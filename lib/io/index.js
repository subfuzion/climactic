var io = module.exports,
    shell = require('shelljs'),
    util = require('util'),
    prompt = require('prompt'),
    figlet = require('figlet'),
    colors = require('./theme').colors,
    info = require('../../package.json');

prompt.start();
prompt.message = colors.promptPrefix('[?] ');
prompt.delimiter = '';


io.print = console.log;

io.write = function () {
  process.stdout.write(util.format.apply(null, [].slice.call(arguments)));
};

io.info = function () {
  if (!arguments.length) return;
  var args = Array.prototype.slice.call(arguments),
      text = util.format.apply(null, args) || 'the operation succeeded';
  io.print('[%s] %s', colors.info('-'), text);
};

io.success = function () {
  if (!arguments.length) return;
  var args = Array.prototype.slice.call(arguments),
      text = util.format.apply(null, args);
  text = !text || text === 'undefined' ? 'the operation succeeded' : text;
  io.print('[%s] %s', colors.success('✓'), text);
};

io.error = function () {
  if (!arguments.length) return;
  var args = Array.prototype.slice.call(arguments),
      text = util.format.apply(null, args);
  text = !text || text === 'undefined' ? 'the operation failed' : text;
  io.print('[%s] %s', colors.error('✘'), colors.normal(text));
};

io.warn = function () {
  if (!arguments.length) return;
  var args = Array.prototype.slice.call(arguments),
      text = util.format.apply(null, args);
  io.print(colors.warn(text));
};

io.suggest = function () {
  if (!arguments.length) return;
  var args = Array.prototype.slice.call(arguments),
      text = util.format.apply(null, args);
  io.print(colors.normal('%s (try %s)'), colors.warn(text), colors.terminal('help'));
};

io.debug = function () {
  if (!arguments.length) return;
  var args = Array.prototype.slice.call(arguments),
      text = util.format.apply(null, args);
  io.print('[%s] %s', colors.terminal('DEBUG'), colors.debug(text));
}

io.printBanner = function (text, font) {
  var indent = createIndent(8),
      nodeVer = process.version;

  io.print(colors.app(figlet.textSync('  ' + text, {
    font: font || 'Standard',
    horizontalLayout: 'fitted'
  })));
  io.print();

  io.write(indent);
  io.print(colors.terminal('CLI v%s, Node %s'), info.version, nodeVer);
  io.print();
};

io.prompt = prompt;

function createIndent(spaces) {
  return (new Array(spaces)).join(' ');
}
