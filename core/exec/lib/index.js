'use strict';

const path = require('path')

const Package = require('@tracy-cli-dev/package')
const log = require('@tracy-cli-dev/log')

const SETTINGS = {
    init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies'

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    let storePath = ''
    let pkg = null
    log.verbose('targetPath', targetPath)
    log.verbose('homePath', homePath)

    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'

    if (!targetPath) {
        targetPath = path.resolve(homePath,CACHE_DIR)
        storePath = path.resolve(homePath, 'node_modules')
        
        pkg = new Package({
            targetPath,
            storePath,
            packageName,
            packageVersion
        })
        if (pkg.exits()) {
            // 更新 package
        } else {
            // 安装 package
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            storePath,
            packageName,
            packageVersion
        })
    }
    const rootFile = pkg.getRootFilePath()
    if (rootFile) {
        require(rootFile)(...arguments) // require(rootFile).apply(null,...arguments)
    }

    
    // console.log(pkg.getRootFilePath())
}

module.exports = exec;
