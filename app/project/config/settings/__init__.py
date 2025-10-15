from pathlib import Path

from split_settings.tools import include

_BASE_DIR = Path(__file__).parent.parent.parent


_base_settings: list[str] = [
    "components/core.py",
    "components/storages.py",
    "components/celery.py",
    "components/cache.py",
    "components/smtp.py",
    "components/valiables.py",
    "components/countries.py",
    "components/currencies.py",
]

# Include settings:
include(*_base_settings)
