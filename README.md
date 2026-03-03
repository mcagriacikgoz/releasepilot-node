# ReleasePilot (Node.js) – Multi-Environment CI/CD on GCP

**Live Environments**
- DEV: https://<dev-url>
- QA: https://<qa-url>
- STAGING: https://<staging-url>

## Architecture

```mermaid
flowchart LR
  A[GitHub Push (branch/tag)] --> B[Cloud Build Trigger]
  B --> C[npm ci + npm test]
  C --> D[Docker build]
  D --> E[gcr.io push (COMMIT_SHA)]
  E --> F[Trivy scan gate]
  F --> G[Cloud Run deploy]
  G --> H[/info shows env + commit]

# 🚀 ReleasePilot (Node.js)
### Multi-Environment CI/CD on Google Cloud Platform

![Google Cloud](https://img.shields.io/badge/GCP-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Security](https://img.shields.io/badge/Trivy-Vulnerability_Scan-blueviolet?style=for-the-badge)

**ReleasePilot** is a production-grade CI/CD pipeline that automates building, security scanning, and deploying a containerized Node.js service to **Google Cloud Run** using **Google Cloud Build**.

---

## 🏗 High-Level Architecture



The pipeline ensures a secure and consistent release flow:
1. **Push:** Developer pushes code to GitHub.
2. **CI:** Cloud Build runs `npm test`.
3. **Build:** Docker image is created and tagged with `$COMMIT_SHA`.
4. **Scan:** **Trivy** scans the image (Blocks deployment on `HIGH/CRITICAL` vulnerabilities).
5. **CD:** The image is deployed to the environment corresponding to the branch.

---

## 🚦 Environments & Deployment Rules

| Environment | Git Branch | Cloud Run Service | Strategy |
| :--- | :--- | :--- | :--- |
| 🛠 **DEV** | `develop` | `releasepilot-dev` | Continuous Deployment |
| 🧪 **QA** | `qa` | `releasepilot-qa` | Integration Testing |
| 🏔 **STAGING** | `staging` | `releasepilot-staging` | Pre-production Sync |
| 🚀 **PROD** | `v*` (Tag) | `releasepilot-prod` | Manual Release |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service Metadata (JSON) |
| `GET` | `/health` | Liveness Probe |
| `GET` | `/info` | Env + Version + Commit Info |
| `POST` | `/echo` | Request Body Echo (Smoke Test) |

---

## 💻 Local Development

### Run on Host
```bash
# Install and test
npm install
npm test

# Start server
npm start
---bash
Run with Dockerstaging html deploy Tue Mar  3 19:39:55 TSS 2026
