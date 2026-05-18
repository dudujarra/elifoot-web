#!/bin/bash
ACTION=$1
MESSAGE=$2
DETAILS=$3
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S%z")
LOGFILE="agent-activity.log"
echo "[$TIMESTAMP] [$ACTION] $MESSAGE | $DETAILS" >> "$LOGFILE"
