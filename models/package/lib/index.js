const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const pathExists = require('path-exists').sync;
const fsExtra = require('fs-extra');

const { isObject } = require('@tracy-cli-dev/utils');
const formatPath = require('@tracy-cli-dev/format-path');
const { getDefaultRegistry, getNpmLatestVersion } = require('@tracy-cli-dev/get-npm-info');

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package 类的 options 参数不能为空！');
    }
    if (!isObject(options)) {
      throw new Error('Package 类的 options 必须为对象类型');
    }
    // package 路径
    this.targetPath = options.targetPath;
    // package 的存储路径
    this.storePath = options.storePath;
    // package 的 name
    this.packageName = options.packageName;
    // package 的 version
    this.packageVersion = options.packageVersion;
    // package 的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  async prepare() {
    if (this.storePath && !pathExists(this.storePath)) {
      fsExtra.mkdirpSync(this.storePath); // 如果目录不存在创建目录
    }

    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    return this.getSpecificCacheFilePath(this.packageVersion);
    // return path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
  }

  // 判断是否存在
  async exits() {
    if (this.storePath) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    }
    return pathExists(this.targetPath);
  }

  // 安装
  install() {
    npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion },
      ],
    });
  }

  // 更新
  async update() {
    await this.prepare();
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: getDefaultRegistry(),
        pkgs: [
          { name: this.packageName, version: latestPackageVersion },
        ],
      });
      this.packageVersion = latestPackageVersion;
    }
  }

  // 获取入口文件
  getRootFilePath() {
    function getRootFile(targetPath) {
      // 获取 package.json 所在目录 pkg-dir
      const dir = pkgDir(targetPath);
      if (dir) {
        // 读取 package.json
        const pkgFile = require(path.resolve(dir, 'package.json'));
        // main/lib
        const entryPath = pkgFile.main || pkgFile.lib;
        // 路径的兼容 （macos/windows）
        if (pkgFile && entryPath) {
          return formatPath(path.resolve(dir, entryPath));
        }
      }
      return null;
    }

    if (this.storePath) {
      return getRootFile(this.cacheFilePath);
    }
    return getRootFile(this.targetPath);
  }
}

module.exports = Package;
