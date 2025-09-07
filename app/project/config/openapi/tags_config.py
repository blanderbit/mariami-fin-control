from drf_yasg.generators import (
    OpenAPISchemaGenerator,
)

AUTH_SWAGGER_TAG_DOCS: dict[str, str] = {
    "name": "auth",
    "description": "EN - a block of endpoints that are fully \
    responsible for auth interaction (account creation, \
    registration, password change, mail, login, etc) \
    \nRU - блок конечных точек, которые полностью \
    отвечает за взаимодействие с аутентификацией (создание учетной записи, \
    регистрация, смена пароля, почта, логин и т.д.) ",
}

USERS_SWAGGER_TAG_DOCS: dict[str, str] = {
    "name": "users",
    "description": "EN - a block of endpoints that are fully \
    responsible for interaction with users (receiving the list of users, \
    deleting users, changing users, etc.) \
    \nRU - блок конечных точек, которые полностью \
    отвечает за взаимодействие с пользователями  (получение списка пользователей, \
    удаление пользователей, изменение пользователей и тд) ",
}


class CustomOpenAPISchemaGenerator(OpenAPISchemaGenerator):
    def get_schema(self, request=None, public=False):
        """Generate a :class:`.Swagger` object with custom tags"""

        swagger = super().get_schema(request, public)
        swagger.tags = [
            AUTH_SWAGGER_TAG_DOCS,
            USERS_SWAGGER_TAG_DOCS,
        ]
        return swagger
