const Command = require('@tracy-cli-dev/command');
const log = require('npmlog');

class InitCommand extends Command {
  init() {
    this.projectName = this.argv[0];
    const opts = this.argv[1] || {};
    this.force = opts.force;
    log.verbose(`input projectName: ${this.projectName}`);
    log.verbose(`input force: ${this.force}`);
  }

  exec() {
    // console.log(this.force);
  }
}

function init(...argv) {
  // console.log(projectName, cmdObj, process.env.CLI_TARGET_PATH);
  const initCommand = new InitCommand(argv);
  return initCommand;
}

module.exports = init;
