#!/bin/bash

cd /opt/app

# ensure data storage directory exists
sudo mkdir -p /var/davros
sudo chown $USER /var/davros
mkdir -p /var/davros/data
