# tlv

[![Build Status](http://jenkins.ossim.io/buildStatus/icon?job=tlv-dev)]() (dev)  

## Description

The Time Lapse Viewer is a web-based tool, dedicated to producing on-demand imagery flipbooks.


## Prerequisites
- [Gradle v4.x (recommended: v4.10.x)](https://docs.gradle.org/4.10/release-notes.html)
- [Docker (recommended: v18.09.x)](https://github.com/docker/docker-ce/releases/tag/v18.09.0)
- [docker-compose (recommended: v1.23.x)](https://github.com/docker/compose/releases/tag/1.23.2)


## Setup

1. Make directory for OSSIM projects:
`mkdir OSSIM`

2. cd in and clone dependencies:
```
git clone https://github.com/ossimlabs/tlv.git
git clone https://github.com/ossimlabs/omar-common.git
git clone https://github.com/ossimlabs/omar-security-plugin.git
```

3. Export necessary variables:

	3a. Set application config yaml
	- `export SPRING_CONFIG_LOCATION=../tlv/apps/tlv-app/config.yml`


4. Navigate in and build:
```
cd ../tlv/apps/tlv-app
gradle assemble
```

5. Startup with `docker-compose`
```
cd ../tlv/apps/tlv-app
docker-compose up

# if you want to specify individual services (specify -d to run detached)
docker-compose up postgis
docker-compose up tlv
```

6. Navigate to [`http://localhost:8080`](http://localhost:8080)

#
