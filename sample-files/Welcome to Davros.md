# Davros File Storage

Davros lets you store all of your files in the cloud and sync them between your devices.

## Prerequisites

Davros is built to run inside [Sandstorm](https://sandstorm.io), an open source web application platform. You can either [run Sandstorm yourself](https://sandstorm.io/install/) or [let someone else host it for you](https://oasis.sandstorm.io/).

## Installation

* [Set up Sandstorm](https://sandstorm.io/install/)
* Download the [latest release](https://github.com/mnutt/davros/releases) and upload it to your Sandstorm server.

## Development

Davros is built using Node.js and Ember.js. To run locally, you'll need to install node.js. Then:

* `npm install`
* `bower install`
* `PORT=3009 ember serve`

At this point you'll have Davros running at `http://localhost:3009`. Substitute `3009` for another port if you want. Note that running Davros this way is not particularly safe; it relies completely on Sandstorm for user management and authentication.

In development, you can connect your desktop client to http://localhost:3009/ with any username and password.

## Sandstorm Development

A few parts of Davros are dependent on running within Sandstorm, such as the authentication instructions on the Clients page. To run inside Sandstorm, first get [vagrant-spk](https://github.com/sandstorm-io/vagrant-spk). Then, within the Davros directory, run

    vagrant-spk up
    ember spk

This uses [ember-cli-vagrant-spk](https://github.com/mnutt/ember-cli-vagrant-spk) to automatically inject Davros into your local Sandstorm instance.

### Building

* `ember build` (development)
* `ember build --environment production` (production, minified)
* `vagrant-spk pack build/davros-v0.10.0`

### Acknowledgements

* Built on [Ember.js](https://emberjs.com).
* WebDAV support built with [jsDAV](https://github.com/mikedeboer/jsDAV).
* Sample images courtesy of NASA

### License

See LICENSE file.
