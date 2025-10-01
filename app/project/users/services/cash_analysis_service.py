from decimal import Decimal
from typing import Dict, Optional
import pandas as pd
import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from config.instances.minio_client import MINIO_CLIENT
from users.models.user_data_file import UserDataFile
import io

logger = logging.getLogger(__name__)
User = get_user_model()


class UserCashAnalysisService:
    """Service for analyzing user transaction data to calculate totals"""

    def __init__(self, user):
        self.user = user
        self.minio_client = MINIO_CLIENT

    def get_cash_analysis(self) -> Dict:
        """
        Get cash analysis from transactions data
        Returns:
            Dict with total_income and total_expense
        """
        cache_key = f"cash_analysis_{self.user.id}"
        cached_result = cache.get(cache_key)

        if cached_result:
            logger.info(f"Using cached cash analysis for user {self.user.id}")
            return cached_result

        try:
            # Get Transactions DataFrame
            transactions_df = self._get_dataframe_from_file(
                "transactions_template"
            )
            if transactions_df is None:
                raise ValueError("No transaction data found for user")

            # Calculate totals
            total_income, total_expense = self._calculate_totals(
                transactions_df
            )

            # Build response
            result = {
                "total_income": float(total_income),
                "total_expense": float(total_expense),
            }

            # Store in cache (24 hours)
            cache.set(cache_key, result, timeout=86400)
            logger.info(
                f"Calculated and cached cash analysis for user {self.user.id}"
            )

            return result

        except Exception as e:
            logger.error(
                f"Error calculating cash analysis for user "
                f"{self.user.id}: {str(e)}"
            )
            raise e

    def _calculate_totals(self, df: pd.DataFrame) -> tuple[Decimal, Decimal]:
        """
        Calculate total income and expense from transactions DataFrame
        Args:
            df: DataFrame with transactions data
        Returns:
            Tuple of (total_income, total_expense)
        """
        try:
            # Ensure required columns exist
            required_columns = ['Category', 'Amount']
            missing_columns = [
                col for col in required_columns if col not in df.columns
            ]
            if missing_columns:
                raise ValueError(
                    f"Missing required columns: {missing_columns}"
                )

            # Convert Amount to numeric, handling any string values
            df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
            
            # Filter out rows with NaN amounts
            df = df.dropna(subset=['Amount'])

            # Calculate totals based on Category
            income_mask = df['Category'].str.lower() == 'income'
            expense_mask = df['Category'].str.lower() == 'expense'

            total_income = Decimal(str(df[income_mask]['Amount'].sum()))
            total_expense = Decimal(str(df[expense_mask]['Amount'].sum()))

            logger.info(
                f"Calculated totals - Income: {total_income}, "
                f"Expense: {total_expense}"
            )
            
            return total_income, total_expense

        except Exception as e:
            logger.error(
                f"Error calculating totals from transactions: {str(e)}"
            )
            raise e

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