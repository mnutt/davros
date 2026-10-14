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
- `yarn dev`

At this point you'll have Davros running at `http://localhost:4200` (Vite UI) with the backend API/WebDAV server on `http://localhost:8000` proxied through Vite.
If you need a different backend port, set `DAVROS_BACKEND_URL` for the UI and `PORT` for the backend.
Note that running Davros this way is not at all safe for anything but local development; it relies completely on Sandstorm for user management and authentication.

In development, you can connect your desktop client to the backend URL (default `http://localhost:8000/`) with any username and password.

### Office document previews

Previews are converted on the server into selectable PDFs: docxide-pdf 0.17.1
for DOCX, and a reduced office2pdf 0.8.1 for XLSX/PPTX. The browser's built-in
PDF viewer handles display, text selection, search, and page navigation. No
Office parser or worker runs in the web app. A browser with PDF viewing enabled
is required. Conversion finishes before display; cached PDFs support byte-range
requests so the browser can fetch pages as needed. Spreadsheet pages expand to
fit all columns at their natural size, retaining vertical pagination instead of
splitting columns across pages or applying print-to-fit scaling.

`yarn fetch:native-preview` downloads the Linux amd64
[davros-preview v0.2.0 release](https://github.com/mnutt/davros-preview/releases/tag/v0.2.0),
verifies its pinned SHA-256, and installs the binary, fonts, and licenses under
`output/native-preview`. Downloads are cached in `tmp/` and verified on reuse.
The Sandstorm build and CI use the same script; Rust is no longer needed to build
Davros. Converter source, patches, and release tooling live in
[davros-preview](https://github.com/mnutt/davros-preview).
`yarn build:server` builds the HTTP server separately.

Only Liberation Sans, Serif, and Mono are packaged, with regular, bold, italic,
and bold italic faces. Font substitution can change line wrapping and pagination;
CJK and other scripts outside these fonts' coverage are not supported by this
minimal font set. Text in images remains an image. The office2pdf build omits its
embedded font packs, DOCX dispatch, and PDF merge/split CLI; local spreadsheet
patches fix percentage precision, fractional zero-padding, and namespace-prefixed
SpreadsheetML parsing.

Rendering runs one disposable native process at a time, coalesces requests for
identical revisions, and cancels abandoned jobs. Limits are 32 MiB input,
32 MiB per decompressed ZIP entry, 128 MiB total decompression, 128 MiB PDF
output, a 4 GiB process address space, and 60 seconds per conversion. Up to four
jobs may be active or queued. The versioned disk cache under `TEMP_STORAGE_PATH`
(or the OS temporary directory) is bounded to 256 MiB of PDFs. File identity,
size, modification time, and change time invalidate cached previews.

The preview binary enables Linux Landlock before parsing any Office content, closes
inherited descriptors other than standard I/O, and disables process dumping.
Only the copied input, bundled font configuration/fonts, and a private job
scratch directory are readable; only scratch is writable. Execution of other
programs is denied. The server passes a minimal environment and keeps temporary
files and font caches inside scratch. There is no extra sandbox executable or
runtime dependency.

Landlock ABI 3 or newer must be enabled (upstream Linux 6.2+); unsupported hosts
fail closed. Additional restrictions follow the available ABI: TCP at 4,
abstract Unix sockets and signals outside the sandbox at 6, pathname Unix
sockets at 9, and UDP at 10. Older ABIs emit a diagnostic about reduced coverage.
Landlock does not restrict all metadata operations, including stat and chmod.
This supplements Sandstorm's grain isolation, rather than fully isolating every
same-grain operation. Tested with Sandstorm's default seccomp policy; its
experimental policy blocks Landlock and previews will fail closed there.
See the [kernel Landlock documentation](https://docs.kernel.org/userspace-api/landlock.html).

Converter and sandbox regression tests live in the davros-preview project.
Davros's server tests exercise the downloaded release through the preview API.

For server tests, install Poppler (`poppler-utils` on Debian) for PDF text
validation, and run `yarn fetch:native-preview` before `yarn test:server`.
Development can set `DAVROS_PREVIEW_NATIVE_DIR` to an existing build directory.

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

1. Edit `.sandstorm/sandstorm-pkgdef.capnp` and update `appVersion` and `appMarketingVersion`. Bump major version for major breaking changes, minor version for significant new features, and patch version for tiny features and bugfixes.
2. Edit `CHANGELOG.md` and add a section with your new version.
3. Run `yarn build` to build the UI.
4. Run `vagrant-spk dev` and navigate around the app testing various functionality. This is generally good to do, but when you exit, this will also update `.sandstorm/sandstorm-files.list` with any new files.
5. Run `vagrant-spk pack build/[VERSION].spk` (replacing `[VERSION]` with the version you chose in step 2)
6. On a sandstorm instance, upload the packed app file and install it. Test it to ensure everything works properly and that all files were included.
7. Commit any uncommitted changes and tag them `v[VERSION]`.
8. Run `vagrant-spk publish build/[VERSION].spk`

### Acknowledgements

- Built on [Ember.js](https://emberjs.com).
- WebDAV support built with [jsDAV](https://github.com/mikedeboer/jsDAV).

### License

See LICENSE file.
