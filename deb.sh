#!/usr/bin/env bash

# IMPORTANT
# Protect agaisnt mispelling a var and rm -rf /
set -u
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ORIGINAL==${DIR}/deb/original
SRC=${DIR}/deb/src
DIST=${DIR}/deb/dist
SYSROOT=${SRC}/ngServer
DEBIAN=${SRC}/DEBIAN

rm -rf ${DIST}
mkdir -p ${DIST}/

rm -rf ${SRC}
rsync -a ${ORIGINAL}/ ${SRC}/
mkdir -p ${SYSROOT}/opt/ng-server

rsync -a src3/ ${SYSROOT}/opt/ng-server/src/ --delete
rsync -a bin/ ${SYSROOT}/opt/ng-server/bin/

find ${SRC}/ -type d -exec chmod 0755 {} \;
find ${SRC}/ -type f -exec chmod go-w {} \;
chown -R root:root ${SRC}/

let SIZE=`du -s ${SYSROOT} | sed s'/\s\+.*//'`+8
pushd ${SYSROOT}/
tar czf ${DIST}/data.tar.gz [a-z]*
popd
sed s"/SIZE/${SIZE}/" -i ${DEBIAN}/control
pushd ${DEBIAN}
tar czf ${DIST}/control.tar.gz *
popd

pushd ${DIST}/
echo 2.0 > ./debian-binary

find ${DIST}/ -type d -exec chmod 0755 {} \;
find ${DIST}/ -type f -exec chmod go-w {} \;
chown -R root:root ${DIST}/
ar r ${DIST}/hellonode-1.deb debian-binary control.tar.gz data.tar.gz
popd
rsync -a ${DIST}/ng-server-1.deb ./