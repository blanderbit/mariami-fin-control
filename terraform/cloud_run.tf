# Cloud Run service for Django application
resource "google_cloud_run_v2_service" "django_app" {
  name     = "${var.app_name}-app"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  
  template {
    service_account = google_service_account.cloud_run_service_account.email
    
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
    
    containers {
      image = "gcr.io/${var.project_id}/${var.app_name}:latest"
      
      ports {
        name           = "http1"
        container_port = 8000
      }
      
      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
      }
      
      env {
        name = "ENVIRONMENT"
        value = var.environment
      }
      
      env {
        name = "PROJECT_ID"
        value = var.project_id
      }
      
      env {
        name = "REGION"
        value = var.region
      }
      
      env {
        name = "GCS_MEDIA_BUCKET"
        value = google_storage_bucket.media_bucket.name
      }
      
      env {
        name = "GCS_STATIC_BUCKET"
        value = google_storage_bucket.static_bucket.name
      }
      
      # Database connection from Secret Manager
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_connection_string.secret_id
            version = "latest"
          }
        }
      }
      
      # Django secret key from Secret Manager
      env {
        name = "DJANGO_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.django_secret_key.secret_id
            version = "latest"
          }
        }
      }
      
      # Redis connection from Secret Manager
      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_connection_string.secret_id
            version = "latest"
          }
        }
      }
      
      # Allowed hosts from Secret Manager
      env {
        name = "ALLOWED_HOSTS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.allowed_hosts.secret_id
            version = "latest"
          }
        }
      }
      
      # CORS origins from Secret Manager
      env {
        name = "CORS_ALLOWED_ORIGINS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.cors_origins.secret_id
            version = "latest"
          }
        }
      }
      
      startup_probe {
        http_get {
          path = "/health/"
          port = 8000
        }
        initial_delay_seconds = 30
        timeout_seconds       = 10
        period_seconds       = 10
        failure_threshold    = 3
      }
      
      liveness_probe {
        http_get {
          path = "/health/"
          port = 8000
        }
        initial_delay_seconds = 60
        timeout_seconds       = 10
        period_seconds       = 30
        failure_threshold    = 3
      }
    }
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
  
  depends_on = [
    google_project_service.apis,
    google_vpc_access_connector.connector,
    google_sql_database_instance.postgres,
    google_redis_instance.redis
  ]
}

# Cloud Run service for Celery worker
resource "google_cloud_run_v2_service" "celery_worker" {
  name     = "${var.app_name}-celery-worker"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"
  
  template {
    service_account = google_service_account.cloud_run_service_account.email
    
    scaling {
      min_instance_count = 1
      max_instance_count = 5
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
    
    containers {
      image   = "gcr.io/${var.project_id}/${var.app_name}:latest"
      command = ["celery"]
      args    = ["-A", "config.celery", "worker", "--loglevel=info"]
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "1Gi"
        }
      }
      
      env {
        name = "ENVIRONMENT"
        value = var.environment
      }
      
      env {
        name = "PROJECT_ID"
        value = var.project_id
      }
      
      # Same environment variables as Django app
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_connection_string.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "DJANGO_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.django_secret_key.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_connection_string.secret_id
            version = "latest"
          }
        }
      }
    }
  }
  
  depends_on = [
    google_project_service.apis,
    google_vpc_access_connector.connector,
    google_redis_instance.redis
  ]
}

# Allow unauthenticated access to Django app
resource "google_cloud_run_service_iam_member" "django_app_all_users" {
  service  = google_cloud_run_v2_service.django_app.name
  location = google_cloud_run_v2_service.django_app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}