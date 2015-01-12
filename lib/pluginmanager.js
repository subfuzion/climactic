var fs = require('fs'),
    path = require('path'),
    io = require('./io'),
    commands = [];

function CommandManager(context) {
  this.context = _context = context;

  var methods = ["init", "execute"];

  methods.forEach(function (method) {
    this[method] = function (command) {
      this.invoke(command, method);
    }.bind(this);
  }.bind(this));
}

module.exports = CommandManager;

var pm = CommandManager.prototype;


pm.invoke = function (command, method) {
  try {
    command[method]()
  } catch (err) {
    this.context.error('\'%s\' command %s failed', command.name, method);
  }
};


pm.loadCommands = function (commandPath) {
  var files, Command, c, name;

  commandPath = commandPath || path.join(process.cwd(), 'commands');

  try {
    files = fs.readdirSync(commandPath)
  } catch (err) {
    this.context.error(err.message);
  }

  files.forEach(function (f) {
    if (isValidCommandFile(f)) {
      name = path.basename(f, '.js');

      Command = require(path.join(commandPath, f));
      c = new Command(this.context, getCommandConfig(this.context, name));
      c.name = name;
      this.context.register(c);
      this.init(c);
      commands.push(c);
    }
  }.bind(this));

  return commands;
};


/**
 * Simple command file validation - just filter out any non-*.js files.
 * @param f {string} filename
 * @returns {boolean}
 */
function isValidCommandFile(f) {
  return f && path.extname(f) === '.js';
}


function getCommandConfig(context, name) {
  return context.config.commands && context.config.commands[name]
      ? context.config.commands[name]
      : {};
}
