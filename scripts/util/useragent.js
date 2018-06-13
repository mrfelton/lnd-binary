var pkg = require('../../package.json')

/**
 * A custom user agent use for binary downloads.
 *
 * @api private
 */
module.exports = function() {
  return ['node/', process.version, ' ', 'node-lnd-installer/', pkg.version].join('')
}
