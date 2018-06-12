/*!
 * node-lnd: lib/extensions.js
 */

var eol = require('os').EOL,
  os = require('os'),
  fs = require('fs'),
  pkg = require('../package.json'),
  findConfig = require('find-config'),
  support = require('./support'),
  config = require('./config')
  mkdir = require('mkdirp'),
  path = require('path'),
  goenv = require('go-platform'),
  trueCasePathSync = require('true-case-path');

/**
 * Get the value of a CLI argument
 *
 * @param {String} name
 * @param {Array} args
 * @api private
 */
function getArgument(name, args) {
  var flags = args || process.argv.slice(2),
    index = flags.lastIndexOf(name);
  if (index === -1 || index + 1 >= flags.length) {
    return null;
  }

  return flags[index + 1];
}

/**
 * Get binary platform.
 * If environment variable LND_BINARY_PLATFORM,
 * .npmrc variable lnd_binary_platform or
 * process argument --lnd-binary-platform is provided,
 * return it as is, otherwise make default binary
 * platform based on the current platform.
 *getBinaryPlatform
 * @api public
 */
function getBinaryPlatform() {
  var binaryPlatform = goenv.GOOS

  if (getArgument('--lnd-binary-platform')) {
    binaryPlatform = getArgument('--lnd-binary-platform');
  } else if (process.env.LND_BINARY_PLATFORM) {
    binaryPlatform = process.env.LND_BINARY_PLATFORM;
  } else if (process.env.npm_config_lnd_binary_platform) {
    binaryPlatform = process.env.npm_config_lnd_binary_platform;
  } else if (config && config.binaryPlatform) {
    binaryPlatform = config.binaryPlatform;
  }

  return binaryPlatform
}

/**
 * Get binary architecture.
 * If environment variable LND_BINARY_ARCH,
 * .npmrc variable lnd_binary_arch or
 * process argument --lnd-binary-arch is provided,
 * return it as is, otherwise make default binary
 * arch based on the current arch.
 *
 * @api public
 */
function getBinaryArch() {
  var binaryArch = goenv.GOARCH

  if (getArgument('--lnd-binary-arch')) {
    binaryArch = getArgument('--lnd-binary-arch');
  } else if (process.env.LND_BINARY_ARCH) {
    binaryArch = process.env.LND_BINARY_ARCH;
  } else if (process.env.npm_config_lnd_binary_arch) {
    binaryArch = process.env.npm_config_lnd_binary_arch;
  } else if (config && config.binaryArch) {
    binaryArch = config.binaryArch;
  }

  return binaryArch
}

/**
 * Get binary version.
 * If environment variable LND_BINARY_VERSION,
 * .npmrc variable lnd_binary_version or
 * process argument --lnd-binary-version is provided,
 * return it as is, otherwise make default binary
 * version.
 *
 * @api public
 */
function getBinaryVersion() {
  var binaryVersion = support.Versions.slice(support.Versions.length - 1)[0]

  if (getArgument('--lnd-binary-version')) {
    binaryVersion = getArgument('--lnd-binary-version');
  } else if (process.env.LND_BINARY_VERSION) {
    binaryVersion = process.env.LND_BINARY_VERSION;
  } else if (process.env.npm_config_lnd_binary_version) {
    binaryVersion = process.env.npm_config_lnd_binary_version;
  } else if (config && config.binaryVersion) {
    binaryVersion = config.binaryVersion;
  }

  return binaryVersion
}

/**
 * Get binary name.
 * If environment variable LND_BINARY_NAME,
 * .npmrc variable lnd_binary_name or
 * process argument --lnd-binary-name is provided,
 * return it as is, otherwise make default binary
 * name: {platform}-{arch}-{lnd version}
 *
 * @api public
 */
function getBinaryName() {
  var binaryName,
    variant,
    platform = getBinaryPlatform();

  if (getArgument('--lnd-binary-name')) {
    binaryName = getArgument('--lnd-binary-name');
  } else if (process.env.LND_BINARY_NAME) {
    binaryName = process.env.LND_BINARY_NAME;
  } else if (process.env.npm_config_lnd_binary_name) {
    binaryName = process.env.npm_config_lnd_binary_name;
  } else if (config && config.binaryName) {
    binaryName = config.binaryName;
  } else {
    variant = getPlatformVariant();
    if (variant) {
      platform += '_' + variant;
    }

    binaryName = [
      'lnd',
      platform,
      getBinaryArch(),
      'v' + getBinaryVersion(),
    ].join('-');
  }

  return binaryName
}

