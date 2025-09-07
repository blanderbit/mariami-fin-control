from users.serializers.update_user_serializer import UserNewDataSerializer

class UserUpdatedSerializer(UserNewDataSerializer):
    def to_representation(self, value):
        return dict(super().to_representation(value))
