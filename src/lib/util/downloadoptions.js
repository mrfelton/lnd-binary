import proxy from './proxy'
import useragent from './useragent'

/**
 * The options passed to request when downloading the binary
 *
 * @return {Object} an options object for request
 * @api private
 */
export const downloadoptions = function() {
  var options = {
    timeout: 60000,
    headers: {
      'User-Agent': useragent(),
    },
  }

  var proxyConfig = proxy()
  if (proxyConfig) {
    options.proxy = proxyConfig
  }

  return options
}
