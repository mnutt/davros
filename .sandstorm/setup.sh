#!/bin/bash
# This script is run in the VM once when you first run `vagrant-spk up`.  It is
# useful for installing system-global dependencies.  It is run exactly once
# over the lifetime of the VM.
#
# This is the ideal place to do things like:
#
#    export DEBIAN_FRONTEND=noninteractive
#    apt-get install nginx nodejs nodejs-legacy python2.7 mysql-server
#
# If the packages you're installing here need some configuration adjustments,
# this is also a good place to do that:
#
#    sed --in-place='' \
#            --expression 's/^user www-data/#user www-data/' \
#            --expression 's#^pid /run/nginx.pid#pid /var/run/nginx.pid#' \
#            /etc/nginx/nginx.conf

# By default, this script does nothing.  You'll have to modify it as
# appropriate for your application.

export DEBIAN_FRONTEND=noninteractive
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y nodejs git-core g++ imagemagick libreoffice

# Disable dangerous imagemagick features
cp /opt/app/.sandstorm/imagemagick-policy.xml /etc/ImageMagick-6/policy.xml

# Set up libreoffice
echo "deb http://ftp.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/backports.list
apt-get update
apt-get -t jessie-backports install -y libreoffice

# Set up libreoffice config directory
rm -Rf /var/libreoffice
mkdir -p /var/libreoffice/config
# Libreoffice always crashes the first time it is run, in the process of creating its config dir
/usr/lib/libreoffice/program/soffice.bin -env:UserInstallation=file:///var/libreoffice/config --headless --invisible --nocrashreport --nodefault --nofirststartwizard --nologo --norestore
# Make sure sandstorm can write to config dir
chown -R 1000:1000 /var/libreoffice

# Compile a small helper to get a publicId
/opt/app/.sandstorm/compile_helper.sh
