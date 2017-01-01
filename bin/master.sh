#!/bin/bash

type git >/dev/null 2>&1 || { echo >&2 "I require git but it's not installed.  Aborting."; exit 1; }
type firefox >/dev/null 2>&1 || { echo >&2 "I require firefox but it's not installed.  Aborting."; exit 1; }
type Xvfb >/dev/null 2>&1 || { echo >&2 "I require Xvfb but it's not installed.  Aborting."; exit 1; }

case "$OSTYPE" in
  solaris*)
    echo "SOLARIS not supported"
    exit 1
    ;;
  darwin*)
    echo "OSX not supported yet"
    exit 1
    ;;
  bsd*)
    echo "BSD not supported or tested - use WITH CAUTION !!!"
    ;;
  msys*)
    echo "WINDOWS NOT SUPPORTED YET"
    exit 1
    ;;
  linux-gnu)
    ;;
  *)
    echo "unknown: $OSTYPE"
    exit 1
    ;;
esac




#/etc/redhat-release
#/etc/SuSE-release
#/etc/debian_version
#/etc/arch-release
#/etc/gentoo-release
#/etc/slackware-version
#/etc/frugalware-release
#/etc/altlinux-release
#/etc/mandriva-release
#/etc/meego-release
#/etc/angstrom-version
#/etc/mageia-release


SLIMERJS="/slimerjs"
BIN="/bin"

a1=`basename $0`
a2=`dirname $0`

BIN_SH=`readlink -f $a2"/"$a1`
BIN_DIR=`dirname $BIN_SH`
BASE_DIR=`realpath $BIN_DIR"/../"`
SLIMER_DIR=$BASE_DIR"/slimerjs"


## SET SLIMERJS PATH
if [[ ! ":$PATH:" == *":$SLIMER_DIR:"* ]]; then
    export PATH=$PATH":"$SLIMER_DIR
fi

export SLIMERJSLAUNCHER=$(which firefox) DISPLAY=:99.0


## CHECK this is a systemd system or a init.d system


if [  -d /etc/systemd ]; then
    #echo "Systemd is installed."
    TYPE="systemd"
elif [ -d /etc/init.d ]; then
    #echo "Systemd is not installed, using init.d"
    TYPE="initd"
else
     echo "This systemd doesn't support systemd neither init.d. Is it a linux OS?"
     exit 1
fi


case "$TYPE" in

  initd)
    INITD_PATH="/etc/init.d/xvfb"
    INITD_DEBIAN_SCRIPT=$BIN_DIR"/init.d/debian/xvfb"
    INITD_OTHER_SCRIPT=$BIN_DIR"/init.d/centos/xvfb.sh"

    if [ ! -f $INITD_PATH ]; then
        echo "xvfb custom init.d daemon is not installed. Need sudo access"
        sudo echo -n
        if [  type "start-stop-daemon" > /dev/null ]; then
          sudo cp $INITD_SCRIPT $INITD_PATH
        else
          sudo cp $INITD_OTHER_SCRIPT $INITD_PATH
        fi
    fi

    ps -aux | grep "[X]vfb" > /dev/null 2>&1
    if [[ ! "$?" == "0" ]]; then
        echo "xvfb daemon is not started, requiring sudo to start it"
        sudo /etc/init.d/xvfb start
    fi

    ps -aux | grep "[X]vfb" > /dev/null 2>&1
    if [[ ! "$?" == "0" ]]; then
        echo "xvfb daemon failed to start. Exiting."
        exit 1
    fi
    ;;
  systemd)
    ## CHECK THAT xvfb custom daemon is installed
    SYSTEMD_PATH=/etc/systemd/system/xvfb.service
    SYSTEMD_SERVICE=$BIN_DIR"/systemd/xvfb.service"

    if [ ! -f $SYSTEMD_PATH ]; then
        echo "xvfb custom systemd daemon is not installed. Need sudo access"
        sudo echo -n
        sudo cp $SYSTEMD_SERVICE $SYSTEMD_PATH
        sudo systemctl enable xvfb
    fi
    # check that xvfb is running

    RUNNING=`systemctl is-active xvfb >/dev/null 2>&1 && echo YES || echo NO`
    if [ $RUNNING = 'NO' ]; then
        echo "xvfb daemon is not running, starting it with sudo: "
        sudo echo -n
        sudo systemctl start xvfb
    fi

    # Re-check it again

    RUNNING=`systemctl is-active xvfb >/dev/null 2>&1 && echo YES || echo NO`
    if [ $RUNNING = 'NO' ]; then
        echo "xvfb daemon failed to start. Exiting."
        exit 1
    fi

    ;;
  *)
    echo "Error Logic"
    exit 1
esac

if [ ! -d $SLIMER_DIR ]; then
    echo "slimerjs is not installed.... installing now"
    cd $BASE_DIR
    sh install-slimerjs.sh
fi

cd $BIN_DIR

node master.js "$@"
