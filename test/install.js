'use strict'

import test from 'tape-promise/tape'
import fs from 'fs-extra'
import path from 'path'
import goenv from 'go-platform'
import { install } from '../src/lib/install'

const dir = path.resolve(__dirname, '..', 'vendor')
const VERSION = 'v0.14.2-beta'

test('Ensure lnd gets downloaded (current version and platform)', (t) => {
  t.plan(4)
  fs.removeSync(dir)

  const platform = goenv.GOOS
  const arch = goenv.GOARCH

  return (
    install()
      // Check return values.
      .then((res) => {
        t.ok(res.fileName.indexOf(`lnd-${platform}-${arch}-${VERSION}`) !== -1, 'Returns the correct filename')
        t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')
      })

      // Check download dir.
      .then(() => fs.stat(dir))
      .then((stats) => t.ok(stats, 'lnd was downloaded'))

      // Check binary.
      .then(() => fs.stat(path.join(dir, 'lnd')))
      .then((stats) => t.ok(stats, `binary was downloaded`))

      // Cleanup.
      .finally(() => delete process.env.LND_BINARY_PLATFORM)
  )
})

test('Ensure Windows version gets downloaded', (t) => {
  t.plan(4)
  fs.removeSync(dir)

  process.env.LND_BINARY_PLATFORM = 'windows'
  const platform = 'windows'
  const arch = goenv.GOARCH

  return (
    install()
      // Check return values.
      .then((res) => {
        t.ok(res.fileName.indexOf(`lnd-${platform}-${arch}-${VERSION}`) !== -1, 'Returns the correct filename')
        t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')
      })

      // Check download dir.
      .then(() => fs.stat(dir))
      .then((stats) => t.ok(stats, 'lnd was downloaded'))

      // Check binary.
      .then(() => fs.stat(path.join(dir, 'lnd.exe')))
      .then((stats) => t.ok(stats, `${platform} binary was downloaded`))

      // Cleanup.
      .finally(() => delete process.env.LND_BINARY_PLATFORM)
  )
})

test('Ensure Linux version gets downloaded', (t) => {
  t.plan(4)
  fs.removeSync(dir)

  process.env.LND_BINARY_PLATFORM = 'linux'
  const platform = 'linux'
  const arch = goenv.GOARCH

  return (
    install()
      // Check return values.
      .then((res) => {
        t.ok(res.fileName.indexOf(`lnd-${platform}-${arch}-${VERSION}`) !== -1, 'Returns the correct filename')
        t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')
      })

      // Check download dir.
      .then(() => fs.stat(dir))
      .then((stats) => t.ok(stats, 'lnd was downloaded'))

      // Check binary.
      .then(() => fs.stat(path.join(dir, 'lnd')))
      .then((stats) => t.ok(stats, `${platform} binary was downloaded`))

      // Cleanup.
      .finally(() => delete process.env.LND_BINARY_PLATFORM)
  )
})

test('Ensure OSX version gets downloaded', (t) => {
  t.plan(4)
  fs.removeSync(dir)

  process.env.LND_BINARY_PLATFORM = 'darwin'
  const platform = 'darwin'
  const arch = goenv.GOARCH

  return (
    install()
      // Check return values.
      .then((res) => {
        t.ok(res.fileName.indexOf(`lnd-${platform}-${arch}-${VERSION}`) !== -1, 'Returns the correct filename')
        t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')
      })

      // Check download dir.
      .then(() => fs.stat(dir))
      .then((stats) => t.ok(stats, 'lnd was downloaded'))

      // Check binary.
      .then(() => fs.stat(path.join(dir, 'lnd')))
      .then((stats) => t.ok(stats, `${platform} binary was downloaded`))

      // Cleanup.
      .finally(() => delete process.env.LND_BINARY_PLATFORM)
  )
})
