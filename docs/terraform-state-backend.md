# Terraform State Backend Configuration

## Current Setup: Local Backend

The DigitalOcean Terraform configuration uses a **local backend** for simplicity. The state file is cached in GitHub Actions and uploaded as an artifact.

### Advantages:
- ✅ No additional setup required
- ✅ No Spaces bucket needed
- ✅ Works immediately
- ✅ State cached between runs

### Disadvantages:
- ⚠️ State stored in GitHub Actions artifacts (30-day retention)
- ⚠️ Not ideal for team collaboration
- ⚠️ Manual state management needed

## Migrating to DigitalOcean Spaces (Remote Backend)

For production or team environments, use DigitalOcean Spaces for remote state storage.

### Step 1: Create Spaces Bucket

```bash
# Via DigitalOcean Console
1. Go to: https://cloud.digitalocean.com/spaces
2. Click "Create Space"
3. Settings:
   - Region: NYC3 (same as cluster)
   - Name: expensy-terraform-state
   - Enable CDN: No
   - File Listing: Restricted
4. Click "Create Space"
```

### Step 2: Generate Spaces Access Keys

```bash
# Via DigitalOcean Console
1. Go to: API → Spaces Keys
2. Click "Generate New Key"
3. Name: "Terraform State Backend"
4. Copy Access Key and Secret Key
```

### Step 3: Add GitHub Secrets

```bash
# Go to: Settings → Secrets and variables → Actions
DO_SPACES_ACCESS_KEY     = <your-spaces-access-key>
DO_SPACES_SECRET_KEY     = <your-spaces-secret-key>
```

### Step 4: Update Terraform Configuration

Edit `terraform/digitalocean/main.tf`:

```hcl
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
  
  # Comment out local backend
  # backend "local" {
  #   path = "terraform.tfstate"
  # }
  
  # Uncomment and configure S3 backend
  backend "s3" {
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    
    endpoints = {
      s3 = "https://nyc3.digitaloceanspaces.com"
    }
    
    region = "us-east-1"
    bucket = "expensy-terraform-state"
    key    = "digitalocean/terraform.tfstate"
  }
}
```

### Step 5: Update Workflow

Edit `.github/workflows/cloud-deploy.yml`:

Add environment variables to Terraform Init step:

```yaml
- name: Terraform Init
  working-directory: terraform/${{ github.event.inputs.cloud_provider }}
  run: |
    terraform init
    terraform workspace select ${{ github.event.inputs.terraform_workspace }} || terraform workspace new ${{ github.event.inputs.terraform_workspace }}
  env:
    # Add these for S3 backend
    AWS_ACCESS_KEY_ID: ${{ secrets.DO_SPACES_ACCESS_KEY }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.DO_SPACES_SECRET_KEY }}
    # Keep these
    DIGITALOCEAN_TOKEN: ${{ secrets.DIGITALOCEAN_TOKEN }}
```

### Step 6: Migrate State

```bash
# Initialize with new backend
terraform init -migrate-state

# Terraform will ask: "Do you want to copy existing state to the new backend?"
# Answer: yes
```

## Troubleshooting

### Error: "No valid credential sources found"

**Problem:** Terraform can't find AWS credentials for Spaces backend.

**Solution:**
1. Check GitHub Secrets are set: `DO_SPACES_ACCESS_KEY`, `DO_SPACES_SECRET_KEY`
2. Ensure they're passed as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in workflow
3. Or use local backend (default)

### Error: "Bucket does not exist"

**Problem:** Spaces bucket not created.

**Solution:**
1. Create the Spaces bucket first (see Step 1 above)
2. Use exact name in Terraform config
3. Ensure region matches (nyc3)

### Error: "Access Denied"

**Problem:** Spaces keys don't have correct permissions.

**Solution:**
1. Regenerate Spaces keys
2. Ensure keys have full access
3. Update GitHub Secrets with new keys

## Cost

**DigitalOcean Spaces:**
- First 250 GB storage: FREE
- Outbound transfer: $0.01/GB after first 1TB
- For Terraform state: **Effectively FREE** (state files are tiny)

## Best Practices

### For Solo Developer:
```hcl
# Use local backend (current setup)
backend "local" {
  path = "terraform.tfstate"
}
```

### For Team:
```hcl
# Use Spaces backend
backend "s3" {
  endpoints = {
    s3 = "https://nyc3.digitaloceanspaces.com"
  }
  bucket = "expensy-terraform-state"
  key    = "digitalocean/terraform.tfstate"
}
```

### State Locking

**Note:** DigitalOcean Spaces doesn't support DynamoDB-style state locking.

For state locking, consider:
1. Use Terraform Cloud (free for small teams)
2. Use GitLab CI/CD with built-in state management
3. Manual coordination for teams

## Alternative: Terraform Cloud

For free, robust state management:

```hcl
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "expensy-digitalocean"
    }
  }
}
```

Benefits:
- ✅ Free for up to 5 users
- ✅ State locking
- ✅ State versioning
- ✅ UI for state inspection
- ✅ Audit logs

## Current Workflow State Management

The workflow currently:
1. ✅ Caches state file between runs
2. ✅ Uploads state as artifact (30-day retention)
3. ✅ Restores state on next run
4. ✅ Works without additional setup

This is sufficient for:
- Solo developers
- Non-production environments
- Testing/PoC projects

For production, migrate to Spaces or Terraform Cloud.
