pipeline{
    agent any 

    stages {
        stage('Clone Repository') {
                steps {
                    // Uses Jenkins SCM configuration (Git plugin)
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
    }

    
}