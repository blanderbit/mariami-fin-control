# Copilot Instructions - MariaMi Financial Control

## Architecture Overview

This is a **full-stack financial control application** with:
- **Backend**: Django REST API (`app/project/`) with Poetry, Celery, Redis, PostgreSQL, MinIO
- **Frontend**: React + TypeScript SPA (`frontend/`) with Vite, TailwindCSS, Recharts
- **Deployment**: Google Cloud Platform via Terraform with Docker containers

## Critical Project Patterns

### Django Settings Structure
- Uses `django-split-settings` in `app/project/config/settings/`
- Settings split into components: `core.py`, `storages.py`, `minio.py`, `celery.py`, etc.
- NO single `settings.py` file - always modify component files

### App Organization Convention
Each Django app follows strict folder structure:
```
app_name/
├── models/         # Split models by domain (user_model.py, user_data_file.py)
├── serializers/    # DRF serializers with specific naming (users_list_serializer.py)
├── views/          # Class-based views, often split by functionality
├── services/       # Business logic layer
├── validators/     # Custom validation logic
├── constants/      # App-specific constants
├── openapi/        # API documentation schemas
├── tasks/          # Celery tasks
```

### API Patterns
- Base URL: `/api/v1/`
- Uses `djangorestframework-simplejwt` for auth
- Swagger docs at `/swagger/` (see `config/yasg.py`)
- API generation: `npm run api:generate` creates TypeScript client from Django schema

## Development Workflows

### Backend Development
```bash
# In app/ directory
docker-compose up -d          # Start all services (postgres, redis, minio)
# Entry point automatically runs: migrate, loaddata, collectstatic, runserver
```

### Frontend Development
```bash
# In frontend/ directory  
npm run dev                   # Vite dev server
npm run api:generate          # Generate API client from backend
```

### Key Commands in Docker Entrypoint
- `Api()`: Development mode with migrations and static files
- `ApiDeploy()`: Production mode with uWSGI
- `CeleryWorker()`: Background task processing

### Financial Data Processing
- Supports CSV/Excel upload for financial analysis
- Uses `pandas` and `openpyxl` for data processing
- AI integration with OpenAI and Anthropic for revenue analysis
- Cryptocurrency payment processing with custom `blockcypher` integration

## Frontend Patterns

### Authentication Flow
- Token storage in localStorage (`isAuthenticated`)
- Route protection with `ProtectedRoute` and `PublicRoute` components  
- Navigation handled in `Layout` component

### Component Structure
- Uses React Router v6 with nested layouts
- Framer Motion for animations
- Recharts for financial visualizations
- Lucide React for icons

## Infrastructure & Deployment

### Google Cloud Platform
- Terraform state stored in `mariami-terraform-state` bucket
- Modules: `cloud_run.tf`, `database.tf`, `networking.tf`, `storage.tf`, `redis.tf`
- Containerized deployment with Cloud Run

### Storage Integration
- MinIO for object storage (local dev)
- Google Cloud Storage (production) 
- User data bucket: `user-data`

## Key Integrations

### External APIs
- Cryptocurrency exchanges via `ccxt` library
- Blockchain integration with custom `hdwallet` and `blockcypher`
- AI models: OpenAI GPT and Anthropic Claude for financial analysis

### Async Processing  
- Celery with Redis broker for background tasks
- WebSocket support via Django Channels for real-time updates
- Uses `djangochannelsrestframework` for WebSocket APIs

## Database Conventions
- Uses `@final` decorator on models to prevent inheritance
- Custom user model with email as USERNAME_FIELD
- Profile model linked via OneToOneField to User
- Fixtures loaded automatically on startup (`*/fixtures/*.json`)

## Security & Configuration
- Environment variables managed via `python-decouple`
- CORS headers configured for frontend integration  
- JWT token authentication with refresh token support
- Admin detection via `is_admin` boolean field on User model