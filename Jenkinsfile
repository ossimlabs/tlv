properties([
  parameters ([
    string(name: 'DOCKER_REGISTRY_DOWNLOAD_URL', defaultValue: 'nexus-docker-private-group.ossim.io', description: 'Repository of docker images')
  ]),
  pipelineTriggers([
    [$class: "GitHubPushTrigger"]
  ]),
  [$class: 'GithubProjectProperty', displayName: '', projectUrlStr: 'https://github.com/ossimlabs/omar-tlv'],
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '3', daysToKeepStr: '', numToKeepStr: '20')),
  disableConcurrentBuilds()
])
podTemplate(
  containers: [
    containerTemplate(
      name: 'docker',
      image: 'docker:19.03.8',
      ttyEnabled: true,
      command: 'cat',
      privileged: true
    ),
    containerTemplate(
      image: "${DOCKER_REGISTRY_DOWNLOAD_URL}/omar-builder:latest",
      name: 'builder',
      command: 'cat',
      ttyEnabled: true
    ),
    containerTemplate(
      image: "${DOCKER_REGISTRY_DOWNLOAD_URL}/kubectl-aws-helm:latest",
      name: 'kubectl-aws-helm',
      command: 'cat',
      ttyEnabled: true,
      alwaysPullImage: true
    ),
    containerTemplate(
      image: "${DOCKER_REGISTRY_DOWNLOAD_URL}/alpine/helm:3.2.3",
      name: 'helm',
      command: 'cat',
      ttyEnabled: true
    )
  ],
  volumes: [
    hostPathVolume(
      hostPath: '/var/run/docker.sock',
      mountPath: '/var/run/docker.sock'
    ),
  ]
) {
  node(POD_LABEL) {

    stage("Checkout branch") {
      scmVars = checkout(scm)

      GIT_BRANCH_NAME = scmVars.GIT_BRANCH
      BRANCH_NAME = "${sh(returnStdout: true, script: "echo ${GIT_BRANCH_NAME} | awk -F'/' '{print \$2}'").trim()}"
      CHART_APP_VERSION = "${sh(returnStdout: true, script: "grep -Po \"(?<=appVersion: ).*\" chart/Chart.yaml").trim()}"

      script {
        if (BRANCH_NAME == 'master') {
          buildName "${CHART_APP_VERSION} - ${BRANCH_NAME}"
        } else {
          buildName "${CHART_APP_VERSION} - ${BRANCH_NAME}-SNAPSHOT"
        }
      }
    }

    stage("Load Variables") {
        withCredentials([string(credentialsId: 'o2-artifact-project', variable: 'o2ArtifactProject')]) {
          step ([$class: "CopyArtifact",
                 projectName: o2ArtifactProject,
                 filter: "common-variables.groovy",
                 flatten: true])
        }
        load "common-variables.groovy"
      }

    stage('SonarQube Analysis') {
      nodejs(nodeJSInstallationName: "${NODEJS_VERSION}") {
        def scannerHome = tool "${SONARQUBE_SCANNER_VERSION}"
        withSonarQubeEnv('sonarqube') {
          sh """
            ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=tlv \
                -Dsonar.login=${SONARQUBE_TOKEN}
          """
        }
      }
    }

    stage('Build') {
      container('builder') {
        sh """
		      buildVersion="${CHART_APP_VERSION}"
          ./gradlew assemble -PossimMavenProxy=${MAVEN_DOWNLOAD_URL}
          cp build/libs/*.jar docker/
        """
      }
    }

    stage('Docker build') {
      container('docker') {
        withDockerRegistry(credentialsId: 'dockerCredentials', url: "https://${DOCKER_REGISTRY_DOWNLOAD_URL}") {
          if (BRANCH_NAME == 'master') {
            TAG_NAME = CHART_APP_VERSION
          } else {
            TAG_NAME = BRANCH_NAME + "-" + System.currentTimeMillis()
          }

          sh """
            docker build --network=host -t "${DOCKER_REGISTRY_PUBLIC_UPLOAD_URL}/tlv:${TAG_NAME}" ./docker
          """
        }
      }
    }

    stage('Docker push') {
      container('docker') {
        withDockerRegistry(credentialsId: 'dockerCredentials', url: "https://${DOCKER_REGISTRY_PUBLIC_UPLOAD_URL}") {
          sh """
            docker push "${DOCKER_REGISTRY_PUBLIC_UPLOAD_URL}"/tlv:${TAG_NAME}
          """
        }
      }
    }

    stage('Package chart') {
      container('helm') {
        sh """
            mkdir packaged-chart
            helm package -d packaged-chart chart
          """
      }
    }

    stage('Upload chart') {
      container('builder') {
        withCredentials([usernameColonPassword(credentialsId: 'helmCredentials', variable: 'HELM_CREDENTIALS')]) {
          sh "curl -u ${HELM_CREDENTIALS} ${HELM_UPLOAD_URL} --upload-file packaged-chart/*.tgz -v"
        }
      }
    }

    stage('New Deploy') {
      container('kubectl-aws-helm') {
        withAWS(
          credentials: 'Jenkins-AWS-IAM',
          region: 'us-east-1') {
          if (BRANCH_NAME == 'master') {
            //insert future instructions here
          }
          else if (BRANCH_NAME == 'dev') {
            sh "aws eks --region us-east-1 update-kubeconfig --name gsp-dev-v2 --alias dev"
            sh "kubectl config set-context dev --namespace=omar-dev"
            sh "kubectl set image deployment/tlv tlv=${DOCKER_REGISTRY_DOWNLOAD_URL}/tlv:${TAG_NAME}"
          }
          else {
            sh "echo Not deploying ${BRANCH_NAME} branch"
          }
        }
      }
    }
  }
}
