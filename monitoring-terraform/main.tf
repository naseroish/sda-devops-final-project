data "azurerm_resource_group" "existing_rg" {
  name = var.existing_rg_name
}

data "azurerm_log_analytics_workspace" "existing_workspace" {
  name                = var.existing_workspace_name
  resource_group_name = data.azurerm_resource_group.existing_rg.name
}

# Event Hub Namespace
resource "azurerm_eventhub_namespace" "eh_ns" {
  name                = "${var.prefix}-eh-ns"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.existing_rg.name
  sku                 = "Standard"
  capacity            = 1
}

# Event Hub
resource "azurerm_eventhub" "eh" {
  name                = "${var.prefix}-splunk-logs"
  namespace_name      = azurerm_eventhub_namespace.eh_ns.name
  resource_group_name = data.azurerm_resource_group.existing_rg.name
  partition_count     = 2
  message_retention   = 7
}

# Shared Access Policy
resource "azurerm_eventhub_authorization_rule" "splunk" {
  name                = "${var.prefix}-splunk-access"
  namespace_name      = azurerm_eventhub_namespace.eh_ns.name
  eventhub_name       = azurerm_eventhub.eh.name
  resource_group_name = data.azurerm_resource_group.existing_rg.name

  listen = true
  send   = true
  manage = true
}
