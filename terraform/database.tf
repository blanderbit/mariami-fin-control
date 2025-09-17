# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Cloud SQL PostgreSQL instance
resource "google_sql_database_instance" "postgres" {
  name             = "${var.app_name}-postgres-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier = var.db_tier
    
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    
    backup_configuration {
      enabled                        = true
      start_time                    = "03:00"
      location                      = var.region
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }
    
    ip_configuration {
      ipv4_enabled                                  = true
      private_network                              = google_compute_network.vpc_network.id
      enable_private_path_for_google_cloud_services = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"  # In production, restrict this to specific IPs
      }
    }
    
    disk_autoresize       = true
    disk_autoresize_limit = 100
    disk_size            = 20
    disk_type            = "PD_SSD"
    
    database_flags {
      name  = "max_connections"
      value = "100"
    }
    
    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
    
    maintenance_window {
      day  = 7  # Sunday
      hour = 3
    }
  }
  
  deletion_protection = var.environment == "prod"
  
  depends_on = [
    google_project_service.apis,
    google_compute_network.vpc_network
  ]
}

# Database
resource "google_sql_database" "database" {
  name      = "${var.app_name}_db"
  instance  = google_sql_database_instance.postgres.name
  charset   = "UTF8"
  collation = "en_US.UTF8"
}

# Database user
resource "google_sql_user" "user" {
  name     = "${var.app_name}_user"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

# Private Service Access for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.app_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}