#!/bin/bash

# When you change this file, you must take manual action. Read this doc:
# - https://docs.sandstorm.io/en/latest/vagrant-spk/customizing/#setupsh

export DEBIAN_FRONTEND=noninteractive

curl -sL https://deb.nodesource.com/setup_16.x | bash -
apt-get update
apt-get install -y --no-install-suggests --no-install-recommends clang++-7 clang-7 nodejs git-core g++ libreoffice-writer libreoffice-impress libreoffice-calc unoconv

sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-7 100
sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-7 100

# Set up libreoffice config directory
rm -Rf /var/libreoffice
mkdir -p /var/libreoffice/config
# Libreoffice always crashes the first time it is run, in the process of creating its config dir
/usr/lib/libreoffice/program/soffice.bin -env:UserInstallation=file:///var/libreoffice/config --headless --invisible --nocrashreport --nodefault --nofirststartwizard --nologo --norestore
# Make sure sandstorm can write to config dir
chown -R 1000:1000 /var/libreoffice

# Compile a small helper to get a publicId
/opt/app/.sandstorm/compile_helper.sh

npm install -g yarn
