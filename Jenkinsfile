pipeline{
    agent any 

    stages {

        stage('Clone Repository') {
                steps {
                    git branch: 'master', url: 'https://github.com/Badr-ezz/cloud-project.git'
                }
            }


        stage('Build and Install Dependencies') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                sh '''
                    npm ci
                    npm run build
                '''
            }
        }   

        stage('Run Tests') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                sh '''
                    echo "Running unit and integration tests..."
                    npm test

                    echo "generating test report"
                    npm run test:report

                    echo "tests report : "
                    cat report/junit.xml
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