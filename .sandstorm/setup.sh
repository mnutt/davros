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
curl -sL https://deb.nodesource.com/setup_node_4.x | bash -
apt-get install -y iojs git-core g++
