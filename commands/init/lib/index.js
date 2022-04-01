const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');

const log = require('@tracy-cli-dev/log');
const Command = require('@tracy-cli-dev/command');

const getProjectTemplate = require('./getProjectTemplate');

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

  createTemplateChoice() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
  }

  async getProjectInfo() {
    let projectInfo = {};

    function validProjectName(v) {
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
    }

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
      const project = await inquirer.prompt(
        [
          {
            type: 'input',
            name: 'projectName',
            message: '请输入项目的名称',
            default: '',
            validate(v) {
              const done = this.async();
              setTimeout(() => {
                if (!validProjectName(v)) {
                  done('项目名称格式不正确');
                  return;
                }
                done(null, true);
              }, 0);
            },
          },
          {
            type: 'input',
            name: 'projectVersion',
            message: '请输入项目的版本号',
            default: '1.0.0',
            validate(v) {
              const done = this.async();
              setTimeout(() => {
                if (!semver.valid(v)) {
                  done('请输入合法的版本号');
                  return;
                }
                done(null, true);
              }, 0);
            },
            filter(v) {
              if (semver.valid(v)) {
                return semver.valid(v);
              }
              return v;
            },
          },
          {
            type: 'list',
            name: 'projectTemplate',
            message: '请选择项目模板',
            choices: this.createTemplateChoice(),
          },
        ],
      );
      projectInfo = { type, ...project };
    } else {
      projectInfo = {};
    }
    return projectInfo;
  }

  async downloadTemplate() {
    // const res = await getProjectTemplate();
    // console.log(res);
  }

  async prepare() {
    const template = await getProjectTemplate();
    if (!template || template.length === 0) {
      throw new Error('项目模板不存在');
    }
    this.template = template;
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
        ]);
        if (!ifContinue) {
          return null;
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

      if (!confirmDelete) {
        return null;
      }

      fse.emptyDirSync(localPath);
    }
    return this.getProjectInfo();
  }

  async exec() {
    try {
      const res = await this.prepare();
      log.verbose(res);
      this.downloadTemplate();
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
