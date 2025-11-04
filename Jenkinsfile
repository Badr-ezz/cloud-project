pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '-v /var/jenkins_home:/var/jenkins_home'  // ensure persistence
        }
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'master', url: 'https://github.com/Badr-ezz/cloud-project.git'
            }
        }

        stage('Build and Install Dependencies') {
            steps {
                sh '''
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    echo "Running unit and integration tests..."
                    npm test
                '''
            }
            post {
                success {
                    echo 'All tests passed successfully.'
                }
                failure {
                    echo 'Some tests failed.'
                }
            }
        }
    }
}
