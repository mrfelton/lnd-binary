# lnd-binary

[![](https://img.shields.io/badge/project-LND-blue.svg?style=flat-square)](https://github.com/lightningnetwork/lnd)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Dependency Status](https://david-dm.org/mrfelton/lnd-binary.svg?style=flat-square)](https://david-dm.org/mrfelton/lnd-binary)

> install lnd from npm https://github.com/lightningnetwork/lnd ⚡️

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [License](#license)


## Installation

```
npm install lnd-binary --save
```

See [lnd getting-started](https://github.com/lightningnetwork/lnd).

## Usage

```sh
> npm install lnd-binary
> npx lnd --version
lnd version 0.4.2-beta
```

See [LND getting-started](hhttps://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md).

## Development

The lnd binary gets installed into the `vendor` directory inside the module folder.

### Which lnd version this package downloads?

By default, the latest supported lnd release will be installed. Alternatively, a specific version can be specified with the configuration options below.

### Configuration

lnd-binary supports different configuration parameters to change settings related to the lnd binary such as binary name, binary path or alternative download path. Following parameters are supported by lnd-binary:

Variable name       | .npmrc parameter    | Process argument   | Value
--------------------|---------------------|--------------------|------
LND_BINARY_NAME     | lnd_binary_name     | --lnd-binary-name     | String
LND_BINARY_SITE     | lnd_binary_site     | --lnd-binary-site     | URL
LND_BINARY_PATH     | lnd_binary_path     | --lnd-binary-path     | Path
LND_BINARY_DIR      | lnd_binary_dir      | --lnd-binary-dir      | Path
LND_BINARY_PLATFORM | lnd_binary_platform | --lnd-binary-platform | See: [Supported Platforms](lib/check-support.js#L4)
LND_BINARY_ARCH     | lnd_binary_arch     | --lnd-binary-arch     | See: [Supported Architectures](lib/check-support.js#L5)
LND_BINARY_VERSION  | lnd_binary_version  | --lnd-binary-version  | See: [Supported Versions](lib/check-support.js#L6)

These parameters can be used as environment variable:

* E.g. `export LND_BINARY_SITE=http://example.com/`

As local or global [.npmrc](https://docs.npmjs.com/misc/config) configuration file:

* E.g. `lnd_binary_site=http://example.com/`

As a process argument:

* E.g. `npm install lnd-binary --lnd-binary-site=http://example.com/`

### API

For programmatic usage, see [scripts/install.js](scripts/install.js).

## License

[MIT](LICENSE)
