#!/usr/bin/env node
// const utils = require('@tracy-cli-dev/utils')

// utils()
// console.log('hello tracy-cli-dev ~~~ 2222')
const importLocal = require('import-local')

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 tracy-cli 本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}