const path = require('path');

function formatPath(p) {
  if (p && typeof p === 'string') {
    const { sep } = path; // 路径分隔符 mac / window \
    if (sep) {
      return p;
    }
    return p.replace(/\\/g, '/');
  }
  return null;
}

module.exports = formatPath;
