############################################
# Full Monitoring Stack: Prometheus + Grafana + Loki + Elasticsearch
############################################

# ======================
# 1. Loki + Promtail (Logs)
# ======================
resource "helm_release" "loki" {
  name       = "${var.prefix}-loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki-stack"
  namespace  = "monitoring"

  set {
    name  = "grafana.enabled"
    value = "false"
  }

  set {
    name  = "promtail.enabled"
    value = "true"
  }

  set {
    name  = "loki.persistence.enabled"
    value = "true"
  }

  set {
    name  = "loki.persistence.size"
    value = "5Gi"
  }
}

# ======================
# 2. Elasticsearch (Security Events / Audit Logs)
# ======================
resource "helm_release" "elasticsearch" {
  name       = "${var.prefix}-elasticsearch"
  repository = "https://helm.elastic.co"
  chart      = "elasticsearch"
  namespace  = "monitoring"

  set {
    name  = "replicas"
    value = "1"
  }

  set {
    name  = "resources.requests.cpu"
    value = "500m"
  }

  set {
    name  = "resources.requests.memory"
    value = "1Gi"
  }

  set {
    name  = "resources.limits.cpu"
    value = "1"
  }

  set {
    name  = "resources.limits.memory"
    value = "2Gi"
  }
}

# ======================
# 3. Prometheus + Grafana (Metrics + Dashboards)
# ======================
resource "helm_release" "prometheus" {
  name       = "${var.prefix}-prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  set {
    name  = "grafana.adminUser"
    value = "admin"
  }

  set {
    name  = "grafana.adminPassword"
    value = "ChangeMe123!"
  }

  set {
    name  = "grafana.plugins"
    value = "grafana-simple-json-datasource,grafana-infinity-datasource,grafana-loki-datasource,grafana-elasticsearch-datasource"
  }

  depends_on = [helm_release.loki, helm_release.elasticsearch]
}

# ======================
# 4. Outputs
# ======================
output "grafana_url" {
  value = "http://${helm_release.prometheus.name}-grafana.monitoring.svc.cluster.local:3000"
}

output "loki_url" {
  value = "http://${helm_release.loki.name}-loki.monitoring.svc.cluster.local:3100"
}

output "elasticsearch_url" {
  value = "http://${helm_release.elasticsearch.name}-elasticsearch.monitoring.svc.cluster.local:9200"
}