/**
 * Get the binary file extension.
 *
 * @api public
 */
function getBinaryExtension() {
  return support.isWindows(getBinaryPlatform()) ? '.zip' : '.tar.gz'
}

/**
 * Get binary file extension.
 * Binary name on Windows has .exe suffix
 *
 * @api public
 */
function getBinaryFileExtension() {
  return getBinaryPlatform() === "windows" ? '.exe' : ''
}

/**
 * Determine the URL to fetch binary file from.
 * By default fetch from the node-lnd distribution
 * site on GitHub.
 *
 * The default URL can be overriden using
 * the environment variable LND_BINARY_SITE,
 * .npmrc variable lnd_binary_site or
 * or a command line option --lnd-binary-site:
 *
 *   node scripts/install.js --lnd-binary-site http://example.com/
 *
 * The URL should to the mirror of the repository
 * laid out as follows:
 *
 * LND_BINARY_SITE/
 *
 *  v3.0.0
 *  v3.0.0/freebsd-x64-14_binding.node
 *  ....
 *  v3.0.0
 *  v3.0.0/freebsd-ia32-11_binding.node
 *  v3.0.0/freebsd-x64-42_binding.node
 *  ... etc. for all supported versions and platforms
 *
 * @api public
 */

function getBinaryUrl() {
  var site = getArgument('--lnd-binary-site') ||
             process.env.LND_BINARY_SITE  ||
             process.env.npm_config_lnd_binary_site ||
             (config && config.binarySite) ||
             'https://github.com/mrfelton/node-lnd/releases/download';

  return [site, 'v' + getBinaryVersion(), getBinaryName()].join('/') + getBinaryExtension();
}

/**
 * Get binary dir.
 * If environment variable LND_BINARY_DIR,
 * .npmrc variable lnd_binary_dir or
 * process argument --lnd-binary-dir is provided,
 * select it by appending binary name, otherwise
 * use default binary dir.
 * Once the primary selection is made, check if
 * callers wants to throw if file not exists before
 * returning.
 *
 * @api public
 */

function getBinaryDir() {
  var binaryDir;

  if (getArgument('--lnd-binary-dir')) {
    binaryDir = getArgument('--lnd-binary-dir');
  } else if (process.env.LND_BINARY_DIR) {
    binaryDir = process.env.LND_BINARY_DIR;
  } else if (process.env.npm_config_lnd_binary_dir) {
    binaryDir = process.env.npm_config_lnd_binary_dir;
  } else if (config && config.binaryDir) {
    binaryDir = config.binaryDir;
  } else {
    binaryDir = path.join(__dirname, '..', 'vendor')
  }

  return path.resolve(binaryDir);
}

/**
 * Get binary path.
 * If environment variable LND_BINARY_PATH,
 * .npmrc variable lnd_binary_path or
 * process argument --lnd-binary-path is provided,
 * select it by appending binary name, otherwise
 * make default binary path using binary name.
 * Once the primary selection is made, check if
 * callers wants to throw if file not exists before
 * returning.
 *
 * @api public
 */

function getBinaryPath() {
  var binaryPath;

  if (getArgument('--lnd-binary-path')) {
    binaryPath = getArgument('--lnd-binary-path');
  } else if (process.env.LND_BINARY_PATH) {
    binaryPath = process.env.LND_BINARY_PATH;
  } else if (process.env.npm_config_lnd_binary_path) {
    binaryPath = process.env.npm_config_lnd_binary_path;
  } else if (config && config.binaryPath) {
    binaryPath = config.binaryPath;
  } else {
    binaryPath = path.join(getBinaryDir(), 'lnd' + getBinaryFileExtension());
  }

  if (process.versions.modules < 46) {
    return binaryPath;
  }

  try {
    return trueCasePathSync(binaryPath) || binaryPath;
  } catch (e) {
    return binaryPath;
  }
}

