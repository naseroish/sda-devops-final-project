# ================================================================
#  Variables for DigitalOcean Kubernetes Deployment
# ================================================================

variable "prefix" {
  description = "Prefix for all resources"
  type        = string
  default     = "expensy"
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
  
  validation {
    condition = contains([
      "nyc1", "nyc3", "ams3", "sfo3", "sgp1", 
      "lon1", "fra1", "tor1", "blr1", "syd1"
    ], var.region)
    error_message = "Must be a valid DigitalOcean region."
  }
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.31.1-do.4" # Latest stable as of Nov 2025
}

variable "node_size" {
  description = "Droplet size for Kubernetes nodes"
  type        = string
  default     = "s-2vcpu-4gb" # $24/month per node
  
  # Options:
  # s-1vcpu-2gb:    $12/month - Dev/Test
  # s-2vcpu-4gb:    $24/month - Small production (recommended)
  # s-4vcpu-8gb:    $48/month - Medium production
  # s-8vcpu-16gb:   $96/month - Large production
}

variable "min_nodes" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of nodes"
  type        = number
  default     = 4
}

variable "registry_tier" {
  description = "Container registry subscription tier"
  type        = string
  default     = "starter" # Free tier
  
  # Options:
  # starter:      Free (500MB storage)
  # basic:        $5/month (5GB storage)
  # professional: $20/month (100GB storage)
}

variable "enable_monitoring" {
  description = "Enable DigitalOcean monitoring"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}
