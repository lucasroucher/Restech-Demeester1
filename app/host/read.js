var fs = require('fs');
var path = require('path');

var archive = require('./archive');
var logger = require('./logger');
var settings = require('./settings');

module.exports = function(msg, push, done) {
    logger.log('read: ' + msg.file);

    settings.getDataDir(function(dataDir) {
        var inputPath = path.resolve(dataDir, msg.file);
        logger.log('inputPath: ' + inputPath);

        if (inputPath.indexOf(dataDir) !== 0) {
            return done(new Error('hacks!'));
        }

        fs.readFile(inputPath, 'utf8', function(err, data) {
            if (err) {
                logger.log('error reading: ' + err);
                return done(err);
            }

            logger.log('length: ' + data.length);
            push({ type: 'fileBegin', path: inputPath, length: data.length });

            // Max message size from host to app is 1MB.
            // Send file to app in 512KB chunks.

            var i = 0;
            var chunkSize = 512 * 1024;

            setImmediate(function pushChunk() {
                push({ type: 'fileData', offset: i, data: data.slice(i, i + chunkSize) });

                i += chunkSize;

                if (i < data.length) {
                    setImmediate(pushChunk);
                } else {
                    push({ type: 'fileEnd', path: inputPath });
                    done();
                }
            });
        });
    });
};
