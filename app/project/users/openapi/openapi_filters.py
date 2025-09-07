from users.filters import (
    USERS_LIST_ORDERING_FIELDS,
    USERS_LIST_SEARCH_FIELDS,
)
from config.openapi import (
    concat_search_fields,
)
from drf_yasg import openapi

users_searh_query = openapi.Parameter(
    "search",
    openapi.IN_QUERY,
    description=f"EN - This option allows you to filter the list of \
        users\
        \nRecords are filtered by the fields: \
        {concat_search_fields(USERS_LIST_SEARCH_FIELDS)}\
    \n \
    \n RU - Эта опция позволяет фильтровать список \
        пользователей \
        \nЗаписи фильтруются по полям: \
        {concat_search_fields(USERS_LIST_SEARCH_FIELDS)}",
    type=openapi.TYPE_STRING,
)
users_ordering = openapi.Parameter(
    "ordering",
    openapi.IN_QUERY,
    description="EN - This option allows you to sort the list of \
        users \
    \n \
    \n RU - Эта опция позволяет вам сортировать список \
        пользователей",
    type=openapi.TYPE_STRING,
    enum=[k for k in USERS_LIST_ORDERING_FIELDS],
)

users_list_query_params: list[openapi.Parameter] = [
    users_ordering,
    users_searh_query,
]