from drf_yasg import openapi


def concat_search_fields(search_fields: list[str]) -> str:
    return ", ".join(search_fields)


offset_query = openapi.Parameter(
    "offset",
    openapi.IN_QUERY,
    type=openapi.TYPE_INTEGER,
    description="EN - This option allows the user to specify \
    how many records he wants to receive. \
    By default, this number is 10. \
    \n \
    \n RU - Эта опция дает возможность пользователю указать какое \
    количество записей он хочет получить. \
    По стандарту это число равняется 10",
)
