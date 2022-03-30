const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const commander = require('commander');

const log = require('@tracy-cli-dev/log');
// const init = require('@tracy-cli-dev/init');
const exec = require('@tracy-cli-dev/exec');

const pkg = require('../package.json');
const constant = require('./const');

const program = new commander.Command();

async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;

  const { getNpmSemverVersion } = require('@tracy-cli-dev/get-npm-info');
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}， 当前版本号：${currentVersion}，最新版本号：${lastVersion}`));
  }
}

function checkPkgVersion() {
  log.notice('cli', pkg.version);
}

function checkRoot() {
  const rootCheck = require('root-check'); // process.geteuid()  为 0 是超级管理员
  rootCheck(); // 自动降级权限
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登陆用户的主目录不存在'));
  }
}

// function checkInputArgs() {
//   const minimist = require('minimist');
//   args = minimist(process.argv.slice(2));
//   checkArgs();
// }

// function checkArgs() {
//   if (args.debug) {
//     process.env.LOG_LEVEL = 'verbose';
//   } else {
//     process.env.LOG_LEVEL = 'info';
//   }
//   log.level = process.env.LOG_LEVEL;
// }

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig.cliHome = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  return cliConfig;
}

function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开始调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .option('-t, --test', '是否强制初始化项目')
    .action(exec);

  // 开启debug
  program.on('option:debug', () => {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose('test');
  });

  // 监听 targetPath
  program.on('option:targetPath', () => {
    const { targetPath } = program.opts() || {};
    process.env.CLI_TARGET_PATH = targetPath;
  });

  // 未知命令监听
  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error(colors.red(`未知的命令：${obj[0]}`));
    if (availableCommands.length > 0) {
      log.info(colors.white(`可用命令：${availableCommands.join(',')}`));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
  }
}

async function core() {
  try {
    checkPkgVersion();
    // checkNodeVersion(); // 检查 node 版本
    checkRoot(); // 检查是否 root 用户
    checkUserHome();
    // checkInputArgs()
    checkEnv(); // 检查环境变量
    await checkGlobalUpdate();
    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}

module.exports = core;
