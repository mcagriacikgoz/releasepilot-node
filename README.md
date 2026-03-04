# 🚀 ReleasePilot (Node.js)
### Multi-Environment CI/CD on Google Cloud Platform

<p align="left">
  <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Security-Trivy-blueviolet?style=for-the-badge&logo=aquasecurity" />
</p>

> **Author:** Mustafa Çağrı Açıkgöz  
> **Credential:** Intel Cloud DevOps Competency

**ReleasePilot** is a production-style CI/CD implementation designed to build, scan, version, and deploy containerized Node.js services to **Google Cloud Run** using automated **Cloud Build** triggers.

---

## 🌐 Live Environments

Each environment serves a visual dashboard at the root `/` displaying real-time deployment metadata.

* **[DEV]** 🛠️ [Access Environment](https://releasepilot-dev-793965989778.europe-west1.run.app/)
* **[QA]** 🧪 [Access Environment](https://releasepilot-qa-793965989778.europe-west1.run.app/)
* **[STAGING]** 🏔️ [Access Environment](https://releasepilot-staging-793965989778.europe-west1.run.app/)

---

## 🏗 System Architecture

The workflow follows a strict "Build Once, Deploy Anywhere" philosophy using immutable artifacts.

```mermaid
graph LR
  A[GitHub Push] --> B{Cloud Build}
  B --> C[npm ci & test]
  C --> D[Docker Build]
  D --> E[Artifact Registry]
  E --> F[Trivy Security Gate]
  F --> G[Cloud Run Deploy]
  G --> H[Live Dashboard]
  
  style F fill:#f96,stroke:#333,stroke-width:2px
  ```

## 🚦 Deployment Rules

| Environment | Git Branch | Cloud Run Service | Config Path |
| :--- | :--- | :--- | :--- |
| **Development** | `develop` | `releasepilot-dev` | `cloudbuild/cloudbuild-dev.yaml` |
| **QA** | `qa` | `releasepilot-qa` | `cloudbuild/cloudbuild-qa.yaml` |
| **Staging** | `staging` | `releasepilot-staging` | `cloudbuild/cloudbuild-staging.yaml` |

## 🛡️ DevSecOps: Security Gate

We implement a Hard Fail policy for security. Before any deployment, Trivy scans the container image.

Blocking Criteria: Any HIGH or CRITICAL vulnerabilities.

Enforcement: The deployment step in Cloud Build will not execute if the scan fails, ensuring 0-day protection.


## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | HTML Dashboard (Env Badge + Commit SHA) |
| **GET** | `/health` | Liveness check (Status 200) |
| **GET** | `/info` | Technical metadata (JSON: env, version, commit) |
| **POST** | `/echo` | Request testing utility (Returns request body) |

## 📂 Repository Structure

```text
src/          # Application source code
test/         # Automated test suites (Jest/Mocha)
cloudbuild/   # Multi-env GCP pipeline definitions
Dockerfile    # Container build instructions
package.json  # Node.js dependencies & scripts
README.md     # Project documentation
 ```

## 💻 Local Development

Native Run
```mermaid
npm install
npm test
npm start
 ```

Docker Simulation
Test the production container behavior locally before pushing:
```mermaid
docker build -t releasepilot-node:local .
docker run --rm -p 8080:8080 \
  -e ENV=dev \
  -e COMMIT_SHA=localtest \
  releasepilot-node:local
 ```

## ⏪ Rollback Strategy

In a production-critical environment, speed of recovery is key:

1. Instant Traffic Shift (Fastest)
Go to Cloud Run Console → Revisions → Select a healthy version → Set Traffic to 100%.

2. Manual Image Redeploy
If you need to force a specific stable Git commit back to live:

```mermaid
gcloud run deploy releasepilot-staging \
  --image gcr.io/[PROJECT_ID]/releasepilot-node:[STABLE_COMMIT_SHA] \
  --region europe-west1
 ```

 ## 📊 Observability & Proofs

 Deployment Pipeline
Registry & Versioning

## ✉️ Contact & Links
- **LinkedIn:** [Mustafa Çağrı Açıkgöz](https://www.linkedin.com/in/cagriack/)
- **GitHub:** [@username](https://github.com/mcagriacikgoz)

---
*This project is an open-source demonstration of modern DevOps practices on GCP.*

---