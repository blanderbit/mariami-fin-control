"""
AI Insight Service for generating business insights using Anthropic Claude
"""
import logging
from typing import Optional, Dict, Any

from config.instances.claude_ai_client import ClaudeClient
from profile.models import ProfileModel

logger = logging.getLogger(__name__)


class AISummaryService:
    """Service for generating AI insights based on user profile data"""

    AI_INSIGHT_PROMPT = """You are FinCl AI — an intelligent, human-like business finance assistant for SME founders.

Based on the available profile data below, generate a personalized financial summary (max 120–140 words):

PROFILE DATA:
– Name: {name}
– Company: {company_name}
– Country: {country} 
– Industry: {industry}
– Company size: {company_size}
– Business model: {revenue_model}
– Financial priority: {priority}
– Update frequency: {update_frequency}
– Currency: {currency}
– Current cash: {current_cash}
– Reserve target: {reserve_months}
– Multi-currency operations: {multicurrency}
– Business description: {business_description}

INSTRUCTIONS:
- ALWAYS generate a complete summary based on available data, even if some fields are missing
- For missing data, use business intelligence to infer reasonable assumptions
- Never ask for more information - work with what's provided
- Adapt tone to company size (Micro: cash flow focus, Small: growth balance, Mid-size: forecasting, Established: strategic finance)
- Include one positive insight and one actionable recommendation
- Mention specific FinCl AI tracking priorities based on their profile
- Sound confident and human-like, not robotic

Generate the summary now based on the provided data."""

    def __init__(self):
        self.claude_client = ClaudeClient()

    def generate_ai_insight(self, profile: ProfileModel) -> str:
        """
        Generate AI insight based on profile data using Anthropic Claude
        
        Args:
            profile: ProfileModel instance with user's business data
            
        Returns:
            Generated AI insight text
        """
        try:
            # Prepare data for the prompt
            profile_data = self._extract_profile_data(profile)
            
            # Format the prompt with profile data
            formatted_prompt = self.AI_INSIGHT_PROMPT.format(**profile_data)

            # Generate insight using Claude
            insight = self.claude_client.chat_completion(
                messages=[
                    {
                        "role": "user",
                        "content": formatted_prompt
                    }
                ],
                model="claude-sonnet-4-20250514",
                max_tokens=200,
                temperature=0.7
            )
            
            return insight
            
        except Exception as e:
            logger.error(f"Failed to generate AI insight: {str(e)}")
            # Return a fallback message instead of raising exception
            return self._get_fallback_insight(profile)

    def _extract_profile_data(self, profile: ProfileModel) -> Dict[str, Any]:
        """Extract and format profile data for the AI prompt"""
        
        # Determine company size category
        company_size_category = self._get_company_size_category(
            profile.employees_count
        )
        
        # Calculate reserve months if possible
        reserve_months = self._calculate_reserve_months(profile)
        
        # Format full name
        full_name = self._format_full_name(profile.name, profile.last_name)
        
        # Format current cash amount
        current_cash = self._format_money_field(profile.current_cash)
        
        return {
            "name": full_name,
            "company_name": profile.company_name or "their business",
            "country": profile.country or "global market",
            "industry": profile.industry or "their sector",
            "company_size": (
                f"{profile.employees_count or 'team'} "
                f"({company_size_category})"
            ),
            "revenue_model": self._format_business_model(
                profile.business_model
            ),
            "priority": self._format_priority(profile.primary_focus),
            "update_frequency": self._format_update_frequency(
                profile.update_frequency
            ),
            "currency": profile.currency or "USD",
            "current_cash": current_cash,
            "reserve_months": reserve_months,
            "multicurrency": (
                "Yes" if profile.multicurrency else "No"
            ),
            "business_description": (
                profile.company_info or 
                "A growing business focused on financial excellence"
            )
        }

    def _format_full_name(self, name: Optional[str], last_name: Optional[str]) -> str:
        """Format full name from first and last name"""
        if name and last_name:
            return f"{name} {last_name}"
        elif name:
            return name
        elif last_name:
            return last_name
        else:
            return "the founder"
    
    def _format_money_field(self, money_field) -> str:
        """Format money field for display"""
        if money_field and money_field.amount:
            return f"{money_field.currency} {money_field.amount:,.0f}"
        return "not specified"
    
    def _format_priority(self, priority) -> str:
        """Format financial priority for display"""
        priority_map = {
            "cash": "cash flow management",
            "profit": "profit optimization", 
            "growth": "growth acceleration"
        }
        
        # Handle list of priorities (multi-select)
        if isinstance(priority, list):
            if not priority:
                return "balanced financial management"
            formatted_priorities = [priority_map.get(p, p) for p in priority]
            if len(formatted_priorities) == 1:
                return formatted_priorities[0]
            elif len(formatted_priorities) == 2:
                return f"{formatted_priorities[0]} and {formatted_priorities[1]}"
            else:
                return f"{', '.join(formatted_priorities[:-1])}, and {formatted_priorities[-1]}"
        
        # Handle single priority (backward compatibility)
        return priority_map.get(priority, "balanced financial management")
    
    def _format_update_frequency(self, frequency: Optional[str]) -> str:
        """Format update frequency for display"""
        if not frequency:
            return "regular"
        return frequency

    def _format_business_model(self, business_model) -> str:
        """Format business model for display"""
        business_model_map = {
            "subscription": "subscription-based",
            "services": "service-oriented", 
            "hybrid": "hybrid model",
            "one_time": "one-time sales",
            "other": "specialized model"
        }
        
        # Handle list of business models (multi-select)
        if isinstance(business_model, list):
            if not business_model:
                return "their business model"
            formatted_models = [
                business_model_map.get(m, m) for m in business_model
            ]
            if len(formatted_models) == 1:
                return formatted_models[0]
            elif len(formatted_models) == 2:
                return f"{formatted_models[0]} and {formatted_models[1]}"
            else:
                return (
                    f"{', '.join(formatted_models[:-1])}, "
                    f"and {formatted_models[-1]}"
                )
        
        # Handle single business model (backward compatibility)
        return business_model_map.get(
            business_model, business_model or "their business model"
        )

    def _get_company_size_category(
        self, employees_count: Optional[int]
    ) -> str:
        """Categorize company size based on employee count"""
        if not employees_count:
            return "Not specified"
        
        if employees_count <= 10:
            return "Micro"
        elif employees_count <= 50:
            return "Small"
        elif employees_count <= 250:
            return "Mid-size"
        else:
            return "Established"

    def _calculate_reserve_months(self, profile: ProfileModel) -> str:
        """Calculate reserve months based on capital reserve target"""
        if not profile.capital_reserve_target or not profile.current_cash:
            # Provide meaningful fallback based on company size
            company_size = self._get_company_size_category(
                profile.employees_count
            )
            fallback_targets = {
                "Micro": "3-6 months target recommended",
                "Small": "6-12 months target recommended", 
                "Mid-size": "12+ months target recommended",
                "Established": "Strategic reserves planning needed"
            }
            return fallback_targets.get(
                company_size, 
                "Reserve planning in progress"
            )
        
        try:
            if profile.capital_reserve_target.amount > 0:
                ratio = (profile.current_cash.amount / 
                        profile.capital_reserve_target.amount)
                months = ratio * 12  # Assuming target is annual
                
                if months >= 12:
                    return f"Strong position (~{months:.1f} months)"
                elif months >= 6:
                    return f"Good progress (~{months:.1f} months)"
                elif months >= 3:
                    return f"Building reserves (~{months:.1f} months)"
                else:
                    return f"Early stage (~{months:.1f} months)"
            else:
                return "Reserve target being established"
        except (AttributeError, ValueError, ZeroDivisionError):
            return "Reserve analysis in progress"

    def _get_fallback_insight(self, profile: ProfileModel) -> str:
        """Return a personalized fallback insight if AI generation fails"""
        company_size_category = self._get_company_size_category(
            profile.employees_count
        )
        
        # Get personalized elements
        name = self._format_full_name(profile.name, profile.last_name)
        company = profile.company_name or "your business"
        priority = self._format_priority(profile.primary_focus)
        
        # Base insights by company size
        fallback_insights = {
            "Micro": (
                f"{name}, as a micro business owner, your focus on "
                f"{priority} is smart. Build cash flow stability while "
                f"tracking daily positions and seeking quick wins."
            ),
            "Small": (
                f"Great to see {company} at this growth stage, {name}. "
                f"Balance {priority} with strategic investments. Track "
                f"metrics that drive sustainable expansion."
            ),
            "Mid-size": (
                f"{name}, {company} needs precision in forecasting now. "
                f"Your {priority} focus should include robust planning "
                f"and team-level execution optimization."
            ),
            "Established": (
                f"{company} is well-positioned, {name}. Strategic "
                f"capital allocation and {priority} will drive "
                f"scalable financial systems for long-term value."
            )
        }
        
        base_insight = fallback_insights.get(
            company_size_category, 
            fallback_insights["Small"]
        )
        
        return (
            f"{base_insight} FinCl AI will track the metrics that "
            f"matter most for your business stage and provide insights "
            f"for better financial decisions."
        )

    def update_profile_with_insight(self, profile: ProfileModel) -> ProfileModel:
        """
        Generate and save AI insight to the profile
        
        Args:
            profile: ProfileModel instance to update
            
        Returns:
            Updated ProfileModel instance
        """
        try:
            insight = self.generate_ai_insight(profile)
            profile.ai_insight = insight
            profile.save(update_fields=['ai_insight'])
            
            logger.info(f"AI insight generated and saved for profile {profile.id}")
            return profile
            
        except Exception as e:
            logger.error(f"Failed to update profile with AI insight: {str(e)}")
            raise


# Singleton instance
ai_summary_service = AISummaryService()