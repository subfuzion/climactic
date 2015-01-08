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
  var cmd;

  // create the command from the spec
  try {
    cmd = this.cli.command(command.spec().command);
  } catch (err) {
    this.error("missing spec for '%s' command", command.name);
  }

  try {
    cmd.action(command.execute);
  } catch (err) {
    this.error(err.message);
  }
};

Context.prototype.error = function () {
  var args = Array.prototype.slice.call(arguments);
  io.error.apply(this, args);
  this.emit('error', util.format.apply(this, args));
};


