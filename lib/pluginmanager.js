var fs = require('fs'),
    path = require('path'),
    io = require('./io'),
    commands = [];

function CommandManager(context) {
  this.context = _context = context;

  var methods = [ "init", "execute" ];

  methods.forEach(function(method) {
    this[method] = function(command) {
      this.invoke(command, method);
    }.bind(this);
  }.bind(this));
}

module.exports = CommandManager;
var pm = CommandManager.prototype;


pm.invoke = function(command, method) {
  try {
    command[method]()
  } catch (err) {
    this.context.error('\'%s\' command %s failed', command.name, method);
  }
};


pm.loadCommands = function(commandPath) {
  var files, Command, p;

  commandPath = commandPath || path.join(process.cwd(), 'commands');

  try {
    files = fs.readdirSync(commandPath)
  } catch (err) {
    this.context.error(err.message);
  }

  files.forEach(function(f) {
    if (isValidCommandFile(f)) {
      Command = require(path.join(commandPath, f));
      p = new Command(this.context);
      p.name = path.basename(f, '.js');
      this.context.register(p);
      this.init(p);
      commands.push(p);
    }
  }.bind(this));

  return commands;
};


/**
 * Simple command file validation - just filter out any non-*.js files
 * @param f {string} filename
 * @returns {boolean}
 */
function isValidCommandFile(f) {
  return f && path.extname(f) === '.js';
}

