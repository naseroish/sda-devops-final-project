# Redis Integration (AKS + GitHub Actions)

**Decision:** Redis will run **inside the AKS cluster** alongside MongoDB using a **StatefulSet + PVC**. Below is the streamlined flow using **GitHub Actions Secrets → Kubernetes Secret → Redis Pod**.

---

## 1) GitHub Actions Secrets
Add to **Settings → Secrets and variables → Actions**:
- `REDIS_PASSWORD` — strong password for in‑cluster Redis

## 2) Pipeline Steps
After Azure login, `az aks get-credentials`, and ensuring the `expensy` namespace, add:

```bash
# Create/Update Redis secret in AKS
kubectl -n $K8S_NAMESPACE create secret generic expensy-redis \
  --from-literal=REDIS_PASSWORD="${{ secrets.REDIS_PASSWORD }}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Apply Redis manifests (StatefulSet + Service)
kubectl apply -f k8s/redis-statefulset.yaml
```

- Secret name: **`expensy-redis`** (namespace: `expensy`).
- Ensure the Redis container requires a password via `--requirepass` that reads from `REDIS_PASSWORD` (env). 
- Use **Azure managed CSI** storage class (e.g., `managed-csi`) for the PVC.
- Expose a headless or ClusterIP **`redis-service`** for in‑cluster DNS.

---

## 3) Backend Configuration (inside the cluster)
Set environment variables in the backend Deployment:

**Single URL form (recommended)**
```env
REDIS_URL=redis://:$REDIS_PASSWORD@redis-service.expensy.svc.cluster.local:6379
```

**Split vars (alternative)**
```env
REDIS_HOST=redis-service.expensy.svc.cluster.local
REDIS_PORT=6379
REDIS_PASSWORD=<valueFrom: secret expensy-redis/REDIS_PASSWORD>
```

> In Node.js (ioredis, node-redis), either provide `REDIS_URL` or `host/port/password` options. No TLS is required for in‑cluster service.

---

## 4) Minimal Redis StatefulSet Expectations
The manifest (applied by the pipeline) should include:
- **StatefulSet** with `replicas: 1` (or more if we add HA later)
- Container image (e.g., `bitnami/redis:latest`)
- `envFrom` or `env` to read `REDIS_PASSWORD` from `expensy-redis`
- Command/args to enforce `--requirepass $(REDIS_PASSWORD)`
- **PVC** via `volumeClaimTemplates` using `storageClassName: managed-csi`
- **Service** named `redis-service` (headless or ClusterIP) in `expensy`

---

## 5) End‑to‑End Picture (MongoDB + Redis)
- **Secrets:**
  - `expensy-secrets` → MongoDB root creds (already in workflow)
  - `expensy-redis` → Redis password (this section)
- **Manifests:**
  - `mongodb-statefulset.yaml` (uses `expensy-secrets`)
  - `redis-statefulset.yaml` (uses `expensy-redis`)
- **Backend:** reads both sets of env vars and connects using in‑cluster DNS:
  - MongoDB: `mongodb-service.expensy.svc.cluster.local:27017`
  - Redis: `redis-service.expensy.svc.cluster.local:6379`

---

## 6) Quick Checklist (Redis, in‑cluster)
- [ ] `REDIS_PASSWORD` added to GitHub Secrets
- [ ] Pipeline creates/updates `expensy-redis` Secret in `expensy`
- [ ] Redis StatefulSet/Service applied with `--requirepass`
- [ ] PVC uses `managed-csi` and has enough size
- [ ] Backend env wired (URL or split vars)
