# Time Lapse Viewer

## Dockerfile
```
FROM omar-base
ENV SPRING_CLOUD_CONFIG_ENABLED true
ENV SPRING_CLOUD_DISCOVERY_ENABLED true
EXPOSE 8080
RUN useradd -u 1001 -r -g 0 -d $HOME -s /sbin/nologin -c 'Default Application User' omar
RUN mkdir /usr/share/omar
COPY tlv-app-1.1.0-SNAPSHOT.jar /usr/share/omar
RUN chown -R 1001:0 /usr/share/omar
RUN chown 1001:0 /usr/share/omar
RUN chmod -R g+rw /usr/share/omar
RUN find $HOME -type d -exec chmod g+x {} +
USER 1001
WORKDIR /usr/share/omar
CMD java -server -Xms256m -Xmx1024m -Djava.awt.headless=true -XX:+CMSClassUnloadingEnabled -XX:+UseGCOverheadLimit -Djava.security.egd=file:/dev/./urandom -jar tlv-app-1.1.0-SNAPSHOT.jar
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
