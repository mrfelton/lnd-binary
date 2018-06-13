import fs from 'fs-extra'
import path from 'path'
import log from 'npmlog'
import cacache from 'cacache'
import { cache } from './cache'
import { extract } from './extract'
import { fetch } from './fetch'
import { verify } from './verify'
import support from './support'
import lnd from './extensions'
import * as pkg from '../../package.json'
import createDebug from 'debug'

const debug = createDebug(pkg.name)

/**
 * Check and download binary
 *
 * @api private
 */

export const install = () => {
  if (process.env.SKIP_LND_BINARY_DOWNLOAD_FOR_CI) {
    log.info(pkg.name, 'Skipping downloading binaries on CI builds')
    return
  }

  // Environment Variables || Args || Defaults
  const version = lnd.getBinaryVersion()
  const platform = lnd.getBinaryPlatform()
  const arch = lnd.getBinaryArch()

  // Make sure we support the requested package
  try {
    support.verify(version, platform, arch)
  } catch (err) {
    log.error(pkg.name, err.message)
    return Promise.reject(err)
  }

  const cachedBinary = lnd.getCachedBinary()
  const binaryPath = lnd.getBinaryPath()
  const binaryUrl = lnd.getBinaryUrl()

  // Create the destination directory.
  try {
    fs.ensureDirSync(path.dirname(binaryPath))
  } catch (err) {
    const error = new Error('Unable to save binary', path.dirname(binaryPath), ':', err)
    log.error(pkg.name, error.message)
    return Promise.reject(error)
  }

  // Attempt to restore binary from cache.
  if (cachedBinary) {
    log.info(pkg.name, 'Cached binary found at', cachedBinary)
    fs.createReadStream(cachedBinary).pipe(fs.createWriteStream(binaryPath, { mode: 0o755 }))
    return Promise.resolve({
      fileName: lnd.getBinaryName(),
      installPath: path.dirname(binaryPath),
    })
  }

  return cacache.tmp
    .withTmp(lnd.getTmpDir(), { tmpPrefix: 'lnd-downloads' }, tmpDir => {
      return fetch(binaryUrl, tmpDir)
        .then(verify)
        .then(() => {
          const tmpFile = path.join(tmpDir, path.basename(binaryUrl))
          return extract(tmpFile, binaryPath)
        })
        .then(() => {
          const binaryPath = lnd.getBinaryPath()
          const cachePath = lnd.getBinaryCachePath()
          return cache(binaryPath, cachePath)
        })
    })
    .then(() => ({
      fileName: lnd.getBinaryName(),
      installPath: path.dirname(binaryPath),
    }))
    .catch(err => log.error(pkg.name, err))
}
