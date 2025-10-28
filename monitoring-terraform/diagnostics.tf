############################################
# Automatic Diagnostic Settings for all resources in the RG
############################################

# ==================================================
# Get all resources in the existing Resource Group
# ==================================================
data "azurerm_resources" "all_resources" {
  resource_group_name = data.azurerm_resource_group.existing_rg.name
}

# ==================================================
# Apply diagnostic settings to all resources
# ==================================================
resource "azurerm_monitor_diagnostic_setting" "all_diag" {
  for_each = { for r in data.azurerm_resources.all_resources.resources : r.id => r }

  name                       = "diag-${each.value.name}"
  target_resource_id         = each.value.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.existing_workspace.id

  log {
    category = "AuditEvent"
    enabled  = true
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
