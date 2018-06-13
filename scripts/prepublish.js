/*!
 * node-lnd: scripts/prepublish.js
 */

const path = require('path')
const rimraf = require('rimraf')

function prepublish() {
  var vendorPath = path.resolve(__dirname, '..', 'vendor')
  rimraf.sync(vendorPath)
}

/**
 * Run
 */

prepublish()
