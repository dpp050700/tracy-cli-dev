const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const log = require('@tracy-cli-dev/log');
const Command = require('@tracy-cli-dev/command');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class InitCommand extends Command {
  init() {
    this.projectName = this.argv[0];
    const opts = this.argv[1] || {};
    this.force = opts.force;
    log.verbose(`input projectName: ${this.projectName}`);
    log.verbose(`input force: ${this.force}`);
  }

  isDirEmpty(dirPath) {
    let fileList = fs.readdirSync(dirPath);
    fileList = fileList.filter((file) => (
      !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    ));
    return fileList.length === 0;
  }

  async getProjectInfo() {
    let projectInfo = {};

    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [
        { name: '项目', value: TYPE_PROJECT },
        { name: '组件', value: TYPE_COMPONENT },
      ],
    });
    log.verbose(type);
    if (type === TYPE_PROJECT) {
      projectInfo = await inquirer.prompt(
        [
          {
            type: 'input', name: 'projectName', message: '请输入项目的名称', validate() { return true; },
          },
          {
            type: 'input', name: 'projectVersion', message: '请输入项目的版本号', validate() { return true; },
          },
        ],
      );
    } else {
      projectInfo = {};
    }
    console.log(projectInfo);
    return projectInfo;
  }

  async prepare() {
    const localPath = process.cwd();
    // 判断当前目录是否为空
    if (!this.isDirEmpty(localPath)) {
      if (!this.force) {
        const { ifContinue } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'ifContinue',
            message: '当前文件夹不为空，是否继续创建项目？',
            default: false,
          },
          /* Pass your questions in here */
        ]);
        if (!ifContinue) {
          return;
        }
      }

      const { confirmDelete } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmDelete',
          message: '继续创建将清空当前文件夹下所有内容，是否确认？',
          default: false,
        },
      ]);

      if (confirmDelete) {
        fse.emptyDirSync(localPath);
      }
    }
    Promise.resolve(this.getProjectInfo());
    // return this.getProjectInfo();
  }

  async exec() {
    try {
      await this.prepare();
    } catch (error) {
      log.error(error.message);
    }
  }
}

function init(...argv) {
  const initCommand = new InitCommand(argv);
  return initCommand;
}

module.exports = init;
