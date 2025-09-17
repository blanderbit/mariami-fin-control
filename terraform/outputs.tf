output "django_app_url" {
  description = "URL of the Django application"
  value       = google_cloud_run_v2_service.django_app.uri
}

output "database_instance_name" {
  description = "Name of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.name
}

output "database_connection_name" {
  description = "Connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Private IP of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "redis_host" {
  description = "Redis instance host"
  value       = google_redis_instance.redis.host
}

output "redis_port" {
  description = "Redis instance port"
  value       = google_redis_instance.redis.port
}

output "media_bucket_name" {
  description = "Name of the media storage bucket"
  value       = google_storage_bucket.media_bucket.name
}

output "static_bucket_name" {
  description = "Name of the static storage bucket"
  value       = google_storage_bucket.static_bucket.name
}

output "service_account_email" {
  description = "Email of the service account used by Cloud Run"
  value       = google_service_account.cloud_run_service_account.email
}

output "vpc_network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.vpc_network.name
}

output "vpc_connector_name" {
  description = "Name of the VPC connector"
  value       = google_vpc_access_connector.connector.name
}

# Secret Manager secret names for reference
output "secret_names" {
  description = "Names of the secrets stored in Secret Manager"
  value = {
    database_connection = google_secret_manager_secret.db_connection_string.secret_id
    django_secret_key   = google_secret_manager_secret.django_secret_key.secret_id
    redis_connection    = google_secret_manager_secret.redis_connection_string.secret_id
    allowed_hosts       = google_secret_manager_secret.allowed_hosts.secret_id
    cors_origins        = google_secret_manager_secret.cors_origins.secret_id
  }
}