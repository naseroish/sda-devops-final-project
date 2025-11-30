# Multi-Cloud Deployment Guide

## Overview

The Expensy application now supports deployment to multiple cloud providers with a unified, reusable infrastructure codebase. This allows you to switch between providers based on cost, performance, or regional requirements.

## Supported Cloud Providers

| Provider | Status | Cost (Est.) | Notes |
|----------|--------|-------------|-------|
| **DigitalOcean** | ✅ Ready | ~$48/month | Recommended for cost-effective deployments |
| **Azure** | ✅ Ready | ~$150/month | Enterprise-grade, existing setup |
| **AWS** | 🔄 Planned | ~$100/month | Future support |
| **GCP** | 🔄 Planned | ~$120/month | Future support |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Cloud Setup                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  terraform/                                                  │
│  ├── azure/              ← Azure-specific resources         │
│  │   ├── main.tf         (AKS cluster configuration)        │
│  │   ├── variables.tf                                       │
│  │   └── terraform.tfvars                                   │
│  │                                                           │
│  ├── digitalocean/       ← DigitalOcean-specific resources  │
│  │   ├── main.tf         (DOKS cluster configuration)       │
│  │   ├── variables.tf                                       │
│  │   └── terraform.tfvars                                   │
│  │                                                           │
│  └── modules/            ← Shared, reusable modules         │
│      └── kubernetes/     (Common K8s configurations)         │
│                                                              │
│  kubernetes/                                                 │
│  ├── *.yaml              ← Cloud-agnostic manifests         │
│  ├── storageclass-azure.yaml        ← Azure storage         │
│  ├── storageclass-digitalocean.yaml ← DO storage            │
│  └── cloud-config.yaml   ← Provider-specific config         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Cost Comparison

### DigitalOcean (Recommended for Budget)
```
DOKS Cluster (2 nodes, s-2vcpu-4gb):    $48/month
Container Registry (Starter):           Free
Load Balancer:                          $12/month
Block Storage (100GB):                  $10/month
─────────────────────────────────────────────────
Total:                                  ~$70/month
```

### Azure (Current Setup)
```
AKS Cluster (3 nodes, Standard_A2_v2): $120/month
Container Registry (Basic):            $5/month
Load Balancer:                          $20/month
Managed Disks (100GB):                  $15/month
Log Analytics:                          Variable
─────────────────────────────────────────────────
Total:                                  ~$160+/month
```

## Quick Start - DigitalOcean Deployment

### Prerequisites

1. **DigitalOcean Account**
   - Sign up at https://www.digitalocean.com
   - Get $200 free credit (new accounts)

2. **Required Secrets in GitHub**
   ```
   DIGITALOCEAN_TOKEN        - DigitalOcean API token
   DOKS_CLUSTER_NAME         - Desired cluster name (e.g., "expensy-doks-cluster")
   DO_SPACES_ACCESS_KEY      - Spaces access key (for Terraform state)
   DO_SPACES_SECRET_KEY      - Spaces secret key (for Terraform state)
   GH_PAT                    - GitHub Personal Access Token
   ```

3. **Create DigitalOcean API Token**
   ```
   1. Go to: https://cloud.digitalocean.com/account/api/tokens
   2. Click "Generate New Token"
   3. Name: "Expensy Terraform"
   4. Scopes: Read & Write
   5. Copy token and add to GitHub Secrets
   ```

4. **Create Spaces for Terraform State** (Optional but recommended)
   ```
   1. Go to: https://cloud.digitalocean.com/spaces
   2. Create Space: "expensy-terraform-state"
   3. Region: NYC3
   4. Generate API keys and add to GitHub Secrets
   ```

### Deployment Steps

#### Step 1: Deploy Infrastructure
```
1. Go to: Actions → "Deploy to Cloud Provider"
2. Select:
   - Cloud Provider: digitalocean
   - Action: deploy
   - Workspace: production
3. Click "Run workflow"
4. Wait ~10 minutes for cluster creation
```

