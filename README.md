Çağrı

# 🚀 ReleasePilot

**Modern Node.js CI/CD on Google Cloud Platform**  
Multi-environment, secure, containerized delivery with **Cloud Build → Artifact Registry → Cloud Run**

<p align="center">
  <a href="https://cloud.google.com">
    <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud" />
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Node.js-20.x-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  </a>
  <a href="https://www.docker.com">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </a>
  <a href="https://aquasecurity.github.io/trivy">
    <img src="https://img.shields.io/badge/Security-Trivy-blueviolet?style=for-the-badge&logo=aquasecurity&logoColor=white" alt="Trivy" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

> **Author:** Mustafa Çağrı Açıkgöz  
> **Credential:** Intel Cloud DevOps Competency

**ReleasePilot** is an open-source reference project demonstrating a **production-style CI/CD pipeline** for a containerized Node.js service on GCP.  
Built around **“Build Once, Deploy Anywhere”**, it keeps environments consistent while enforcing a security gate before deployment.

---

## Table of Contents

- [Highlights](#-highlights)
- [Live Environments](#-live-environments)
- [Architecture](#-architecture)
- [Deployment Rules](#-deployment-rules)
- [CI/CD Workflow](#-cicd-workflow)
- [Security Gate](#-security-gate-hard-fail)
- [API Reference](#-api-reference)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Manual Deployment](#-manual-deployment-optional)
- [Rollback Strategy](#-rollback-strategy)
- [Observability](#-observability)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## ✨ Highlights

- **Multi-environment** delivery: Dev / QA / Staging
- **Container-first**: Docker image build + Artifact Registry
- **DevSecOps gate**: Trivy scan with **hard fail** on HIGH/CRITICAL vulnerabilities
- **Cloud Run revisions**: rapid rollback via traffic shifting
- **Live dashboard**: deployment details on `/`, metadata on `/info`

---

## 🌍 Live Environments

Each environment exposes a simple dashboard on `/` (environment badge + commit SHA).

| Environment | Branch | Service URL | Status |
|---|---|---|---|
| **Dev** | `develop` | https://releasepilot-dev-793965989778.europe-west1.run.app | 🛠️ Live |
| **QA** | `qa` | https://releasepilot-qa-793965989778.europe-west1.run.app | 🧪 Live |
| **Staging** | `staging` | https://releasepilot-staging-793965989778.europe-west1.run.app | 🏔️ Live |

---

## 🧩 Architecture

```mermaid
graph LR
  A[GitHub Push / PR] --> B{Cloud Build Trigger}
  B --> C[npm ci + tests + lint]
  C --> D[Build Docker Image]
  D --> E[Push to Artifact Registry]
  E --> F[Trivy Vulnerability Scan]
  F -->|Pass| G[Deploy to Cloud Run]
  F -->|Fail| H[Build Fails]
  G --> I[Dashboard (/) + Metadata (/info)]
```

---

## 🚦 Deployment Rules

| Environment | Git Branch | Cloud Run Service | Pipeline Config |
|---|---|---|---|
| **Development** | `develop` | `releasepilot-dev` | `cloudbuild/cloudbuild-dev.yaml` |
| **QA** | `qa` | `releasepilot-qa` | `cloudbuild/cloudbuild-qa.yaml` |
| **Staging** | `staging` | `releasepilot-staging` | `cloudbuild/cloudbuild-staging.yaml` |

---

## 🔁 CI/CD Workflow

1. **Trigger** on push/PR (per environment branch)
2. **Install & validate**: `npm ci`, tests, lint
3. **Build image** from `Dockerfile`
4. **Push** to Artifact Registry
5. **Scan** image using Trivy
6. **Deploy** to Cloud Run (only if scan passes)
7. **Verify** via `/health` and `/info`

> Tip: Tag images with the commit SHA. It makes “what is running” auditable and reproducible.

---

## 🛡️ Security Gate (Hard Fail)

Before any deployment, the built image is scanned using **Trivy**.

- **Blocking criteria:** any **HIGH** or **CRITICAL** vulnerabilities
- **Enforcement:** if the scan fails, the pipeline **does not execute** the deploy step
- **Outcome:** vulnerable builds never reach a live environment

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/` | HTML dashboard (env badge + commit SHA) |
| **GET** | `/health` | Liveness check (200 OK) |
| **GET** | `/info` | Metadata JSON (env, version, commit) |
| **POST** | `/echo` | Request testing utility (returns request body) |

---

## 📁 Repository Structure

```text
src/            # Application source code
tests/          # Automated tests (Jest/Mocha)
cloudbuild/     # Multi-env Cloud Build pipeline definitions
Dockerfile      # Container build instructions
package.json    # Scripts + dependencies
README.md       # Project documentation
```

---

## ✅ Prerequisites

- A **Google Cloud project** with billing enabled
- **gcloud CLI** authenticated (`gcloud auth login`)
- Permissions to manage:
  - Cloud Build
  - Artifact Registry
  - Cloud Run
  - IAM (service accounts/roles)

Common roles (depending on org policies):
- Cloud Run Admin
- Cloud Build Editor
- Artifact Registry Writer
- Service Account User

---

## 💻 Local Development

### Native

```bash
npm install
npm test
npm start
```

### Docker (Production Simulation)

Test the production container locally before pushing:

```bash
docker build -t releasepilot-node:local .

docker run --rm -p 8080:8080   -e ENV=dev   -e COMMIT_SHA=localtest   releasepilot-node:local
```

> The GitHub error you saw (“Unable to render rich display”) happens when shell commands are placed in a `mermaid` code block.  
> Commands must be fenced as `bash` (like above). Only diagrams should use `mermaid`.

---

## 🚀 Manual Deployment (Optional)

If you need to deploy manually (for example, validating a revision outside CI/CD):

```bash
gcloud run deploy releasepilot-staging   --image REGION-docker.pkg.dev/PROJECT_ID/REPO/releasepilot-node:TAG   --region europe-west1   --platform managed
```

> Artifact Registry image paths usually look like: `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG`

---

## ⏪ Rollback Strategy

In production-style environments, recovery time matters.

### 1) Instant Traffic Shift (Fastest)

Cloud Run Console → **Revisions** → select a healthy revision → set **Traffic 100%**

### 2) Redeploy a Known-Good Image Tag

```bash
gcloud run deploy releasepilot-staging   --image REGION-docker.pkg.dev/PROJECT_ID/REPO/releasepilot-node:STABLE_TAG   --region europe-west1   --platform managed
```

---

## 📈 Observability

- **Cloud Build Logs:** end-to-end build/test/scan/deploy traceability
- **Cloud Run Logs:** request + application logs in Cloud Logging
- **Metrics:** latency, request count, CPU/memory in Cloud Monitoring
- **Release proof:** `/info` returns env + commit/version metadata for verification

---

## 🤝 Contributing

PRs are welcome. If you add pipeline improvements, keep them:

- environment-safe (Dev/QA/Staging parity)
- secure-by-default (no shortcuts around the security gate)
- documented (update the README)

---

## ✉️ Contact

- **LinkedIn:** Mustafa Çağrı Açıkgöz (https://www.linkedin.com/in/cagriack/)
- **GitHub:** mcagriacikgoz (https://github.com/mcagriacikgoz)

---

*This project is an open-source demonstration of modern DevOps practices on GCP.*

