from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta
import pandas as pd
import io
from typing import Dict, Optional
import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from config.instances.minio_client import MINIO_CLIENT
from users.models.user_data_file import UserDataFile

logger = logging.getLogger(__name__)
User = get_user_model()


class UserInvoicesAnalysisService:
    """Service for analyzing user invoices data with date ranges"""

    def __init__(self, user):
        self.user = user
        self.minio_client = MINIO_CLIENT

    def get_invoices_analysis(self, start_date: date, end_date: date) -> Dict:
        """
        Get invoices analysis for specific date range
        Args:
            start_date: Start date for analysis period
            end_date: End date for analysis period
        Returns:
            Dict with invoices analysis data, totals, and change calculations
        """
        cache_key = f"invoices_analysis_{self.user.id}_{start_date}_{end_date}"
        cached_result = cache.get(cache_key)

        if cached_result:
            # Update cache access order for LRU
            self._update_cache_access(cache_key)
            logger.info(f"Using cached invoices analysis for user {self.user.id}")
            return cached_result

        try:
            # Get invoices DataFrame
            invoices_df = self._get_dataframe_from_file("invoices_template")
            if invoices_df is None:
                raise ValueError("No invoices data found for user")

            # Filter data for the requested period
            invoices_data = self._filter_invoices_data(invoices_df, start_date, end_date)

            # Calculate totals for the period
            total_count = len(invoices_data)
            
            # Calculate paid invoices metrics
            paid_invoices = self._calculate_paid_invoices_metrics(invoices_data)
            
            # Calculate overdue invoices metrics
            overdue_invoices = self._calculate_overdue_invoices_metrics(invoices_data)

            # Calculate changes (1 month and 1 year ago)
            month_changes = self._calculate_period_changes(
                invoices_df, start_date, end_date, "month"
            )
            year_changes = self._calculate_period_changes(
                invoices_df, start_date, end_date, "year"
            )

            # Build response
            result = {
                "total_count": total_count,
                "paid_invoices": {
                    "total_count": paid_invoices["count"],
                    "total_amount": paid_invoices["amount"],
                },
                "overdue_invoices": {
                    "total_count": overdue_invoices["count"],
                    "total_amount": overdue_invoices["amount"],
                },
                "month_change": {
                    "paid_invoices": month_changes["paid_invoices"],
                    "overdue_invoices": month_changes["overdue_invoices"],
                    "total_count": month_changes["total_count"],
                },
                "year_change": {
                    "paid_invoices": year_changes["paid_invoices"],
                    "overdue_invoices": year_changes["overdue_invoices"],
                    "total_count": year_changes["total_count"],
                },
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
            }

            # Store in cache with LRU management
            self._store_in_cache(cache_key, result)
            logger.info(f"Calculated and cached invoices analysis for user {self.user.id}")

            return result

        except Exception as e:
            logger.error(
                f"Error calculating invoices analysis "
                f"for user {self.user.id}: {str(e)}"
            )
            raise

    def _calculate_paid_invoices_metrics(self, invoices_data: pd.DataFrame) -> Dict:
        """Calculate metrics for paid invoices"""
        try:
            if invoices_data.empty:
                return {"count": 0, "amount": 0.0}

            # Filter paid invoices (assuming Status column exists)
            if "Status" not in invoices_data.columns:
                logger.warning("Status column not found in invoices data")
                return {"count": 0, "amount": 0.0}

            paid_invoices = invoices_data[
                invoices_data["Status"].str.lower().isin(["paid", "completed"])
            ]

            count = len(paid_invoices)
            
            # Calculate total amount (assuming Amount column exists)
            total_amount = 0.0
            if "Amount" in paid_invoices.columns and not paid_invoices.empty:
                amount_sum = paid_invoices["Amount"].sum()
                total_amount = float(amount_sum) if not pd.isna(amount_sum) else 0.0

            return {
                "count": count,
                "amount": total_amount
            }

        except Exception as e:
            logger.error(f"Error calculating paid invoices metrics: {str(e)}")
            return {"count": 0, "amount": 0.0}

    def _calculate_overdue_invoices_metrics(self, invoices_data: pd.DataFrame) -> Dict:
        """Calculate metrics for overdue invoices"""
        try:
            if invoices_data.empty:
                return {"count": 0, "amount": 0.0}

            # Filter overdue invoices
            overdue_invoices = pd.DataFrame()
            
            if "Status" in invoices_data.columns:
                # Method 1: Filter by status
                overdue_invoices = invoices_data[
                    invoices_data["Status"].str.lower().isin(["overdue", "unpaid", "pending"])
                ]
            elif "Due_Date" in invoices_data.columns:
                # Method 2: Filter by due date if status not available
                invoices_copy = invoices_data.copy()
                invoices_copy["Due_Date"] = pd.to_datetime(invoices_copy["Due_Date"])
                current_date = pd.Timestamp.now()
                overdue_invoices = invoices_copy[invoices_copy["Due_Date"] < current_date]

            count = len(overdue_invoices)
            
            # Calculate total amount
            total_amount = 0.0
            if "Amount" in overdue_invoices.columns and not overdue_invoices.empty:
                amount_sum = overdue_invoices["Amount"].sum()
                total_amount = float(amount_sum) if not pd.isna(amount_sum) else 0.0

            return {
                "count": count,
                "amount": total_amount
            }

        except Exception as e:
            logger.error(f"Error calculating overdue invoices metrics: {str(e)}")
            return {"count": 0, "amount": 0.0}

    def _calculate_period_changes(
        self, invoices_df: pd.DataFrame, start_date: date, end_date: date, period_type: str
    ) -> Dict:
        """Calculate changes compared to same period 1 month or 1 year ago"""
        try:
            # Calculate offset based on period type
            if period_type == "month":
                offset_start = start_date - relativedelta(months=1)
                offset_end = end_date - relativedelta(months=1)
            else:  # year
                offset_start = start_date - relativedelta(years=1)
                offset_end = end_date - relativedelta(years=1)

            # Get data for comparison period
            comparison_data = self._filter_invoices_data(invoices_df, offset_start, offset_end)

            # Calculate metrics for comparison period
            comparison_total_count = len(comparison_data)
            comparison_paid = self._calculate_paid_invoices_metrics(comparison_data)
            comparison_overdue = self._calculate_overdue_invoices_metrics(comparison_data)

            # Current period metrics
            current_data = self._filter_invoices_data(invoices_df, start_date, end_date)
            current_total_count = len(current_data)
            current_paid = self._calculate_paid_invoices_metrics(current_data)
            current_overdue = self._calculate_overdue_invoices_metrics(current_data)

            # Calculate changes
            return {
                "total_count": self._build_change_data(
                    Decimal(str(current_total_count)), 
                    Decimal(str(comparison_total_count))
                ),
                "paid_invoices": {
                    "count_change": self._build_change_data(
                        Decimal(str(current_paid["count"])), 
                        Decimal(str(comparison_paid["count"]))
                    ),
                    "amount_change": self._build_change_data(
                        Decimal(str(current_paid["amount"])), 
                        Decimal(str(comparison_paid["amount"]))
                    ),
                },
                "overdue_invoices": {
                    "count_change": self._build_change_data(
                        Decimal(str(current_overdue["count"])), 
                        Decimal(str(comparison_overdue["count"]))
                    ),
                    "amount_change": self._build_change_data(
                        Decimal(str(current_overdue["amount"])), 
                        Decimal(str(comparison_overdue["amount"]))
                    ),
                },
            }

        except Exception as e:
            logger.error(f"Error calculating period changes: {str(e)}")
            return {
                "total_count": {"change": 0.0, "percentage_change": 0.0},
                "paid_invoices": {
                    "count_change": {"change": 0.0, "percentage_change": 0.0},
                    "amount_change": {"change": 0.0, "percentage_change": 0.0},
                },
                "overdue_invoices": {
                    "count_change": {"change": 0.0, "percentage_change": 0.0},
                    "amount_change": {"change": 0.0, "percentage_change": 0.0},
                },
            }

    def _build_change_data(self, current: Decimal, previous: Decimal) -> Dict:
        """Build change data structure"""
        change = current - previous
        if previous > 0:
            percentage_change = float(change / previous * 100)
        elif current > 0:
            percentage_change = 100.0
        else:
            percentage_change = 0.0

        return {
            "change": float(change),
            "percentage_change": round(percentage_change, 2),
        }

    def _filter_invoices_data(
        self, invoices_df: pd.DataFrame, start_date: date, end_date: date
    ) -> pd.DataFrame:
        """Filter invoices data for the specified date range"""
        try:
            if invoices_df.empty:
                return pd.DataFrame()

            # Look for date columns (common names)
            date_column = None
            possible_date_columns = ["Date", "Invoice_Date", "Created_Date", "Issue_Date"]
            
            for col in possible_date_columns:
                if col in invoices_df.columns:
                    date_column = col
                    break

            if not date_column:
                logger.warning("No date column found in invoices data")
                return invoices_df  # Return all data if no date column

            # Convert date column to datetime
            invoices_df = invoices_df.copy()
            invoices_df[date_column] = pd.to_datetime(invoices_df[date_column])

            # Filter for the period
            filtered_data = invoices_df[
                (invoices_df[date_column] >= pd.Timestamp(start_date))
                & (invoices_df[date_column] <= pd.Timestamp(end_date))
            ]

            return filtered_data

        except Exception as e:
            logger.error(f"Error filtering invoices data: {str(e)}")
            return pd.DataFrame()

    def _get_dataframe_from_file(self, template_type: str) -> Optional[pd.DataFrame]:
        """Load CSV data from MinIO and convert to DataFrame"""
        try:
            # Get the most recent active file for this template type
            user_file = (
                UserDataFile.objects.filter(
                    user=self.user, template_type=template_type, is_active=True
                )
                .order_by("-upload_time")
                .first()
            )

            if not user_file:
                logger.info(
                    f"No active {template_type} file found for user {self.user.id}"
                )
                return None

            # Download file from MinIO
            try:
                response = self.minio_client.client.get_object(
                    "user-data", user_file.file_path
                )
                csv_data = response.read()
                response.close()

                # Convert to DataFrame
                df = pd.read_csv(io.StringIO(csv_data.decode("utf-8")))
                logger.info(
                    f"Successfully loaded {template_type} data for user {self.user.id}"
                )
                return df

            except Exception as e:
                logger.error(f"Error downloading file from MinIO: {str(e)}")
                return None

        except Exception as e:
            logger.error(
                f"Error loading {template_type} data for user {self.user.id}: {str(e)}"
            )
            return None

    def _store_in_cache(self, cache_key: str, result: Dict):
        """Store result in cache with LRU management (max 5 entries per user)"""
        user_cache_list_key = f"invoices_cache_list_{self.user.id}"

        # Get current cache list for this user
        cache_list = cache.get(user_cache_list_key, [])

        # Remove the key if it already exists (update scenario)
        if cache_key in cache_list:
            cache_list.remove(cache_key)

        # Add new key to the front (most recent)
        cache_list.insert(0, cache_key)

        # Limit to 5 entries - remove oldest if needed
        if len(cache_list) > 5:
            # Delete the oldest cache entry
            oldest_key = cache_list.pop()
            cache.delete(oldest_key)
            logger.info(f"Removed oldest cache entry: {oldest_key}")

        # Update the cache list and store the result
        cache.set(user_cache_list_key, cache_list, 3600)  # 1 hour TTL
        cache.set(cache_key, result, 60)  # 1 minute TTL for analysis data

        logger.info(
            f"Stored cache for user {self.user.id}, total entries: {len(cache_list)}"
        )

    def _update_cache_access(self, cache_key: str):
        """Update cache access order for LRU"""
        user_cache_list_key = f"invoices_cache_list_{self.user.id}"
        cache_list = cache.get(user_cache_list_key, [])

        if cache_key in cache_list:
            # Move accessed key to front
            cache_list.remove(cache_key)
            cache_list.insert(0, cache_key)
            cache.set(user_cache_list_key, cache_list, 3600)

    def invalidate_cache(self):
        """Invalidate all cached data for this user"""
        user_cache_list_key = f"invoices_cache_list_{self.user.id}"
        cache_list = cache.get(user_cache_list_key, [])

        # Delete all cache entries for this user
        if cache_list:
            cache.delete_many(cache_list)
            logger.info(
                f"Deleted {len(cache_list)} cache entries for user {self.user.id}"
            )

        # Delete the cache list itself
        cache.delete(user_cache_list_key)
        logger.info(f"Invoices cache invalidated for user {self.user.id}")