import lnd from './lib/extensions'

/**
 * The version of lnd installed by this package.
 * @type {number}
 */
exports.version = lnd.getBinaryVersion()

/**
 * The location of the lnd binary installed by this package.
 * @type {number}
 */
exports.path = lnd.getBinaryPath()
