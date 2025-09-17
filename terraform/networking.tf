# Enable necessary Google Cloud APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "storage-component.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com"
  ])

  service = each.key
  project = var.project_id

  disable_dependent_services = true
}

# Create VPC network
resource "google_compute_network" "vpc_network" {
  name                    = "${var.app_name}-vpc"
  auto_create_subnetworks = false
  depends_on             = [google_project_service.apis]
}

# Create subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.app_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
  
  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "192.168.1.0/24"
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.64.0/22"
  }
}

# VPC Connector for Cloud Run
resource "google_vpc_access_connector" "connector" {
  name          = "${var.app_name}-vpc-connector"
  region        = var.region
  network       = google_compute_network.vpc_network.name
  ip_cidr_range = "10.8.0.0/28"
  
  depends_on = [
    google_project_service.apis,
    google_compute_subnetwork.subnet
  ]
}