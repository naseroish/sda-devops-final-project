# Monitoring Stack Quick Deployment Guide

## ✅ What's Included

All monitoring components are properly separated and configured with latest stable versions:

| Component | Chart Version | App Version | File |
|-----------|---------------|-------------|------|
| **Prometheus Stack** | 79.9.0 | v0.86.2 | `monitoring-prometheus.yaml` |
| **Grafana** | 10.2.0 | 12.3.0 | `monitoring-grafana.yaml` |
| **Loki** | 6.46.0 | 3.5.7 | `monitoring-loki.yaml` |
| **Elasticsearch** | 8.5.1 | 8.5.1 | `monitoring-elasticsearch.yaml` |

## 🚀 Quick Deploy

```bash
# Deploy all monitoring components via ArgoCD
kubectl apply -f kubernetes/monitoring-prometheus.yaml
kubectl apply -f kubernetes/monitoring-grafana.yaml
kubectl apply -f kubernetes/monitoring-loki.yaml
kubectl apply -f kubernetes/monitoring-elasticsearch.yaml

# Watch the deployment
kubectl get pods -n monitoring -w
```

## 🔍 Verify Deployment

```bash
# Check ArgoCD applications
kubectl get applications -n argocd | grep -E "(prometheus|grafana|loki|elasticsearch)"

# Check all monitoring pods
kubectl get pods -n monitoring

# Expected pods:
# - prometheus-kube-prometheus-operator-*
# - prometheus-kube-prometheus-prometheus-*
# - alertmanager-prometheus-kube-prometheus-alertmanager-*
# - prometheus-kube-state-metrics-*
# - prometheus-prometheus-node-exporter-*
# - grafana-*
# - loki-*
# - loki-promtail-*
# - elasticsearch-master-*
```

## 🌐 Access Services

### Grafana (LoadBalancer)
```bash
# Get LoadBalancer IP
kubectl get svc -n monitoring grafana

# Or use Azure DNS
# http://grafana-naseroish.<region>.cloudapp.azure.com
# Default credentials: admin / admin
```

### Port-Forward for Other Services
```bash
# Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Access: http://localhost:9090

# Alertmanager
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093
# Access: http://localhost:9093

# Loki
kubectl port-forward -n monitoring svc/loki-gateway 3100:80
# Access: http://localhost:3100

# Elasticsearch
kubectl port-forward -n monitoring svc/elasticsearch-master 9200:9200
# Access: http://localhost:9200
```

## 📊 Pre-configured Grafana Dashboards

Grafana comes with these dashboards pre-loaded:
1. **Prometheus Stats** (ID: 2)
2. **Node Exporter Full** (ID: 1860) - Server metrics
3. **Kubernetes Cluster Monitoring** (ID: 7249)
4. **Kubernetes Pod Monitoring** (ID: 6417)

## 🔗 Datasources Auto-configured in Grafana

- ✅ **Prometheus** (default) → `http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090`
- ✅ **Loki** → `http://loki-gateway.monitoring.svc.cluster.local`
- ✅ **Elasticsearch** → `http://elasticsearch-master.monitoring.svc.cluster.local:9200`

## 📝 Common Commands

```bash
# View Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit: http://localhost:9090/targets

# Query Loki logs
kubectl port-forward -n monitoring svc/loki-gateway 3100:80
# Visit: http://localhost:3100/loki/api/v1/query?query={namespace="expensy"}

# Check Elasticsearch health
kubectl exec -n monitoring elasticsearch-master-0 -- curl http://localhost:9200/_cluster/health?pretty

# View collected logs in Grafana
# Go to Grafana → Explore → Select Loki datasource
```

## 🔧 Troubleshooting

### Pods in CrashLoopBackOff
```bash
# Check logs
kubectl logs -n monitoring <pod-name>

# Check events
kubectl get events -n monitoring --sort-by='.lastTimestamp'
```

### Storage Issues
```bash
# Check PVCs
kubectl get pvc -n monitoring

# Verify storage class exists
kubectl get storageclass managed-csi
```

### Grafana Can't Connect to Datasources
```bash
# Test from Grafana pod
kubectl exec -n monitoring deployment/grafana -- curl -v http://prometheus-kube-prometheus-prometheus:9090/-/healthy
kubectl exec -n monitoring deployment/grafana -- curl -v http://loki-gateway
kubectl exec -n monitoring deployment/grafana -- curl -v http://elasticsearch-master:9200
```

## ⚠️ Production Checklist

Before going to production:

- [ ] Change Grafana admin password
- [ ] Enable Elasticsearch security (xpack)
- [ ] Configure TLS/HTTPS for all services
- [ ] Set up backup for Prometheus data
- [ ] Configure Alertmanager with email/Slack
- [ ] Review and adjust resource limits
- [ ] Enable network policies
- [ ] Configure proper RBAC
- [ ] Set up log rotation policies
- [ ] Configure monitoring alerts
- [ ] Scale Elasticsearch to 3 nodes
- [ ] Consider Prometheus HA (2+ replicas)

## 📚 Documentation

Full documentation: `docs/monitoring.md`

## 🆘 Need Help?

1. Check pod logs: `kubectl logs -n monitoring <pod-name>`
2. Check ArgoCD sync status: `kubectl get application -n argocd <app-name> -o yaml`
3. Review full documentation in `docs/monitoring.md`
