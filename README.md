# tlv

[![Build Status](http://jenkins.ossim.io/buildStatus/icon?job=tlv-dev)]() (dev)  

## Description

The Time Lapse Viewer is a web-based tool, dedicated to producing on-demand imagery flipbooks.


## Setup

1. Make directory for OSSIM projects:
`mkdir OSSIM`

2. cd in and clone dependencies:
```
git clone https://github.com/ossimlabs/tlv.git
git clone https://github.com/ossimlabs/omar-common.git
git clone https://github.com/ossimlabs/omar-security-plugin.git
```

3. Install Gradle v4.x [(recommended: v4.10.x)](https://docs.gradle.org/4.10/release-notes.html)

3. Export necessary variables:
	3a. Set path to project directory:
	`export O2_DEV_HOME=<path to project>/OSSIM`
	3b. Set path to common properties:
	`export OMAR_COMMON_PROPERTIES=$O2_DEV_HOME/omar-common/omar-common-properties.gradle`
	3c. Set repository manager:
	`export REPOSITORY_MANAGER_URL=https://nexus.ossim.io/nexus/content/repositories`

4. Navigate in and build:
```
cd $O2_DEV_HOME/tlv/apps/tlv-app
gradle assemble
```
