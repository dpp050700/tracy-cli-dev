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

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}

function getSemverVersions(baseVersion, versions) {
    return versions.filter(version => {
        return semver.satisfies(version, `^${baseVersion}`)
    }).sort((a, b) => {
        return semver.gt(b,a) ? 1 : -1
    })
}

async function getNpmSemverVersion(baseVersion,npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersions(baseVersion, versions)

    return newVersions[0]
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion
};
