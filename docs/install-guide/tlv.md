# Time Lapse Viewer

## Dockerfile
```
FROM omar-base
RUN yum -y install o2-tlv-app && yum clean all
EXPOSE 8080
CMD [ "java", "-server", "-Xms256m", "-Xmx1024m", "-Djava.awt.headless=true", "-XX:+CMSClassUnloadingEnabled", "-XX:+UseGCOverheadLimit", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/usr/share/omar/tlv-app/tlv-app-1.0.0-SNAPSHOT.jar", "--spring.config.location=/usr/share/omar/tlv-app/tlv-app.yml" ]
```
Ref: [omar-base](../../../omar-base/docs/install-guide/omar-base/)

## JAR
[http://artifacts.radiantbluecloud.com/artifactory/webapp/#/artifacts/browse/tree/General/omar-local/io/ossim/omar/apps/tlv-app](http://artifacts.radiantbluecloud.com/artifactory/webapp/#/artifacts/browse/tree/General/omar-local/io/ossim/omar/apps/tlv-app)

## Configuration

```
baseLayers:
  osmBasic:
      layers: o2-basemap-basic
      name: OSM Basic
      styles:
      type: wms
      url: ${serverProtocol}://${serverName}/service-proxy/wmsProxy
      visible: false
  osmBright:
      layers: o2-basemap-bright
      name: OSM Bright
      styles:
      type: wms
      visible: true
      url: ${serverProtocol}://${serverName}/service-proxy/wmsProxy

baseUrl: ${serverProtocol}://${serverName}

beLookup:
  columnName: be_number
  typeName: omar:facility
  url: ${baseUrl}/omar-wfs/wfs

defaultLocation: 48.8584, 2.2945

docsUrl: ${baseUrl}/omar-docs/tlv/docs/user-guide/tlv/

geocoderUrl: ${baseUrl}/twofishes

isaUrl: ${baseUrl}/isa/

libraries:
    o2:
      label: O2
      layerType: wms
      name: o2
      sensors: []
      wfsUrl: http://omar-wfs-app:8080/omar-wfs/wfs
      viewUrl: ${baseUrl}/omar-wms/wms

plugins:
  networkSpecific:
    navigationMenu: false

securityClassification:
  backgroundColor: green
  text: UNCLASSIFIED
  textColor: white

terrainProvider: //assets.agi.com/stk-terrain/world
```
