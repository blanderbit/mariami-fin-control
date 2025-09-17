# Redis instance for caching and Celery broker
resource "google_redis_instance" "redis" {
  name           = "${var.app_name}-redis-${var.environment}"
  tier           = var.redis_tier
  memory_size_gb = var.redis_memory_size_gb
  region         = var.region
  
  location_id = var.zone
  
  authorized_network = google_compute_network.vpc_network.id
  
  redis_version = "REDIS_7_0"
  display_name  = "${var.app_name} Redis Instance"
  
  # Enable AUTH
  auth_enabled = true
  
  # Redis configuration
  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }
  
  # Maintenance policy
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
        nanos   = 0
        seconds = 0
      }
    }
  }
  
  depends_on = [
    google_project_service.apis,
    google_compute_network.vpc_network
  ]
}