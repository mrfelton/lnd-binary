# lnd-binary

[![](https://img.shields.io/badge/project-LND-blue.svg?style=flat-square)](https://github.com/lightningnetwork/lnd)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Dependency Status](https://david-dm.org/mrfelton/lnd-binary.svg?style=flat-square)](https://david-dm.org/mrfelton/lnd-binary)
[![Build Status](https://travis-ci.org/mrfelton/lnd-binary.svg?branch=master)](https://travis-ci.org/mrfelton/lnd-binary)

> install lnd from npm https://github.com/lightningnetwork/lnd ⚡️

This package will download and install a precompiled [lnd](https://github.com/lightningnetwork/lnd) binary. The installed binary is verified against the official lnd binary checksums to ensure its integrity.

By default, the latest supported lnd release for your platform/architecture will be installed. Alternatively, a specific version can be specified using the configuration options below.

The lnd binary gets installed into the `vendor` directory inside the module folder and symlinked into your node bin directory.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

```
npm install lnd-binary --save
```

## Usage

```sh
> npm install lnd-binary
> npx lnd --version
lnd version 0.4.2-beta
```

### Configuration

lnd-binary supports different configuration parameters to change settings related to the lnd binary such as binary name, binary path or alternative download path. Following parameters are supported by lnd-binary:

| Variable name         | package.json     | .npmrc parameter      | Process argument        | Value                              |
| --------------------- | ---------------- | --------------------- | ----------------------- | ---------------------------------- |
| `LND_BINARY_NAME`     | `binaryName`     | `lnd_binary_name`     | `--lnd-binary-name`     | String                             |
| `LND_BINARY_SITE`     | `binarySite`     | `lnd_binary_site`     | `--lnd-binary-site`     | URL                                |
| `LND_BINARY_PATH`     | `binaryPath`     | `lnd_binary_path`     | `--lnd-binary-path`     | Path                               |
| `LND_BINARY_DIR`      | `binaryDir`      | `lnd_binary_dir`      | `--lnd-binary-dir`      | Path                               |
| `LND_BINARY_PLATFORM` | `binaryPlatform` | `lnd_binary_platform` | `--lnd-binary-platform` | [Platform](src/lib/support.js)     |
| `LND_BINARY_ARCH`     | `binaryArch`     | `lnd_binary_arch`     | `--lnd-binary-arch`     | [Architecture](src/lib/support.js) |
| `LND_BINARY_VERSION`  | `binaryVersion`  | `lnd_binary_version`  | `--lnd-binary-version`  | [Version](src/lib/support.js)      |

These parameters can be used in [package.json `config` section](https://docs.npmjs.com/files/package.json#config):

- E.g.

```json
{
  "config": {
    "lnd-binary": {
      "binaryVersion": "0.4.2-beta"
    }
  }
}
```

These parameters can be used as environment variable:

- E.g. `export LND_BINARY_VERSION=0.4.2-beta`

As local or global [.npmrc](https://docs.npmjs.com/misc/config) configuration file:

- E.g. `lnd_binary_version=0.4.2-beta`

As a process argument:

- E.g. `npm install lnd-binary --lnd-binary-version 0.4.2-beta`

### Testing

Run the tests suite:

```bash
  npm test
```

Run with debugging output on:

```bash
  DEBUG='lnd-binary' npm test
```

## Maintainers

[@Tom Kirkpatrick (mrfelton)](https://github.com/mrfelton).

## Contribute

Feel free to dive in! [Open an issue](https://github.com/mrfelton/lnd-binary/issues/new) or submit PRs.

lnd-binary follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

## License

[MIT](LICENSE) © Tom Kirkpatrick
