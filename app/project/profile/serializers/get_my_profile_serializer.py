from users.models import UserModel
from profile.models import ProfileModel
from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
)


class GetMyProfileSerializer(ModelSerializer):
    profile = SerializerMethodField()
    
    def get_profile(self, obj):
        if obj.profile:
            return ProfileSerializer(obj.profile).data
        return None
    
    class Meta:
        model: UserModel = UserModel
        exclude = ["password"]


class ProfileSerializer(ModelSerializer):
    class Meta:
        model: ProfileModel = ProfileModel
        fields = '__all__'
