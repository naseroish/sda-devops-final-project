# DevOps Project

In this project, we will focus on the hands-on implementation of the learnings throughout this program, where you will gain practical insights while deploying a full-stack, multi-component web application using modern DevOps practices. 
The project focuses on containerization, infrastructure automation, Orchestration, CI/CD, observability, and security.

## App Structure & Overview

The App consists of:

- Frontend (Expense Tracker UI): A Next.js application providing a user-friendly interface to add, view, and analyze expenses.
- Backend (API): A Node.js / Express service that exposes REST endpoints for expense management.
- Database (MongoDB): Stores persistent expense data.
- Redis: In-memory datastore used for caching and fast access to frequently requested data.

The purpose of this stack is to simulate a real-world multi-component application while exposing you to Docker, Kubernetes, IaC, CI/CD pipelines, monitoring, and secure deployments.

GitHub repository: [expense tracker web app](https://github.com/najjaved/devOps-final-project-expensy.git)


Your **forked repository** should contain the **Next.js** frontend (root directory) and the **Node/Express** backend (`formitbe/`, or similar) as two distinct folders.

### Environment Variables

- **Frontend**: use `NEXT_PUBLIC_*` for variables that need to be exposed to the browser.
- **Backend**: store secrets like `DATABASE_URI`, `REDIS_PASSWORD`, etc. in a `.env` file or in your CI/CD pipeline secret store. **Never** commit these secrets directly.

Remember that environment variables set in your server take precedence (priority) over the `.env` files.

---

## Learning Objectives

By the end of this project, you will be able to:

1. Deploy, run, and debug multi-component applications locally (optional).
2. Containerize applications using Docker and optionally compose them locally using docker-compose.
3. Use Terraform to provision managed Kubernetes clusters (AKS) and configure cloud networking as well as manage state remotely.
4. Automate CI/CD workflows with GitHub Actions:
 - Build, test, and containerize frontend and backend & push container images to a registry (Docker Hub or ACR).
 - Automate infratructure deployment
 - Deploy to AKS using manifests or Helm charts.
5. Set up monitoring and observability using Prometheus and Grafana, with dashboards and alerts.
6. Implement and document security best practices: 
 - Manage secrets via .env files, Kubernetes Secrets, or cloud secret stores such as Azure Key vault.
 - Restrict network access and enforce HTTPS.
 - Configure RBAC and minimal service exposure (apply principle of least privilege).
 - security.md
 
## Working as a Team

Work as an adapted Scrum team. Have the Instructor as the Product Owner, with daily stand-ups, one sprint cycle ( 5 days), and 30-minute retrospective meetings.

- Decide what can be done in firat 2-3 days, and what can be done in the following couple of days.
- Divide tasks—for example, containerizing the Apps, creating the k8s infra, configuring your worker nodes, CI/CD workflows & Monitoring.
- Use a task board (Jira or Trello/Github-project) to manage work.
   - Jira is a more real-life working scenario.
   - Trello is well adapted for small teams and smaller projects—choose this to be practical, save time, and deliver as much work as possible.

The final presentation should work as a Final Sprint Review, demonstrating your work at project end.

---

## Flow of the Project

### Part 1.1 - Cloning the Application

Make sure to **fork** the main branch of [this repository](https://github.com/najjaved/devOps-final-project-expensy.git). Forking means creating your own version of the repository.

Inspect the folder structures to understand what technologies belong to the respective folders(backend, frontend), and see what is directly run from a Docker image (mongodb, redis).

### Part 1.2 - Running the Applications Locally (Not Evaluated- OPTIONAL)
This step is to help you get comfortable with the components before containerization. You will run the services directly on your local machine.

**Prerequisites**: You must have Node.js and nmp installed locally, verify using `node -v` & `npm -v`.

### First Step - Redis & MongoDB
When setting up the project, make sure to setup mongo and redis containers accordingly:

**Mongo**
```docker
docker run --name mongo -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example mongo:latest
```

**Redis**
```docker
docker run --name redis -d -p 6379:6379   redis:latest   redis-server --requirepass someredispassword
```

### Second Step - Backend
When you run the backend, make sure to inspect the `.env`  file and to add the same environment variables to the terminal you’re running them on, if the server doesn’t seem to recognize the connection to Database.

```
npm i 
npm start
```

### Third Step - Frontend
You can easily run the frontend by running `npm run dev` (inspect the package.json file for this)

### Part 1.3 - Dockerizing the Applications
You’ll build and run these services in Docker containers.

1. **Dockerfiles**:
    - Frontend Dockerfile (example name: `expensy_frontend/Dockerfile`).
    - Backend Dockerfile (example name: `expensy_backend/Dockerfile`).
    - Each should define the build process and runtime for their respective services.
2. **Optional**:
    - A `docker-compose.yaml` to quickly spin up all 4 containers locally, referencing environment variables for ports, database URIs, etc.
3. **Deliverable**:
    - Dockerfiles committed to your forked repo.
    - A `docker-compose.yaml` (optional, but highly recommended).


### Part 1.4 - Infrastructure Automation (IaC)
1. **Infrastructure Setup (IaC)**:
    - Use **Terraform** or **Bicep** to provision an **AKS** (Azure) cluster.
    - Keep your IaC files in a dedicated folder, e.g., `/infrastructure/`.
2. Implement Remote state storage for your infra


### Part 1.5 - Orchestration (AKS)

**Kubernetes Manifests**:
    - Create kubernetes manifests i.e. `deployment.yaml` and `service.yaml` files for both the frontend and backend.
	- Create manifests (recommeneded type is statefulset) for Redis and MongoDB.
    - Consider using a single `kustomization.yaml` or a `helm chart` if comfortable.
    - Reference the container images from Docker Hub (or ACR) and ensure environment variables (like `DATABASE_URI`) are passed via **ConfigMaps** or **Secrets**.
	
**Deliverable**:
    - **Kubernetes manifests** or **Helm charts** for deploying your containers.
    - A short `README.md` describing how to deploy onto your AKS cluster.

	
### Part 1.6 - CI/CD Pipeline

1. **Setup**:
    - Create a **GitHub Actions** workflow (`.github/workflows/ci-cd.yaml`, or similar).
    - **Stages**:
	    - **Code Analysis** using SonarQube
        - **Build**: Install dependencies (`npm install`) and build the projects (`npm run build`) for both frontend and backend.
        - **Test**: Optionally run unit or integration tests (if any).
        - **Docker Build & Push**: Build container images for both frontend and backend and push them to a container registry (e.g., Docker Hub/ACR, etc.).
        - **Deploy**: Automate your deployment to AKS or a staging environment, requiring manual approval before production.
		
2. **Deliverable**:
    - A `ci-cd.yaml` (or `main.yaml`) in `.github/workflows/` with steps for build, test, container push, and deployment.
	- An `infra.yaml` pipeline with terraform init, plan, apply, etc.
    - Document in your `README.md` or a separate `CI-CD.md` how to set up environment variables, the pipeline, and any required secrets/tokens.


### Part 1.7 - Monitoring and Logging

1. **Prometheus & Grafana** (or an equivalent monitoring stack):
    - Configure a **Prometheus** instance to scrape metrics from your infrastructure as well as your pods/services.
    - Configure **Grafana** to visualize those metrics.
    - Optionally, set up alerts/alertmanager (idelly via a yaml file)
2. **Logging**:
    - Ensure container logs are available in **Azure Monitor** (AKS).
    - Alternatively, use an **ELK (Elasticsearch, Logstash, Kibana)** stack if you prefer self-managed logs.
3. **Deliverable**:
    - Prometheus config files and sample Grafana dashboards in your repo (`/monitoring/`).
    - Documentation explaining:
        - How to spin up Prometheus & Grafana within your cluster.
        - How to view logs in Azure Monitor (or via ELK).

### Part 1.8 - Security and Compliance

1. **Security Best Practices**:
    - **IAM roles/RBAC** for your Kubernetes cluster instead of root credentials.
    - **Network Security**: Restrict inbound traffic, lock down security groups/NSGs.
    - **TLS/HTTPS** for frontend-backend communication.
    - **Secrets** in Kubernetes or an external secret manager (Azure Key Vault).
2. **Compliance Documentation**:
    - Create a `SECURITY.md` or `COMPLIANCE.md` listing:
        - How you manage secrets.
        - How logs and metrics are retained (retention policy).
        - Basic data-protection requirements (e.g., data is encrypted at rest if needed).
3. **Deliverable**:
    - A short security overview in your repo explaining how credentials, secrets, and roles are handled.
    - Any compliance checklists you’re following (GDPR, HIPAA, etc., if relevant) to show where the user data is saved (and therefore under which legislation) OPTIONAL.

---

## Final Deliverables Summary

Make sure the following are **all committed** to your **forked GitHub repository**:

1. **CI/CD Pipeline**
    - `.github/workflows/*.yaml` with build/test/deploy steps.
    - Documentation on how to configure environment variables/secrets in GitHub Actions.
2. **Containerization**
    - **Dockerfiles** for frontend & backend.
    - Optionally, a `docker-compose.yaml` for local dev.
3. **Orchestration**
    - Terraform or scripts for setting up AKS.
    - Kubernetes manifests (Deployment, Service, etc.) or Helm charts.
    - Instructions for deploying to your cluster.
4. **Monitoring and Logging**
    - Prometheus config, Grafana dashboards (JSON exports), or instructions for Azure Monitor setup.
    - Document how to install them or how to view logs/metrics.
5. **Security and Compliance**
    - `SECURITY.md` or `COMPLIANCE.md` summarizing your RBAC approach, secret handling, and compliance posture.
6. **Project Documentation**
    - [**README.md**](http://readme.md/) with a clear overview of:
        - The app’s purpose (expense tracker).
        - Detailed local dev steps (frontend & backend).
        - Container usage.
        - How to deploy to your chosen cloud platform.
    - Additional docs as needed (CI/CD instructions, monitoring, troubleshooting, etc.).

---
## Acceptance Criteria (How this will be graded)

### Architecture & Design (25%)
* Clear diagram matches the description; components are justified (e.g., AGIC vs NGINX).
* AKS designed with system/user node pools and autoscaling strategy.
* All the services are private; direct access from outside the cluster is disabled.
* ACR + managed identity for image pulls; GitHub OIDC described.

### Infrastructure Automation (20%)
* Terraform execution model via GitHub Actions is well documented (plan on PR, apply on main with approvals).
* Remote state and state locking described; policy/security checks included.
* Outputs & drift-detection approach documented.

### CI/CD Workflows (20%)
* Separate workflows for frontend and backend; independent triggers.
* Build/test steps, artifact strategy, image tagging strategy (immutable).

### Security & Compliance (15%)
* Secrets handled exclusively via Azure Key Vault or Kubernetes secrets; least-privilege RBAC; Network Policies documented.
* Image scanning and tag immutability addressed.
* environments variables are never committed to remote repository

### Observability & SRE (10%)
* Prometheus/Grafana plan with insightful dashboards.
* Alerts are actionable; sub-grouping between business and technical alerts.


## In Closing

Follow these guidelines to demonstrate a **full DevOps lifecycle**, from checking app, containerizing it, deploying to a managed Kubernetes service, monitoring performance, and ensuring basic security. Having these deliveries in your **GitHub fork** makes your work transparent, versioned, and easy to review by instructors or teammates.

**Good luck!**