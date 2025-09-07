from users.models import UserModel
from profile.serializers import GetMyProfileSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK



class GetMyProfileView(GenericAPIView):
    """
    User personal profile

    This endpoint allows an authorized user to
    get detailed information about their profile,
    """

    serializer_class = GetMyProfileSerializer

    def get(self, request: Request) -> Response:
        user: UserModel = UserModel.objects.get(id=self.request.user.id)
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=HTTP_200_OK)
