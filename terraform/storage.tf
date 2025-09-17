# Google Cloud Storage bucket for file uploads
resource "google_storage_bucket" "media_bucket" {
  name          = "${var.project_id}-${var.app_name}-media-${var.environment}"
  location      = var.region
  force_destroy = var.environment != "prod"
  
  uniform_bucket_level_access = true
  
  public_access_prevention = "enforced"
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 30
      with_state = "NONCURRENT"
    }
    action {
      type = "Delete"
    }
  }
  
  cors {
    origin          = var.allowed_origins
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Google Cloud Storage bucket for static files
resource "google_storage_bucket" "static_bucket" {
  name          = "${var.project_id}-${var.app_name}-static-${var.environment}"
  location      = var.region
  force_destroy = var.environment != "prod"
  
  uniform_bucket_level_access = true
  
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
  
  cors {
    origin          = var.allowed_origins
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Bucket for Terraform state (create manually before applying)
# This should be created first manually: gsutil mb gs://mariami-terraform-state

# IAM for Cloud Run to access buckets
resource "google_storage_bucket_iam_member" "media_bucket_admin" {
  bucket = google_storage_bucket.media_bucket.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

resource "google_storage_bucket_iam_member" "static_bucket_admin" {
  bucket = google_storage_bucket.static_bucket.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}