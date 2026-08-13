#!/bin/bash
set -euo pipefail

### Install capnproto and build the Sandstorm getPublicId helper.

# First, install capnp from apt along with headers/libs used by
# sandstorm-integration/Makefile.
if ! command -v capnp >/dev/null 2>&1 || ! pkg-config --exists capnp-rpc ; then
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -q clang-19 clang++-19 make pkg-config capnproto libcapnp-dev
fi

# Second, compile the small C++ program within
# /opt/app/sandstorm-integration. The generated Cap'n Proto C++ files are
# under the mounted app directory, so they can survive VM image upgrades. Clean
# first to ensure they match the VM's installed capnp headers.
pushd /opt/app/sandstorm-integration
make clean
make CXX=clang++-19
popd
### All done.
