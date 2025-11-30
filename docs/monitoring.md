# Monitoring Stack Documentation

## Overview

The Expensy application uses a comprehensive monitoring stack deployed via ArgoCD. All monitoring components are deployed in the `monitoring` namespace.

## Components

### 1. Prometheus Stack (kube-prometheus-stack)
**Chart Version:** 79.9.0  
**App Version:** v0.86.2  
**Repository:** https://prometheus-community.github.io/helm-charts

**Purpose:** Metrics collection, storage, and alerting

**Components Included:**
- **Prometheus Server:** Time-series database for metrics
- **Alertmanager:** Alert routing and management
- **Prometheus Operator:** Manages Prometheus instances
- **Node Exporter:** Hardware and OS metrics from nodes
- **Kube State Metrics:** Kubernetes cluster-level metrics

**Key Features:**
- 30-day metric retention
- 30Gi persistent storage
- Automatic service discovery
- Pre-configured alerting rules for Kubernetes

**Access:**
```bash
# Port-forward Prometheus UI
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Port-forward Alertmanager UI
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093
```

### 2. Grafana
**Chart Version:** 10.2.0  
**App Version:** 12.3.0  
**Repository:** https://grafana.github.io/helm-charts

**Purpose:** Visualization and dashboarding

**Pre-configured Datasources:**
- **Prometheus:** Default datasource for metrics
- **Loki:** For log aggregation and querying
- **Elasticsearch:** For advanced log search

**Pre-loaded Dashboards:**
- Prometheus Stats (GrafanaNet ID: 2)
- Node Exporter Full (GrafanaNet ID: 1860)
- Kubernetes Cluster Monitoring (GrafanaNet ID: 7249)
- Kubernetes Pod Monitoring (GrafanaNet ID: 6417)

**Default Credentials:**
- Username: `admin`
- Password: `admin` (⚠️ **Change in production!**)

**Access:**
- LoadBalancer with Azure DNS: `http://grafana-naseroish.<region>.cloudapp.azure.com`
- Or port-forward: `kubectl port-forward -n monitoring svc/grafana 3000:80`

**Features:**
- 10Gi persistent storage for dashboards
- Dynamic dashboard discovery via sidecar
- Plugin support (piechart, clock, simple-json)

### 3. Loki
**Chart Version:** 6.46.0  
**App Version:** 3.5.7  
**Repository:** https://grafana.github.io/helm-charts

**Purpose:** Log aggregation and querying

**Deployment Mode:** SingleBinary (suitable for small to medium deployments)

**Key Features:**
- 31-day log retention (744 hours)
- 30Gi persistent storage
- Integrated Promtail for log collection
- ServiceMonitor for Prometheus scraping

**Storage:** Filesystem-based (TSDB schema v13)

**Access:**
```bash
# Loki query endpoint
kubectl port-forward -n monitoring svc/loki-gateway 3100:80
```

**Log Collection:**
- Promtail DaemonSet automatically collects logs from all pods
- Logs are pushed to: `http://loki-gateway/loki/api/v1/push`

### 4. Elasticsearch
**Chart Version:** 8.5.1  
**App Version:** 8.5.1  
**Repository:** https://helm.elastic.co

**Purpose:** Log storage and advanced search capabilities

**Configuration:**
- Single-node deployment (scale for production)
- 30Gi persistent storage
- 4Gi memory limit with 2Gi JVM heap
- Security disabled for development (⚠️ **Enable in production!**)

**Key Settings:**
```yaml
Discovery Type: single-node
Network Host: 0.0.0.0
Monitoring: Enabled
Max Clause Count: 10000
```

