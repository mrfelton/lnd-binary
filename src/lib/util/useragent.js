import * as pkg from '../../../package.json'

/**
 * A custom user agent use for binary downloads.
 *
 * @api private
 */
export const useragent = function() {
  return ['node/', process.version, ' ', 'node-lnd-installer/', pkg.version].join('')
}
