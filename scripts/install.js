/*!
 * node-lnd: scripts/install.js
 */

const fs = require('fs')
const mkdir = require('mkdirp')
const path = require('path')
const lnd = require('../lib/extensions')
const support = require('../lib/support')
const manifest = require('../lib/manifest')
const axios = require('axios')
const debug = require('debug')('lnd-binary')
const gunzip = require('gunzip-maybe')
const tar = require('tar-fs')
const unzip = require('unzip-stream')
const log = require('npmlog')
const cacache = require('cacache')
const hasha = require('hasha')
const pkg = require('../package.json')

// Download or fecth binary archive from cache.
const fetch = (url, dest) => {
  debug('fetch: %o', { url, dest })

  log.info(pkg.name, 'Downloading', url)

  return axios({
    method: 'get',
    url,
    responseType: 'stream'
  })
    .then((response) => {
      // return a promise and resolve when download finishes
      return new Promise((resolve, reject) => {
        // Pipe the data into a temporary file.
        const tmpFile = path.join(dest, path.basename(url))
        debug('writing data to file: %s', tmpFile)
        response.data.pipe(fs.createWriteStream(tmpFile))

        // The `progress` is true by default. However if it has not
        // been explicitly set it's `undefined` which is considered
        // as far as npm is concerned.
        if (process.env.npm_config_progress === 'true') {
          var length = parseInt(response.headers['content-length'], 10)
          var progress = log.newItem('', length)

          log.enableProgress()

          response.data.on('data', (chunk) => progress.completeWork(chunk.length))
          response.data.on('end', progress.finish)
        }

        response.data.on('end', () => {
          debug('Download complete')
          resolve(tmpFile)
        })

        response.data.on('error', err => {
          debug('Download error')
          reject(err)
        })
      })
    })
}

// Verify the binary archive.
const verify = (path) => {
  debug('fetch: %o', { path })

  function getKeyByValue (object, value) {
    return Object.keys(object).find(key => object[key] === value)
  }

  const checksums = manifest[lnd.getBinaryVersion()]
  const checksum = getKeyByValue(checksums, lnd.getBinaryName() + lnd.getBinaryExtension())

  debug('Verifying archive against checksum', checksum)

  return hasha.fromFile(path, { algorithm: 'sha256' })
    .then(hash => {
      debug('Generated hash from downloaded file', hash)

      if (checksum === hash) {
        log.info(pkg.name, 'Verified checksum of downloaded file')
        return path
      }
      log.error(pkg.name, 'Checksum did not match')
      return Promise.reject(new Error('Checksum did not match'))
    })
    .catch(err => {
      log.error(pkg.name, 'Error verifying checksum of downloaded file', err)
      return Promise.reject(err)
    })
}

// Extract the archive.
const extract = (archive, dest) => {
  debug('extract: %o', { archive, dest })

  const archiveDir = path.dirname(archive)
  const archiveExtractedDir = archive.replace(lnd.getBinaryExtension(), '')
  const downloadedLndBinary = path.join(archiveExtractedDir, 'lnd' + lnd.getBinaryFileExtension())
  const isWindows = support.isWindows(lnd.getBinaryPlatform())
  const stream = fs.createReadStream(archive)

  const moveToDest = cb => {
    log.info(pkg.name, 'Extracted lnd archive to', archiveDir)

    // Make sure the binary is executable.
    try {
      // avoid touching the binary if it's already got the correct permissions
      var st = fs.statSync(downloadedLndBinary)
      var mode = st.mode | parseInt('0755', 8)
      if (mode !== st.mode) {
        fs.chmodSync(downloadedLndBinary, mode)
      }
    } catch (error) {
      log.error(error)
      return cb(error)
    }
    fs.renameSync(downloadedLndBinary, dest)
    log.info(pkg.name, 'Moved lnd binary to', dest)
    return cb()
  }

  return new Promise((resolve, reject) => {
    if (isWindows) {
      stream
        .pipe(unzip.Extract({ path: archiveDir }))
        .on('finish', () => moveToDest(resolve))
        .on('error', reject)
    } else {
      stream
        .pipe(gunzip())
        .pipe(tar.extract(archiveDir))
        .on('finish', () => moveToDest(resolve))
        .on('error', reject)
    }
  })
}

// Cache the archive.
const cache = (binaryPath, cachePath) => {
  debug('extract: %o', { binaryPath, cachePath })
  if (!cachePath) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const cachedBinary = path.join(cachePath, lnd.getBinaryName())

    debug('cachedBinary: %o', cachedBinary)

    try {
      mkdir.sync(path.dirname(cachedBinary))
      fs.createReadStream(binaryPath)
        .pipe(fs.createWriteStream(cachedBinary, { mode: 0o755 }))
        .on('finish', () => {
          log.info(pkg.name, 'Cached binary to', cachedBinary)
          resolve()
        })
        .on('error', function (err) {
          log.error(pkg.name, 'Failed to cache binary:', err)
          reject(err)
        })
    } catch (err) {
      log.info(pkg.name, 'Failed to cache binary:', err)
      reject(err)
    }
  })
}

const fetchVerifyAndExtract = (url, tmpDir, dest) => {
  debug('fetchVerifyAndExtract %o', {url, tmpDir, dest})
  return fetch(url, tmpDir)
    .then(verify)
    .then(() => {
      const tmpFile = path.join(tmpDir, path.basename(url))
      return extract(tmpFile, dest)
    })
    .then(() => {
      const binaryPath = lnd.getBinaryPath()
      const cachePath = lnd.getBinaryCachePath()
      return cache(binaryPath, cachePath)
    })
}

/**
 * Check and download binary
 *
 * @api private
 */

function checkAndDownloadBinary (cb) {
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
    return cb(err)
  }

  const cachedBinary = lnd.getCachedBinary()
  const binaryPath = lnd.getBinaryPath()

  // Create the destination directory.
  try {
    mkdir.sync(path.dirname(binaryPath))
  } catch (err) {
    const error = new Error('Unable to save binary', path.dirname(binaryPath), ':', err)
    log.error(pkg.name, error.message)
    return cb(error)
  }

  // Attempt to restore binary from cache.
  if (cachedBinary) {
    log.info(pkg.name, 'Cached binary found at', cachedBinary)
    fs.createReadStream(cachedBinary).pipe(fs.createWriteStream(binaryPath, { mode: 0o755 }))
    return cb(null, {
      fileName: lnd.getBinaryName(),
      installPath: path.dirname(binaryPath)
    })
  }

  return cacache.tmp.withTmp(lnd.getTmpDir(), { tmpPrefix: 'lnd-downloads' }, (tmpDir) => {
    return fetchVerifyAndExtract(lnd.getBinaryUrl(), tmpDir, binaryPath)
  })
    .then(() => cb(null, {
      fileName: lnd.getBinaryName(),
      installPath: path.dirname(binaryPath)
    }))
    .catch(err => log.error(pkg.name, err))
}

/**
 * If binary does not exist, download it
 */

if (require.main === module) {
  checkAndDownloadBinary(() => {})
}

// module.exports.download = download
module.exports.checkAndDownloadBinary = checkAndDownloadBinary