/**
 * An array of paths suitable for use as a local disk cache of the binary.
 *
 * @return {[]String} an array of paths
 * @api public
 */
function getCachePathCandidates() {
  return [
    process.env.npm_config_lnd_binary_cache,
    process.env.npm_config_cache,
  ].filter(function(_) { return _; });
}

/**
 * Temporary directory.
 *
 * @return {[]String} path
 * @api public
 */
function getTmpDir() {
  return process.env.npm_config_tmp || os.tmpdir()
}

/**
 * The most suitable location for caching the binary on disk.
 *
 * Given the candidates directories provided by `getCachePathCandidates()` this
 * returns the first writable directory. By treating the candidate directories
 * as a prioritised list this method is deterministic, assuming no change to the
 * local environment.
 *
 * @return {String} directory to cache binary
 * @api public
 */
function getBinaryCachePath() {
  var i,
    cachePath,
    cachePathCandidates = getCachePathCandidates();

  for (i = 0; i < cachePathCandidates.length; i++) {
    cachePath = path.join(cachePathCandidates[i], pkg.name, getBinaryVersion());

    try {
      mkdir.sync(cachePath);
      return cachePath;
    } catch (e) {
      // Directory is not writable, try another
    }
  }

  return '';
}

/**
 * The cached binding
 *
 * Check the candidates directories provided by `getCachePathCandidates()` for
 * the binding file, if it exists. By treating the candidate directories
 * as a prioritised list this method is deterministic, assuming no change to the
 * local environment.
 *
 * @return {String} path to cached binary
 * @api public
 */
function getCachedBinary() {
  var i,
    cachePath,
    cacheBinary,
    cachePathCandidates = getCachePathCandidates(),
    binaryName = getBinaryName();

  for (i = 0; i < cachePathCandidates.length; i++) {
    cachePath = path.join(cachePathCandidates[i], pkg.name, getBinaryVersion());
    cacheBinary = path.join(cachePath, binaryName);
    if (fs.existsSync(cacheBinary)) {
      return cacheBinary;
    }
  }

  return '';
}

/**
 * Does the supplied binary path exist
 *
 * @param {String} binaryPath
 * @api public
 */

function hasBinary(binaryPath) {
  return fs.existsSync(binaryPath);
}

/**
 * Get LND version information
 *
 * @api public
 */

function getVersionInfo(binding) {
  return [
    ['node-lnd', getBinaryVersion(), '(Wrapper)', '[JavaScript]'].join('\t'),
  ].join(eol);
}

/**
 * Gets the platform variant, currently either an empty string or 'musl' for Linux/musl platforms.
 *
 * @api public
 */

function getPlatformVariant() {
  var contents = '';

  if (getBinaryPlatform() !== 'linux') {
    return '';
  }

  try {
    contents = fs.readFileSync(process.execPath);

    // Buffer.indexOf was added in v1.5.0 so cast to string for old node
    // Delay contents.toStrings because it's expensive
    if (!contents.indexOf) {
      contents = contents.toString();
    }

    if (contents.indexOf('libc.musl-x86_64.so.1') !== -1) {
      return 'musl';
    }
  } catch (err) { } // eslint-disable-line no-empty

  return '';
}

module.exports.hasBinary = hasBinary;
module.exports.getBinaryUrl = getBinaryUrl;
module.exports.getBinaryName = getBinaryName;
module.exports.getBinaryVersion = getBinaryVersion;
module.exports.getBinaryPlatform = getBinaryPlatform;
module.exports.getBinaryArch = getBinaryArch;
module.exports.getBinaryFileExtension = getBinaryFileExtension;
module.exports.getBinaryExtension = getBinaryExtension;
module.exports.getBinaryDir = getBinaryDir;
module.exports.getBinaryPath = getBinaryPath;
module.exports.getBinaryCachePath = getBinaryCachePath;
module.exports.getCachedBinary = getCachedBinary;
module.exports.getCachePathCandidates = getCachePathCandidates;
module.exports.getVersionInfo = getVersionInfo;
module.exports.getTmpDir = getTmpDir;
