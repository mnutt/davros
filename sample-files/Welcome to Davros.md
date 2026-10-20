# Davros File Storage

Davros lets you store all of your files in the cloud and sync them between your devices.

## Prerequisites

Davros is built to run inside [Sandstorm](https://sandstorm.io), an open source web application platform. You can either [run Sandstorm yourself](https://sandstorm.io/install/) or let someone else host it for you.

## Installation

* [Set up Sandstorm](https://sandstorm.io/install/)
* Download the [latest release](https://github.com/mnutt/davros/releases) and upload it to your Sandstorm server.

## Development

Davros is built using Node.js and Ember.js. To run locally, you'll need to install node.js. We also recommend that you use yarn to install dependencies since that will lock versions to the ones that are
used during deployment.

To install yarn run `npm install -g yarn`
Then:

* `yarn install`
* `ember serve --port=3009`

At this point you'll have Davros running at `http://localhost:3009`. Substitute `3009` for another port if you want. Note that running Davros this way is not particularly safe; it relies completely on Sandstorm for user management and authentication.

In development, you can connect your desktop client to http://localhost:3009/ with any username and password.

## Sandstorm Development

A few parts of Davros depend on running within Sandstorm, such as the authentication instructions on the Clients page. Install [spktool](https://github.com/mnutt/spktool) and a supported VM provider. For example, with Lima installed, run these commands from the Davros directory:

```sh
spktool vm create --provider lima
yarn build
spktool build --provider lima
spktool dev --provider lima
```

Use `spktool vm up --provider lima` to start an existing VM, or `spktool vm provision --provider lima` to rerun its setup. Replace `lima` with `vagrant` if you use the Vagrant provider.

After changing the app, rebuild with `yarn build` and `spktool build --provider lima`, then restart `spktool dev --provider lima`.

### Building

* `yarn build` (production UI)
* `spktool build --provider lima` (server and package dependencies)
* `spktool pack --provider lima build/[VERSION].spk` (replace `[VERSION]` with the release version)

### Acknowledgements

* Built on [Ember.js](https://emberjs.com).
* WebDAV support built with [jsDAV](https://github.com/mikedeboer/jsDAV).
* Sample images courtesy of NASA

### License

See LICENSE file.
