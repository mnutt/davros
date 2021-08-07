# 0.28.0

- Performance: compile davros server to a single file using webpack. This can result in significantly decreased app start times, especially on non-ssd hard drives.
- Fix document previews

# 0.27.3

- Fix switch checkbox css on non-mac platforms

# 0.27.2

- Fix initial state of Publishing tab

# 0.27.1

- Minor css tweaks

# 0.27.0

- Minor visual cleanup
- Fixes PDF preview height issues
- Image thumbnails display @2x on retina
- Under the hood: upgrades Ember to 3.20 and modernizes codebase to Ember Octane
- Under the hood: replaces ember-paper (Material Design) with plain css/ember components

# 0.26.1

- Fixes issue uploading files into subdirectories

# 0.26.0

- Fixes upload button
- Re-enables support in OwnCloud/NextCloud
- Upgrades build system
- (thanks griff for all of these changes)

# 0.25.0

- No new user-facing features
- Applies 3.5 years of updates to node/ember/other dependencies to enable future enhancements
- Switches from imagemagick to sharp (libvips) for thumbnails
- Some bundling efficiencies

# 0.24.0

- Support for previewing documents: .doc, .docx, .xls, .xlsx, .ppt, .pptx
- Get a file's public URL when publishing is enabled
- Added unauthenticated OPTIONS DAV header to fix auth issues with transmit among others
- Upgraded to support latest sandstorm build system

# 0.21.7

- Security: disable javascript in html previews. Otherwise, it is possible to make relative xhr POSTs from the preview iframe to the webdav API.

# 0.21.6

- Label m4v format as video
- Fix styling on pdfs and iframed content

# 0.21.5

- Correctly report version to OwnCloud clients via /status

# 0.21.4

- Bugfix: ensure all imagemagick coders are present

# 0.21.3

- Remove sandstorm app icon borders

# 0.21.2

- Fix markdown alignment

# 0.21.1

- Better mobile styling
- Some sandstorm metadata optimizations

# 0.21.0

- Image thumbnails
- Fix markdown display
- Fix back button issue using replaceState
- Enable gzip compression
- Begin adding aria labels

# 0.20.0

- Major UI and navigation updates
  - Navigation moved to the right for better Sandstorm UI integration
  - Don't hide common actions behind menu dropdown, if there's room
  - Slightly cleaned up file details view
- Davros reports itself to OwnCloud Client as a newer server version
- Fix some directory upload regressions; progress bar should work more consistently
- Use Sandstorm's `$GRAIN_TITLE_SLUG` as username to differentiate shared directories on desktop clients

# 0.19.1

- Fix regression where web UI did not update when files were modified

# 0.19.0

- Support X-OC-Mtime header to prevent Owncloud Client crashes
- Directories have etags, to make client syncing more efficient

# 0.18.0

- Fix MS Edge web font icon issues
- Report as Owncloud 8.2.5 to prevent Owncloud Client warnings

# 0.17.2

- Repackaged to take advantage of another Sandstorm v0.170 memory issue fix

# 0.17.1

- Repackaged to take advantage of Sandstorm v0.166 flow control fixes for large file downloads

# 0.17.0

- Download directory as zip action (thanks @timbertson)
- Better Chrome/Android support (upgraded to latest version of ember-paper)
- Loading indicators
- Bugfix: Don't throw when trying to publish while not running inside sandstorm
- Replace ic-ajax with ember-network for possible ember-fastboot support in the future

# 0.16.1

- Fix IE11 404 error and normalize css for IE11

# 0.16.0

- Support for iOS and Android mobile clients
- Preview PDF documents
- Support Sandstorm copy-to-clipboard for client URLs

# 0.15.3

- Bugfix: prevent Web UI 404 when using a share link read-only

# 0.15.2

- Bugfix: refresh view after creating directory in web UI
- Bugfix: web UI uploads used wrong directory root and failed
- More performance improvements for large directories

# 0.15.1

- Workaround for old firefox XML parsing behavior

# 0.15.0

- Performance improvements to large directories by removing timers
- All web UI actions go through WebDAV
- Upgrade dependencies (ember 2.2, moment, photoswipe, ember-paper)
- Only load slideshow images once
- Bugfix: only add sample files if storage directory is missing, to prevent the being readded to empty grains

# 0.14.2

- v0.14.1 was accidentally released as a development build; correctly package this one. This fixes file uploading and refreshing issues.

# 0.14.1

- Fix wording in modified time "a moment ago"
- Fix upload button

# 0.14.0

- Bugfix: gallery works better in Firefox
- Display preview of HTML files
- Added test suite
- Ensure that malicious HTML files cannot modify other content in the shared directory

# 0.13.1

- Bugfix: ensure gallery works when switching between directories

# 0.13.0

- Add gallery support for directories
- Move file and directory actions to the menu
- Better file format display

# 0.12.0

- Improved mobile web experience. Fixes scrolling issues, tightens up the UI a bit
- Add about page with (this) changelog
- Create and delete directories from the web UI

# 0.11.4

- Correct one more issue with uploading files into the correct directory from the web UI

# 0.11.3

- Fix publishing instructions and warn about CNAMEing top-level domains
- Some styling cleanup
- Fix for upload button breaking when moving between different pages. If upload button is clicked on Clients or Publishing page, upload to the root and redirect there. Eventually it should be hidden on those pages.

# 0.11.2

- Small release to fix some metadata

# 0.11.1

- Fix a bug where app crashed when client tried to display disk usage in some cases
- Ensure scrollbar doesn't obscure client server url display

# 0.11.0

- Add Web Publishing to expose a shared folder as a website

# 0.10.8

- Hide editing options when viewing shared grain with only 'view' permissions

# 0.10.7

- Show correct (or at least, more correct) disk usage in desktop client

# 0.10.6

- Add sandstorm sharing permissions (view, edit)

# 0.10.5

- Support HTTPS Sandstorm installs

# 0.10.4

- Add missing sample assets
- Add icons and other app store metadata

# 0.10.3

- Cold start page

# 0.10.2

- First release
