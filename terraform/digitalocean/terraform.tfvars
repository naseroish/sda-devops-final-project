# ================================================================
#  DigitalOcean Configuration Values
# ================================================================

prefix             = "expensy"
region             = "nyc3"          # New York 3 datacenter
kubernetes_version = "1.31.1-do.4"   # Latest stable K8s version
node_size          = "s-2vcpu-4gb"   # $24/month per node
min_nodes          = 2               # Minimum for HA
max_nodes          = 4               # Maximum for cost control
registry_tier      = "starter"       # Free tier (500MB)
enable_monitoring  = true
environment        = "production"
