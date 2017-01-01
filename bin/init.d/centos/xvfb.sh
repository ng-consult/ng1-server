#!/usr/bin/env bash
source /etc/init.d/functions
daemon --user USER nohup /path/to/your/binary arg1 arg2 >/dev/null 2>&1 &