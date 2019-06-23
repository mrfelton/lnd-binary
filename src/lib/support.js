import log from 'npmlog'
import * as pkg from '../../package.json'
import manifest from '../../config/manifest.json'

// The packages we support
const supportedPlatforms = ['linux', 'darwin', 'windows', 'freebsd']
const supportedArchs = ['amd64', '386', 'arm']
const supportedVersions = Object.keys(manifest)

// Check functions
const isSupportedVersion = version => supportedVersions.indexOf(version) !== -1
const isSupportedPlatform = platform => supportedPlatforms.indexOf(platform) !== -1
const isSupportedArch = arch => supportedArchs.indexOf(arch) !== -1

// Is the platform Windows?
function isWindows(os) {
  return os === 'windows'
}

// Validate the requested binary support, throw en error if not supported
function verify(version, platform, arch) {
  if (!isSupportedArch(arch)) {
    log.warn(pkg.name, `Arch '${arch}' is not an officially supported architecture`)
  }

  if (!isSupportedPlatform(platform)) {
    log.warn(pkg.name, `Platform '${platform}' is not an officially supported platform`)
  }

  if (!isSupportedVersion(version)) {
    log.warn(pkg.name, `Version '${version}' not an officially supported lnd version`)
  }

  return true
}

// Public API
export default {
  Versions: supportedVersions,
  Platforms: supportedPlatforms,
  Archs: supportedArchs,
  isSupportedVersion: isSupportedVersion,
  isSupportedPlatform: isSupportedPlatform,
  isSupportedArch: isSupportedArch,
  isWindows: isWindows,
  verify: verify,
}
