from users.models import UserModel
from users.serializers.file_upload_serializers import UserDataFileSerializer
from profile.models import ProfileModel
from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
)


class GetMyProfileSerializer(ModelSerializer):
    profile = SerializerMethodField()
    uploaded_files = SerializerMethodField()
    
    def get_profile(self, obj):
        if obj.profile:
            return ProfileSerializer(obj.profile).data
        return None
    
    def get_uploaded_files(self, obj):
        """Get user's uploaded data files"""
        # Use prefetched and pre-filtered data
        return UserDataFileSerializer(obj.data_files.all(), many=True).data
    
    class Meta:
        model: UserModel = UserModel
        exclude = ["password"]


class ProfileSerializer(ModelSerializer):
    oecd_country = SerializerMethodField()
    
    def get_oecd_country(self, obj):
        """Get OECD country code for the profile's country"""
        return obj.oecd_country
    
    class Meta:
        model: ProfileModel = ProfileModel
        fields = '__all__'
