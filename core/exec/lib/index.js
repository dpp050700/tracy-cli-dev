const path = require('path');

const Package = require('@tracy-cli-dev/package');
const log = require('@tracy-cli-dev/log');
const { exec: spawn } = require('@tracy-cli-dev/utils');

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
    storePath = path.resolve(targetPath, 'node_modules');

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
    try {
      const code = `require('${rootFile}').apply(null, ${JSON.stringify(argv.slice(0, argv.length - 1))})`;
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      child.on('error', (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on('exit', (e) => {
        log.verbose(`命令执行成功：${e}`);
        process.exit(e);
      });
      // eslint-disable-next-line import/no-dynamic-require
      // require(rootFile)(...argv);
    } catch (error) {
      log.error(error.message);
    }
  }
}

module.exports = exec;
