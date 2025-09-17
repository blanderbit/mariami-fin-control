# Generate random Django secret key
resource "random_password" "django_secret_key" {
  length  = 50
  special = true
}

# Store database connection string in Secret Manager
resource "google_secret_manager_secret" "db_connection_string" {
  secret_id = "${var.app_name}-db-connection-string"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_connection_string" {
  secret = google_secret_manager_secret.db_connection_string.id
  secret_data = "postgresql://${google_sql_user.user.name}:${random_password.db_password.result}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}"
}

# Store Django secret key in Secret Manager
resource "google_secret_manager_secret" "django_secret_key" {
  secret_id = "${var.app_name}-django-secret-key"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "django_secret_key" {
  secret = google_secret_manager_secret.django_secret_key.id
  secret_data = random_password.django_secret_key.result
}

# Store Redis connection string in Secret Manager
resource "google_secret_manager_secret" "redis_connection_string" {
  secret_id = "${var.app_name}-redis-connection-string"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "redis_connection_string" {
  secret = google_secret_manager_secret.redis_connection_string.id
  secret_data = "redis://:${google_redis_instance.redis.auth_string}@${google_redis_instance.redis.host}:${google_redis_instance.redis.port}/0"
}

# Store allowed hosts
resource "google_secret_manager_secret" "allowed_hosts" {
  secret_id = "${var.app_name}-allowed-hosts"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "allowed_hosts" {
  secret = google_secret_manager_secret.allowed_hosts.id
  secret_data = join(",", var.allowed_origins)
}

# Store CORS origins
resource "google_secret_manager_secret" "cors_origins" {
  secret_id = "${var.app_name}-cors-origins"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "cors_origins" {
  secret = google_secret_manager_secret.cors_origins.id
  secret_data = join(",", var.allowed_origins)
}