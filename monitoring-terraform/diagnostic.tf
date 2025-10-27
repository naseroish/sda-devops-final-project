resource "azurerm_eventhub_namespace_authorization_rule" "activity_logs" {
  name                = "${var.prefix}-activity-logs-access"
  namespace_name      = azurerm_eventhub_namespace.eh_ns.name
  resource_group_name = data.azurerm_resource_group.existing_rg.name

  listen = true
  send   = true
  manage = false
}

resource "azurerm_monitor_activity_log_alert" "rg_activity_logs" {
  name                = "${var.prefix}-activity-log-alert"
  resource_group_name = data.azurerm_resource_group.existing_rg.name
  scopes              = [data.azurerm_resource_group.existing_rg.id]

  criteria {
    category = "Administrative"
  }

  action {
    action_group_id = "<ACTION_GROUP_PLACEHOLDER>"
  }
}

