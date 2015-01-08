var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    io = require('./io');

function Command(context) {
  EventEmitter.call(this);
  this.context = context;
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