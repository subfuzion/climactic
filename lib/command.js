var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    io = require('./io');

function Command(context, options) {
  EventEmitter.call(this);
  this.context = context;
  this.config = options;
}

util.inherits(Command, EventEmitter);

module.exports = Command;

// ====================================

/**
 * This is an optional function to override
 */
Command.prototype.init = function() {};

Command.prototype.info = function() {
  var args = Array.prototype.slice.call(arguments);
  io.info.apply(this, args);
};

Command.prototype.error = function() {
  var args = Array.prototype.slice.call(arguments);
  io.error.apply(this, args);
  process.exit(1);
};

Command.prototype.getCommandConfig = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(this);
  return this.context.getCommandConfig.apply(this.context, args);
};

Command.prototype.getAppConfig = function() {
  return this.context.getAppConfig.apply(this.context, arguments);
};
