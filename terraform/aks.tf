data "azurerm_resource_group" "existing_rg" {
  name = var.prefix
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.prefix}-aks-cluster"
  location            = data.azurerm_resource_group.existing_rg.location
  resource_group_name = data.azurerm_resource_group.existing_rg.name
  dns_prefix          = "${var.prefix}-dns"

  node_resource_group = "${var.prefix}-aks-node"

  default_node_pool {
    name       = var.default_node_pool_name
    node_count = 2
    vm_size    = var.vm_size
  }

  identity {
    type = "SystemAssigned"
  }


}

