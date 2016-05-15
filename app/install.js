const DATA_DIR = 'C:\\Restech\\DataView\\Data';
const SAMPLES_DIR = __dirname + '/data/*';

// This function gets run when the app is installed.
module.exports = function(app, done) {
    var shelljs = require('shelljs');

    shelljs.mkdir('-p', DATA_DIR);
    shelljs.cp('-nRf', SAMPLES_DIR, DATA_DIR);

    done();
};
