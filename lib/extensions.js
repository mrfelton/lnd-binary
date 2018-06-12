/*!
 * node-lnd: lib/extensions.js
 */

var eol = require('os').EOL,
  os = require('os'),
  fs = require('fs'),
  pkg = require('../package.json'),
  mkdir = require('mkdirp'),
  path = require('path'),
  goenv = require('go-platform'),
  defaultBinaryDir = path.join(__dirname, '..', 'vendor'),
  trueCasePathSync = require('true-case-path');

/**
 * Get the human readable name of the Platform that is running
 *
 * @param  {string} platform - An OS platform to match, or null to fallback to
 * the current process platform
 * @return {Object} The name of the platform if matched, false otherwise
 *
 * @api public
 */
function getHumanPlatform(platform) {
  switch (platform || process.platform) {
    case 'darwin': return 'OS X';
    case 'freebsd': return 'FreeBSD';
    case 'linux': return 'Linux';
    case 'linux_musl': return 'Linux/musl';
    case 'win32': return 'Windows';
    default: return false;
  }
}

/**
 * Provides a more readable version of the architecture
 *
 * @param  {string} arch - An instruction architecture name to match, or null to
 * lookup the current process architecture
 * @return {Object} The value of the process architecture, or false if unknown
 *
 * @api public
 */
function getHumanArchitecture(arch) {
  switch (arch || process.arch) {
    case 'ia32': return '32-bit';
    case 'x86': return '32-bit';
    case 'x64': return '64-bit';
    default: return false;
  }
}

/**
 * Get the friendly name of the Node environment being run
 *
 * @param  {Object} abi - A Node Application Binary Interface value, or null to
 * fallback to the current Node ABI
 * @return {Object} Returns a string name of the Node environment or false if
 * unmatched
 *
 * @api public
 */
function getHumanNodeVersion(abi) {
  switch (parseInt(abi || process.versions.modules, 10)) {
    case 11: return 'Node 0.10.x';
    case 14: return 'Node 0.12.x';
    case 42: return 'io.js 1.x';
    case 43: return 'io.js 1.1.x';
    case 44: return 'io.js 2.x';
    case 45: return 'io.js 3.x';
    case 46: return 'Node.js 4.x';
    case 47: return 'Node.js 5.x';
    case 48: return 'Node.js 6.x';
    case 49: return 'Electron 1.3.x';
    case 50: return 'Electron 1.4.x';
    case 51: return 'Node.js 7.x';
    case 53: return 'Electron 1.6.x';
    case 57: return 'Node.js 8.x';
    case 59: return 'Node.js 9.x';
    case 64: return 'Node.js 10.x';
    default: return false;
  }
}

/**
 * Get a human readable description of where node-lnd is running to support
 * user error reporting when something goes wrong
 *
 * @param  {string} env - The name of the native binary that is to be parsed
 * @return {string} A description of what os, architecture, and Node version
 * that is being run
 *
 * @api public
 */
function getHumanEnvironment(env) {
  var binding = env.replace(/_binding\.node$/, ''),
    parts = binding.split('-'),
    platform = getHumanPlatform(parts[0]),
    arch = getHumanArchitecture(parts[1]),
    runtime = getHumanNodeVersion(parts[2]);

  if (parts.length !== 3) {
    return 'Unknown environment (' + binding + ')';
  }

  if (!platform) {
    platform = 'Unsupported platform (' + parts[0] + ')';
  }

  if (!arch) {
    arch = 'Unsupported architecture (' + parts[1] + ')';
  }

  if (!runtime) {
    runtime = 'Unsupported runtime (' + parts[2] + ')';
  }

  return [
    platform, arch, 'with', runtime,
  ].join(' ');
}

/**
 * Get the value of the binaries under the default path
 *
 * @return {Array} The currently installed node-lnd binaries
 *
 * @api public
 */
function getInstalledBinaries() {
  return fs.readdirSync(getBinaryDir());
}

/**
 * Check that an environment matches the whitelisted values or the current
 * environment if no parameters are passed
 *
 * @param  {string} platform - The name of the OS platform(darwin, win32, etc...)
 * @param  {string} arch - The instruction set architecture of the Node environment
 * @param  {string} abi - The Node Application Binary Interface
 * @return {Boolean} True, if node-lnd supports the current platform, false otherwise
 *
 * @api public
 */
function isSupportedEnvironment(platform, arch, abi) {
  return (
    false !== getHumanPlatform(platform) &&
    false !== getHumanArchitecture(arch) &&
    false !== getHumanNodeVersion(abi)
  );
}

/**
 * Check that a os is Windows or the current os if no parameters are passed
 *
 * @param  {string} os - The name of the OS platform(darwin, win32, etc...)
 * @return {Boolean} True, if node-lnd supports the current platform, false otherwise
 *
 * @api public
 */
 function isWindows(os) {
   return os === 'windows'
 }

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
  var binaryVersion;

  if (getArgument('--lnd-binary-version')) {
    binaryVersion = getArgument('--lnd-binary-version');
  } else if (process.env.LND_BINARY_VERSION) {
    binaryVersion = process.env.LND_BINARY_VERSION;
  } else if (process.env.npm_config_lnd_binary_version) {
    binaryVersion = process.env.npm_config_lnd_binary_version;
  } else if (pkg.lndBinaryConfig && pkg.lndBinaryConfig.binaryVersion) {
    binaryVersion = pkg.lndBinaryConfig.binaryVersion;
  }

  return binaryVersion
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
  } else if (pkg.lndBinaryConfig && pkg.lndBinaryConfig.binaryPlatform) {
    binaryPlatform = pkg.lndBinaryConfig.binaryPlatform;
  }

  return binaryPlatform
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
  } else if (pkg.lndBinaryConfig && pkg.lndBinaryConfig.binaryName) {
    binaryName = pkg.lndBinaryConfig.binaryName;
  } else {
    variant = getPlatformVariant();
    if (variant) {
      platform += '_' + variant;
    }

    binaryName = [
      'lnd',
      platform,
      goenv.GOARCH,
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
  return isWindows(getBinaryPlatform()) ? '.zip' : '.tar.gz'
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
             (pkg.lndBinaryConfig && pkg.lndBinaryConfig.binarySite) ||
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
  } else if (pkg.lndBinaryConfig && pkg.lndBinaryConfig.binaryDir) {
    binaryDir = pkg.lndBinaryConfig.binaryDir;
  } else {
    binaryDir = defaultBinaryDir;
  }

  return binaryDir;
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
  } else if (pkg.lndBinaryConfig && pkg.lndBinaryConfig.binaryPath) {
    binaryPath = pkg.lndBinaryConfig.binaryPath;
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
module.exports.getBinaryFileExtension = getBinaryFileExtension;
module.exports.getBinaryExtension = getBinaryExtension;
module.exports.getBinaryDir = getBinaryDir;
module.exports.getBinaryPath = getBinaryPath;
module.exports.getBinaryCachePath = getBinaryCachePath;
module.exports.getCachedBinary = getCachedBinary;
module.exports.getCachePathCandidates = getCachePathCandidates;
module.exports.getVersionInfo = getVersionInfo;
module.exports.getHumanEnvironment = getHumanEnvironment;
module.exports.getInstalledBinaries = getInstalledBinaries;
module.exports.getTmpDir = getTmpDir;
module.exports.isSupportedEnvironment = isSupportedEnvironment;
module.exports.isWindows = isWindows;
