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

When used via `node ./bin/lnd-install`, you can specify the target platform, version, architecture, and installation path via environment variables:

`LND_BINARY_PLATFORM`

See: [Supported Platforms](lib/check-support.js#L4) for possible values.

`LND_BINARY_ARCH`

See: [Supported Architectures](lib/check-support.js#L5) for possible values.

`LND_BINARY_VERSION`

See: [Supported Versions](lib/check-support.js#L6) for possible values.

`LND_BINARY_DIR`

Defaults to the `./vendor` directory in this package.

Or via command line arguments:
```
node ./bin/lnd-install \
  --lnd-binary-version <version> \
  --lnd-binary-platform <platform> \
  --lnd-binary-arch <architecture> \
  --lnd-binary-dir <install directory>
```

eg.
```
node ./bin/lnd-install` --lnd-binary-version v0.4.2-beta --lnd-binary-platform linux --lnd-binary-arch amd64 --lnd-binary-dir ./resources
```

### API

For programmatic usage, see [scripts/install.js](scripts/install.js).

## License

[MIT](LICENSE)
