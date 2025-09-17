variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "Google Cloud Zone"
  type        = string
  default     = "europe-west1-b"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "mariami-fin-control"
}

variable "db_tier" {
  description = "Database instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "redis_memory_size_gb" {
  description = "Redis memory size in GB"
  type        = number
  default     = 1
}

variable "redis_tier" {
  description = "Redis service tier"
  type        = string
  default     = "BASIC"
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run instances"
  type        = string
  default     = "1000m"
}

variable "memory_limit" {
  description = "Memory limit for Cloud Run instances"
  type        = string
  default     = "2Gi"
}

variable "allowed_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = ["https://yourdomain.com"]
}

variable "django_secret_key" {
  description = "Django secret key"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}