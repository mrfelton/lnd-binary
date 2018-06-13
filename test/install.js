'use strict'

const test = require('tape')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const goenv = require('go-platform')
const checkAndDownloadBinary = require('../scripts/install').checkAndDownloadBinary

const version = 'v0.4.2-beta'
const dir = path.resolve(__dirname, '..', 'vendor')

test('Ensure lnd gets downloaded (current version and platform)', t => {
  t.plan(5)
  rimraf.sync(dir)
  checkAndDownloadBinary((err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`lnd-${goenv.GOOS}-${goenv.GOARCH}-${version}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'lnd should stat without error')
      t.ok(stats, 'lnd was downloaded')
    })
  })
})

test('Ensure Windows version gets downloaded', t => {
  t.plan(7)
  rimraf.sync(dir)
  process.env.LND_BINARY_PLATFORM = 'windows'
  checkAndDownloadBinary((err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`lnd-windows-${goenv.GOARCH}-${version}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'lnd for windows should stat without error')
      t.ok(stats, 'lnd for windows was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'lnd.exe'), (err2, stats2) => {
        t.error(err2, 'windows bin should stat without error')
        t.ok(stats2, 'windows bin was downloaded')
        delete process.env.LND_BINARY_PLATFORM
      })
    })
  })
})

test('Ensure Linux version gets downloaded', t => {
  t.plan(7)
  rimraf.sync(dir)
  process.env.LND_BINARY_PLATFORM = 'linux'
  checkAndDownloadBinary((err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`lnd-linux-${goenv.GOARCH}-${version}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'lnd for linux should stat without error')
      t.ok(stats, 'lnd for linux was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'lnd'), (err2, stats2) => {
        t.error(err2, 'linux bin should stat without error')
        t.ok(stats2, 'linux bin was downloaded')
        delete process.env.LND_BINARY_PLATFORM
      })
    })
  })
})

test('Ensure OSX version gets downloaded', t => {
  t.plan(7)
  rimraf.sync(dir)
  process.env.LND_BINARY_PLATFORM = 'darwin'
  checkAndDownloadBinary((err, res) => {
    t.ifErr(err)
    t.ok(res.fileName.indexOf(`lnd-darwin-${goenv.GOARCH}-${version}`) !== -1, 'Returns the correct filename')
    t.ok(res.installPath === path.resolve(path.join(__dirname, '..', 'vendor')), 'Returns the correct output path')

    fs.stat(dir, (err, stats) => {
      t.error(err, 'lnd for OSX should stat without error')
      t.ok(stats, 'lnd OSX linux was downloaded')
      // Check executable
      fs.stat(path.join(dir, 'lnd'), (err2, stats2) => {
        t.error(err2, 'OSX bin should stat without error')
        t.ok(stats2, 'OSX bin was downloaded')
        delete process.env.LND_BINARY_PLATFORM
      })
    })
  })
})
