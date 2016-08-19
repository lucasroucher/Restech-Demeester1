var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var config = require('./config');
var defaults = require('./defaults');
var logger = require('./logger');

var settingsPath = path.resolve(config.root, 'settings.json');
var defaultDataDir = path.resolve(config.root, 'data');

module.exports = exports = {
    load: function(done) {
        fs.readFile(settingsPath, { encoding: 'utf8' }, function(err, data) {
            var parsed = (function() {
                try { return JSON.parse(data); }
                catch (err) { return {}; }
            })();

            var settings = _.defaults(parsed, defaults);

            settings.defaults = defaults;

            done(settings);
        });
    },

    read: function(msg, push, done) {
        logger.log('reading settings from ' + settingsPath);

        exports.load(function(settings) {
            push({ type: 'read-settings', settings: settings });

            done();
        });
    },

    write: function(msg, push, done) {
        var settings = msg.settings || {};

        logger.log('writing settings to ' + settingsPath);

        fs.readFile(settingsPath, { encoding: 'utf8' }, function(err, existingData) {
            var parsed = (function() {
                try { return JSON.parse(existingData); }
                catch (err) { return {}; }
            })();

            for (var key in settings) {
                parsed[key] = settings[key];
            }

            for (var key in defaults) {
                if (!parsed.hasOwnProperty(key)) {
                    parsed[key] = defaults[key];
                }
            }

            fs.writeFile(settingsPath, JSON.stringify(parsed, null, 2), { encoding: 'utf8' }, function(err) {
                if (err) {
                    logger.log('error writing settings: ' + err);

                    return done(err);
                }

                push({ type: 'wrote-settings' });

                done();
            });
        });
    },

    getDataDir: function(done) {
        exports.load(function(settings) {
            done(settings.dataDir ? settings.dataDir : defaultDataDir);
        });
    }
};
