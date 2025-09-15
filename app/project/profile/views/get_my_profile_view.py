from users.models import UserModel
from profile.serializers import GetMyProfileSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from django.db.models import Prefetch
from users.models.user_data_file import UserDataFile


class GetMyProfileView(GenericAPIView):
    """
    User personal profile

    This endpoint allows an authorized user to
    get detailed information about their profile,
    """

    serializer_class = GetMyProfileSerializer

    def get(self, request: Request) -> Response:
        # Optimize queries with select_related and prefetch_related
        user: UserModel = (
            UserModel.objects
            .select_related('profile')
            .prefetch_related(
                Prefetch(
                    'data_files',
                    queryset=UserDataFile.objects.filter(is_active=True)
                    .order_by('-upload_time')
                )
            )
            .get(id=self.request.user.id)
        )
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=HTTP_200_OK)
