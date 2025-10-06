from os import path

import django
from decouple import Csv, config
from django.conf import settings
from django.utils.encoding import smart_str
from django.utils.translation import (
    gettext_lazy as _,
)

django.utils.encoding.smart_text = smart_str


################################################################

# Build paths inside the project like this: _BASE_DIR.joinpath('some')
# `pathlib` is better than writing: dirname(dirname(dirname(__file__)))


# project secret key
SECRET_KEY: str = config("SECRET_KEY", cast=str)

# OpenAI API key
CLAUDE_API_KEY: str = config("CLAUDE_API_KEY", cast=str, default="")

# list of allowed project hosts
ALLOWED_HOSTS: list[str] = config("ALLOWED_HOSTS", cast=Csv())
################################################################

# the path where you can open any static file
# from the directory STATIC_ROOT in the browser
STATIC_URL: str = "/api/static/"

# the path to the folder where all static files, styles, etc. are saved
STATIC_ROOT: str = path.join(settings._BASE_DIR, "static/")

# path to the file that is responsible
# for processing synchronous requests to the application
WSGI_APPLICATION: str = "config.wsgi.application"
# path to the file that is responsible for
# processing asynchronous requests to the application

ASGI_APPLICATION: str = "config.asgi.application"

# path to a file that contains all the application's routing paths
ROOT_URLCONF: str = "config.urls"

# the constant that is responsible for which
# locale is currently set in the application
LANGUAGE_CODE: str = config("LANGUAGE_CODE", cast=str)

# the constant responsible for the time
# zone in which the application will work
TIME_ZONE: str = config("TIME_ZONE", cast=str)

USE_I18N: bool = config("USE_I18N", cast=bool)

USE_TZ: bool = False

USE_L10N: bool = True

# the constant that is responsible for filling the id field
DEFAULT_AUTO_FIELD: str = "django.db.models.BigAutoField"

# number of items to be displayed on list pages
PAGINATION_PAGE_SIZE: int = config("PAGINATION_PAGE_SIZE", cast=int)

# main user model
AUTH_USER_MODEL: str = config("AUTH_USER_MODEL", cast=str)

# the constant that is responsible for the mode in which the application will work.
# if true will be the development mode.
# if false, then in prod server mode
DEBUG: bool = config("DEBUG", cast=bool)

CODE_EXPIRE_MINUTES_TIME: int = 5

ALGORITHM = "HS256"