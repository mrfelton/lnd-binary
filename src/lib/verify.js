import fs from 'fs-extra'
import path from 'path'
import hasha from 'hasha'
import log from 'npmlog'
import lnd, { DEFAULT_BINARY_URL } from '../lib/extensions'
import * as pkg from '../../package.json'
import createDebug from 'debug'

const debug = createDebug(pkg.name)

// Verify the binary archive.
export const verify = filepath => {
  debug('verify: %o', { filepath })

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
  }

  const manifestPath = path.join(__dirname, '..', '..', 'config', 'manifest.json')
  const manifest = fs.readJsonSync(manifestPath)
  const checksums = manifest[lnd.getBinaryVersion()]

  if (lnd.getBinarySite() !== DEFAULT_BINARY_URL) {
    log.warn(`Skipping checksum validation. Unknown binary site.`)
    return Promise.resolve()
  }

  if (!checksums) {
    log.warn(`Checksum for ${lnd.getBinaryVersion()} unknown. Unable to verify release.`)
    return Promise.resolve()
  }

  const checksum = getKeyByValue(checksums, lnd.getBinaryName() + lnd.getBinaryExtension())
  debug('Verifying archive against checksum', checksum)

  return hasha
    .fromFile(filepath, { algorithm: 'sha256' })
    .then(hash => {
      debug('Generated hash from downloaded file', hash)

      if (checksum === hash) {
        log.info(pkg.name, 'Verified checksum of downloaded file')
        return filepath
      }
      log.error(pkg.name, 'Checksum did not match')
      return Promise.reject(new Error('Checksum did not match'))
    })
    .catch(err => {
      log.error(pkg.name, 'Error verifying checksum of downloaded file', err)
      return Promise.reject(err)
    })
}
