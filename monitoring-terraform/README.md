# Monitoring Setup for Existing Azure Project

This Terraform module sets up centralized monitoring for an existing Azure project using Event Hub, Splunk HEC, Prometheus, and Grafana. It automates the provisioning and configuration of resources so you can focus on dashboards and alerts rather than manual setup.

Overview

Tools & Purpose:

Tool           Purpose
Event Hub      Collects logs and metrics from Azure resources
Splunk HEC     Receives data from Event Hub and allows queries and dashboards
Prometheus    Collects metrics from Kubernetes cluster and other Azure resources
Grafana       Visualizes metrics and logs in dashboards

Why Terraform?

Automates the creation of Event Hub, Shared Access Policy, and Activity Log collection
Deploys Prometheus and Grafana via Helm in Kubernetes cluster automatically
Outputs connection strings and URLs for easy integration
Ensures reproducibility: deploy to multiple environments with a single command
Avoids manual errors and saves time

Can you run it without Terraform?

Yes, but it requires manual steps:
1. Create Event Hub Namespace and Event Hub in Azure Portal
2. Configure Shared Access Policy manually
3. Enable Activity Log collection or Agents on each resource
4. Install Prometheus and Grafana using Helm commands in the cluster
5. Connect Grafana to Splunk HEC manually

Terraform is not required, but it greatly simplifies deployment and management, especially for multiple resources or RGs.

Directory Structure

monitoring-terraform/
- providers.tf          Azure + Helm providers
- variables.tf          All variables (RG, Workspace, Location, Prefix, Splunk Token)
- terraform.tfvars      Your environment-specific values
- main.tf               Event Hub Namespace, Event Hub, Shared Access Policy
- diagnostic.tf         Activity log alerts and Event Hub authorization
- helm_prom_graf.tf     Prometheus and Grafana deployment via Helm
- outputs.tf            Outputs: Event Hub connection string, Grafana URL, Splunk HEC token

Required Values in terraform.tfvars

existing_rg_name        = "your-existing-RG"
existing_workspace_name = "your-existing-LogAnalytics"
location                = "UK West"
prefix                  = "final-cometops"
splunk_hec_token        = "your-splunk-hec-token"

Deployment Steps

cd monitoring-terraform
terraform init
terraform plan
terraform apply

Outputs:

eventhub_connection_string: Use in Splunk HEC input
grafana_url: Access Grafana dashboards
splunk_hec_token: Used in Grafana Infinity plugin to query Splunk

Notes

Activity Log Alerts capture admin and security events in your RG
Grafana OSS with Infinity plugin allows querying Splunk directly without Enterprise
You can extend this module by adding more resources or RGs
Terraform ensures reproducible infrastructure and avoids manual misconfigurations
All resources can also be deployed manually, but it is more error-prone and time-consuming

Workflow

Azure Resources (VMs, App Service, AKS) 
   then to Event Hub (collects logs & metrics)
   then to Splunk HEC (ingests logs)
   then to Grafana (Infinity plugin queries Splunk)
   then dashboards for metrics & logs

Integration Summary

Event Hub receives logs and metrics from Azure resources
Splunk HEC ingests Event Hub data for queries and dashboards
Prometheus collects Kubernetes metrics
Grafana (OSS with Infinity Plugin) visualizes both Splunk logs and Prometheus metrics in a single dashboard
This setup avoids the need for Diagnostic Settings permissions on every Azure resource, using your Splunk HEC token for integration
