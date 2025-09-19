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


class UserPNLAnalysisService:
    """Service for analyzing user P&L data with date ranges"""

    def __init__(self, user):
        self.user = user
        self.minio_client = MINIO_CLIENT

    def get_pnl_analysis(self, start_date: date, end_date: date) -> Dict:
        """
        Get P&L analysis for specific date range
        Args:
            start_date: Start date for analysis period
            end_date: End date for analysis period
        Returns:
            Dict with pnl_data, totals, and change calculations
        """
        cache_key = f"pnl_analysis_{self.user.id}_{start_date}_{end_date}"
        cached_result = cache.get(cache_key)

        if cached_result:
            logger.info(f"Using cached PnL analysis for user {self.user.id}")
            return cached_result

        try:
            # Get PnL DataFrame
            pnl_df = self._get_dataframe_from_file("pnl_template")
            if pnl_df is None:
                raise ValueError("No P&L data found for user")

            # Filter data for the requested period
            pnl_data = self._filter_pnl_data(pnl_df, start_date, end_date)

            # Calculate totals for the period
            total_revenue = self._calculate_total_revenue(pnl_data)
            total_expenses = self._calculate_total_expenses(pnl_data)
            net_profit = total_revenue - total_expenses

            # Calculate changes (1 month and 1 year ago)
            month_changes = self._calculate_period_changes(
                pnl_df, start_date, end_date, "month"
            )
            year_changes = self._calculate_period_changes(
                pnl_df, start_date, end_date, "year"
            )

            # Build response
            result = {
                "pnl_data": pnl_data.to_dict("records"),
                "total_revenue": float(total_revenue),
                "total_expenses": float(total_expenses),
                "net_profit": float(net_profit),
                "month_change": {
                    "revenue": month_changes["revenue"],
                    "expenses": month_changes["expenses"],
                    "net_profit": month_changes["net_profit"],
                },
                "year_change": {
                    "revenue": year_changes["revenue"],
                    "expenses": year_changes["expenses"],
                    "net_profit": year_changes["net_profit"],
                },
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
            }

            # Cache for 60 seconds
            cache.set(cache_key, result, 60)
            logger.info(f"Calculated and cached PnL analysis for user {self.user.id}")

            return result

        except Exception as e:
            logger.error(
                f"Error calculating PnL analysis " f"for user {self.user.id}: {str(e)}"
            )
            raise

    def _filter_pnl_data(
        self, pnl_df: pd.DataFrame, start_date: date, end_date: date
    ) -> pd.DataFrame:
        """Filter P&L data for the specified date range"""
        try:
            if "Month" not in pnl_df.columns:
                raise ValueError("Month column not found in P&L data")

            # Convert Month column to datetime
            pnl_df = pnl_df.copy()
            pnl_df["Month"] = pd.to_datetime(pnl_df["Month"])

            # Filter for the period
            filtered_data = pnl_df[
                (pnl_df["Month"] >= pd.Timestamp(start_date))
                & (pnl_df["Month"] <= pd.Timestamp(end_date))
            ]

            return filtered_data

        except Exception as e:
            logger.error(f"Error filtering P&L data: {str(e)}")
            return pd.DataFrame()

    def _calculate_total_revenue(self, pnl_data: pd.DataFrame) -> Decimal:
        """Calculate total revenue from P&L data"""
        try:
            if "Revenue" not in pnl_data.columns or pnl_data.empty:
                return Decimal("0")

            total = pnl_data["Revenue"].sum()
            return Decimal(str(total)) if not pd.isna(total) else Decimal("0")

        except Exception as e:
            logger.error(f"Error calculating total revenue: {str(e)}")
            return Decimal("0")

    def _calculate_total_expenses(self, pnl_data: pd.DataFrame) -> Decimal:
        """Calculate total expenses from P&L data"""
        try:
            expense_columns = ["COGS", "Payroll", "Rent", "Marketing", "Other_Expenses"]

            if pnl_data.empty:
                return Decimal("0")

            total_expenses = Decimal("0")
            for col in expense_columns:
                if col in pnl_data.columns:
                    col_sum = pnl_data[col].sum()
                    if not pd.isna(col_sum):
                        total_expenses += Decimal(str(col_sum))

            return total_expenses

        except Exception as e:
            logger.error(f"Error calculating total expenses: {str(e)}")
            return Decimal("0")

    def _calculate_period_changes(
        self, pnl_df: pd.DataFrame, start_date: date, end_date: date, period_type: str
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
            comparison_data = self._filter_pnl_data(pnl_df, offset_start, offset_end)

            # Calculate totals for comparison period
            comparison_revenue = self._calculate_total_revenue(comparison_data)
            comparison_expenses = self._calculate_total_expenses(comparison_data)
            comparison_net_profit = comparison_revenue - comparison_expenses

            # Current period totals
            current_data = self._filter_pnl_data(pnl_df, start_date, end_date)
            current_revenue = self._calculate_total_revenue(current_data)
            current_expenses = self._calculate_total_expenses(current_data)
            current_net_profit = current_revenue - current_expenses

            # Calculate changes and percentages
            return {
                "revenue": self._build_change_data(current_revenue, comparison_revenue),
                "expenses": self._build_change_data(
                    current_expenses, comparison_expenses
                ),
                "net_profit": self._build_change_data(
                    current_net_profit, comparison_net_profit
                ),
            }

        except Exception as e:
            logger.error(f"Error calculating period changes: {str(e)}")
            return {
                "revenue": {"change": 0.0, "percentage_change": 0.0},
                "expenses": {"change": 0.0, "percentage_change": 0.0},
                "net_profit": {"change": 0.0, "percentage_change": 0.0},
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
                    f"No active {template_type} file found " f"for user {self.user.id}"
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
                    f"Successfully loaded {template_type} data "
                    f"for user {self.user.id}"
                )
                return df

            except Exception as e:
                logger.error(f"Error downloading file from MinIO: {str(e)}")
                return None

        except Exception as e:
            logger.error(
                f"Error loading {template_type} data "
                f"for user {self.user.id}: {str(e)}"
            )
            return None

    def invalidate_cache(self):
        """Invalidate all cached data for this user"""
        # Delete all PnL analysis cache entries for this user
        # Note: We can't easily delete all entries with wildcard,
        # so we'll need to manage cache keys more systematically
        logger.info(f"Cache invalidation requested for user {self.user.id}")
        # For now, cache will expire naturally after 1 hour
