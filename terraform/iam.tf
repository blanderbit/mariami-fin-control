# Service Account for Cloud Run
resource "google_service_account" "cloud_run_service_account" {
  account_id   = "${var.app_name}-cloud-run-sa"
  display_name = "Cloud Run Service Account for ${var.app_name}"
  description  = "Service account used by Cloud Run instances"
}

# IAM bindings for the service account
resource "google_project_iam_member" "cloud_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_project_iam_member" "secret_manager_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_project_iam_member" "logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_project_iam_member" "monitoring_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_project_iam_member" "trace_agent" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

# Allow Secret Manager secrets access
resource "google_secret_manager_secret_iam_member" "db_connection_string_access" {
  secret_id = google_secret_manager_secret.db_connection_string.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "django_secret_key_access" {
  secret_id = google_secret_manager_secret.django_secret_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "redis_connection_string_access" {
  secret_id = google_secret_manager_secret.redis_connection_string.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "allowed_hosts_access" {
  secret_id = google_secret_manager_secret.allowed_hosts.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "cors_origins_access" {
  secret_id = google_secret_manager_secret.cors_origins.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}