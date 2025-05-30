pipeline {
    agent any

    tools {
        // El “Name” que diste en Jenkins Admin → Tools → NodeJS
        nodejs 'NodeJS_24'
    }

    stages {
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main',
                        credentialsId: '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',
                        url: 'https://github.com/jhosef1234/ExamenAppSonar.git'
                }
            }
        }

        stage('Install dependencies') {
            steps {
                dir('capachica-app') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('capachica-app') {
                    sh 'npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage'
                }
            }
        }

        stage('Build') {
            steps {
                dir('capachica-app') {
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('capachica-app') {
                        withSonarQubeEnv('sonarqube') {
                            sh 'npx sonar-scanner'
                        }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        success { echo '✅ ¡Todo verde!' }
        failure { echo '🚨 Algo falló, échale un ojo.' }
        always  { echo '🔚 Pipeline finalizado.' }
    }
}
