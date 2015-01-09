var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    _ = require('underscore');

var defOptions = {
  exactMatch: false,
  encoding: 'utf8'
};


/**
 * Will attempt to load file exactly matching the supplied
 * filepath argument, or else with a .yaml extension, or
 * else a .json extension, in that order, unless
 * options.exactMatch=true
 *
 * @param filepath {string} path to config file
 * @param config {object} default configuration
 * @param options {object}
 *     - exactMatch: {boolean} default=false
 *     - encoding: {string} default='utf8'
 *     - throws: {boolean} default=false (will not throw on
 *       on load errors if a default config is supplied)
 */
exports.loadSync = function (filepath, config, options) {
  var doc, error, yamlOptions;

  // override valid defaults with any supplied options
  options = _.extend(defOptions, options || {});

  // attempt to load the file, trying alternate extensions on error
  try {
    doc = fs.readFileSync(filepath, {encoding: options.encoding});
  } catch (err) {
    // save the original error before attempting other file extensions
    error = err;

    // if the filename already specifically included an extension than rethrow
    if (path.extname(filepath)) {
      throw error;
    }

    // otherwise, attempt to find a .yaml or .json file with the name
    try {
      doc = fs.readFileSync(filepath + '.yaml', {encoding: options.encoding});
    } catch (err) {
      try {
        doc = fs.readFileSync(filepath + '.json', {encoding: options.encoding});
      } catch (err) {
        // if a default config was supplied, return it
        if (config && !options.throws) {
          return config;
        }

        // otherwise, throw the error that failed with the original filepath
        throw error;
      }
    }
  }

  yamlOptions = {
    filename: filepath
    // TODO onWarning: function
  }

  // should safely load either yaml or json file and override
  // any default config values, if supplied
  return _.extend(config || {}, yaml.safeLoad(doc, yamlOptions));
};


