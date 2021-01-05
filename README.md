[![Build Status](http://jenkins.ossim.io/buildStatus/icon?job=tlv-dev)]() (dev)  

## Description

The Time Lapse Viewer is a web-based tool, dedicated to producing on-demand imagery flipbooks.

## How to run a local TLV
The local TLV uses H2 instead of PostgreSQL. You'll need to change the datasource in the application.yml if you want to use PostgreSQL. An example of PostgreSQL is in `tlv/apps/tlv-app/grails-app/conf/application.yml`.

Go to `tlv/apps/tlv-app` and copy `application.yml.local` into the same directory and name it to `application.yml`.

Go to `tlv/apps/tlv-app` and run `grails run-app`.

Go to `http://localhost:8090/tlv` in your browser.

