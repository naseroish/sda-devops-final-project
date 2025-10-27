resource "azurerm_monitor_diagnostic_setting" "resource_logs" {
  name               = "${var.prefix}-resource-logs"
  target_resource_id = "<RESOURCE_ID_HERE>" 

  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.existing_workspace.id

  log {
    category = "Administrative"
    enabled  = true
  }

  log {
    category = "Security"
    enabled  = true
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
