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
