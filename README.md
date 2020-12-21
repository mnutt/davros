# Davros File Storage

Davros lets you store all of your files in the cloud and sync them between your devices.

![Screenshot of Davros](/public/images/screenshot.png)

[![Try Live Demo](https://cdn.rawgit.com/mnutt/davros/master/public/images/try-live.svg)](https://oasis.sandstorm.io/appdemo/8aspz4sfjnp8u89000mh2v1xrdyx97ytn8hq71mdzv4p4d8n0n3h)

## Prerequisites

Davros is built to run inside [Sandstorm](https://sandstorm.io), an open source web application platform. You can either [run Sandstorm yourself](https://sandstorm.io/install/) or [let someone else host it for you](https://oasis.sandstorm.io/).

## Installation

- [Set up Sandstorm](https://sandstorm.io/install/)
- Download the [latest release](https://github.com/mnutt/davros/releases) and upload it to your Sandstorm server.

## Development

Davros is built using Node.js and Ember.js. To run locally, you'll need to install node.js. We also recommend that you use yarn to install dependencies since that will lock versions to the ones that are
used during deployment.

To install yarn run `npm install -g yarn`
Then:

- `yarn install`
- `ember serve --port=3009`

At this point you'll have Davros running at `http://localhost:3009`. Substitute `3009` for another port if you want. Note that running Davros this way is not particularly safe; it relies completely on Sandstorm for user management and authentication.

In development, you can connect your desktop client to http://localhost:3009/ with any username and password.

## Sandstorm Development

A few parts of Davros are dependent on running within Sandstorm, such as the authentication instructions on the Clients page. To run inside Sandstorm, first get [vagrant-spk](https://github.com/sandstorm-io/vagrant-spk). Then, within the Davros directory, run

    vagrant-spk vm up
    vagrant-spk dev

While this works it requires that you re-run `vagrant-spk dev` manually anytime you make a change. To
have this done automatically consider using [ember-cli-vagrant-spk](https://github.com/mnutt/ember-cli-vagrant-spk) instead which will monitor your filesystem for changes and restart the server
for you.

### Linting

- `yarn lint:hbs`
- `yarn lint:js`
- `yarn lint:js -- --fix`

### Releasing

Releasing an app is a little bit convoluted. This assumes you are on a non-linux machine, running sandstorm via vagrant-spk. On linux, you might be able to get away with skipping step 1.

1. `vagrant-spk vm ssh` then `cd /opt/app && rm -rf node_modules/sharp && yarn` -- this is because the `sharp` module has native components that need to be built on linux
2. Edit `.sandstorm/sandstorm-pkgdef.capnp` and update `appVersion` and `appMarketingVersion`. Bump major version for major breaking changes, minor version for significant new features, and patch version for tiny features and bugfixes.
3. Edit `CHANGELOG.md` and add a section with your new version.
4. Run `yarn build` to build the UI.
5. Run `yarn build-server` to build the backend.
6. Run `vagrant-spk dev` and navigate around the app testing various functionality. This is generally good to do, but when you exit, this will also update `.sandstorm/sandstorm-files.list` with any new files.
7. Run `vagrant-spk pack build/[VERSION].spk` (replacing `[VERSION]` with the version you chose in step 2)
8. On a sandstorm instance, upload the packed app file and install it. Test it to ensure everything works properly and that all files were included.
9. Commit any uncommitted changes and tag them `v[VERSION]`.
10. Run `vagrant-spk publish build/[VERSION].spk`

### Acknowledgements

- Built on [Ember.js](https://emberjs.com).
- WebDAV support built with [jsDAV](https://github.com/mikedeboer/jsDAV).

### License

See LICENSE file.