**Access:**
```bash
# Elasticsearch API
kubectl port-forward -n monitoring svc/elasticsearch-master 9200:9200

# Test connection
curl http://localhost:9200/_cluster/health
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Monitoring Stack                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │  Prometheus  │◄─────┤ Node Exporter│                │
│  │              │      └──────────────┘                │
│  │              │      ┌──────────────┐                │
│  │              │◄─────┤ Kube State   │                │
│  │              │      │   Metrics    │                │
│  └─���────┬───────┘      └──────────────┘                │
│         │                                               │
│         │ Scrapes Metrics                               │
│         ▼                                               │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Grafana    │◄─────┤     Loki     │◄───Promtail   │
│  │              │      └──────────────┘    (Logs)     │
│  │              │                                       │
│  │              │      ┌──────────────┐                │
│  │              │◄─────┤Elasticsearch │◄───Filebeat   │
│  └──────────────┘      └──────────────┘    (Logs)     │
│         ▲                                               │
│         │                                               │
│         └─── Users access dashboards                   │
└─────────────────────────────────────────────────────────┘
```

## Deployment Files

All monitoring components are separated into individual ArgoCD Application manifests:

1. **monitoring-prometheus.yaml** - Prometheus stack
2. **monitoring-grafana.yaml** - Grafana visualization
3. **monitoring-loki.yaml** - Loki log aggregation
4. **monitoring-elasticsearch.yaml** - Elasticsearch log storage

## Installation

### Prerequisites
- Kubernetes cluster with ArgoCD installed
- `managed-csi` StorageClass available
- Sufficient cluster resources (see resource requirements below)

### Deploy via ArgoCD

```bash
# Apply all monitoring manifests
kubectl apply -f kubernetes/monitoring-prometheus.yaml
kubectl apply -f kubernetes/monitoring-grafana.yaml
kubectl apply -f kubernetes/monitoring-loki.yaml
kubectl apply -f kubernetes/monitoring-elasticsearch.yaml

# Verify deployments
kubectl get applications -n argocd
kubectl get pods -n monitoring
```

### Manual Deployment (without ArgoCD)

```bash
# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add elastic https://helm.elastic.co
helm repo update

# Install Prometheus Stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --version 79.9.0 \
  -f kubernetes/monitoring-prometheus.yaml

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --version 10.2.0 \
  -f kubernetes/monitoring-grafana.yaml

# Install Loki
helm install loki grafana/loki \
  --namespace monitoring \
  --version 6.46.0 \
  -f kubernetes/monitoring-loki.yaml

# Install Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  --namespace monitoring \
  --version 8.5.1 \
  -f kubernetes/monitoring-elasticsearch.yaml
```

## Resource Requirements

### Minimum Requirements (Development)
```
CPU: 3-4 cores
Memory: 10-12 GB
Storage: 100 GB (persistent volumes)
```

### Recommended (Production)
```
CPU: 8-12 cores
Memory: 24-32 GB
Storage: 200-500 GB (persistent volumes)
Nodes: 3+ for high availability
```

### Per-Component Resources

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit | Storage |
|-----------|-------------|-----------|----------------|--------------|---------|
| Prometheus | 500m | 2000m | 2Gi | 4Gi | 30Gi |
| Grafana | 100m | 500m | 256Mi | 512Mi | 10Gi |
| Loki | 100m | 1000m | 256Mi | 2Gi | 30Gi |
| Elasticsearch | 500m | 2000m | 2Gi | 4Gi | 30Gi |
| Alertmanager | 50m | 200m | 128Mi | 256Mi | 10Gi |
| Node Exporter | 50m | 200m | 64Mi | 128Mi | - |

## Monitoring URLs

Once deployed, access the monitoring tools:

| Service | URL | Notes |
|---------|-----|-------|
| Grafana | `http://grafana-naseroish.<region>.cloudapp.azure.com` | LoadBalancer DNS |
| Prometheus | Port-forward to `localhost:9090` | Internal only |
| Alertmanager | Port-forward to `localhost:9093` | Internal only |
| Loki | Port-forward to `localhost:3100` | Internal only |
| Elasticsearch | Port-forward to `localhost:9200` | Internal only |

## Configuration

### Adding Custom Alerts

Edit Prometheus rules:
```yaml
# In monitoring-prometheus.yaml, add under prometheus.prometheusSpec
additionalScrapeConfigs:
  - job_name: 'custom-app'
    static_configs:
      - targets: ['app-service:8080']
```

