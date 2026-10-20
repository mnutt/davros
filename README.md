# Davros File Storage

Davros lets you store all of your files in the cloud and sync them between your devices.

![Screenshot of Davros](/public/images/screenshot.png)

## Prerequisites

Davros is built to run inside [Sandstorm](https://sandstorm.io), an open source web application platform. You can [run Sandstorm yourself](https://sandstorm.io/install/).

## Installation

- [Set up Sandstorm](https://sandstorm.io/install/)
- Download the [latest release](https://github.com/mnutt/davros/releases) and upload it to your Sandstorm server.

## Development

Davros is built using Node.js and Ember.js. To run locally, you'll need to install Node.js. We also recommend that you use yarn to install dependencies since that will lock versions to the ones that are
used during deployment.

To install yarn run `npm install -g yarn`
Then:

- `yarn install`
- `yarn dev`

At this point you'll have Davros running at `http://localhost:4200` (Vite UI) with the backend API/WebDAV server on `http://localhost:8000` proxied through Vite.
If you need a different backend port, set `DAVROS_BACKEND_URL` for the UI and `PORT` for the backend.
Running Davros outside Sandstorm is only suitable for local development: it relies on Sandstorm for user management and authentication. No environment variable is required to enable standalone startup, and requests without Sandstorm permission headers are allowed. Do not expose the development servers to untrusted networks.

In development, you can connect your desktop client to the backend URL (default `http://localhost:8000/`) with any username and password.

### Office document previews

Previews are converted on the server into selectable PDFs using davros-preview.
Supported formats are Microsoft Word (.doc, .docx), Excel (.xls, .xlsx),
PowerPoint (.ppt, .pptx), and OpenDocument (.odt, .ods, .odp). The browser's built-in
PDF viewer handles display, text selection, search, and page navigation. No
Office parser or worker runs in the web app. A browser with PDF viewing enabled
is required. Conversion finishes before display; cached PDFs support byte-range
requests so the browser can fetch pages as needed. Spreadsheet pages expand to
fit all columns at their natural size, retaining vertical pagination instead of
splitting columns across pages or applying print-to-fit scaling.

`yarn fetch:native-preview` downloads the Linux amd64
[davros-preview v0.4.0 release](https://github.com/mnutt/davros-preview/releases/tag/v0.4.0),
verifies its pinned SHA-256, and installs the binary, fonts, and licenses under
`output/native-preview`.

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

### Linting

- `yarn lint:hbs`
- `yarn lint:js`
- `yarn lint:js -- --fix`

### Releasing

Set up the spktool VM as described above before releasing. The commands below use Lima; substitute your configured provider if needed.

1. Edit `.sandstorm/sandstorm-pkgdef.capnp` and update `appVersion` and `appMarketingVersion`. Bump major version for major breaking changes, minor version for significant new features, and patch version for tiny features and bugfixes.
2. Edit `CHANGELOG.md` and add a section with your new version.
3. Run `yarn build` to build the UI, then `spktool build --provider lima` to build the server and prepare the package dependencies.
4. Run `spktool dev --provider lima` and navigate around the app testing various functionality. This is generally good to do, but when you exit, this will also update `.sandstorm/sandstorm-files.list` with any new files.
5. Run `spktool pack --provider lima build/[VERSION].spk` (replacing `[VERSION]` with the version you chose in step 2)
6. On a sandstorm instance, upload the packed app file and install it. Test it to ensure everything works properly and that all files were included.
7. Commit any uncommitted changes and tag them `v[VERSION]`.
8. Run `spktool publish --provider lima build/[VERSION].spk`

### Acknowledgements

- Built on [Ember.js](https://emberjs.com).
- WebDAV support built with [jsDAV](https://github.com/mikedeboer/jsDAV).

### License

See LICENSE file.
