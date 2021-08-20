@0x931fbb8c04377a42;

using Spk = import "/sandstorm/package.capnp";
# This imports:
#   $SANDSTORM_HOME/latest/usr/include/sandstorm/package.capnp
# Check out that file to see the full, documented package definition format.

const pkgdef :Spk.PackageDefinition = (
  # The package definition. Note that the spk tool looks specifically for the
  # "pkgdef" constant.

  id = "8aspz4sfjnp8u89000mh2v1xrdyx97ytn8hq71mdzv4p4d8n0n3h",
  # Your app ID is actually its public key. The private key was placed in
  # your keyring. All updates must be signed with the same key.

  manifest = (
    # This manifest is included in your app package to tell Sandstorm
    # about your app.

    appTitle = (defaultText = "Davros"),

    appVersion = 300,  # Increment this for every release.

    appMarketingVersion = (defaultText = "0.30.0"),
    # Human-readable representation of appVersion. Should match the way you
    # identify versions of your app in documentation and marketing.

    actions = [
      # Define your "new document" handlers here.
      ( title = (defaultText = "New Shared Directory"),
        command = .myCommand
        # The command to run when starting for the first time. (".myCommand"
        # is just a constant defined at the bottom of the file.)
      )
    ],

    continueCommand = .myCommand,
    # This is the command called to start your app back up after it has been
    # shut down for inactivity. Here we're using the same command as for
    # starting a new instance, but you could use different commands for each
    # case.

    metadata = (
      icons = (
        appGrid = (png = (dpi1x = embed "app-graphics/icon-128.png",
                          dpi2x = embed "app-graphics/icon-256.jpg")),
        grain = (png = (dpi1x = embed "app-graphics/icon-24.png",
                        dpi2x = embed "app-graphics/icon-48.png")),
        market = (png = (dpi1x = embed "app-graphics/icon-150.png",
                         dpi2x = embed "app-graphics/icon-300.jpg")),
        marketBig = (png = (dpi1x = embed "app-graphics/icon-300.jpg",
                            dpi2x = embed "app-graphics/icon-600.jpg")),
      ),

      website = "https://github.com/mnutt/davros/",
      codeUrl = "https://github.com/mnutt/davros/",
      license = (openSource = apache2),
      categories = [productivity, media],

      author = (
        contactEmail = "michael@nutt.im",
        pgpSignature = embed "pgp-signature",
      ),
      pgpKeyring = embed "pgp-keyring",

      description = (defaultText = embed "description.md"),
      shortDescription = (defaultText = "File storage"),

      screenshots = [
        (width = 2418, height = 1326, png = embed "app-graphics/screenshot-1.png"),
        (width = 2418, height = 1326, jpeg = embed "app-graphics/screenshot-2.jpg"),
        (width = 2418, height = 1326, png = embed "app-graphics/screenshot-3.png"),
      ],

      changeLog = (defaultText = embed "../CHANGELOG.md"),
    ),
  ),

  sourceMap = (
    # Here we defined where to look for files to copy into your package. The
    # `spk dev` command actually figures out what files your app needs
    # automatically by running it on a FUSE filesystem. So, the mappings
    # here are only to tell it where to find files that the app wants.
    searchPath = [
      ( sourcePath = "." ),  # Search this directory first.
      # fake out libreoffice
      ( packagePath = "proc/version",
        sourcePath = "/opt/app/.sandstorm/fake/proc-version" ),
      ( packagePath = "proc/mounts",
        sourcePath = "/opt/app/.sandstorm/fake/proc-mounts" ),
      ( packagePath = "proc/filesystems",
        sourcePath = "/opt/app/.sandstorm/fake/proc-filesystems" ),
      ( packagePath = "proc/meminfo",
        sourcePath = "/opt/app/.sandstorm/fake/proc-meminfo" ),
      ( packagePath = "proc/self/exe",
        sourcePath = "/opt/app/.sandstorm/fake/proc-self-exe" ),
      ( packagePath = "etc/passwd",
        sourcePath = "/opt/app/.sandstorm/fake/etc-passwd" ),
      # end fake out libreoffice
      ( sourcePath = "/",    # Then search the system root directory.
        hidePaths = [ "home", "proc", "sys",
                      "etc/passwd", "etc/hosts", "etc/host.conf",
                      "etc/nsswitch.conf", "etc/resolv.conf" ]
        # You probably don't want the app pulling files from these places,
        # so we hide them. Note that /dev, /var, and /tmp are implicitly
        # hidden because Sandstorm itself provides them.
      )
    ]
  ),

  fileList = "sandstorm-files.list",
  # `spk dev` will write a list of all the files your app uses to this file.
  # You should review it later, before shipping your app.

  alwaysInclude = [
    "opt/app/.sandstorm",
    "opt/app/dist", # css/js files change due to fingerprinting
    "opt/app/server",
    "opt/app/sample-files",
    # libreoffice stats() some files without reading them
    "usr/lib/libreoffice/presets/config/autotbl.fmt",
    "usr/lib/libreoffice/program",
    "usr/lib/python3.5", # pull in the whole Python 3 runtime
    "usr/lib/python3", # pull in any Debian pure-Python packages
    ],
  # Fill this list with more names of files or directories that should be
  # included in your package, even if not listed in sandstorm-files.list.
  # Use this to force-include stuff that you know you need but which may
  # not have been detected as a dependency during `spk dev`. If you list
  # a directory here, its entire contents will be included recursively.

  bridgeConfig = (
    apiPath = "/",
    viewInfo = (
      permissions = [(name = "view"), (name = "edit")],
      roles = [(title = (defaultText = "viewer"),
                permissions = [true,false],
                verbPhrase = (defaultText = "can view files"),
                default = true),
               (title = (defaultText = "admin"),
                permissions = [true,true],
                verbPhrase = (defaultText = "can edit files"))],
    )
  )
);

const myCommand :Spk.Manifest.Command = (
  # Here we define the command used to start up your server.
  argv = ["/sandstorm-http-bridge", "8000", "--", "/opt/app/.sandstorm/launcher.sh"],
  environ = [
    # Note that this defines the *entire* environment seen by your app.
    (key = "PATH", value = "/opt/app/vendor:/usr/local/bin:/usr/bin:/bin"),
    (key = "PORT", value = "8000"),
    (key = "HOME", value = "/var"),
    (key = "SANDSTORM", value = "1"),
    (key = "CACHE_REQUIRE_PATHS_FILE", value = "/var/davros/.require-cache.0"),
    (key = "STORAGE_PATH", value = "/var/davros/data"),
    (key = "TEMP_STORAGE_PATH", value = "/var/davros/tmp"),
    (key = "CONFIG_PATH", value = "/var/davros/config"),
    (key = "TMPDIR", value = "/var/davros/tmp"),
    (key = "UserInstallation", value = "file:///var/libreoffice/config"),
  ]
);
