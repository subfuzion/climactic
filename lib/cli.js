var commander = require('commander'),
    async = require('async'),
    fsx = require('fs-extra'),
    io = require('./io'),
    Context = require('./context'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    PluginManager = require('./pluginmanager'),
    ResourceManager = require('./resourcemanager'),
    context = {},
    pm,
    configloader = require('./io/configloader'),
    defaultConfig = {
        checkForUpdates: true,
        autoUpdate: true,
        theme: 'dark',
        disabled: []
    },
    theme = require('./io/theme');

function CLI(spec) {
    EventEmitter.call(this);

    this.spec = spec;
    this.config = defaultConfig;
}

util.inherits(CLI, EventEmitter);

module.exports = CLI;

// =====

CLI.prototype.loadConfig = function () {
    var themes;

    // if no config file has been specified, then bail out
    if (!this.spec.config){
        return;
    }

    try {
        // load config file and update this config, but ensure
        // missing values are provided by the default config
        this.config = configloader.loadSync(this.spec.config, defaultConfig);

        // if no disabled commands, then just ensure an empty array
        if (!this.config.disabled) this.config.disabled = [];

        // if the spec provides a custom themes path, ensure it
        // resolves to an absolute path; otherwise, default to
        // the process themes directory
        themes = this.spec.themes
            ? path.resolve(process.cwd(), this.spec.themes)
            : path.join(process.cwd(), this.spec.themes);

        // attempt to load any specified custom theme; report if
        // there is an error loading, but just continue with the
        // default theme and don't exit
        if (this.config.theme) {
            try {
                theme.load(path.join(themes, this.config.theme));
            } catch (err) {
                io.error('unable to load \'%s\' theme from \'%s\'', this.config.theme, themes);
            }
        }

    } catch (err) {
        io.error('unable to load \'%s\'', this.spec.config);
        this.emit('error');
    }
};

CLI.prototype.start = function (argv) {
    // create a 'context' that will be used to map commander
    // to command plugins and error handling
    // also relay 'error' event so the process can choose to
    // log, if desired, and exit
    var context = new Context(commander)
        .on('error', function (args) {
            this.emit('error', args);
        }.bind(this));


    // if a config file has been specified and exists, load it;
    // otherwise this will create a default config
    this.loadConfig();

    io.printBanner(this.spec.banner || 'CLI');

    pm = new PluginManager(context);
    pm.loadCommands();

    commander.version(this.spec.version || '0.0.0');
    commander.parse(argv);

};


