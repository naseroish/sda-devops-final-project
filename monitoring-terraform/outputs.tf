output "eventhub_connection_string" {
  value = azurerm_eventhub_authorization_rule.splunk.primary_connection_string
}

output "grafana_url" {
  value = helm_release.prometheus.status_url
}
