from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta
import pandas as pd
import io
from typing import Dict, Tuple, Optional
import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from config.instances.minio_client import MINIO_CLIENT
from users.models.user_data_file import UserDataFile

logger = logging.getLogger(__name__)
User = get_user_model()


class UserDataAnalysisService:
    """Service for analyzing user financial data"""
    
    def __init__(self, user):
        self.user = user
        self.minio_client = MINIO_CLIENT
    
    def get_financial_analysis(self, period_type: str) -> Dict:
        """
        Calculate comprehensive financial analysis based on period type
        Args:
            period_type: 'month' or 'year'
        Returns:
            Dict with revenue_data, expenses_data, and net_profit_data
        """
        cache_key = (
            f"financial_analysis_{self.user.id}_{period_type}_"
            f"{timezone.now().strftime('%Y-%m-%d')}"
        )
        cached_result = cache.get(cache_key)
        
        if cached_result:
            logger.info(
                f"Using cached money analysis for user {self.user.id}"
            )
            return cached_result
        
        try:
            # Get user financial data
            financial_data = self._get_user_financial_data()
            
            # Calculate all three metrics based on period
            if period_type == 'month':
                revenue_current, revenue_previous = (
                    self._calculate_monthly_revenue(financial_data)
                )
                expenses_current, expenses_previous = (
                    self._calculate_monthly_expenses(financial_data)
                )
            else:  # year
                revenue_current, revenue_previous = (
                    self._calculate_yearly_revenue(financial_data)
                )
                expenses_current, expenses_previous = (
                    self._calculate_yearly_expenses(financial_data)
                )
            
            # Calculate net profit
            net_profit_current = revenue_current - expenses_current
            net_profit_previous = revenue_previous - expenses_previous
            
            # Build response with nested structure
            result = {
                'period_type': period_type,
                'revenue_data': self._build_metric_data(
                    revenue_current, revenue_previous
                ),
                'expenses_data': self._build_metric_data(
                    expenses_current, expenses_previous
                ),
                'net_profit_data': self._build_metric_data(
                    net_profit_current, net_profit_previous
                ),
                'currency': 'USD'  # можно сделать настраиваемым
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            logger.info(
                f"Calculated and cached money analysis "
                f"for user {self.user.id}"
            )
            
            return result
            
        except Exception as e:
            logger.error(
                f"Error calculating money analysis "
                f"for user {self.user.id}: {str(e)}"
            )
            raise
    
    def _build_metric_data(self, current: Decimal, previous: Decimal) -> Dict:
        """Build metric data structure with calculations"""
        change = current - previous
        if previous > 0:
            percentage_change = float(change / previous * 100)
        elif current > 0:
            percentage_change = 100.0
        else:
            percentage_change = 0.0
            
        return {
            'current': float(current),
            'previous': float(previous),
            'change': float(change),
            'percentage_change': round(percentage_change, 2),
            'is_positive_change': change >= 0
        }
    
    def _get_user_financial_data(self) -> Dict[str, pd.DataFrame]:
        """Get P&L revenue data from user files"""
        data = {}
        
        # Get P&L data only - this is our single source of truth for revenue
        pnl_df = self._get_dataframe_from_file('pnl_template')
        if pnl_df is not None:
            data['pnl'] = pnl_df
        
        return data
    
    def _get_dataframe_from_file(
        self,
        template_type: str
    ) -> Optional[pd.DataFrame]:
        """Load CSV data from MinIO and convert to DataFrame"""
        try:
            # Get the most recent active file for this template type
            user_file = UserDataFile.objects.filter(
                user=self.user,
                template_type=template_type,
                is_active=True
            ).order_by('-upload_time').first()
            
            if not user_file:
                logger.info(
                    f"No active {template_type} file found "
                    f"for user {self.user.id}"
                )
                return None
            
            # Download file from MinIO
            bucket_name = 'user-data'
            try:
                response = self.minio_client.client.get_object(
                    bucket_name,
                    user_file.file_path
                )
                csv_data = response.read()
                response.close()
                
                # Convert to DataFrame
                df = pd.read_csv(io.StringIO(csv_data.decode('utf-8')))
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
    
    def _calculate_monthly_revenue(
        self,
        revenue_data: Dict[str, pd.DataFrame]
    ) -> Tuple[Decimal, Decimal]:
        """Calculate current month and previous month revenue"""
        now = timezone.now().date()
        current_month = now.replace(day=1)
        previous_month = (current_month - relativedelta(months=1))
        
        current_revenue = self._get_revenue_for_period(
            revenue_data,
            current_month,
            current_month + relativedelta(months=1)
        )
        previous_revenue = self._get_revenue_for_period(
            revenue_data,
            previous_month,
            current_month
        )
        
        return current_revenue, previous_revenue
    
    def _calculate_yearly_revenue(
        self,
        revenue_data: Dict[str, pd.DataFrame]
    ) -> Tuple[Decimal, Decimal]:
        """Calculate current year and previous year revenue"""
        now = timezone.now().date()
        current_year = now.replace(month=1, day=1)
        previous_year = current_year.replace(year=current_year.year - 1)
        
        current_revenue = self._get_revenue_for_period(
            revenue_data,
            current_year,
            current_year.replace(year=current_year.year + 1)
        )
        previous_revenue = self._get_revenue_for_period(
            revenue_data,
            previous_year,
            current_year
        )
        
        return current_revenue, previous_revenue
    
    def _calculate_monthly_expenses(
        self,
        financial_data: Dict[str, pd.DataFrame]
    ) -> Tuple[Decimal, Decimal]:
        """Calculate current month and previous month expenses"""
        now = timezone.now().date()
        current_month = now.replace(day=1)
        previous_month = (current_month - relativedelta(months=1))
        
        current_expenses = self._get_expenses_for_period(
            financial_data,
            current_month,
            current_month + relativedelta(months=1)
        )
        previous_expenses = self._get_expenses_for_period(
            financial_data,
            previous_month,
            current_month
        )
        
        return current_expenses, previous_expenses
    
    def _calculate_yearly_expenses(
        self,
        financial_data: Dict[str, pd.DataFrame]
    ) -> Tuple[Decimal, Decimal]:
        """Calculate current year and previous year expenses"""
        now = timezone.now().date()
        current_year = now.replace(month=1, day=1)
        previous_year = current_year.replace(year=current_year.year - 1)
        
        current_expenses = self._get_expenses_for_period(
            financial_data,
            current_year,
            current_year.replace(year=current_year.year + 1)
        )
        previous_expenses = self._get_expenses_for_period(
            financial_data,
            previous_year,
            current_year
        )
        
        return current_expenses, previous_expenses
    
    def _get_revenue_for_period(
        self,
        revenue_data: Dict[str, pd.DataFrame],
        start_date: date,
        end_date: date
    ) -> Decimal:
        """Calculate revenue for given period from P&L data only"""
        total_revenue = Decimal('0')
        
        # P&L Revenue - our single source of truth
        if 'pnl' in revenue_data:
            pnl_revenue = self._get_pnl_revenue_for_period(
                revenue_data['pnl'],
                start_date,
                end_date
            )
            total_revenue = pnl_revenue
        
        return total_revenue
    
    def _get_expenses_for_period(
        self,
        financial_data: Dict[str, pd.DataFrame],
        start_date: date,
        end_date: date
    ) -> Decimal:
        """Calculate expenses for given period from P&L data"""
        total_expenses = Decimal('0')
        
        # P&L Expenses - sum of COGS, Payroll, Rent, Marketing, Other_Expenses
        if 'pnl' in financial_data:
            pnl_expenses = self._get_pnl_expenses_for_period(
                financial_data['pnl'],
                start_date,
                end_date
            )
            total_expenses = pnl_expenses
        
        return total_expenses
    
    def _get_pnl_revenue_for_period(
        self,
        pnl_df: pd.DataFrame,
        start_date: date,
        end_date: date
    ) -> Decimal:
        """Extract revenue from P&L data for the period"""
        try:
            required_columns = ['Month', 'Revenue']
            if not all(col in pnl_df.columns for col in required_columns):
                return Decimal('0')
            
            # Convert Month column to datetime
            pnl_df['Month'] = pd.to_datetime(pnl_df['Month'])
            
            # Filter for the period
            period_data = pnl_df[
                (pnl_df['Month'] >= pd.Timestamp(start_date)) &
                (pnl_df['Month'] < pd.Timestamp(end_date))
            ]
            
            # Sum revenue
            total_revenue = period_data['Revenue'].sum()
            return (
                Decimal(str(total_revenue))
                if not pd.isna(total_revenue)
                else Decimal('0')
            )
            
        except Exception as e:
            logger.error(f"Error calculating P&L revenue: {str(e)}")
            return Decimal('0')
    
    def _get_pnl_expenses_for_period(
        self,
        pnl_df: pd.DataFrame,
        start_date: date,
        end_date: date
    ) -> Decimal:
        """Extract expenses from P&L data for the period"""
        try:
            # Required expense columns
            expense_columns = [
                'COGS', 'Payroll', 'Rent', 'Marketing', 'Other_Expenses'
            ]
            required_columns = ['Month'] + expense_columns
            
            if not all(col in pnl_df.columns for col in required_columns):
                return Decimal('0')
            
            # Convert Month column to datetime
            pnl_df = pnl_df.copy()
            pnl_df['Month'] = pd.to_datetime(pnl_df['Month'])
            
            # Filter for the period
            period_data = pnl_df[
                (pnl_df['Month'] >= pd.Timestamp(start_date)) &
                (pnl_df['Month'] < pd.Timestamp(end_date))
            ]
            
            # Sum all expense columns
            total_expenses = Decimal('0')
            for col in expense_columns:
                col_sum = period_data[col].sum()
                if not pd.isna(col_sum):
                    total_expenses += Decimal(str(col_sum))
            
            return total_expenses
            
        except Exception as e:
            logger.error(f"Error calculating P&L expenses: {str(e)}")
            return Decimal('0')
    
    def invalidate_cache(self):
        """Invalidate all cached data for this user"""
        today = timezone.now().strftime('%Y-%m-%d')
        cache.delete_many([
            f"financial_analysis_{self.user.id}_month_{today}",
            f"financial_analysis_{self.user.id}_year_{today}"
        ])
        logger.info(f"Invalidated cache for user {self.user.id}")