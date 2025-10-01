from datetime import date
from typing import Dict, List, Optional
import logging
import pandas as pd
import os
from django.contrib.auth import get_user_model
from django.conf import settings

from users.services.financial_analysis_service import UserPNLAnalysisService
from users.services.invoices_analysis_service import (
    UserInvoicesAnalysisService
)
from users.services.cash_analysis_service import UserCashAnalysisService
from config.instances.claude_ai_client import CLAUDE_CLIENT

logger = logging.getLogger(__name__)
User = get_user_model()


class UserAIInsightsService:
    """Service for generating AI-powered business insights from combined data"""

    def __init__(self, user):
        self.user = user
        self.claude_client = CLAUDE_CLIENT

    def get_ai_insights(self, start_date: date, end_date: date) -> Dict:
        """
        Generate AI insights by combining data from multiple analysis services
        Args:
            start_date: Start date for analysis period
            end_date: End date for analysis period
        Returns:
            Dict with AI-generated insights
        """
        try:
            # Gather data from all services
            combined_data = self._gather_combined_data(start_date, end_date)
            
            # Add industry benchmarks if available
            industry_benchmarks = self._get_industry_benchmarks()
            combined_data["industry_benchmarks"] = industry_benchmarks
            
            # Generate AI insights using the combined data
            insights = self._generate_ai_insights(combined_data)
            
            return {
                "insights": insights,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
                "data_sources": {
                    "pnl_analysis": bool(combined_data.get("pnl_data")),
                    "invoices_analysis": bool(combined_data.get("invoices_data")),
                    "cash_analysis": bool(combined_data.get("cash_data")),
                }
            }

        except Exception as e:
            logger.error(
                f"Error generating AI insights for user {self.user.id}: {str(e)}"
            )
            raise e

    def _gather_combined_data(self, start_date: date, end_date: date) -> Dict:
        """Gather data from all available analysis services"""
        combined_data = {}

        # Get P&L analysis data
        try:
            pnl_service = UserPNLAnalysisService(self.user)
            pnl_data = pnl_service.get_pnl_analysis(start_date, end_date)
            combined_data["pnl_data"] = self._extract_pnl_essentials(pnl_data)
        except Exception as e:
            logger.warning(f"Could not get P&L data: {str(e)}")
            combined_data["pnl_data"] = None

        # Get invoices analysis data
        try:
            invoices_service = UserInvoicesAnalysisService(self.user)
            invoices_data = invoices_service.get_invoices_analysis(
                start_date, end_date
            )
            combined_data["invoices_data"] = self._extract_invoices_essentials(
                invoices_data
            )
        except Exception as e:
            logger.warning(f"Could not get invoices data: {str(e)}")
            combined_data["invoices_data"] = None

        # Get cash analysis data
        try:
            cash_service = UserCashAnalysisService(self.user)
            cash_data = cash_service.get_cash_analysis()
            combined_data["cash_data"] = self._extract_cash_essentials(cash_data)
        except Exception as e:
            logger.warning(f"Could not get cash data: {str(e)}")
            combined_data["cash_data"] = None

        return combined_data

    def _extract_pnl_essentials(self, pnl_data: Dict) -> Dict:
        """Extract only essential data from P&L analysis"""
        return {
            "total_revenue": pnl_data.get("total_revenue", 0),
            "total_expenses": pnl_data.get("total_expenses", 0),
            "net_profit": pnl_data.get("net_profit", 0),
            "gross_margin": pnl_data.get("gross_margin", 0),
            "operating_margin": pnl_data.get("operating_margin"),
            "month_change_revenue": pnl_data.get("month_change", {}).get(
                "revenue", {}
            ).get("percentage_change", 0),
            "month_change_expenses": pnl_data.get("month_change", {}).get(
                "expenses", {}
            ).get("percentage_change", 0),
            "month_change_profit": pnl_data.get("month_change", {}).get(
                "net_profit", {}
            ).get("percentage_change", 0),
            "year_change_revenue": pnl_data.get("year_change", {}).get(
                "revenue", {}
            ).get("percentage_change", 0),
            "year_change_expenses": pnl_data.get("year_change", {}).get(
                "expenses", {}
            ).get("percentage_change", 0),
            "year_change_profit": pnl_data.get("year_change", {}).get(
                "net_profit", {}
            ).get("percentage_change", 0),
        }

    def _extract_invoices_essentials(self, invoices_data: Dict) -> Dict:
        """Extract only essential data from invoices analysis"""
        return {
            "total_invoices": invoices_data.get("total_invoices", 0),
            "paid_invoices_count": invoices_data.get("paid_invoices", {}).get(
                "count", 0
            ),
            "paid_invoices_amount": invoices_data.get("paid_invoices", {}).get(
                "total_amount", 0
            ),
            "overdue_invoices_count": invoices_data.get("overdue_invoices", {}).get(
                "count", 0
            ),
            "overdue_invoices_amount": invoices_data.get("overdue_invoices", {}).get(
                "total_amount", 0
            ),
            "month_change_paid": invoices_data.get("month_change", {}).get(
                "paid_amount", {}
            ).get("percentage_change", 0),
            "month_change_overdue": invoices_data.get("month_change", {}).get(
                "overdue_amount", {}
            ).get("percentage_change", 0),
        }

    def _extract_cash_essentials(self, cash_data: Dict) -> Dict:
        """Extract only essential data from cash analysis"""
        return {
            "total_income": cash_data.get("total_income", 0),
            "total_expense": cash_data.get("total_expense", 0),
            "net_cash_flow": (
                float(cash_data.get("total_income", 0)) -
                float(cash_data.get("total_expense", 0))
            ),
        }

    def _get_industry_benchmarks(self) -> Optional[Dict]:
        """Load industry benchmarks from Industry_norms.csv if user has industry set"""
        try:
            # Get user's industry from profile
            if not self.user.profile or not self.user.profile.industry:
                logger.info(f"No industry set for user {self.user.id}")
                return None

            user_industry = self.user.profile.industry.strip()

            # Load Industry_norms.csv
            csv_path = os.path.join(
                settings.BASE_DIR, 
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
                logger.info(
                    f"No benchmarks found for industry: {user_industry}"
                )
                return None

            # Extract relevant benchmark data
            row = industry_row.iloc[0]
            return {
                "industry_name": row['industry'],
                "gross_margin_range": row['gross_margin_range'],
                "operating_margin_range": row['Operating_margin_range'],
                "cash_buffer_target": row['cash_buffer_target_months'],
                "dso_range": row['dso_range'],
                "expense_mix_notes": row['expense_mix_notes'],
                "notes": row['notes'],
            }

        except Exception as e:
            logger.error(f"Error loading industry benchmarks: {str(e)}")
            return None

    def _generate_ai_insights(self, combined_data: Dict) -> List[str]:
        """Generate AI insights using Claude with optimized prompt"""
        try:
            # Build prompt with available data
            prompt = self._build_analysis_prompt(combined_data)
            
            # Call Claude API
            insights_response = self.claude_client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system=(
                    "You are a business financial analyst. Generate exactly 4 "
                    "concise bullet-point insights. Each insight must be one "
                    "sentence with max 20 words. Focus on trends, benchmarks, "
                    "and actionable recommendations."
                ),
                model="claude-sonnet-4-20250514",
                max_tokens=200,
                temperature=0.3,
            )

            # Parse response into list of insights
            insights = self._parse_insights_response(insights_response)
            
            logger.info(f"Generated AI insights for user {self.user.id}")
            return insights

        except Exception as e:
            logger.error(f"Failed to generate AI insights: {str(e)}")
            # Return fallback insights
            return self._generate_fallback_insights(combined_data)

    def _build_analysis_prompt(self, combined_data: Dict) -> str:
        """Build optimized prompt with only essential financial metrics"""
        prompt_parts = [
            "Analyze this business financial data and provide exactly 4 insights:"
        ]

        # Add P&L data if available
        pnl_data = combined_data.get("pnl_data")
        if pnl_data:
            revenue = pnl_data["total_revenue"]
            expenses = pnl_data["total_expenses"]
            profit = pnl_data["net_profit"]
            
            # Use calculated gross margin from PnL data
            gross_margin = pnl_data.get('gross_margin', 0)
            
            prompt_parts.append(f"""
FINANCIAL PERFORMANCE:
• Revenue: ${revenue:,.0f} ({pnl_data['month_change_revenue']:+.1f}% MoM, {pnl_data['year_change_revenue']:+.1f}% YoY)
• Expenses: ${expenses:,.0f} ({pnl_data['month_change_expenses']:+.1f}% MoM, {pnl_data['year_change_expenses']:+.1f}% YoY)  
• Net Profit: ${profit:,.0f} ({pnl_data['month_change_profit']:+.1f}% MoM, {pnl_data['year_change_profit']:+.1f}% YoY)
• Gross Margin: {gross_margin:.1f}%""")

        # Add invoices data if available
        invoices_data = combined_data.get("invoices_data")
        if invoices_data:
            overdue_rate = 0
            total_invoices = invoices_data["total_invoices"]
            if total_invoices > 0:
                overdue_rate = (invoices_data["overdue_invoices_count"] / total_invoices) * 100
                
            prompt_parts.append(f"""
CASH FLOW & COLLECTIONS:
• Total Invoices: {invoices_data['total_invoices']}
• Overdue Rate: {overdue_rate:.1f}% (${invoices_data['overdue_invoices_amount']:,.0f})
• Collections Change: {invoices_data['month_change_paid']:+.1f}% MoM""")

        # Add cash analysis if available
        cash_data = combined_data.get("cash_data")
        if cash_data:
            prompt_parts.append(f"""
TRANSACTION FLOW:
• Income: ${cash_data['total_income']:,.0f}
• Expenses: ${cash_data['total_expense']:,.0f}
• Net Cash Flow: ${cash_data['net_cash_flow']:,.0f}""")

        # Add industry benchmarks if available
        industry_benchmarks = combined_data.get("industry_benchmarks")
        if industry_benchmarks:
            prompt_parts.append(f"""
INDUSTRY BENCHMARKS ({industry_benchmarks['industry_name']}):
• Gross Margin: {industry_benchmarks['gross_margin_range']}
• Operating Margin: {industry_benchmarks['operating_margin_range']}
• Cash Buffer: {industry_benchmarks['cash_buffer_target']} months
• Expense Mix: {industry_benchmarks['expense_mix_notes']}
• Notes: {industry_benchmarks['notes']}""")

        prompt_parts.append("""
Focus on: growth trends, expense efficiency, cash flow health,
profitability vs benchmarks.""")

        return "\n".join(prompt_parts)

    def _parse_insights_response(self, response: str) -> List[str]:
        """Parse Claude response into list of insights"""
        lines = response.strip().split('\n')
        insights = []
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith('•') or line.startswith('-') or
                         line.startswith('*') or len(insights) < 4):
                # Clean up bullet points and formatting
                clean_line = line.lstrip('•-* ').strip()
                if clean_line and len(clean_line) > 10:  # Meaningful insight
                    insights.append(clean_line)
                    
        # Ensure we have exactly 4 insights
        while len(insights) < 4:
            insights.append("Review business metrics for optimization.")
            
        return insights[:4]

    def _generate_fallback_insights(self, combined_data: Dict) -> List[str]:
        """Generate basic insights when AI fails"""
        insights = []
        
        pnl_data = combined_data.get("pnl_data")
        if pnl_data:
            revenue_change = pnl_data["month_change_revenue"]
            profit_change = pnl_data["month_change_profit"]
            
            if revenue_change > 10:
                insights.append("Revenue growth strong, maintain momentum.")
            elif revenue_change < -10:
                insights.append("Revenue declining, need growth initiatives.")
            else:
                insights.append("Revenue stable, explore optimization.")
                
            if profit_change > 15:
                insights.append("Profit margins improving, good efficiency.")
            elif profit_change < -15:
                insights.append("Profit declining, review expense management.")
            else:
                insights.append("Profitability steady, monitor expenses.")
        
        # Pad with generic insights if needed
        while len(insights) < 4:
            generic_insights = [
                "Monitor cash flow trends for better financial planning.",
                "Review invoice collection processes for optimization.",
            ]
            for insight in generic_insights:
                if insight not in insights and len(insights) < 4:
                    insights.append(insight)
                    
        return insights[:4]