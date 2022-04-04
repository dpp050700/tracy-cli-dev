// const spinner = require('spinner');
const childProcess = require('child_process');

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function exec(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return childProcess.spawn(cmd, cmdArgs, options || []);
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on('error', (e) => {
      reject(e);
    });
    p.on('exit', (c) => {
      resolve(c);
    });
  });
}

function spinnerStart(msg, spinnerString = '|/-\\') {
  const Spinner = require('cli-spinner').Spinner;
  const spinner = new Spinner(`${msg}%s`);
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
}

module.exports = {
  isObject,
  spinnerStart,
  exec,
  execAsync,
};
