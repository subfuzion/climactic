var chalk = require('chalk'),
    path = require('path'),
    configloader = require('./configloader');

// use this for color function if not a terminal
function noop(text) {
  return text;
}

// init colors with defaults
var colors = {
  normal: chalk.white,
  important: chalk.yellow,
  app: chalk.cyan,
  terminal: chalk.red,
  help: chalk.cyan,
  data: chalk.cyan,
  promptPrefix: chalk.yellow,
  prompt: chalk.gray,
  input: chalk.gray,
  strong: chalk.white,
  light: chalk.gray,
  verbose: chalk.cyan,
  debug: chalk.blue,
  info: chalk.gray,
  warn: chalk.yellow,
  error: chalk.red,
  success: chalk.green
};

/**
 * Theme can be a filepath or a color function
 * @param config
 *   - {string} a yaml or json file (see themes/dark.yaml for example)
 *   - {function} a color function with that takes two args (key, text) and returns colored text
 */
function load(config) {
  var theme;

  if (typeof config === 'function') {
    Object.keys(colors).forEach(function(key) {
      colors[key] = function(text) {
        return config(key, text);
      };
    });

  } else {
    theme = configloader.loadSync(config);

    // update defaults with theme colors
    Object.keys(theme).forEach(function(key) {
      colors[key] = chalk[theme[key]];
    });
  }

  // override color functions with noop if not a terminal
  // regardless of config
  if (!process.stdout.isTTY) {
    Object.keys(colors).forEach(function(key) {
      colors[key] = noop;
    });
  }
}

// attempt to load dark theme from current process themes directory, else
// default to the dark theme located in in this package's themes directory
try {
  load(path.join(process.cwd(), 'themes', 'dark'));
} catch (err) {
  load(path.join(__dirname, '../../themes', 'dark'));
}

module.exports = {
  load: load,
  colors: colors
};

