output "grafana_url" {
  value = "http://${helm_release.prometheus.name}-grafana.monitoring.svc.cluster.local:3000"
}

output "loki_url" {
  value = "http://${helm_release.loki.name}-loki.monitoring.svc.cluster.local:3100"
}

output "elasticsearch_url" {
  value = "http://${helm_release.elasticsearch.name}-elasticsearch.monitoring.svc.cluster.local:9200"
}

output "prometheus_url" {
  value = "http://${helm_release.prometheus.name}-prometheus.monitoring.svc.cluster.local:9090"
}
