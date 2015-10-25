#!/bin/bash

# This script is run every time an instance of our app - aka grain - starts up.
# This is the entry point for the application both when a grain is first launched
# and when a grain resumes after being previously shut down.
#
cd /opt/app

mkdir -p $STORAGE_PATH
mkdir -p $TEMP_STORAGE_PATH

/usr/bin/node app.js
