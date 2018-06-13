import fs from 'fs-extra'
import path from 'path'
import log from 'npmlog'
import lnd from './extensions'
import * as pkg from '../../package.json'
import createDebug from 'debug'

const debug = createDebug(pkg.name)

// Cache the archive.
export const cache = (binaryPath, cachePath) => {
  debug('cache: %o', { binaryPath, cachePath })
  if (!cachePath) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const cachedBinary = path.join(cachePath, lnd.getBinaryName())

    debug('cachedBinary: %o', cachedBinary)

    try {
      fs.ensureDirSync(path.dirname(cachedBinary))
      fs.createReadStream(binaryPath)
        .pipe(fs.createWriteStream(cachedBinary, { mode: 0o755 }))
        .on('finish', () => {
          log.info(pkg.name, 'Cached binary to', cachedBinary)
          resolve()
        })
        .on('error', function(err) {
          log.error(pkg.name, 'Failed to cache binary:', err)
          reject(err)
        })
    } catch (err) {
      log.info(pkg.name, 'Failed to cache binary:', err)
      reject(err)
    }
  })
}
