# Time Lapse Viewer

## Purpose

TLV is is a web-based tool, dedicated to producing on-demand imagery flipbooks. This allows the user to quickly flip between different stacks of images easily.

## Installation in Openshift

**Assumption:** The tlv-app docker image is pushed into the OpenShift server's internal docker registry and available to the project.

### Environment variables

|Variable|Value|
|------|------|
|SPRING_PROFILES_ACTIVE|Comma separated profile tags (*e.g. production, dev*)|
|SPRING_CLOUD_CONFIG_LABEL|The Git branch from which to pull config files (*e.g. master*)|
