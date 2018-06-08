# lnd-binary

[![](https://img.shields.io/badge/project-LND-blue.svg?style=flat-square)](https://github.com/lightningnetwork/lnd)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Dependency Status](https://david-dm.org/mrfelton/lnd-binary.svg?style=flat-square)](https://david-dm.org/mrfelton/lnd-binary)

> install lnd from npm https://github.com/lightningnetwork/lnd ⚡️

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Development](#development)
  - [Publish a new version](#publish-a-new-version)
- [Contribute](#contribute)
- [License](#license)

## Install

Install the latest [lnd](https://github.com/lightningnetwork/lnd) binary.

```
npm install lnd
```

Downloads the relevant precompiled lnd binary for your system from [https://github.com/lightningnetwork/lnd](https://github.com/lightningnetwork/lnd).

After downloading, this package will re-calculate the sha256 sum of the downloaded binary, and compare that with the from the hashes from lnd manifest file in order to ensure the integrity of the installed lnd binary.

## Usage

```sh
> npm install lnd-binary
> npx lnd --version
lnd version 0.4.2-beta
```

See [LND getting-started](hhttps://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md).

Note: this package installs the corresponding version of lnd that matches the version of this package that you have installed.

### Publish a new version

1. First, (in package.json) you should Update the `goBinary.version` property to reference the new lnd version.

2. Next, (in package.json) you should list out all checksums for the release assets that are available as part of the new release (those listed on https://github.com/lightningnetwork/lnd/releases).

3. Use [np](https://github.com/sindresorhus/np) to do a release (release version number should match the lnd version number).

```sh
> npx np 0.4.3-beta
```

This will:

- `git tag` the release
- push to https://github.com/mrfelton/lnd-binary
- publish to `lnd-binary@$version` to https://npmjs.com/package/lnd-binary

Open an issue in the repo if you run into trouble.

### Publish a new version of this module with exact same lnd version

If some problem happens, and you need to publish a new version of this module targetting _the same_ lnd version, then please follow this convention:

1. **Clean up bad stuff:** unpublish all modules with this exact same `<lnd-version>`
2. **Add a "update" version suffix:** use version: `<lnd-version>-update<num>`
3. **Publish version:** publish the module. Since it's the only one with the lnd version, then it should be installed.

> Why do this?

Well, if you previously published npm module `lnd-binary@0.4.3-beta` and there was a problem, we now must publish a different version, but we want to keep the version number the same. so the strategy is to publish as `lnd-binary@0.4.3-beta-update.1`, and unpublish `lnd-binary@0.4.3-beta`.

> Why `-update.<num>`?

Because it is unlikely to be a legitimate lnd version, and we want to support lnd versions like `featureset-1` etc.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/mrfelton/lnd-binary/issues)!

## License

[MIT](LICENSE)
