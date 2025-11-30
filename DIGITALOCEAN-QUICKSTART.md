# 🚀 Quick Start: Deploy to DigitalOcean

Get your Expensy app running on DigitalOcean in ~15 minutes for only ~$70/month!

## Prerequisites (5 minutes)

### 1. Create DigitalOcean Account
- Visit: https://www.digitalocean.com
- Sign up (get $200 free credit!)

### 2. Generate API Token
```
1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click "Generate New Token"
3. Name: "Expensy-GitHub-Actions"
4. Scopes: ✅ Read ✅ Write
5. Copy the token (you'll need it next!)
```

### 3. Add GitHub Secrets
Go to: `Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:
```
DIGITALOCEAN_TOKEN     = <your-api-token-from-step-2>
DOKS_CLUSTER_NAME      = expensy-doks-cluster
GH_PAT                 = <your-github-personal-access-token>
```

**Optional** (for Terraform state storage):
```
DO_SPACES_ACCESS_KEY   = <spaces-access-key>
DO_SPACES_SECRET_KEY   = <spaces-secret-key>
```

## Deploy (10 minutes)

### Step 1: Deploy Infrastructure (8 min)
```
1. Go to: Actions tab
2. Select: "Deploy to Cloud Provider"
3. Click: "Run workflow"
4. Select:
   - Cloud Provider: digitalocean
   - Action: deploy
   - Workspace: production
5. Click: "Run workflow"
6. Wait ~8 minutes ☕
```

**What gets created:**
- ✅ Kubernetes cluster (2 nodes, auto-scaling to 4)
- ✅ Container registry (free tier)
- ✅ Load balancer
- ✅ VPC network
- ✅ Firewall rules

### Step 2: Setup ArgoCD (2 min)
```
1. Go to: Actions tab
2. Select: "ArgoCD Setup"
3. Click: "Run workflow"
4. Select:
   - Cloud Provider: digitalocean
   - Action: install
5. Click: "Run workflow"
6. Wait ~2 minutes ⏱️
```

**What gets deployed automatically:**
- ✅ ArgoCD (GitOps controller)
- ✅ Expensy app (frontend + backend)
- ✅ MongoDB (database)
- ✅ Redis (cache)
- ✅ Prometheus (metrics)
- ✅ Grafana (dashboards)
- ✅ Loki (logs)
- ✅ Elasticsearch (log storage)
- ✅ NGINX Ingress

## Access Your App (2 minutes)

### Get Load Balancer IP
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Copy the EXTERNAL-IP
```

### Update DNS (If you have a domain)
```
1. Go to your DNS provider (Cloudflare, etc.)
2. Add A record:
   - Name: expensy (or @)
   - Value: <EXTERNAL-IP from above>
   - TTL: Auto
3. Wait 1-5 minutes for DNS propagation
```

### Access Services

#### Your Application
```
http://<EXTERNAL-IP>
or
http://your-domain.com (if DNS configured)
```

#### Grafana Dashboard
```bash
# Get Grafana load balancer IP
kubectl get svc -n monitoring grafana

# Access at: http://<GRAFANA-IP>
# Username: admin
# Password: admin (change this!)
```

#### ArgoCD UI
```bash
# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Port-forward ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at: https://localhost:8080
# Username: admin
# Password: <from command above>
```

## Verify Everything Works

### Check Cluster
```bash
# Get kubeconfig
doctl kubernetes cluster kubeconfig save expensy-doks-cluster

# Check nodes
kubectl get nodes

# Check all pods
kubectl get pods -A
```

### Check Applications
```bash
# Expensy app
kubectl get pods -n expensy

# Monitoring
kubectl get pods -n monitoring

# ArgoCD
kubectl get applications -n argocd
```

## Monthly Costs Breakdown

```
DOKS Cluster (2-4 nodes, s-2vcpu-4gb):  $48-96/month
Load Balancer (1x):                     $12/month
Block Storage (~100GB):                 $10/month
Container Registry (Starter):           FREE
Bandwidth (1TB included):               FREE
────────────────────────────────────────────────
Total:                                  ~$70-118/month
```

**With free $200 credit:** ~3 months free!

## What's Different from Azure?

| Feature | Azure | DigitalOcean | Savings |
|---------|-------|--------------|---------|
| K8s Cluster | ~$120/month | ~$48/month | -60% |
| Load Balancer | ~$20/month | $12/month | -40% |
| Storage | ~$15/month | ~$10/month | -33% |
| Registry | $5/month | FREE | -100% |
| **Total** | **~$160/month** | **~$70/month** | **-56%** |

## Next Steps

### 1. Secure Your Setup
```bash
# Change Grafana password
kubectl exec -it -n monitoring deployment/grafana -- grafana-cli admin reset-admin-password <new-password>

# Change ArgoCD password  
argocd account update-password
```

### 2. Setup Monitoring Alerts
```
1. Access Grafana
2. Go to: Alerting → Alert rules
3. Configure notifications (email, Slack, etc.)
```

### 3. Enable HTTPS
```bash
# Apply cert-manager issuer
kubectl apply -f kubernetes/cert-manager-issuer.yaml

# Update ingress to use TLS
# (Already configured in ingress-manifest.yaml)
```

### 4. Setup Backups
```bash
# Install Velero for backups
# (Instructions in docs/)
```

## Troubleshooting

### Pods Stuck in Pending
```bash
# Check storage class
kubectl get storageclass

# Should see: do-block-storage (default)
# If not, apply it:
kubectl apply -f kubernetes/storageclass-digitalocean.yaml
```

### Can't Access Application
```bash
# Check ingress
kubectl get ingress -n expensy

# Check load balancer
kubectl get svc -n ingress-nginx

# Check pods
kubectl get pods -n expensy
```

### ArgoCD Not Syncing
```bash
# Check ArgoCD status
kubectl get applications -n argocd

# Force sync
argocd app sync expensy-app

# Check logs
kubectl logs -n argocd deployment/argocd-server
```

## Destroy Everything (if needed)

### Via GitHub Actions
```
1. Go to: Actions → "Deploy to Cloud Provider"
2. Select:
   - Cloud Provider: digitalocean
   - Action: destroy
3. Click: "Run workflow"
```

### Via CLI
```bash
cd terraform/digitalocean
terraform destroy -auto-approve
```

## Get Help

- **DigitalOcean Community:** https://www.digitalocean.com/community
- **Documentation:** See `docs/multi-cloud-deployment.md`
- **Issues:** Create a GitHub issue

---

**That's it!** Your app is now running on DigitalOcean! 🎉

**Total time:** ~15 minutes  
**Total cost:** ~$70/month (or FREE for 3 months with $200 credit!)
