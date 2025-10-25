# AKS + MongoDB Secrets via GitHub Actions 

A short, practical guide to connect **MongoDB** on **AKS** using **GitHub Actions** with a **service principal (client secret)**. 

---

## 1) Overview
- **Source of truth for secrets:** GitHub Actions Secrets
- **Auth to Azure:** Service principal (`clientId`/`clientSecret`)
- **Target:** AKS cluster namespace (e.g., `expensy`)
- **Pattern:** GitHub Secrets ➜ Kubernetes Secret ➜ Pods consume env vars ➜ build Mongo connection string

---

## 2) Prerequisites
- An AKS cluster and `kubectl` access from the GitHub runner
- A service principal with rights to AKS 
- MongoDB StatefulSet manifest already referencing a Kubernetes Secret (e.g., `expensy-secrets`)

---

## 3) Add GitHub Actions Secrets
In the Github repository: **Settings → Secrets and variables → Actions**

**Azure login**
- `ARM_CLIENT_ID`
- `ARM_CLIENT_SECRET`
- `ARM_TENANT_ID`
- `ARM_SUBSCRIPTION_ID`

**MongoDB credentials**
- `MONGO_INITDB_ROOT_USERNAME`
- `MONGO_INITDB_ROOT_PASSWORD`
- *(Optional)* `MONGO_DB_NAME` or a single `MONGO_URL`

> These values are encrypted by GitHub and masked in logs.

---

## 4) High‑Level Workflow Steps (CI/CD)
1. **Checkout** the repo.
2. **Login to Azure** using the 4 `ARM_*` secrets via `azure/login@v2`.
3. **Point kubectl to AKS**:
   ```bash
   az aks get-credentials \
     --resource-group <AKS_RESOURCE_GROUP> \
     --name <AKS_CLUSTER_NAME> \
     --overwrite-existing
   ```
4. **Ensure namespace exists** (e.g., `expensy`).
5. **Create/Update a Kubernetes Secret** from GitHub Secrets (idempotent):
   ```bash
   kubectl -n <K8S_NAMESPACE> create secret generic expensy-secrets \
     --from-literal=MONGO_INITDB_ROOT_USERNAME="${{ secrets.MONGO_INITDB_ROOT_USERNAME }}" \
     --from-literal=MONGO_INITDB_ROOT_PASSWORD="${{ secrets.MONGO_INITDB_ROOT_PASSWORD }}" \
     --dry-run=client -o yaml | kubectl apply -f -
   ```
6. **Apply MongoDB manifests** (StatefulSet/Service). The DB pod reads the secret to initialize auth on first boot.
7. **Backend Deployment** (later step) to **consume the same secret** as env vars.

---

## 5) Backend Connection String (inside the cluster)
When backend starts, build the URI using env vars injected from the secret:

```bash
mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongodb-service.<namespace>.svc.cluster.local:27017/<db>?authSource=admin
```

- Replace `<namespace>` with `expensy` namespace.
- Replace `<db>` with `MONGO_DB_NAME` database name.
- If a **non-root app user** got created, `authSource=admin` could be dropped and scope privileges to the app DB.

---

## 6) Rotating Secrets
1. Update values in **GitHub Actions Secrets**.
2. Re-run the workflow to **upsert** the Kubernetes Secret.
3. Restart affected pods (if the app only reads env at startup):
   ```bash
   kubectl -n <K8S_NAMESPACE> rollout restart deploy/<your-backend-deployment>
   ```

---

## 7) Notes & Tips
- **Security**: Kubernetes Secrets are base64-encoded by default. For production, enable **secret encryption at rest (KMS/CMK)** or use **Azure Key Vault + CSI Driver**.
- **Idempotency**: The `--dry-run=client -o yaml | kubectl apply -f -` pattern makes secret creation safe on repeated runs.
- **Service DNS**: Inside the cluster, prefer the service FQDN `mongodb-service.<namespace>.svc.cluster.local:27017`.
- **App user (recommended)**: Initialize a dedicated app user via a one-off Kubernetes Job, then store those credentials separately.

---

## 8) Troubleshooting
- **Pod can’t auth**: Ensure the secret keys referenced in the Mongo manifest match the keys created (`MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`).
- **Auth only works on first boot**: If the PVC already has data, the init creds don’t re-run. Use the mongo shell to create/update users instead.
- **DNS/connectivity**: Check service/pod resolution and port: `kubectl -n <ns> get svc,pod -o wide`.
- **Permissions**: The service principal must access the AKS resource. If `az aks get-credentials` fails, verify role assignments.

---

## 9) Quick Checklist
- [ ] ARM_* secrets added in GitHub
- [ ] MongoDB creds added in GitHub
- [ ] Workflow logs into Azure and targets AKS
- [ ] Namespace exists (e.g., `expensy`)
- [ ] `expensy-secrets` created/updated from GitHub Secrets
- [ ] MongoDB StatefulSet applied and running
- [ ] Backend reads the secret and connects via service DNS

