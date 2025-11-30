# ================================================================
#  DigitalOcean Kubernetes (DOKS) Cluster Configuration
# ================================================================

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
  
  # Local backend (simpler for now - can migrate to Spaces later)
  backend "local" {
    path = "terraform.tfstate"
  }
  
  # Uncomment below to use DigitalOcean Spaces for remote state
  # backend "s3" {
  #   skip_credentials_validation = true
  #   skip_metadata_api_check     = true
  #   skip_requesting_account_id  = true
  #   skip_s3_checksum            = true
  #   
  #   endpoints = {
  #     s3 = "https://nyc3.digitaloceanspaces.com"
  #   }
  #   
  #   region = "us-east-1"
  #   bucket = "expensy-terraform-state"
  #   key    = "digitalocean/terraform.tfstate"
  #   
  #   # Set via environment variables:
  #   # AWS_ACCESS_KEY_ID = DigitalOcean Spaces Access Key
  #   # AWS_SECRET_ACCESS_KEY = DigitalOcean Spaces Secret Key
  # }
}

provider "digitalocean" {
  # Token should be set via environment variable: DIGITALOCEAN_TOKEN
}

# ================================================================
#  Data Sources
# ================================================================

# Get latest available Kubernetes version
data "digitalocean_kubernetes_versions" "main" {
  version_prefix = "1.32."
}

# ================================================================
#  DigitalOcean Kubernetes Cluster (DOKS)
# ================================================================

resource "digitalocean_kubernetes_cluster" "main" {
  name    = "${var.prefix}-doks-cluster"
  region  = var.region
  version = data.digitalocean_kubernetes_versions.main.latest_version

  # Auto-upgrade for security patches
  auto_upgrade = true
  surge_upgrade = true

  # Maintenance window
  maintenance_policy {
    start_time = "04:00"
    day        = "sunday"
  }

  node_pool {
    name       = "${var.prefix}-default-pool"
    size       = var.node_size
    auto_scale = true
    min_nodes  = var.min_nodes
    max_nodes  = var.max_nodes
    
    tags = ["${var.prefix}", "production", "kubernetes"]
    
    labels = {
      environment = "production"
      project     = var.prefix
    }
  }

  tags = ["${var.prefix}", "kubernetes", "production"]
}

# ================================================================
#  VPC for Kubernetes Cluster
# ================================================================

resource "digitalocean_vpc" "main" {
  name     = "${var.prefix}-vpc"
  region   = var.region
  ip_range = "10.10.0.0/16"
  
  description = "VPC for ${var.prefix} Kubernetes cluster"
}

# ================================================================
#  Container Registry
# ================================================================

resource "digitalocean_container_registry" "main" {
  name                   = "${var.prefix}registry"
  subscription_tier_slug = var.registry_tier
  region                 = var.region
}

# Integrate registry with Kubernetes cluster
resource "digitalocean_container_registry_docker_credentials" "main" {
  registry_name = digitalocean_container_registry.main.name
}

# ================================================================
#  Firewall Rules (Optional - for additional security)
# ================================================================

resource "digitalocean_firewall" "k8s" {
  name = "${var.prefix}-k8s-firewall"

  # Apply to all nodes in the cluster
  tags = ["${var.prefix}"]
  
  # Ensure cluster is created first so the tag exists
  depends_on = [digitalocean_kubernetes_cluster.main]

  # Allow inbound HTTP/HTTPS
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow SSH (for debugging if needed)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0"]
  }

  # Allow all outbound
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# ================================================================
#  Load Balancer for Ingress
# ================================================================

resource "digitalocean_loadbalancer" "public" {
  name   = "${var.prefix}-lb"
  region = var.region

  forwarding_rule {
    entry_port     = 80
    entry_protocol = "http"

    target_port     = 80
    target_protocol = "http"
  }

  forwarding_rule {
    entry_port     = 443
    entry_protocol = "https"

    target_port     = 443
    target_protocol = "https"

    tls_passthrough = true
  }

  healthcheck {
    port     = 80
    protocol = "http"
    path     = "/healthz"
  }

  # Droplet tag to automatically add cluster nodes
  droplet_tag = "${var.prefix}"
  
  # Ensure cluster is created first so the tag exists
  depends_on = [digitalocean_kubernetes_cluster.main]
}

# ================================================================
#  Outputs
# ================================================================

output "cluster_id" {
  description = "DigitalOcean Kubernetes cluster ID"
  value       = digitalocean_kubernetes_cluster.main.id
}

output "cluster_name" {
  description = "DigitalOcean Kubernetes cluster name"
  value       = digitalocean_kubernetes_cluster.main.name
}

output "cluster_endpoint" {
  description = "Kubernetes cluster endpoint"
  value       = digitalocean_kubernetes_cluster.main.endpoint
}

output "cluster_status" {
  description = "Kubernetes cluster status"
  value       = digitalocean_kubernetes_cluster.main.status
}

output "vpc_id" {
  description = "VPC ID"
  value       = digitalocean_vpc.main.id
}

output "registry_endpoint" {
  description = "Container registry endpoint"
  value       = digitalocean_container_registry.main.endpoint
}

output "loadbalancer_ip" {
  description = "Load balancer public IP"
  value       = digitalocean_loadbalancer.public.ip
}

output "kubeconfig" {
  description = "Kubernetes config file"
  value       = digitalocean_kubernetes_cluster.main.kube_config[0].raw_config
  sensitive   = true
}
