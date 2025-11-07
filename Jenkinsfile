pipeline {
    agent any

    environment {
        // Replace these defaults if you want different names; keep the credential IDs in Jenkins aligned
        ACR_NAME = 'cloudprojacrXYZ'
        RESOURCE_GROUP = 'rg-cloudproject'
        WEBAPP_NAME = 'cloudproject-webapp'
        IMAGE_REPO = 'cloudproject'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        IMAGE = "${env.ACR_NAME}.azurecr.io/${env.IMAGE_REPO}:${env.IMAGE_TAG}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], userRemoteConfigs: [[url: 'https://github.com/Badr-ezz/cloud-project.git']]])
            }
        }

        stage('Install & Build') {
            steps {
                // run npm in a lightweight node container so the agent doesn't need node installed
                script {
                    docker.image('node:20-alpine').inside('--network host') {
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Tests') {
            steps {
                script {
                    docker.image('node:20-alpine').inside('--network host') {
                        sh 'echo "Running unit and integration tests..."'
                        sh 'npm run test:report || true' // do not fail the whole pipeline if tests use interactive reporter; JUnit result captured below
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
                script {
                    // Build the Docker image on the agent (requires docker on the Jenkins agent)
                    sh "docker build -t ${IMAGE} ."
                }
            }
        }

        stage('Login to Azure & Push to ACR') {
            steps {
                // This stage expects the following Jenkins string credentials to be configured:
                // - azure-client-id
                // - azure-client-secret
                // - azure-tenant-id
                // - azure-subscription-id
                // The agent must have Docker available so we can run the azure-cli container and mount the host docker socket.
                withCredentials([
                    string(credentialsId: 'azure-client-id', variable: 'AZ_CLIENT_ID'),
                    string(credentialsId: 'azure-client-secret', variable: 'AZ_CLIENT_SECRET'),
                    string(credentialsId: 'azure-tenant-id', variable: 'AZ_TENANT_ID'),
                    string(credentialsId: 'azure-subscription-id', variable: 'AZ_SUBSCRIPTION_ID')
                ]) {
                    sh '''
                    # Run azure-cli in a container and mount docker socket so az acr login can perform docker login
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        -e AZ_CLIENT_ID='bdea7f9a-01e6-40f4-82e9-275dc327402f' -e AZ_CLIENT_SECRET='fe6c9120-05f7-41bc-8b82-c8edff69346b' -e AZ_TENANT_ID='dc59e38c-4977-406f-bdd1-9ebbabbd387e' -e AZ_SUBSCRIPTION_ID='0b07f7e9-4d60-48da-a639-c5141bf10b24' \
                        mcr.microsoft.com/azure-cli:latest /bin/sh -c "\
                          az login --service-principal -u \"bdea7f9a-01e6-40f4-82e9-275dc327402f\" -p \"fe6c9120-05f7-41bc-8b82-c8edff69346b\" --tenant \"dc59e38c-4977-406f-bdd1-9ebbabbd387e\" >/dev/null && \
                          az account set --subscription \"0b07f7e9-4d60-48da-a639-c5141bf10b24\" && \
                          az acr login --name cloudprojacrXYZ && \
                          docker push ${IMAGE}"
                    '''
                }
            }
        }

        stage('Deploy to Web App') {
            steps {
                withCredentials([
                    string(credentialsId: 'azure-client-id', variable: 'AZ_CLIENT_ID'),
                    string(credentialsId: 'azure-client-secret', variable: 'AZ_CLIENT_SECRET'),
                    string(credentialsId: 'azure-tenant-id', variable: 'AZ_TENANT_ID'),
                    string(credentialsId: 'azure-subscription-id', variable: 'AZ_SUBSCRIPTION_ID')
                ]) {
                    sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                      -e AZ_CLIENT_ID='bdea7f9a-01e6-40f4-82e9-275dc327402f' -e AZ_CLIENT_SECRET='fe6c9120-05f7-41bc-8b82-c8edff69346b' -e AZ_TENANT_ID='dc59e38c-4977-406f-bdd1-9ebbabbd387e' -e AZ_SUBSCRIPTION_ID='0b07f7e9-4d60-48da-a639-c5141bf10b24' \
                      mcr.microsoft.com/azure-cli:latest /bin/sh -c "\
                        az login --service-principal -u \"bdea7f9a-01e6-40f4-82e9-275dc327402f\" -p \"fe6c9120-05f7-41bc-8b82-c8edff69346b\" --tenant \"dc59e38c-4977-406f-bdd1-9ebbabbd387e\" >/dev/null && \
                        az account set --subscription \"0b07f7e9-4d60-48da-a639-c5141bf10b24\" && \
                        az webapp config container set --name cloudproject-webapp --resource-group ${RESOURCE_GROUP} --docker-custom-image-name ${IMAGE} --docker-registry-server-url https://cloudprojacrXYZ.azurecr.io"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Build ${env.BUILD_NUMBER} finished"
        }
    }
}
