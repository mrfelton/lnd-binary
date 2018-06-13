'use strict'

// The packages we support
const supportedPlatforms = ['linux', 'darwin', 'windows', 'freebsd']
const supportedArchs = ['amd64', '386', 'arm']
const supportedVersions = [
  '0.4.2-beta',
  '0.4.1-beta',
  '0.4-beta',
  '0.3-alpha',
  '0.2.1-alpha',
  '0.2-alpha'
]

// Check functions
const isSupportedVersion = (version) => supportedVersions.indexOf(version) !== -1
const isSupportedPlatform = (platform) => supportedPlatforms.indexOf(platform) !== -1
const isSupportedArch = (arch) => supportedArchs.indexOf(arch) !== -1

// Is the platform Windows?
function isWindows (os) {
  return os === 'windows'
}

// Validate the requested binary support, throw en error if not supported
function verify (version, platform, arch) {
  if (!isSupportedArch(arch)) {
    throw new Error(`No binary available for arch '${arch}'`)
  }

  if (!isSupportedPlatform(platform)) {
    throw new Error(`No binary available for platform '${platform}'`)
  }

  if (!isSupportedVersion(version)) {
    throw new Error(`Version '${version}' not available`)
  }

  return true
}

// Public API
module.exports = {
  Versions: supportedVersions,
  Platforms: supportedPlatforms,
  Archs: supportedArchs,
  isSupportedVersion: isSupportedVersion,
  isSupportedPlatform: isSupportedPlatform,
  isSupportedArch: isSupportedArch,
  isWindows: isWindows,
  verify: verify
}
