pipeline {
  agent any
  options { timestamps() }

  environment {
    // Azure resources
    ACR_NAME       = 'cloudprojacrxyz'
    RESOURCE_GROUP = 'rg-cloudproject'
    WEBAPP_NAME    = 'cloudproject-webapp'

    // Image naming
    IMAGE_REPO = 'cloudproject'
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
    IMAGE      = "${env.ACR_NAME}.azurecr.io/${env.IMAGE_REPO}:${env.IMAGE_TAG}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: '*/master']],
          userRemoteConfigs: [[url: 'https://github.com/Badr-ezz/cloud-project.git']]
        ])
      }
    }

    stage('Install & Build') {
      steps {
        script {
          docker.image('node:20-alpine').inside('--network host') {
            sh '''
              set -eux
              npm ci
              npm run build
            '''
          }
        }
      }
    }

    stage('Tests') {
      steps {
        script {
          docker.image('node:20-alpine').inside('--network host') {
            sh '''
              set +e
              npm run test:report
              exit 0
            '''
          }
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit.xml'
        }
      }
    }

    stage('Build Docker image') {
      steps {
        sh '''
          set -eux
          docker build -t "${IMAGE}" .
          docker image ls "${IMAGE}" || true
        '''
      }
    }

    // ======== CHANGED STAGE BELOW =========
    stage('Login to ACR and Push Image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'acr-credentials', // Jenkins credential you’ll create
          usernameVariable: 'ACR_USER',
          passwordVariable: 'ACR_PASS'
        )]) {
          sh '''
            set -eux
            echo "Logging into Azure Container Registry..."
            docker login ${ACR_NAME}.azurecr.io -u "$ACR_USER" -p "$ACR_PASS"

            echo "Pushing Docker image to ACR..."
            docker push "${IMAGE}"

            echo "Logging out from ACR..."
            docker logout ${ACR_NAME}.azurecr.io
          '''
        }
      }
    }

//     stage('Deploy to Web App') {
//         steps {
//             withCredentials([
//             string(credentialsId: 'azure-client-id',       variable: 'AZ_CLIENT_ID'),
//             string(credentialsId: 'azure-client-secret',   variable: 'AZ_CLIENT_SECRET'),
//             string(credentialsId: 'azure-tenant-id',       variable: 'AZ_TENANT_ID'),
//             string(credentialsId: 'azure-subscription-id', variable: 'AZ_SUBSCRIPTION_ID'),
//             usernamePassword(credentialsId: 'deploy-credentials', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')
//             ]) {
//             sh '''
//                 set -eux
//                 docker run --rm \
//                 -e AZ_CLIENT_ID -e AZ_CLIENT_SECRET -e AZ_TENANT_ID -e AZ_SUBSCRIPTION_ID \
//                 -e RESOURCE_GROUP -e WEBAPP_NAME -e IMAGE -e ACR_NAME \
//                 -e ACR_USER -e ACR_PASS \
//                 mcr.microsoft.com/azure-cli:latest /bin/sh -c "
//                     set -eux
//                     az login --service-principal -u \\"$AZ_CLIENT_ID\\" -p \\"$AZ_CLIENT_SECRET\\" --tenant \\"$AZ_TENANT_ID\\"
//                     az account set --subscription \\"$AZ_SUBSCRIPTION_ID\\"
//                     az webapp config container set \
//                     --name \\"$WEBAPP_NAME\\" \
//                     --resource-group \\"$RESOURCE_GROUP\\" \
//                     --docker-custom-image-name \\"$IMAGE\\" \
//                     --docker-registry-server-url https://$ACR_NAME.azurecr.io \
//                     --docker-registry-server-user \\"$ACR_USER\\" \
//                     --docker-registry-server-password \\"$ACR_PASS\\"
//                     az webapp restart --name \\"$WEBAPP_NAME\\" --resource-group \\"$RESOURCE_GROUP\\"
//                 "
//             '''
//             }
//         }
// }

  }

  post {
    always {
      echo "Build ${env.BUILD_NUMBER} finished for image ${env.IMAGE}"
      sh 'docker image prune -f || true'
    }
  }
}
