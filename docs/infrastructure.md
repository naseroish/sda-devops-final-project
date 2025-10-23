# Infrastructure as Code (IaC) with Terraform – Expensy Project

This document describes how the infrastructure for the **Expensy microservices project** is provisioned using **Terraform**. This setup creates an **Azure Kubernetes Service (AKS)** cluster to host the frontend, backend, MongoDB, and Redis services as containers.

---

# Overview

| Component                     | Technology Used                 |
|------------------------------|----------------------------------|
| IaC Language                  | Terraform                       |
| Cloud Provider                | Microsoft Azure                 |
| Container Orchestrator        | Azure Kubernetes Service (AKS)  |
| State Management              | Azure Storage (Remote State)    |
| Resource Group                | `devops3-final-cometops`                    |
| Terraform Directory           | `/docs/infra`               |

---

# 🌐 Infrastructure Architecture

Local Dev → Docker Build → Push Images → AKS Deployment
│
├─ Redis (StatefulSet)
├─ MongoDB (StatefulSet)
├─ Backend API (Deployment + Service)
└─ Frontend App (Deployment + Service)

# 📁 Directory Structure

/infra
├── main.tf # AKS cluster + resource group
├── backend.tf # Remote state definition
├── variables.tf # Input variables
├── outputs.tf # Outputs such as AKS kube config
├── providers.tf # Azure + Kubernetes providers
├── terraform.tfvars # Variable values (excluded from Git if secrets exist)
├── README.md

------------------------------------------------------------------------
## ☁️ Remote Backend (Terraform State)

Terraform stores state remotely using Azure Storage Account to enable team collaboration and protect against local file loss.

Example `backend.tf`:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "expensyterraformsa"
    container_name       = "tfstate"
    key                  = "expensy-infra.terraform.tfstate"
  }
}
------------------------------------------------------------------------

## 🏗️ Resources Provisioned by Terraform
Resource	                                                  Description
* Resource Group (azurerm_resource_group)	                  Logical host for all Azure resources
* AKS Cluster (azurerm_kubernetes_cluster)	                  Hosts containers
* Log Analytics Workspace (optional)	                      Stores logs for AKS
* Virtual Networks/Subnets 	                                  Secure networking setup

## Tools Needed:
 - Terraform
 - Azure CLI
 - kubectl
 - Docker