'use strict';

const path = require('path')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
// const userHome = require('user')

const { isObject } = require('@tracy-cli-dev/utils')
const formatPath = require('@tracy-cli-dev/format-path')
const { getDefaultRegistry } = require('@tracy-cli-dev/get-npm-info')

class Package {
    constructor(options) {
        if (!options ) {
            throw new Error('Package 类的 options 参数不能为空！')
        }
        if (!isObject(options)) {
            throw new Error('Package 类的 options 必须为对象类型')
        }
        // package 路径
        this.targetPath = options.targetPath
        // package 的存储路径
        this.storePath = options.storePath
        // package 的 name
        this.packageName = options.packageName
        // package 的 version
        this.packageVersion = options.packageVersion
    }
    // 判断是否存在
    exits() {
        
    }
    // 安装
    install() { 
        npminstall({
            root: this.targetPath,
            storeDir: this.storePath,
            registry: getDefaultRegistry(),
            pkgs: [
                {name: this.packageName, version: this.packageVersion}
            ]
        })
    }
    // 更新
    update() { }

    //获取入口文件
    getRootFilePath() {
        // 获取 package.json 所在目录 pkg-dir
        const dir = pkgDir(this.targetPath)
        if (dir) {
            // 读取 package.json
            const pkgFile = require(path.resolve(dir, 'package.json'))
            // main/lib
            const entryPath = pkgFile.main || pkgFile.lib

            // 路径的兼容 （macos/windows）
            if (pkgFile && entryPath) {
                return formatPath(path.resolve(dir, entryPath))
            }
        }
        return null
    }
}

module.exports = Package;
