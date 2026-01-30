# CI/CD Pipeline with Jenkins + Docker + Azure

This project demonstrates a fully automated CI/CD pipeline using Jenkins, Docker, and Microsoft Azure.  
The pipeline builds a Node.js application, runs tests, creates a Docker image, pushes it to Azure Container Registry (ACR), and deploys it automatically to Azure Web App.

## 🚀 Overview

The goal of this project is to implement a production-style CI/CD workflow with:

- automated build
- automated testing
- Docker containerization
- secure image registry
- cloud deployment
- zero manual release steps

Every push to GitHub triggers a complete pipeline execution.

---

## 🧱 Architecture
GitHub push
→ Jenkins pipeline
→ Build & tests
→ Docker image creation
→ Push to Azure Container Registry (ACR)
→ Deploy to Azure Web App


The entire pipeline is defined as code using a Jenkinsfile.

---

## ⚙️ Tech Stack

- Jenkins (Pipeline as Code)
- Docker
- Node.js 20
- Azure Container Registry (ACR)
- Azure Web App (App Service)
- Azure CLI
- JUnit test reporting

---

## 🔄 Pipeline Stages

### 1. Checkout

- Pulls source code from GitHub
- Triggered automatically on push

### 2. Install & Build

- Runs inside a Docker Node container
- Clean dependency install (`npm ci`)
- Production build

### 3. Tests

- Executes automated tests
- Generates JUnit report
- Jenkins collects test results

### 4. Docker Image Build

- Builds versioned Docker image
- Tag based on Jenkins build number
- Enables rollback and traceability

### 5. Push to Azure Container Registry

- Secure login using Jenkins credentials
- Pushes image to private registry

### 6. Deploy to Azure Web App

- Uses Azure CLI container
- Authenticates with service principal
- Updates running container
- Restarts web app

### 7. Cleanup

- Removes unused Docker images
- Prevents Jenkins disk overload

---

## 🔐 Security

- No secrets stored in source code
- Credentials managed via Jenkins Credentials Manager
- Azure authentication via service principal
- Private container registry

---

## 📦 Image Versioning

Each build generates a unique Docker image:

cloudprojacrxyz.azurecr.io/cloudproject:<build_number>


This allows:

- rollback capability
- deployment traceability
- reproducible releases

---

## 🧪 Testing Strategy

- Automated test execution during pipeline
- JUnit report integration with Jenkins
- Non-blocking test reporting (can be configured to fail build)

---

## 📈 Possible Improvements

- fail pipeline on test failure
- integrate SonarQube code analysis
- Docker security scanning
- blue/green deployment strategy
- monitoring and logging
- Kubernetes deployment
- caching dependencies
- environment separation (dev/staging/prod)

---

## 🧠 Key DevOps Concepts Demonstrated

- CI/CD automation
- Pipeline as Code
- container-based builds
- reproducible environments
- cloud-native deployment
- secrets management
- versioned artifacts
- zero-downtime deployment approach

---



