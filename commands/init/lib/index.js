const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');
const userHome = require('user-home');

const log = require('@tracy-cli-dev/log');
const Command = require('@tracy-cli-dev/command');
const Package = require('@tracy-cli-dev/package');
const { spinnerStart } = require('@tracy-cli-dev/utils');

const getProjectTemplate = require('./getProjectTemplate');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';
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
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find((item) => item.npmName === projectTemplate);
    const targetPath = path.resolve(userHome, '.tracy-cli-dev', 'template');
    const storePath = path.resolve(userHome, '.tracy-cli-dev', 'template', 'node_modules');
    const { npmName, version } = templateInfo;
    this.templateInfo = templateInfo;
    const templateNpm = new Package({
      targetPath,
      storePath,
      packageName: npmName,
      packageVersion: version,
    });
    if (!await templateNpm.exits()) {
      const spinner = spinnerStart('正在下载模板...');
      try {
        await templateNpm.install();
      } catch (error) {
        throw new Error(error);
      } finally {
        spinner.stop(true);
        if (await templateNpm.exits()) {
          log.success('模板下载成功');
          this.templateNpm = templateNpm;
        }
      }
    } else {
      const spinner = spinnerStart('正在更新模板...');
      try {
        await templateNpm.update();
      } catch (error) {
        throw new Error(error);
      } finally {
        spinner.stop(true);
        if (await templateNpm.exits()) {
          log.success('模板更新成功');
          this.templateNpm = templateNpm;
        }
      }
    }
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

  async installNormalTemplate() {
    const spinner = spinnerStart('正在安装模板...');
    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (error) {
      throw new Error(error);
    } finally {
      spinner.stop(true);
      log.success('模板按照成功');
    }
  }

  async installCustomTemplate() {
    console.log('install custom');
  }

  async installTemplate() {
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        await this.installCustomTemplate();
      } else {
        throw new Error('无法识别项目模板类型！');
      }
    } else {
      throw new Error('项目模板信息不存在');
    }
  }

  async exec() {
    try {
      const projectInfo = await this.prepare();
      if (projectInfo) {
        this.projectInfo = projectInfo;
        log.verbose(projectInfo);
        // 下载模版
        await this.downloadTemplate();
        // 安装模版
        await this.installTemplate();
      }
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
