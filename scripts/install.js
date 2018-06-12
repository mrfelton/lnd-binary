/*!
 * node-lnd: scripts/install.js
 */

var fs = require('fs'),
  eol = require('os').EOL,
  mkdir = require('mkdirp'),
  path = require('path'),
  lnd = require('../lib/extensions'),
  support = require('../lib/support'),
  request = require('request'),
  gunzip = require('gunzip-maybe'),
  tarFS = require('tar-fs'),
  unzip = require('unzip-stream'),
  log = require('npmlog'),
  cacache = require('cacache'),
  downloadOptions = require('./util/downloadoptions');

/**
 * Download file, if succeeds save, if not delete
 *
 * @param {String} url
 * @param {String} dest
 * @param {Function} cb
 * @api private
 */

function download(url, dest, cb) {
  var reportError = function(err) {
    var timeoutMessge;

    if (err.code === 'ETIMEDOUT') {
      if (err.connect === true) {
        // timeout is hit while your client is attempting to establish a connection to a remote machine
        timeoutMessge = 'Timed out attemping to establish a remote connection';
      } else {
        timeoutMessge = 'Timed out whilst downloading the prebuilt binary';
        // occurs any time the server is too slow to send back a part of the response
      }

    }
    cb(['Cannot download "', url, '": ', eol, eol,
      typeof err.message === 'string' ? err.message : err, eol, eol,
      timeoutMessge ? timeoutMessge + eol + eol : timeoutMessge,
      'Hint: If github.com is not accessible in your location', eol,
      '      try setting a proxy via HTTP_PROXY, e.g. ', eol, eol,
      '      export HTTP_PROXY=http://example.com:1234',eol, eol,
      'or configure npm proxy via', eol, eol,
      '      npm config set proxy http://example.com:8080'].join(''));
  };

  var successful = function(response) {
    return response.statusCode >= 200 && response.statusCode < 300;
  };

  // Unpack the response stream
  var unpack = function(stream, cb) {
    return cacache.tmp.withTmp(lnd.getTmpDir(), {tmpPrefix: 'lnd-downloads'}, (tmpDir) => {
      return new Promise((resolve, reject) => {
        const downloadedBinary = path.join(tmpDir, lnd.getBinaryName(), 'lnd' + lnd.getBinaryFileExtension())

        console.log('Unpacking binary to', tmpDir)

        // TODO: handle errors for both cases
        if (support.isWindows(lnd.getBinaryPlatform())) {
          return stream.pipe(
            unzip
              .Extract({ path: tmpDir })
              .on('close', () => {
                console.log('Extracted archive to', tmpDir)

                // Make sure the binary is executable.
                try {
                  // avoid touching the binary if it's already got the correct permissions
                  var st = fs.statSync(downloadedBinary)
                  var mode = st.mode | parseInt('0755', 8)
                  if (mode !== st.mode) {
                    fs.chmodSync(downloadedBinary, mode)
                  }
                } catch (error) {
                  console.error(error)
                  // Just ignore error if we don't have permission.
                  // We did our best. Likely because phantomjs was already installed.
                }

                fs.renameSync(downloadedBinary, dest)
                resolve()
              })
          )
        }

        return stream
          .pipe(gunzip())
          .pipe(
            tarFS
              .extract(tmpDir)
              .on('finish', () => {
                console.log('Extracted archive to', tmpDir)
                fs.renameSync(downloadedBinary, dest)
                resolve()
              })
          )
      })
    })
    .finally(cb)
  }

  console.log('Downloading binary', url);

  try {
    request(url, downloadOptions(), function(err, response, buffer) {
      if (err) {
        reportError(err);
      } else if (!successful(response)) {
        reportError(['HTTP error', response.statusCode, response.statusMessage].join(' '));
      } else {
        console.log('Download complete');
      }
    })
    .on('response', function(response) {
      // The `progress` is true by default. However if it has not
      // been explicitly set it's `undefined` which is considered
      // as far as npm is concerned.
      if (process.env.npm_config_progress === 'true') {
        var length = parseInt(response.headers['content-length'], 10);
        var progress = log.newItem('', length);

        log.enableProgress();

        response.on('data', function(chunk) {
          progress.completeWork(chunk.length);
        })
        .on('end', progress.finish);
      }

      if (successful(response)) {
        unpack(response, cb)
      } else {
        return cb('Error downloading binary')
      }
    });
  } catch (err) {
    cb(err);
  }
}

/**
 * Check and download binary
 *
 * @api private
 */

function checkAndDownloadBinary(cb) {
  if (process.env.SKIP_LND_BINARY_DOWNLOAD_FOR_CI) {
    console.log('Skipping downloading binaries on CI builds');
    return;
  }

  //Environment Variables || Args || Defaults
  version = lnd.getBinaryVersion()
  platform = lnd.getBinaryPlatform()
  arch = lnd.getBinaryArch()

  // Make sure we support the requested package
  try {
    support.verify(version, platform, arch)
  } catch (err) {
    console.error(err.message)
    return cb(err)
  }

  var cachedBinary = lnd.getCachedBinary(),
    cachePath = lnd.getBinaryCachePath(),
    binaryPath = lnd.getBinaryPath();

  // if (lnd.hasBinary(binaryPath)) {
  //   console.log('node-lnd build', 'Binary found at', binaryPath);
  //   return;
  // }

  try {
    mkdir.sync(path.dirname(binaryPath));
  } catch (err) {
    const error = new Error('Unable to save binary', path.dirname(binaryPath), ':', err);
    console.error(error.message)
    return cb(error);
  }

  if (cachedBinary) {
    console.log('Cached binary found at', cachedBinary);
    fs.createReadStream(cachedBinary).pipe(fs.createWriteStream(binaryPath, { mode: 0o755 }));
    return cb(null, {
      fileName: lnd.getBinaryName(),
      installPath: path.dirname(binaryPath),
    });
  }

  download(lnd.getBinaryUrl(), binaryPath, function(err) {
    if (err) {
      console.error(err);
      return cb(err)
    }

    console.log('Binary saved to', binaryPath);

    cachedBinary = path.join(cachePath, lnd.getBinaryName());

    if (cachePath) {
      console.log('Caching binary to', cachedBinary);

      try {
        mkdir.sync(path.dirname(cachedBinary));
        fs.createReadStream(binaryPath)
          .pipe(fs.createWriteStream(cachedBinary, { mode: 0o755 }))
          .on('error', function (err) {
            console.log('Failed to cache binary:', err);
          });
      } catch (err) {
        console.log('Failed to cache binary:', err);
      }
    }
  });
}

/**
 * If binary does not exist, download it
 */

if (require.main === module) {
  checkAndDownloadBinary(() => {});
}

module.exports.download = download
module.exports.checkAndDownloadBinary = checkAndDownloadBinary
