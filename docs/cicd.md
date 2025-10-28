# CI/CD Pipeline Architecture

## Overview

This document describes our CI/CD pipeline flows. We use **dev** and **main** branches with namespace-based separation on a shared AKS cluster.

---

## Branch Strategy

- **`dev`** branch → Deploys to `app-dev` namespace (automatic, no approval)
- **`main`** branch → Deploys to `app-prod` namespace (requires manual approval)

### Key Points
- Infrastructure changes only go to `main` branch
- Infrastructure deployment is manual from local machine
- Application changes flow: `dev` → `main`

---

## Repository Structure

```
/
├── infrastructure/      # Terraform/Bicep code
├── kubernetes/         # K8s manifests and configs
├── backend/           # Backend application code
├── frontend/          # Frontend application code
└── docs/              # Documentation
```

---

## Environment Architecture

**Single AKS Cluster with Two Namespaces:**
- `app-dev` - Development environment
- `app-prod` - Production environment

Both environments share the same AKS infrastructure but are isolated via namespaces.

---

## CI/CD Flows Overview

We have **7 total flows**:
- **4 PR Validation Flows** (run on pull requests - don't deploy anything)
- **3 Deployment Flows** (run after merge - actually deploy)

---

# Part 1: PR Validation Flows

These flows validate code quality and security when pull requests are opened. They don't deploy anything.

---

## Flow 1: Terraform PR Validation

**When:** Pull request to `/infrastructure/**`  
**Branch:** `main` only

**What it does:**
- Checks Terraform/Bicep code formatting
- Validates syntax
- Generates Terraform plan preview
- Runs security scans
- Posts results as PR comments

**Goal:** Catch infrastructure issues before merging

---

## Flow 2: Kubernetes PR Validation

**When:** Pull request to `/kubernetes/**`  
**Branch:** `dev` or `main`

**What it does:**
- Validates YAML syntax
- Checks Kubernetes manifest structure
- Runs security policy checks
- Verifies best practices

**Goal:** Ensure K8s configs are valid and secure

---

## Flow 3: Backend PR Validation

**When:** Pull request to `/backend/**`  
**Branch:** `dev` or `main`

**What it does:**
- Builds backend Docker image (test only)
- Runs unit tests
- Runs code quality checks
- Scans code for security issues
- Scans Docker image for vulnerabilities

**Goal:** Ensure backend code quality and security

---

## Flow 4: Frontend PR Validation

**When:** Pull request to `/frontend/**`  
**Branch:** `dev` or `main`

**What it does:**
- Builds frontend Docker image (test only)
- Runs unit tests
- Runs code quality checks
- Scans code for security issues
- Scans Docker image for vulnerabilities

**Goal:** Ensure frontend code quality and security

---

# Part 2: Deployment Flows

These flows run after code is merged and actually deploy changes.

---

## Flow 5: Kubernetes Deployment (Conditional)

**When:** Merged to `dev` or `main` branch  
**Changes:** `/kubernetes/**`

### If merged to `dev`:
- Deploys to `app-dev` namespace
- No approval needed
- Automatic deployment

### If merged to `main`:
- Requires manual approval
- Deploys to `app-prod` namespace
- Includes verification checks

**Goal:** Deploy Kubernetes configuration changes to appropriate environment

---

## Flow 6: Backend Deployment (Conditional)

**When:** Merged to `dev` or `main` branch  
**Changes:** `/backend/**`

### If merged to `dev`:
- Builds Docker image with `dev-<sha>` tag
- Pushes to container registry
- Deploys to `app-dev` namespace
- Runs integration tests
- No approval needed

### If merged to `main`:
- Builds Docker image with `v<version>` tag
- Runs full security scan
- Requires manual approval
- Deploys to `app-prod` namespace
- Runs smoke tests

**Goal:** Build and deploy backend application to appropriate environment

---

## Flow 7: Frontend Deployment (Conditional)

**When:** Merged to `dev` or `main` branch  
**Changes:** `/frontend/**`

### If merged to `dev`:
- Builds Docker image with `dev-<sha>` tag
- Pushes to container registry
- Deploys to `app-dev` namespace
- Runs integration tests
- No approval needed

### If merged to `main`:
- Builds Docker image with `v<version>` tag
- Runs full security scan
- Requires manual approval
- Deploys to `app-prod` namespace
- Runs smoke tests

**Goal:** Build and deploy frontend application to appropriate environment

---

## Flow Summary Table

| # | Flow Name | Trigger | Deploys? | Auto/Manual |
|---|-----------|---------|----------|-------------|
| **PR Validations** |
| 1 | Infrastructure Validation | PR to `/infrastructure/**` | ❌ No | Auto |
| 2 | Kubernetes Validation | PR to `/kubernetes/**` | ❌ No | Auto |
| 3 | Backend Validation | PR to `/backend/**` | ❌ No | Auto |
| 4 | Frontend Validation | PR to `/frontend/**` | ❌ No | Auto |
| **Deployments** |
| 5 | Kubernetes Deployment | Merge to `dev`/`main` | ✅ Yes | Conditional* |
| 6 | Backend Deployment | Merge to `dev`/`main` | ✅ Yes | Conditional* |
| 7 | Frontend Deployment | Merge to `dev`/`main` | ✅ Yes | Conditional* |

**Conditional means:**
- `dev` branch = automatic (no approval)
- `main` branch = manual approval required

---

## Infrastructure Deployment (Manual)

Infrastructure changes are **NOT automated**:

1. Create PR to `main` branch with infrastructure changes
2. PR validation runs (shows Terraform plan)
3. Team reviews and merges PR
4. **Manually run Terraform from local machine**
5. Infrastructure is deployed

**Why manual?** Maximum safety and control over critical infrastructure.

---

## Typical Developer Workflow

### Working on a Feature

1. Create feature branch from `dev`
2. Make changes to backend, frontend, or kubernetes files
3. Open PR to `dev` branch
4. PR validation runs automatically
5. Team reviews and approves
6. Merge to `dev` → Automatically deploys to `app-dev` namespace
7. Test in dev environment
8. When ready: Open PR from `dev` to `main`
9. Team reviews production PR
10. Merge to `main` → Manual approval → Deploys to `app-prod` namespace

### Infrastructure Changes

1. Create branch from `main` (not from dev)
2. Make changes to `/infrastructure/**`
3. Open PR to `main`
4. PR validation runs (shows Terraform plan)
5. Team reviews carefully
6. Merge to `main`
7. Manually deploy from local machine using Terraform CLI

---

## Rollback Strategy

### Application Rollback (Quick)
Use Kubernetes rollback command to revert to previous version

### Configuration Rollback
Revert the commit in git and merge - will trigger deployment of previous config

### Infrastructure Rollback
Revert changes in git, then manually apply from local machine

---

## Security & Approvals

### Development Environment (`app-dev`)
- No manual approvals
- Automatic deployments
- Fast feedback for developers

### Production Environment (`app-prod`)
- Manual approval required for all deployments
- Additional security scans
- Smoke tests after deployment

### Infrastructure
- PR validation automatic
- Deployment always manual from local machine
- Team review required before merge

---

## What You Need to Create (Diagrams)

When creating flow diagrams, make these 6 separate diagrams:

1. **Branch Strategy** - Show dev → main workflow
2. **PR Validation Flows** - Show all 4 validation flows
3. **Kubernetes Deployment Flow** - Show conditional logic (dev vs prod)
4. **Backend Deployment Flow** - Show conditional logic (dev vs prod)
5. **Frontend Deployment Flow** - Show conditional logic (dev vs prod)
6. **Environment Architecture** - Show AKS cluster with namespaces

---

## Key Principles

✅ **Validate everything** - All PRs are validated before merge  
✅ **Fast feedback in dev** - No approvals, automatic deployment  
✅ **Safe production** - Manual approval gates, additional checks  
✅ **Infrastructure safety** - Manual deployment from local machine  
✅ **Separation of concerns** - Backend, frontend, and K8s deployed independently  

---

**Document Version:** 1.0  
**Last Updated:** [Date]  
**Owner:** DevOps Team