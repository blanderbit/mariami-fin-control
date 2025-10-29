# Revenue Analysis Feature

Этот функционал позволяет пользователям получать анализ выручки на основе загруженных финансовых данных.

## Эндпоинт

```
GET /api/v1/users/revenue?period={period_type}
```

### Параметры

- `period` (обязательный): тип периода для анализа
  - `month` - сравнение текущего месяца с предыдущим
  - `year` - сравнение текущего года с предыдущим

### Авторизация

Требует JWT токен в заголовке `Authorization: Bearer <token>`

### Примеры запросов

```bash
# Анализ месяц к месяцу
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "https://api.finclai.com/api/v1/users/revenue?period=month"

# Анализ год к году
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "https://api.finclai.com/api/v1/users/revenue?period=year"
```

### Пример ответа

```json
{
  "period_type": "month",
  "current_revenue": 15000.0,
  "previous_revenue": 12000.0,
  "change": 3000.0,
  "percentage_change": 25.0,
  "is_positive_change": true,
  "currency": "USD"
}
```

## Источники данных

Анализ выручки рассчитывается **исключительно** на основе P&L файлов:

1. **P&L (Profit & Loss)** - колонка `Revenue` по месяцам

Структура P&L файла должна содержать:
- `Month` - дата в формате YYYY-MM или любом формате, распознаваемом pandas
- `Revenue` - числовое значение выручки за указанный месяц

## Кэширование

- Результаты кэшируются на 1 час в Redis
- Кэш автоматически инвалидируется при загрузке новых P&L файлов
- Кэш НЕ инвалидируется при загрузке invoices или transactions (они не влияют на расчёт)
- Ключи кэша: `financial_analysis_{user_id}_{period}_{date}`

## Архитектура

### Файлы

- `users/services/financial_analysis_service.py` - основная логика расчёта выручки
- `users/services/cache_invalidation_service.py` - управление кэшем
- `users/views/financial_analysis_view.py` - API endpoint
- `users/serializers/financial_analysis_serializer.py` - валидация и сериализация
- `config/settings/components/cache.py` - настройки Redis кэширования

### Модели

- `UserDataFile` - информация о загруженных пользователем файлах
- CSV файлы хранятся в MinIO storage

## Обработка ошибок

- `400` - Неверные параметры запроса
- `401` - Требуется авторизация
- `404` - Нет данных для анализа (пользователь не загрузил файлы)
- `500` - Внутренняя ошибка сервера

## Производительность

- Результаты кэшируются в Redis
- Файлы загружаются из MinIO только при первом запросе или после инвалидации кэша
- Поддерживается предварительная загрузка кэша после загрузки файлов