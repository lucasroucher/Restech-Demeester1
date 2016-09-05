const DATAVIEW_DIR = 'C:\\Restech\\DataView';
const DATA_DIR = DATAVIEW_DIR + '\\Data';
const SAMPLES_DIR = __dirname + '/data/*';
const MESSAGES_FILE = __dirname + '/messages/messages.tsv';

// This function gets run when the app is installed.
module.exports = function(app, done) {
    var shelljs = require('shelljs');

    shelljs.mkdir('-p', DATA_DIR);
    shelljs.cp('-nRf', SAMPLES_DIR, DATA_DIR);
    shelljs.cp(MESSAGES_FILE, DATAVIEW_DIR);

    done();
};
