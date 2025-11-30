terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.14.0, <= 4.38.1"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.6.3"
    }
    azapi = {
      source  = "azure/azapi"
      version = ">= 2.1.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "expensyapp-cometops"
    storage_account_name = "expensyapp"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
  resource_provider_registrations = "none"

  subscription_id = "4421688c-0a8d-4588-8dd0-338c5271d0af"
}

