'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registryUrl, npmName)
    return axios.get(npmInfoUrl).then(res => {
        if (res.status === 200) {
            return res.data
        } else {
            return null
        }
    }).catch(error => {
        return Promise.reject(error)
    })
}

function getDefaultRegistry(isOriginal = true) {
    return isOriginal ?  'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

module.exports = {
    getNpmInfo
};
