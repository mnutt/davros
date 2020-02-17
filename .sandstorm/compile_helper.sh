### Download & compile capnproto and the Sandstorm getPublicId helper.

# First, get capnproto from master and install it to
# /usr/local/bin. This requires a C++ compiler. We opt for clang
# because that's what Sandstorm is typically compiled with.
if [ ! -e /usr/local/bin/capnp ] ; then
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -q clang autoconf pkg-config libtool
    cd /tmp
    if [ ! -e capnproto ]; then git clone https://github.com/capnproto/capnproto; fi
    cd capnproto
    git checkout master
    cd c++
    autoreconf -i
    ./configure
    make -j2
    sudo make install
fi

# Second, compile the small C++ program within
# /opt/app/sandstorm-integration.
if [ ! -e /opt/app/sandstorm-integration/getPublicId ] ; then
    pushd /opt/app/sandstorm-integration
    make
fi
### All done.