#### Step 2: Setup ArgoCD
```
1. Go to: Actions → "ArgoCD Setup"
2. Select:
   - Cloud Provider: digitalocean
   - Action: install
3. Click "Run workflow"
4. ArgoCD will automatically deploy all applications!
```

#### Step 3: Access Your Applications
```bash
# Get LoadBalancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Get Grafana URL
kubectl get svc -n monitoring grafana

# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

## Configuration Files

### Terraform Variables (digitalocean/terraform.tfvars)

```hcl
prefix             = "expensy"
region             = "nyc3"          # NYC, Amsterdam, Singapore, etc.
kubernetes_version = "1.31.1-do.4"   # Latest stable
node_size          = "s-2vcpu-4gb"   # $24/month per node
min_nodes          = 2               # High availability
max_nodes          = 4               # Cost control
registry_tier      = "starter"       # Free tier
```

### Kubernetes Storage Classes

The manifests automatically use the correct storage class:

**DigitalOcean:**
- Default: `do-block-storage` (Standard SSD)
- Fast: `fast-ssd` (High-performance SSD)

**Azure:**
- Default: `managed-csi` (Azure Managed Disk)
- Fast: `fast-ssd` (Premium SSD)

To switch between providers, storage classes are automatically handled. No manual changes needed!

## Switching Between Providers

### From Azure to DigitalOcean

```bash
# 1. Export data if needed
kubectl get all -A > backup.yaml

# 2. Destroy Azure infrastructure
GitHub Actions → "Deploy to Cloud Provider"
  - Cloud Provider: azure
  - Action: destroy

# 3. Deploy to DigitalOcean
GitHub Actions → "Deploy to Cloud Provider"
  - Cloud Provider: digitalocean
  - Action: deploy

# 4. Setup ArgoCD on new cluster
GitHub Actions → "ArgoCD Setup"
  - Cloud Provider: digitalocean
  - Action: install
```

### From DigitalOcean to Azure

Same process, just reverse the cloud providers!

## DigitalOcean Specific Features

### 1. Container Registry Integration
```hcl
resource "digitalocean_container_registry" "main" {
  name                   = "expensyregistry"
  subscription_tier_slug = "starter"  # Free!
}
```

### 2. VPC for Network Isolation
```hcl
resource "digitalocean_vpc" "main" {
  name     = "expensy-vpc"
  region   = "nyc3"
  ip_range = "10.10.0.0/16"
}
```

### 3. Auto-scaling Node Pool
```hcl
node_pool {
  auto_scale = true
  min_nodes  = 2  # High availability
  max_nodes  = 4  # Cost control
}
```

### 4. Automatic Updates
```hcl
auto_upgrade = true        # Security patches
surge_upgrade = true       # Zero downtime
maintenance_policy {
  start_time = "04:00"     # Sunday 4 AM
  day        = "sunday"
}
```

## Available DigitalOcean Regions

| Region | Code | Location | Latency |
|--------|------|----------|---------|
| New York 1 | nyc1 | USA East | Low (US) |
| New York 3 | nyc3 | USA East | Low (US) |
| San Francisco 3 | sfo3 | USA West | Low (US West) |
| Amsterdam 3 | ams3 | Europe | Low (EU) |
| Singapore 1 | sgp1 | Asia | Low (Asia) |
| London 1 | lon1 | Europe | Low (UK) |
| Frankfurt 1 | fra1 | Europe | Low (DE) |
| Toronto 1 | tor1 | Canada | Low (CA) |
| Bangalore 1 | blr1 | India | Low (IN) |
| Sydney 1 | syd1 | Australia | Low (AU) |

## Node Size Options

| Size | vCPU | RAM | Storage | Cost/Month | Use Case |
|------|------|-----|---------|------------|----------|
| s-1vcpu-2gb | 1 | 2GB | 50GB | $12 | Dev/Test |
| s-2vcpu-4gb | 2 | 4GB | 80GB | $24 | **Recommended** |
| s-4vcpu-8gb | 4 | 8GB | 160GB | $48 | Production |
| s-8vcpu-16gb | 8 | 16GB | 320GB | $96 | High Traffic |

## Monitoring & Observability

All monitoring components work identically across providers:
- ✅ Prometheus (metrics)
- ✅ Grafana (dashboards)
- ✅ Loki (logs)
- ✅ Elasticsearch (log storage)

Storage classes are automatically configured for each provider!

## Terraform State Management

### DigitalOcean (Uses Spaces - S3 Compatible)
```hcl
backend "s3" {
  endpoint = "https://nyc3.digitaloceanspaces.com"
  bucket   = "expensy-terraform-state"
  key      = "digitalocean/terraform.tfstate"
}
```

### Azure (Uses Azure Storage)
```hcl
backend "azurerm" {
  resource_group_name  = "expensyapp-cometops"
  storage_account_name = "expensyapp"
  container_name       = "tfstate"
}
```

## Troubleshooting

### DigitalOcean Cluster Not Ready
```bash
# Check cluster status
doctl kubernetes cluster get expensy-doks-cluster

