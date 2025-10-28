# ======================
# Resource Group & Workspace
# ======================
data "azurerm_resource_group" "existing_rg" {
  name = var.existing_rg_name
}

data "azurerm_log_analytics_workspace" "existing_workspace" {
  name                = var.existing_workspace_name
  resource_group_name = data.azurerm_resource_group.existing_rg.name
}

# ======================
# Event Hub Namespace (Optional for Logs/Alerts)
# ======================
resource "azurerm_eventhub_namespace" "eh_ns" {
  name                = "${var.prefix}-eh-ns"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.existing_rg.name
  sku                 = "Standard"
  capacity            = 1
}
