const path = require('path');

const Package = require('@tracy-cli-dev/package');
const log = require('@tracy-cli-dev/log');

const SETTINGS = {
  init: '@tracy-cli-dev/init',
};

const CACHE_DIR = 'dependencies';

async function exec(...argv) {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storePath = '';
  let pkg = null;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);

  const cmdObj = argv[argv.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storePath = path.resolve(homePath, 'node_modules');

    pkg = new Package({
      targetPath,
      storePath,
      packageName,
      packageVersion,
    });
    if (await pkg.exits()) {
      // 更新 package
      await pkg.update();
    } else {
      // 安装 package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      storePath,
      packageName,
      packageVersion,
    });
  }
  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    // eslint-disable-next-line import/no-dynamic-require
    require(rootFile)(...argv); // require(rootFile).apply(null,...arguments)
  }
}

module.exports = exec;