# Get kubeconfig manually
doctl kubernetes cluster kubeconfig save expensy-doks-cluster

# Verify nodes
kubectl get nodes
```

### Storage Class Issues
```bash
# Check available storage classes
kubectl get storageclass

# For DigitalOcean, should see:
# - do-block-storage (default)
# - fast-ssd

# Apply manually if missing
kubectl apply -f kubernetes/storageclass-digitalocean.yaml
```

### Pod Stuck in Pending (Storage)
```bash
# Check PVC status
kubectl get pvc -A

# Describe PVC to see issue
kubectl describe pvc <pvc-name> -n <namespace>

# Common fix: Update storage class in manifest
# Change 'managed-csi' to 'do-block-storage'
```

## Cost Optimization Tips

### 1. Use Smaller Nodes for Dev/Test
```hcl
node_size = "s-1vcpu-2gb"  # $12/month per node
min_nodes = 1
max_nodes = 2
```

### 2. Enable Auto-scaling
```hcl
auto_scale = true
min_nodes  = 2  # Start small
max_nodes  = 4  # Scale when needed
```

### 3. Use Free Registry Tier
```hcl
registry_tier = "starter"  # 500MB free
```

### 4. Cleanup Unused Resources
```bash
# Delete old load balancers
doctl compute load-balancer list
doctl compute load-balancer delete <id>

# Delete unused volumes
doctl compute volume list
doctl compute volume delete <id>
```

## Security Best Practices

### 1. Use Private Registry
```hcl
resource "digitalocean_container_registry" "main" {
  name                   = "expensyregistry"
  subscription_tier_slug = "professional"  # Private images
}
```

### 2. Enable Firewall
```hcl
resource "digitalocean_firewall" "k8s" {
  name = "expensy-k8s-firewall"
  # Only allow necessary ports
}
```

### 3. Regular Updates
```hcl
auto_upgrade = true  # Auto-apply security patches
```

### 4. Use Secrets
- Never commit tokens to Git
- Use GitHub Secrets for sensitive data
- Rotate API tokens regularly

## Future Enhancements

- [ ] AWS EKS support
- [ ] Google GKE support
- [ ] Multi-region deployments
- [ ] Disaster recovery setup
- [ ] Cost monitoring dashboard
- [ ] Automated backup/restore

## Support & Resources

- **DigitalOcean Docs:** https://docs.digitalocean.com/products/kubernetes/
- **Terraform Registry:** https://registry.terraform.io/providers/digitalocean/digitalocean
- **Community Forum:** https://www.digitalocean.com/community/tags/kubernetes

## Migration Checklist

- [ ] Create DigitalOcean account
- [ ] Add GitHub Secrets
- [ ] Create Spaces bucket (optional)
- [ ] Deploy infrastructure
- [ ] Setup ArgoCD
- [ ] Update DNS records
- [ ] Test applications
- [ ] Destroy old infrastructure

---

**Ready to deploy?** Run the "Deploy to Cloud Provider" workflow and select DigitalOcean! 🚀
