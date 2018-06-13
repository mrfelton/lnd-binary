import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import log from 'npmlog'
import downloadoptions from './util/downloadoptions'
import * as pkg from '../../package.json'
import createDebug from 'debug'

const debug = createDebug(pkg.name)

// Download or fecth binary archive from cache.
export const fetch = (url, dest) => {
  debug('fetch: %o', { url, dest })

  log.info(pkg.name, 'Downloading', url)

  return axios(
    Object.assign(
      {
        method: 'get',
        url,
        responseType: 'stream',
      },
      downloadoptions,
    ),
  ).then(response => {
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

        response.data.on('data', chunk => progress.completeWork(chunk.length))
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
