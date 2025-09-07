from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK


class CheckIsUserAdminView(GenericAPIView):
    def get(self, request: Request) -> Response:
        return Response({"is_admin": request.user.is_admin}, status=HTTP_200_OK)
