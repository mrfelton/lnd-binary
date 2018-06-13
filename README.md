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

See [lnd getting started](https://github.com/lightningnetwork/lnd).

## Usage

```sh
> npm install lnd-binary
> npx lnd --version
lnd version 0.4.2-beta
```

## Development

The lnd binary gets installed into the `vendor` directory inside the module folder.

### Which lnd version this package downloads?

By default, the latest supported lnd release will be installed. Alternatively, a specific version can be specified using the configuration options below.

### Configuration

lnd-binary supports different configuration parameters to change settings related to the lnd binary such as binary name, binary path or alternative download path. Following parameters are supported by lnd-binary:

| Variable name         | package.json     | .npmrc parameter      | Process argument        | Value                             |
| --------------------- | ---------------- | --------------------- | ----------------------- | --------------------------------- |
| `LND_BINARY_NAME`     | `binaryName`     | `lnd_binary_name`     | `--lnd-binary-name`     | String                            |
| `LND_BINARY_SITE`     | `binarySite`     | `lnd_binary_site`     | `--lnd-binary-site`     | URL                               |
| `LND_BINARY_PATH`     | `binaryPath`     | `lnd_binary_path`     | `--lnd-binary-path`     | Path                              |
| `LND_BINARY_DIR`      | `binaryDir`      | `lnd_binary_dir`      | `--lnd-binary-dir`      | Path                              |
| `LND_BINARY_PLATFORM` | `binaryPlatform` | `lnd_binary_platform` | `--lnd-binary-platform` | [Platform](lib/support.js#L4)     |
| `LND_BINARY_ARCH`     | `binaryArch`     | `lnd_binary_arch`     | `--lnd-binary-arch`     | [Architecture](lib/support.js#L5) |
| `LND_BINARY_VERSION`  | `binaryVersion`  | `lnd_binary_version`  | `--lnd-binary-version`  | [Version](lib/support.js#L6)      |

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

## License

[MIT](LICENSE)
