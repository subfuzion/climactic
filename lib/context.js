var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    io = require('./io');

function Context(cli) {
  EventEmitter.call(this);
  this.cli = cli;
}

util.inherits(Context, EventEmitter);

module.exports = Context;

Context.prototype.register = function (command) {
  var spec, cmd, options;

  spec = command.spec();

  // create the command from the spec
  try {
    cmd = this.cli.command(spec.command);
    cmd.description(spec.description);

  } catch (err) {
    this.error("missing or invalid spec for '%s' command", command.name);
  }

  options = spec.options || [];
  if (typeof options === 'object' && !Array.isArray(options)) {
    options = [ options ]
  }

  options.forEach(function(option) {
    try {
      cmd.option(option.option, option.description);

    } catch (err) {
      this.error("unable to register '%s' option for '%s' command", option.name, command.name);
    }
  });

  try {

    /* TODO might want to pass along cleaned up options
    cmd.action(function () {
      command.execute.apply(command, Array.prototype.slice.call(arguments));
    });
    */

    cmd.action(command.execute.bind(command));

  } catch (err) {
    this.error(err.message);
  }
};

Context.prototype.error = function () {
  var args = Array.prototype.slice.call(arguments);
  io.error.apply(this, args);
  this.emit('error', util.format.apply(this, args));
};


