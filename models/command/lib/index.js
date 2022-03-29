/* eslint-disable class-methods-use-this */
const semver = require('semver');
const colors = require('colors/safe');

const LOWEST_NODE_VERSION = '12.0.0';

class Command {
  constructor(argv) {
    this.argv = argv;
    new Promise(() => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain.catch(() => {
        // log();
      });
    });
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
