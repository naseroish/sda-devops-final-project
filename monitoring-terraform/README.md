# Monitoring Setup for Existing Azure Project

This Terraform module sets up centralized monitoring for an existing Azure project using **Log Analytics, Prometheus, Grafana, Loki, and Elasticsearch (ELK)**. It automates provisioning and configuration of resources so you can focus on dashboards and alerts rather than manual setup.

## Overview

**Tools & Purpose:**

| Tool              | Purpose |
|------------------|---------|
| Log Analytics     | Collects logs and metrics automatically from all Azure resources via Diagnostic Settings |
| Prometheus        | Collects metrics from Kubernetes cluster and other Azure resources |
| Grafana           | Visualizes metrics and logs in dashboards |
| Loki              | Aggregates logs from Kubernetes workloads and integrates with Grafana |
| Elasticsearch (ELK) | Stores security events and audit logs from the cluster, integrates with Grafana dashboards |

---

## Why Terraform?

- Automatically enables **Diagnostic Settings** for all Azure resources in the Resource Group, sending logs and metrics to Log Analytics Workspace  
- Deploys **Prometheus, Grafana, Loki, and Elasticsearch** via Helm in Kubernetes cluster automatically  
- Outputs URLs for Grafana, Loki, Elasticsearch for easy access  
- Ensures reproducibility: deploy to multiple environments with a single command  
- Avoids manual errors and saves time  

---

## Can you run it without Terraform?

Yes, but requires manual steps:

1. Enable Diagnostic Settings on each Azure resource individually  
2. Configure Log Analytics Workspace manually  
3. Install Prometheus, Grafana, Loki, and Elasticsearch using Helm commands in the cluster  
4. Connect Grafana to Loki and Elasticsearch manually  

Terraform is optional but simplifies deployment and maintenance.

---

## Directory Structure

monitoring-terraform/
- `providers.tf`              Azure + Helm providers  
- `variables.tf`              All variables (RG, Workspace, Location, Prefix)  
- `terraform.tfvars`          Your environment-specific values  
- `main.tf`                   Data sources for RG and Log Analytics Workspace  
- `diagnostics.tf`            Automatically enables Diagnostic Settings for all resources  
- `helm_monitoring_stack.tf`  Prometheus, Grafana, Loki, Elasticsearch deployment via Helm  
- `outputs.tf`                Outputs: Grafana, Loki, Elasticsearch URLs  
- `README.md`                 Documentation  

---

## Required Values in terraform.tfvars

```hcl
existing_rg_name        = "your-existing-RG"
existing_workspace_name = "your-existing-LogAnalytics"
location                = "UK West"
prefix                  = "final-cometops"


## Workflow

Azure Resources (VMs, App Service, AKS)
        │
        ▼
Log Analytics Workspace
  - Collects logs and metrics automatically from all Azure resources via Diagnostic Settings
        │
        ▼
Prometheus
  - Collects metrics from Kubernetes cluster nodes, pods, and workloads
        │
        ▼
Loki
  - Aggregates application and system logs from Kubernetes workloads
        │
        ▼
Elasticsearch (ELK)
  - Stores security events, audit logs, and cluster-level logs
        │
        ▼
Grafana Dashboards
  - Visualizes metrics, logs, and security events from Prometheus, Loki, and Elasticsearch
