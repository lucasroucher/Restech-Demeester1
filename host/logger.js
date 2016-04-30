var fs = require('fs');
var path = require('path');
var util = require('util');
var mkdirp = require('mkdirp');
var config = require('./config');

var LOGS_DIR = path.resolve(config.root);

mkdirp.sync(LOGS_DIR);

var LOG_FILE = path.resolve(LOGS_DIR, 'log.txt');

exports.log = function(msg) {
    if (arguments.length > 1) {
        msg = util.format.apply(util, arguments);
    }

    fs.appendFileSync(LOG_FILE, (msg || '').trimRight() + '\r\n', 'utf8');
}
