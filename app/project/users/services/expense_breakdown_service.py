from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta
from typing import Dict, Optional
import pandas as pd
import io
import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from config.instances.minio_client import MINIO_CLIENT
from users.models.user_data_file import UserDataFile

logger = logging.getLogger(__name__)
User = get_user_model()


class UserExpenseBreakdownService:
    """Service for analyzing expense breakdown with spike and new detection"""

    def __init__(self, user):
        self.user = user
        self.minio_client = MINIO_CLIENT

    def get_expense_breakdown(self, start_date: date, end_date: date) -> Dict:
        """
        Get expense breakdown analysis for specific date range
        Args:
            start_date: Start date for analysis period
            end_date: End date for analysis period
        Returns:
            Dict with expense breakdown by category
        """
        cache_key = f"expense_breakdown_{self.user.id}_{start_date}_{end_date}"
        cached_result = cache.get(cache_key)

        if cached_result:
            logger.info(f"Using cached expense breakdown for user {self.user.id}")
            return cached_result

        try:
            # Get PnL DataFrame
            pnl_df = self._get_dataframe_from_file("pnl_template")
            if pnl_df is None:
                raise ValueError("No P&L data found for user")

            # Filter data for the requested period
            period_data = self._filter_pnl_data(pnl_df, start_date, end_date)
            if period_data.empty:
                raise ValueError("No data found for the specified period")

            # Analyze each expense category
            expense_breakdown = self._analyze_expense_categories(
                period_data, pnl_df, start_date, end_date
            )

            # Store in cache (1 hour)
            cache.set(cache_key, expense_breakdown, timeout=3600)
            logger.info(
                f"Calculated and cached expense breakdown for user {self.user.id}"
            )

            return expense_breakdown

        except Exception as e:
            logger.error(
                f"Error calculating expense breakdown for user "
                f"{self.user.id}: {str(e)}"
            )
            raise e

    def _analyze_expense_categories(
        self, period_data: pd.DataFrame, pnl_df: pd.DataFrame,
        start_date: date, end_date: date
    ) -> Dict:
        """Analyze each expense category for total amount, spike, and new status"""
        expense_columns = [
            "COGS", "Payroll", "Rent", "Marketing", "Other_Expenses"
        ]

        result = {}

        # Calculate total expenses for the period (for spike % calculation)
        total_expenses = self._calculate_total_expenses(period_data)

        # Get previous month data for MoM comparison
        prev_month_start = start_date - relativedelta(months=1)
        prev_month_end = end_date - relativedelta(months=1)
        prev_month_data = self._filter_pnl_data(
            pnl_df, prev_month_start, prev_month_end
        )

        for category in expense_columns:
            if category in period_data.columns:
                # Calculate total amount for this category
                total_amount = period_data[category].sum()
                total_amount = total_amount if not pd.isna(total_amount) else 0

                # Calculate spike status
                spike = self._calculate_spike_status(
                    category, total_amount, total_expenses,
                    period_data, prev_month_data
                )

                # Calculate new status (for now, set to False as per original request)
                # This can be enhanced later if needed
                new = False

                result[category] = {
                    "total_amount": float(total_amount),
                    "spike": spike,
                    "new": new
                }

        return result

    def _calculate_spike_status(
        self, category: str, current_amount: float, total_expenses: Decimal,
        period_data: pd.DataFrame, prev_month_data: pd.DataFrame
    ) -> bool:
        """
        Calculate if category has spike based on:
        - MoM growth > +20%
        - Category ≥ 3% of total expenses
        """
        # Check if category ≥ 3% of total expenses
        if total_expenses > 0:
            percentage_of_total = (current_amount / float(total_expenses)) * 100
            if percentage_of_total >= 3:
                return True

        # Check MoM growth > 20%
        if not prev_month_data.empty and category in prev_month_data.columns:
            prev_amount = prev_month_data[category].sum()
            prev_amount = prev_amount if not pd.isna(prev_amount) else 0

            if prev_amount > 0:
                mom_growth = ((current_amount - prev_amount) / prev_amount) * 100
                if mom_growth > 20:
                    return True

        return False

    def _calculate_total_expenses(self, pnl_data: pd.DataFrame) -> Decimal:
        """Calculate total expenses from P&L data"""
        try:
            expense_columns = [
                "COGS", "Payroll", "Rent", "Marketing", "Other_Expenses"
            ]

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

    def _get_dataframe_from_file(
        self, template_type: str
    ) -> Optional[pd.DataFrame]:
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
                    f"No active {template_type} file found for "
                    f"user {self.user.id}"
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
                    f"Successfully loaded {template_type} data for "
                    f"user {self.user.id}"
                )
                return df

            except Exception as e:
                logger.error(f"Error downloading file from MinIO: {str(e)}")
                return None

        except Exception as e:
            logger.error(
                f"Error loading {template_type} data for user "
                f"{self.user.id}: {str(e)}"
            )
            return None