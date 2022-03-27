'use strict';

const path = require('path')

function formatPath(p) {
    if (p && typeof p === 'string') {
        const sep = path.sep // 路径分隔符 mac / window \
        if (sep) {
            return p
        } else {
            return p.replace(/\\/g, '/')
        }
    }
}

module.exports = formatPath;