### Adding Custom Dashboards

1. **Via Grafana UI:** Import from grafana.com/dashboards
2. **Via ConfigMap:** Create ConfigMap with label `grafana_dashboard: "1"`
3. **Via Code:** Add to `dashboards` section in monitoring-grafana.yaml

### Custom Log Parsing

Edit Loki or Elasticsearch configurations to add custom log parsers and filters.

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n monitoring

# Check pod logs
kubectl logs -n monitoring <pod-name>

# Check events
kubectl get events -n monitoring --sort-by='.lastTimestamp'
```

### Elasticsearch Yellow/Red Status

```bash
# Check cluster health
kubectl exec -n monitoring elasticsearch-master-0 -- curl -s http://localhost:9200/_cluster/health?pretty

# Check indices
kubectl exec -n monitoring elasticsearch-master-0 -- curl -s http://localhost:9200/_cat/indices?v
```

### Prometheus Not Scraping

```bash
# Check targets
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Visit http://localhost:9090/targets
```

### Grafana Datasource Issues

```bash
# Get Grafana logs
kubectl logs -n monitoring deployment/grafana

# Test datasource connectivity from Grafana pod
kubectl exec -n monitoring deployment/grafana -- curl -v http://prometheus-kube-prometheus-prometheus:9090/-/healthy
```

## Security Considerations

⚠️ **For Production Deployments:**

1. **Change Default Passwords:**
   - Grafana admin password
   - Add authentication to Prometheus/Alertmanager

2. **Enable Elasticsearch Security:**
   ```yaml
   xpack.security.enabled: true
   xpack.security.transport.ssl.enabled: true
   xpack.security.http.ssl.enabled: true
   ```

3. **Enable HTTPS/TLS:**
   - Configure ingress with TLS certificates
   - Use cert-manager for automatic certificate management

4. **Network Policies:**
   - Restrict access between namespaces
   - Implement least-privilege access

5. **RBAC:**
   - Configure service accounts with minimal permissions
   - Use pod security policies/standards

6. **Secrets Management:**
   - Use external secrets operator
   - Never commit passwords to Git

## Scaling for Production

### Prometheus High Availability

```yaml
prometheus:
  prometheusSpec:
    replicas: 2
    replicaExternalLabelName: "__replica__"
```

### Loki Microservices Mode

Switch from SingleBinary to distributed mode:
```yaml
deploymentMode: Distributed
```

### Elasticsearch Cluster

```yaml
replicas: 3
minimumMasterNodes: 2
```

## Backup and Disaster Recovery

### Prometheus Snapshots

```bash
# Create snapshot
curl -XPOST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Snapshots are stored in: /prometheus/snapshots/
```

### Grafana Backup

Dashboards and datasources are stored in persistent volume at `/var/lib/grafana`

### Elasticsearch Snapshots

Configure snapshot repository (requires S3 or Azure Blob):
```bash
# Register repository
curl -X PUT "localhost:9200/_snapshot/my_backup" -H 'Content-Type: application/json' -d'
{
  "type": "azure",
  "settings": {
    "container": "backup",
    "base_path": "elasticsearch"
  }
}'
```

## Maintenance

### Updating Components

```bash
# Update Helm repositories
helm repo update

# Check available versions
helm search repo prometheus-community/kube-prometheus-stack --versions
helm search repo grafana/grafana --versions
helm search repo grafana/loki --versions
helm search repo elastic/elasticsearch --versions

# Update via ArgoCD (automatic if auto-sync enabled)
# Or manually update targetRevision in YAML files
```

### Log Retention Management

Logs are automatically rotated based on retention policies:
- **Loki:** 31 days (configurable in limits_config.retention_period)
- **Elasticsearch:** Configure ILM policies for automatic deletion

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/8.5/)
- [kube-prometheus-stack Chart](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)

## Support

For issues or questions:
1. Check pod logs: `kubectl logs -n monitoring <pod-name>`
2. Review ArgoCD application status: `kubectl get application -n argocd`
3. Check resource usage: `kubectl top pods -n monitoring`
