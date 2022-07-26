#!/bin/bash

cd /opt/app

# ensure data storage directory exists
sudo mkdir -p /var/davros
sudo chown $USER /var/davros
mkdir -p /var/davros/data

if [ ! -d "/opt/app/node_modules" ]; then
    yarn install
fi
if [ ! -d "/opt/app/dist" ]; then
    ./node_modules/.bin/ember build
fi
if [ ! -d "/opt/app/output" ]; then
    yarn build-server
fi
