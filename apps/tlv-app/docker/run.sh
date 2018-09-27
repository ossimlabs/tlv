#!/bin/bash
#
# ENV Variables:
#
# GOOFY_OPTS - options for goofy
# MOUNT_POINT - mount point for s3 buckets.  Should have default of /s3
# 
# AWS_ACCESS_KEY - AWS key.  Optional
# AWS_SECRET_KEY - AWS Secret Key. Optional
# JAVA_OPTS - Arguments to pass to java to start the app.  Optional
# 
export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
sed '/^omar/d' /etc/passwd > /tmp/passwd
echo omar:x:$USER_ID:$GROUP_ID:Default Application User:$HOME:/sbin/nologin >> /tmp/passwd

export LD_PRELOAD=/usr/lib64/libnss_wrapper.so
export NSS_WRAPPER_PASSWD=/tmp/passwd
export NSS_WRAPPER_GROUP=/etc/group

if [ -z "${JAVA_OPTS}" ] ; then
   JAVA_OPTS="-server -Xms256m -Xmx1024m -Djava.awt.headless=true -XX:+CMSClassUnloadingEnabled -XX:+UseGCOverheadLimit -Djava.security.egd=file:/dev/./urandom"
fi

export JAR_FILE=`find /home/omar -name "*.jar"`

echo "java ${JAVA_OPTS} -jar ${JAR_FILE}"
java ${JAVA_OPTS} -jar ${JAR_FILE}
