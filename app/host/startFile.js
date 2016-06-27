var child_process = require('child_process');
var path = require('path');

const isDev = require('electron-is-dev');

var logger = require('./logger');

var startCommand = process.platform === 'win32'
    ? 'start ""'
    : 'open'
;

var availableFiles = {
    eula: 'DataView End User License Agreement.pdf',
    guide: 'DataView User Guide.pdf',
    score: 'DeMeester RYAN Score.pdf',
    normchart: 'Normative Data Chart.pdf'
};

module.exports = function(msg, push, done) {
    var file = availableFiles[msg.file];

    var dir = isDev ? path.join(__dirname, '../docs') : path.join(process.resourcesPath, 'app/docs');

    var cmd = startCommand + ' "' + path.join(dir, '../docs', file) + '"';

    logger.log('about to exec: %s', cmd);

    child_process.exec(cmd, function(err) {
        if (err) {
            logger.log('exec error: ' + err);
        }

        push({ type: 'fileStarted' });
        done();
    });
};
