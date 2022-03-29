const Command = require('@tracy-cli-dev/command');

class InitCommand extends Command {

}

function init(...argv) {
  // console.log(projectName, cmdObj, process.env.CLI_TARGET_PATH);
  const initCommand = new InitCommand(argv);
  return initCommand;
}

module.exports = init;
