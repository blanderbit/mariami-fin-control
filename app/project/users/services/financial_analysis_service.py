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
from config.instances.claude_ai_client import CLAUDE_CLIENT
from users.models.user_data_file import UserDataFile

logger = logging.getLogger(__name__)
User = get_user_model()


class UserPNLAnalysisService:
    """Service for analyzing user P&L data with date ranges"""

    def __init__(self, user):
        self.user = user
        self.minio_client = MINIO_CLIENT
        # Use Claude client instance
        self.claude_client = CLAUDE_CLIENT

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
            # Update cache access order for LRU
            self._update_cache_access(cache_key)
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
            
            # Calculate margins
            gross_margin = self._calculate_gross_margin(pnl_data, total_revenue)
            operating_margin = self._get_industry_operating_margin()

            # Calculate changes (1 month and 1 year ago)
            month_changes = self._calculate_period_changes(
                pnl_df, start_date, end_date, "month"
            )
            year_changes = self._calculate_period_changes(
                pnl_df, start_date, end_date, "year"
            )

            # Generate AI insights
            ai_insights = self._generate_ai_insights(
                total_revenue, total_expenses, net_profit, month_changes, year_changes, pnl_data
            )

            # Build response
            result = {
                "pnl_data": pnl_data.to_dict("records"),
                "total_revenue": float(total_revenue),
                "total_expenses": float(total_expenses),
                "net_profit": float(net_profit),
                "gross_margin": float(gross_margin),
                "operating_margin": operating_margin,
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
                "ai_insights": ai_insights,
            }

            # Store in cache with LRU management
            self._store_in_cache(cache_key, result)
            logger.info(f"Calculated and cached PnL analysis for user {self.user.id}")

            return result

        except Exception as e:
            logger.error(
                f"Error calculating PnL analysis " f"for user {self.user.id}: {str(e)}"
            )
            raise

    def _store_in_cache(self, cache_key: str, result: Dict):
        """Store result in cache with LRU management (max 5 entries per user)"""
        user_cache_list_key = f"pnl_cache_list_{self.user.id}"

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
            f"Stored cache for user {self.user.id}, "
            f"total entries: {len(cache_list)}"
        )

    def _update_cache_access(self, cache_key: str):
        """Update cache access order for LRU"""
        user_cache_list_key = f"pnl_cache_list_{self.user.id}"
        cache_list = cache.get(user_cache_list_key, [])

        if cache_key in cache_list:
            # Move accessed key to front
            cache_list.remove(cache_key)
            cache_list.insert(0, cache_key)
            cache.set(user_cache_list_key, cache_list, 3600)

    def _generate_ai_insights(
        self,
        total_revenue: Decimal,
        total_expenses: Decimal,
        net_profit: Decimal,
        month_changes: Dict,
        year_changes: Dict,
        current_period_data: pd.DataFrame,
    ) -> str:
        """Generate AI-powered insights summary using Claude"""
        try:
            # Prepare data for AI analysis
            revenue_mom = month_changes["revenue"]["percentage_change"]
            revenue_yoy = year_changes["revenue"]["percentage_change"]
            expenses_mom = month_changes["expenses"]["percentage_change"]
            expenses_yoy = year_changes["expenses"]["percentage_change"]
            profit_mom = month_changes["net_profit"]["percentage_change"]
            profit_yoy = year_changes["net_profit"]["percentage_change"]

            # Calculate expense categories for the actual current period
            expense_categories = self._calculate_expenses_by_categories(current_period_data)
            
            # Build expense categories info for prompt
            expense_info = ""

            for expense_item in expense_categories.items():
                expense_info += f"\n- {expense_item[0]}: ${expense_item[1]:,.0f}"
            # Create more specific prompt for Claude analysis
            user_prompt = f"""
Analyze this business P&L and provide ONE actionable insight in 15-20 words:

FINANCIALS:
• Revenue: ${total_revenue:,.0f} ({revenue_mom:+.1f}% MoM, {revenue_yoy:+.1f}% YoY)
• Expenses: ${total_expenses:,.0f} ({expenses_mom:+.1f}% MoM, {expenses_yoy:+.1f}% YoY)
• Expenses detailed info with categories: {expense_info}
• Net Profit: ${net_profit:,.0f} ({profit_mom:+.1f}% MoM, {profit_yoy:+.1f}% YoY)

FOCUS ON:
1. Most concerning trend (revenue decline, expense growth, margin pressure)
2. Specific category driving changes
3. Clear action item

BAD EXAMPLES (avoid these):
- "Revenue growth outpacing expenses - Investigate opportunities to scale profitable product lines."
- "Expenses stable but revenue down - Analyze customer acquisition channels for optimization."
- "Revenue growth outpacing expenses - Invest in scaling high-margin product lines."

GOOD EXAMPLES (use similar format):
- "Revenue down 15% while Marketing up 25% - optimize ad spend efficiency"
- "Payroll costs rising 20% faster than revenue - review headcount strategy"  
- "Strong 12% revenue growth but COGS increasing - negotiate supplier terms"
- "Marketing driving 30% revenue boost but margins tight - scale profitable channels"

Respond with format: "[Main trend] - [specific action]"
            """.strip()

            # Call Claude API with proper format
            insight = self.claude_client.chat_completion(
                messages=[{"role": "user", "content": user_prompt}],
                system="You are a CFO providing specific, actionable business insights. Focus on trends and concrete next steps. Keep responses under 20 words.",
                model="claude-sonnet-4-20250514",
                max_tokens=50,
                temperature=0.1,  # Lower temperature for more consistent, focused insights
            )

            logger.info(f"Generated Claude insight for user {self.user.id}: {insight}")
            return insight

        except Exception as e:
            logger.error(f"Failed to generate Claude insights: {str(e)}")
            # Return fallback insight based on basic analysis
            return self._generate_fallback_insight(month_changes, year_changes)

    def _calculate_expenses_by_categories(
        self, pnl_data: pd.DataFrame
    ) -> Dict[str, float]:
        """Calculate total expenses for each category"""
        try:
            expense_columns = ["COGS", "Payroll", "Rent", "Marketing", "Other_Expenses"]

            if pnl_data.empty:
                return {}

            category_totals = {}
            for col in expense_columns:
                if col in pnl_data.columns:
                    col_sum = pnl_data[col].sum()
                    if not pd.isna(col_sum) and col_sum > 0:
                        category_totals[col] = float(col_sum)

            return category_totals

        except Exception as e:
            logger.error(f"Error calculating expenses by categories: {str(e)}")
            return {}

    def _generate_fallback_insight(
        self, month_changes: Dict, year_changes: Dict
    ) -> str:
        """Generate basic insight when AI fails"""
        try:
            revenue_yoy = year_changes["revenue"]["percentage_change"]
            expenses_yoy = year_changes["expenses"]["percentage_change"]
            profit_mom = month_changes["net_profit"]["percentage_change"]

            if revenue_yoy > 10:
                return "Strong revenue growth YoY, monitor expense efficiency."
            elif revenue_yoy < -10:
                return "Revenue declining YoY, focus on growth initiatives."
            elif expenses_yoy > revenue_yoy + 5:
                return "Expenses growing faster than revenue, cost control needed."
            elif profit_mom > 15:
                return "Strong profit growth MoM, good operational momentum."
            else:
                return "Performance steady, opportunities for optimization."

        except Exception:
            return "Financial analysis completed, review metrics for trends."

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
            logger.info(
                f"Using cached expense breakdown for user {self.user.id}"
            )
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
                f"Calculated and cached expense breakdown for user "
                f"{self.user.id}"
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
        """
        Analyze each expense category for total amount, spike, and new status
        """
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
                total_amount = (
                    total_amount if not pd.isna(total_amount) else 0
                )

                # Calculate spike status
                spike = self._calculate_spike_status(
                    category, total_amount, total_expenses,
                    period_data, prev_month_data
                )

                # Calculate new status (set to False for now)
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
            percentage_of_total = (
                current_amount / float(total_expenses)
            ) * 100
            if percentage_of_total >= 3:
                return True

        # Check MoM growth > 20%
        if (not prev_month_data.empty and
                category in prev_month_data.columns):
            prev_amount = prev_month_data[category].sum()
            prev_amount = prev_amount if not pd.isna(prev_amount) else 0

            if prev_amount > 0:
                mom_growth = (
                    (current_amount - prev_amount) / prev_amount
                ) * 100
                if mom_growth > 20:
                    return True

        return False

    def _calculate_gross_margin(self, pnl_data: pd.DataFrame, total_revenue: Decimal) -> Decimal:
        """Calculate gross margin percentage from PnL data"""
        try:
            if total_revenue <= 0:
                return Decimal("0")
            
            # Calculate total COGS for the period
            total_cogs = Decimal("0")
            if "COGS" in pnl_data.columns:
                cogs_sum = pnl_data["COGS"].sum()
                if not pd.isna(cogs_sum):
                    total_cogs = Decimal(str(cogs_sum))
            
            # Gross Margin = (Revenue - COGS) / Revenue * 100
            gross_margin_percentage = ((total_revenue - total_cogs) / total_revenue) * 100
            return gross_margin_percentage.quantize(Decimal('0.01'))
            
        except Exception as e:
            logger.error(f"Error calculating gross margin: {str(e)}")
            return Decimal("0")

    def _get_industry_operating_margin(self) -> Optional[str]:
        """Get operating margin range from Industry_norms.csv for user's industry"""
        try:
            # Get user's industry from profile
            if not self.user.profile or not self.user.profile.industry:
                logger.info(f"No industry set for user {self.user.id}")
                return None

            user_industry = self.user.profile.industry.strip()

            # Load Industry_norms.csv
            import os
            from django.conf import settings
            
            csv_path = os.path.join(
                settings._BASE_DIR, 
                'templates', 
                'user_data', 
                'Industry_norms.csv'
            )
            
            if not os.path.exists(csv_path):
                logger.warning(f"Industry_norms.csv not found at {csv_path}")
                return None

            # Read CSV and find matching industry
            df = pd.read_csv(csv_path)
            
            # Try exact match first, then case-insensitive partial match
            industry_row = df[df['industry'].str.strip() == user_industry]
            
            if industry_row.empty:
                # Try case-insensitive match
                industry_row = df[
                    df['industry'].str.strip().str.lower() == 
                    user_industry.lower()
                ]
            
            if industry_row.empty:
                # Try partial match for composite industries
                for _, row in df.iterrows():
                    if (user_industry.lower() in row['industry'].lower() or
                        row['industry'].lower() in user_industry.lower()):
                        industry_row = pd.DataFrame([row])
                        break
            
            if industry_row.empty:
                logger.info(f"No operating margin found for industry: {user_industry}")
                return None

            # Extract operating margin range
            row = industry_row.iloc[0]
            operating_margin = row.get('Operating_margin_range')
            
            return operating_margin if pd.notna(operating_margin) else None

        except Exception as e:
            logger.error(f"Error loading operating margin from industry norms: {str(e)}")
            return None

    def invalidate_cache(self):
        """Invalidate all cached data for this user"""
        user_cache_list_key = f"pnl_cache_list_{self.user.id}"
        cache_list = cache.get(user_cache_list_key, [])

        # Delete all cache entries for this user
        if cache_list:
            cache.delete_many(cache_list)
            logger.info(
                f"Deleted {len(cache_list)} cache entries for user {self.user.id}"
            )

        # Delete the cache list itself
        cache.delete(user_cache_list_key)
        logger.info(f"Cache invalidated for user {self.user.id}")
