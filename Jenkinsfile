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
                    npm run test:report 
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

// pipeline {
//   agent {
//     docker {
//       image 'node:18-bullseye'
//       args '-u root:root'
//     }
//   }
//   triggers {
//     githubPush()
//   }
//   options {
//     timestamps()
//   }
//   environment {
//     CI = 'true'
//   }
//   stages {
//     stage('Install dependencies') {
//       steps {
//         sh 'npm ci'
//       }
//     }
//     stage('Build') {
//       steps {
//         sh 'npm run build'
//       }
//     }
//     stage('Test') {
//       steps {
//         sh 'npm run test:report'
//       }
//     }
//   }
//   post {
//     always {
//       junit 'reports/junit.xml'
//     }
//   }
// }
