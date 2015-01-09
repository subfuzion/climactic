var commander = require('commander'),
    async = require('async'),
    fsx = require('fs-extra'),
    io = require('./io'),
    Context = require('./context'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    PluginManager = require('./pluginmanager'),
    pm,
    configloader = require('./io/configloader'),
    defaultConfig = {
      checkForUpdates: true,
      autoUpdate: true,
      theme: 'dark',
      disabled: []
    },
    theme = require('./io/theme'),
    osenv = require('osenv'),
    _ = require('underscore');

function CLI(spec) {
  EventEmitter.call(this);

  this.spec = spec;
  this.config = defaultConfig;
}

util.inherits(CLI, EventEmitter);

module.exports = CLI;

// =====

/**
 * Kickstart the CLI (load config, commands, parse args, ...)
 * @param argv the process args vector
 */
CLI.prototype.start = function (argv) {
  // Create a 'context' that will be used to map commander
  // to command plugins and error handling
  // also relay 'error' event so the process can choose to
  // log, if desired, and exit
  this.context = new Context(commander)
      .on('error', function (args) {
        this.emit('error', args);
      }.bind(this));

  // If a config file has been specified and exists, load it;
  // otherwise this will create a default config.
  // We don't load config before this function to give the app an
  // opportunity to add an 'error' event listener to this object.
  this.context.config = loadConfig.call(this);

  io.printBanner(this.spec.banner || 'CLI');

  pm = new PluginManager(this.context);
  pm.loadCommands(this.context.config.commandpath);

  commander.version(this.spec.version || '0.0.0');
  commander.parse(argv);

  console.log('HELLO');
};

/**
 * Load configuration settings.
 *
 * Private function this context must be bound to cli instance.
 *
 * Configuration settings are loaded in the following
 * order (later settings override earlier settings):
 *   1. (cli-path)/(app-config-file)
 *   2. (cli-path)/(user-config-file)
 *   3. ($HOME/%USERPROFILE%>)/(user-config-file)
 *
 * NOTE:
 *   * app-config-file is specified in this.spec.config
 *   * user-config-file is specified in this.spec.preferences
 *
 * NOTE: it is conventional on unix-like systems to make
 * this a hidden file with a leading '.' (ex: '.appconfig');
 * however, it can be challenging for some users to create
 * files like this on Windows systems. Therefore, when a
 * file is specified with a leading '.', the load function
 * will attempt to find it, and if not present, will also
 * attempt to locate and load a file with the same name, but
 * no leading '.'.
 */
function loadConfig() {
  var config = defaultConfig,
      configFiles = [
        {
          file: this.spec.appconfig,
          path: process.cwd()
        },
        {
          file: this.spec.userconfig,
          path: process.cwd()
        },
        {
          file: this.spec.userconfig,
          path: osenv.home()
        }
      ],
      filepath, options, leadingDot, themepath;

  // Each subsequent file that is loaded will override previous.
  configFiles.forEach(function (configFile) {
    try {
      filepath = path.join(configFile.path, configFile.file);

      leadingDot = configFile.file.charAt(0) === '.';
      options = leadingDot ? {throws: true} : {};

      // Update config based on previous config values, which
      // will be updated by values in the loaded file, if present.
      config = configloader.loadSync(filepath, config, options);

    } catch (err) {
      if (leadingDot) {
        try {
          // Try stripping leading '.' and see if file can be loaded.
          filepath = path.join(configFile.path, configFile.file.substr(1));
          // On second attempt, we don't want to throw if file can't be loaded
          // since it is optional and we supply a default config anyway.
          config = configloader.loadSync(filepath, config, {throws: false});
        } catch (err) {
          io.error('unable to load either \'%s\' or \'%s\' at %s', configFile.file, configFile.file.substr(1), configFile.path);
          this.emit('error');
        }

      } else {
        io.error('unable to load \'%s\' at %s', configFile.file, configFile.path);
        this.emit('error');
      }
    }
  }.bind(this));

  // Sanitize settings, as necessary:
  // if no disabled commands, then just ensure an empty array.
  if (!config.disabled) config.disabled = [];

  // Add the spec (app settings that should not be overridden by config)
  // and save to this config
  config = _.extend(config, this.spec);
  this.config = config;

  // Load theme, if specified:
  // attempt to load any specified custom theme; report if
  // there is an error loading, but just continue with the
  // default theme and don't exit.
  if (config.theme) {
    // Resolve absolue path to themes directory:
    // if the config provides a custom themes path, ensure it
    // resolves to an absolute path; otherwise, default to
    // the process themes directory.
    themepath = config.themepath
        ? path.resolve(process.cwd(), config.themepath)
        : path.join(process.cwd(), config.themepath);

    try {
      theme.load(path.join(themepath, config.theme));
    } catch (err) {
      io.error('unable to load \'%s\' theme from \'%s\'', config.themepath, themepath);
    }
  }

  return config;
}


