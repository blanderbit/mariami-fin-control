from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
)
from profile.models import ProfileModel
from profile.serializers.onboarding_serializer import OnboardingSerializer


class OnboardingView(GenericAPIView):
    """
    Onboarding API - allows step by step profile completion
    """
    
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request) -> Response:
        """
        Update profile data during onboarding process
        """
        user = request.user
        
        # Get or create profile
        if not user.profile:
            profile = ProfileModel.objects.create()
            user.profile = profile
            user.save()
        else:
            profile = user.profile
        
        # Serialize and validate the data
        serializer = self.serializer_class(
            profile,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            updated_profile = serializer.save()
            
            # Check if onboarding is complete and update user status
            if (updated_profile.is_onboarding_complete()
                    and not user.is_onboarded):
                user.is_onboarded = True
                user.save()
            
            # Return updated profile data with onboarding status
            response_data = {
                "profile": OnboardingSerializer(updated_profile).data,
                "is_onboarding_complete": (
                    updated_profile.is_onboarding_complete()
                ),
                "is_onboarded": user.is_onboarded
            }
            
            return Response(response_data, status=HTTP_200_OK)
        
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class OnboardingStatusView(GenericAPIView):
    """
    Get current onboarding status and profile data
    """
    
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """
        Get current onboarding status and profile data
        """
        user = request.user
        
        # Get or create profile
        if not user.profile:
            profile = ProfileModel.objects.create()
            user.profile = profile
            user.save()
        else:
            profile = user.profile
        
        response_data = {
            "profile": OnboardingSerializer(profile).data,
            "is_onboarding_complete": profile.is_onboarding_complete(),
            "is_onboarded": user.is_onboarded,
            "required_fields": ProfileModel.REQUIRED_ONBOARDING_FIELDS
        }
        
        return Response(response_data, status=HTTP_200_OK)
