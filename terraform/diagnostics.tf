############################################
# Diagnostic Settings for all resources in the RG
############################################

# Reuse existing resource group data source from aks.tf:
# data "azurerm_resource_group" "existing_rg" { name = var.prefix }

data "azurerm_resources" "all_resources" {
  resource_group_name = data.azurerm_resource_group.existing_rg.name
}

resource "azurerm_monitor_diagnostic_setting" "all_diag" {
  for_each = { for r in data.azurerm_resources.all_resources.resources : r.id => r }

  name                       = "diag-${each.value.name}"
  target_resource_id         = each.value.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  dynamic "log" {
    for_each = [
      {
        category = "AuditEvent"
        enabled  = true
      }
    ]
    content {
      category = log.value.category
      enabled  = log.value.enabled
    }
  }

  dynamic "metric" {
    for_each = [
      {
        category = "AllMetrics"
        enabled  = true
      }
    ]
    content {
      category = metric.value.category
      enabled  = metric.value.enabled
    }
  }
}
