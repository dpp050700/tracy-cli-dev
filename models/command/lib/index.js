/* eslint-disable class-methods-use-this */
const semver = require('semver');
const colors = require('colors/safe');
const log = require('@tracy-cli-dev/log');

const LOWEST_NODE_VERSION = '12.0.0';

class Command {
  constructor(argv) {
    this.argv = argv;
    if (!argv) {
      throw new Error('参数不能为空');
    }

    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！');
    }

    if (argv.length < 1) {
      throw new Error('参数列表为空！');
    }

    new Promise(() => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((error) => {
        log.error(error.message);
      });
    });
  }

  initArgs() {
    // this.cmd = this.argv[this.argv.length - 1];
    // this.argv = this.argv.slice(0, this.argv.length - 1);
    // this.argv = this.argv;
  }

  checkNodeVersion() {
    const currentVersion = process.version;
    if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
      throw new Error(colors.red(`tracy-cli 需要安装 ${LOWEST_NODE_VERSION} 以上 node 版本`));
    }
  }

  init() {
    throw new Error('init 必须实现');
  }

  exec() {
    throw new Error('exec 必须实现');
  }
}

module.exports = Command;
