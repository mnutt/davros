#!/bin/bash

set -euo pipefail

export HOME="${HOME:-/home/vagrant}"

cd /opt/app

sudo mkdir -p /var/davros
sudo chown "$USER" /var/davros
mkdir -p /var/davros/data

lock_hash_file="/opt/app/node_modules/.yarn-lock.sha256"
if command -v sha256sum >/dev/null 2>&1; then
  current_lock_hash="$(sha256sum /opt/app/yarn.lock | awk '{print $1}')"
else
  current_lock_hash="$(shasum -a 256 /opt/app/yarn.lock | awk '{print $1}')"
fi

need_install=0
if [ ! -d "/opt/app/node_modules" ]; then
  need_install=1
elif [ ! -f "$lock_hash_file" ]; then
  need_install=1
elif [ "$(cat "$lock_hash_file")" != "$current_lock_hash" ]; then
  need_install=1
fi

if [ "$need_install" -eq 1 ]; then
  export CC=clang
  export CXX=clang++
  export npm_config_cxxflags="-std=gnu++20"
  export CXXFLAGS="-std=gnu++20"
  yarn install
  mkdir -p /opt/app/node_modules
  printf '%s\n' "$current_lock_hash" > "$lock_hash_file"
fi

if [ ! -d "/opt/app/dist" ]; then
  ./node_modules/.bin/ember build
fi

yarn build:server
