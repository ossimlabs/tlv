[![Build Status](http://jenkins.ossim.io/buildStatus/icon?job=tlv-dev)]() (dev)  

# Time Lapse Viewer

## Description

The Time Lapse Viewer is a web-based tool, dedicated to producing on-demand imagery flipbooks.

## How to run a local TLV
The local TLV uses H2 instead of PostgreSQL. You'll need to change the datasource in the application.yml if you want to use PostgreSQL. An example of PostgreSQL is in `tlv/apps/tlv-app/grails-app/conf/application.yml`.

Go to `tlv/apps/tlv-app` and copy `application.yml.local` into the same directory and name it to `application.yml`.

Go to `tlv/apps/tlv-app` and run `grails run-app`.

Go to `http://localhost:8090/tlv` in your browser.

## Special Branches

Per the `Jenkinsfile`, certain branches are treated as special, and commits to these branches have implications listed below:

### Master

Each commit to master will result in a newly published docker image of the version specified in `Chart.yaml`:`appVersion`. Docker images cannot be overriden in our docker registry (that is, nexus), so each commit will need to be accompanied with a bumped version, or else a docker image will not be pushed.

### Dev

Each commit will initiate a deployment of the newly created docker image (named `dev-<timestamp>`) to the omar-dev.ossim.io domain.
