resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.prefix}-logs"
  location            = data.azurerm_resource_group.existing_rg.location
  resource_group_name = data.azurerm_resource_group.existing_rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    environment = "production"
    project     = var.prefix
  }
}
