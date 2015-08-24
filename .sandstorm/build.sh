#!/bin/bash

cd /opt/app

# allow npm to install global packages
mkdir "${HOME}/.npm-packages"
export NPM_PACKAGES="${HOME}/.npm-packages"
echo "prefix=${HOME}/.npm-packages" >> ~/.npmrc
export NODE_PATH="$NPM_PACKAGES/lib/node_modules:$NODE_PATH"
export PATH="$NPM_PACKAGES/bin:$PATH"

# ensure data storage directory exists
mkdir -p /var/davros/data

# install app dependencies
npm install

# install asset dependencies
npm install -g bower
bower install

# install ember-cli and build the ember app into dist/
npm install -g ember-cli
ember build
