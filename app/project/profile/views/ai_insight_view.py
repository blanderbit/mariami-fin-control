"""
AI Insight View for generating business insights
"""

import logging

from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from profile.services.ai_summary_service import ai_summary_service

logger = logging.getLogger(__name__)

class ProfileAIInsightView(GenericAPIView):
    """
    Generate AI insight for user's business profile

    This endpoint generates a personalized AI insight based on the user's
    profile information using Anthropic Claude AI. The insight is saved
    to the user's profile and returned in the response.
    """

    def get(self, request: Request) -> Response:
        """Generate and return AI insight for the current user's profile"""

        user = request.user

        # Check if user has a profile
        if not hasattr(user, "profile") or not user.profile:
            return Response(
                {
                    "error": "User profile not found. Please complete onboarding first.",
                },
                status=HTTP_400_BAD_REQUEST,
            )

        profile = user.profile

        try:
            # Generate and update profile with AI insight
            updated_profile = ai_summary_service.update_profile_with_insight(profile)

            # Return the generated insight
            response_data = {
                "ai_insight": updated_profile.ai_insight,
            }

            logger.info(f"AI insight generated successfully for user {user.id}")
            return Response(response_data, status=HTTP_200_OK)

        except Exception as e:
            logger.error(f"Failed to generate AI insight for user {user.id}: {str(e)}")
            return Response(
                {
                    "error": "Failed to generate AI insight. Please try again later.",
                },
                status=HTTP_400_BAD_REQUEST,
            )
