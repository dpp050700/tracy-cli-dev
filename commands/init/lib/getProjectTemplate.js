const request = require('@tracy-cli-dev/request');

module.exports = () => request({
  url: '/project/getTemplate',
});
