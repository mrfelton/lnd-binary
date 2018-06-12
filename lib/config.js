'use strict'

var path = require('path'),
  pkg = require(path.join(__dirname, '../package.json')),
  findConfig = require('find-config');

/**
 * Try to find config block in the nearest package.json
 * @api private
 */
function readConfigFile() {
  var pkgPath = findConfig('package.json', { home: false, cwd: path.join(__dirname, '..', '..') })
  if (pkgPath && pkgPath !== 'package.json') {
    const pkgConfig= require(pkgPath)
    if (pkgConfig.config && pkgConfig.config[pkg.name]) {
      return pkgConfig.config[pkg.name]
    }
  }
}

// Public API
module.exports = readConfigFile()
