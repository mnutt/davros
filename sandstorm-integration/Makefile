# You may override the following vars on the command line to suit
# your config.
CXX=clang++
CXXFLAGS=-O2 -Wall

# You generally should not modify these.
CXXFLAGS2=-std=c++1y -Itmp $(CXXFLAGS)

.PHONY: all clean

all: bin/getPublicId

clean:
	rm -rf bin tmp

bin/getPublicId: tmp/genfiles getPublicId.c++
	@mkdir -p bin
	@$(CXX) getPublicId.c++ tmp/sandstorm/*.capnp.c++ -o bin/getPublicId -static $(CXXFLAGS2) `pkg-config capnp-rpc --cflags --libs`

tmp/genfiles: /opt/sandstorm/latest/usr/include/sandstorm/*.capnp
	@echo "generating capnp files..."
	@mkdir -p tmp
	@capnp compile --src-prefix=/opt/sandstorm/latest/usr/include -oc++:tmp /opt/sandstorm/latest/usr/include/sandstorm/*.capnp
	@touch tmp/genfiles