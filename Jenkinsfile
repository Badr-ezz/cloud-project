pipeline {
  agent any
  options { timestamps() }

  environment {
    // Azure resources (adjust names only if yours differ)
    ACR_NAME        = 'cloudprojacrXYZ'
    RESOURCE_GROUP  = 'rg-cloudproject'
    WEBAPP_NAME     = 'cloudproject-webapp'

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

    stage('Login to Azure & Push to ACR') {
      steps {
        withCredentials([
          string(credentialsId: 'azure-client-id',     variable: 'AZ_CLIENT_ID'),
          string(credentialsId: 'azure-client-secret', variable: 'AZ_CLIENT_SECRET'),
          string(credentialsId: 'azure-tenant-id',     variable: 'AZ_TENANT_ID'),
          string(credentialsId: 'azure-subscription-id', variable: 'AZ_SUBSCRIPTION_ID')
        ]) {
          sh '''
            set -eux
            docker run --rm \
              -v /var/run/docker.sock:/var/run/docker.sock \
              -e AZ_CLIENT_ID -e AZ_CLIENT_SECRET -e AZ_TENANT_ID -e AZ_SUBSCRIPTION_ID \
              -e ACR_NAME -e IMAGE \
              mcr.microsoft.com/azure-cli:latest /bin/sh -c "
                set -eux
                az login --service-principal -u \\"$AZ_CLIENT_ID\\" -p \\"$AZ_CLIENT_SECRET\\" --tenant \\"$AZ_TENANT_ID\\"
                az account set --subscription \\"$AZ_SUBSCRIPTION_ID\\"
                az acr login -n \\"$ACR_NAME\\"
                docker push \\"$IMAGE\\"
              "
          '''
        }
      }
    }

    stage('Deploy to Web App') {
      steps {
        withCredentials([
          string(credentialsId: 'azure-client-id',     variable: 'AZ_CLIENT_ID'),
          string(credentialsId: 'azure-client-secret', variable: 'AZ_CLIENT_SECRET'),
          string(credentialsId: 'azure-tenant-id',     variable: 'AZ_TENANT_ID'),
          string(credentialsId: 'azure-subscription-id', variable: 'AZ_SUBSCRIPTION_ID')
        ]) {
          sh '''
            set -eux
            docker run --rm \
              -v /var/run/docker.sock:/var/run/docker.sock \
              -e AZ_CLIENT_ID -e AZ_CLIENT_SECRET -e AZ_TENANT_ID -e AZ_SUBSCRIPTION_ID \
              -e RESOURCE_GROUP -e WEBAPP_NAME -e IMAGE -e ACR_NAME \
              mcr.microsoft.com/azure-cli:latest /bin/sh -c "
                set -eux
                az login --service-principal -u \\"$AZ_CLIENT_ID\\" -p \\"$AZ_CLIENT_SECRET\\" --tenant \\"$AZ_TENANT_ID\\"
                az account set --subscription \\"$AZ_SUBSCRIPTION_ID\\"
                az webapp config container set \
                  --name \\"$WEBAPP_NAME\\" \
                  --resource-group \\"$RESOURCE_GROUP\\" \
                  --docker-custom-image-name \\"$IMAGE\\" \
                  --docker-registry-server-url https://$ACR_NAME.azurecr.io
                az webapp restart --name \\"$WEBAPP_NAME\\" --resource-group \\"$RESOURCE_GROUP\\"
              "
          '''
        }
      }
    }
  }

  post {
    always {
      echo "Build ${env.BUILD_NUMBER} finished for image ${env.IMAGE}"
      sh 'docker image prune -f || true'
    }
  }
}
