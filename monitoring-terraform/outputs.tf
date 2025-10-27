output "eventhub_connection_string" {
  value = azurerm_eventhub_authorization_rule.splunk.primary_connection_string
}

output "grafana_url" {
  value = "http://${helm_release.prometheus.name}-grafana.monitoring.svc.cluster.local:3000"
}

output "splunk_hec_token" {
  value = var.splunk_hec_token
}

