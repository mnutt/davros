#!/bin/bash

# When you change this file, you must take manual action. Read this doc:
# - https://docs.sandstorm.io/en/latest/vagrant-spk/customizing/#setupsh

export DEBIAN_FRONTEND=noninteractive

curl -sL https://deb.nodesource.com/setup_24.x | bash -
apt-get update
apt-get install -y --no-install-suggests --no-install-recommends clang++-19 clang-19 nodejs git-core

sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-19 100
sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-19 100

# Compile a small helper to get a publicId
/opt/app/.sandstorm/compile_helper.sh

npm install -g yarn
