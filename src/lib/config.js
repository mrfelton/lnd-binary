import path from 'path'
import fs from 'fs-extra'
import findConfig from 'find-config'
import * as pkg from '../../package.json'
import createDebug from 'debug'

const debug = createDebug(pkg.name)

/**
 * Try to find config block in the nearest package.json
 */
const getConfig = () => {
  const pkgPath = findConfig('package.json', { home: false, cwd: path.join(__dirname, '..', '..', '..') })
  if (pkgPath && pkgPath !== 'package.json') {
    debug('found parent package.json at: %s', pkgPath)
    const pkgConfig = fs.readJsonSync(pkgPath)
    if (pkgConfig.config && pkgConfig.config[pkg.name]) {
      const config = pkgConfig.config[pkg.name]
      debug('using lnd-binary config from parent package.json: %o', config)
      return config
    }
  }
}

export const config = getConfig()
