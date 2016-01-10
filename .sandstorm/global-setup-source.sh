#!/bin/bash
set -eu
echo localhost > /etc/hostname
hostname localhost

export DEBIAN_FRONTEND=noninteractive

# tools needed to build sandstorm
sudo apt-get -y install build-essential libcap-dev xz-utils zip \
     unzip imagemagick strace curl clang-3.5 discount git

# clang-3.4 needs to be set as default
update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.5 100
update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.5 100

modprobe ip_tables

export CC=/usr/bin/clang
export CXX=/usr/bin/clang++
export CXXFLAGS="-g"

cd /opt/sandstorm
git clone git://github.com/sandstorm-io/sandstorm .
make deps
make

# Enable apt-cacher-ng proxy to make things faster if one appears to be running on the gateway IP
GATEWAY_IP=$(ip route  | grep ^default  | cut -d ' ' -f 3)
if nc -z "$GATEWAY_IP" 3142 ; then
    echo "Acquire::http::Proxy \"http://$GATEWAY_IP:3142\";" > /etc/apt/apt.conf.d/80httpproxy
fi
