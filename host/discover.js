var fs = require('fs');
var path = require('path');

var archive = require('./archive');
var logger = require('./logger');
var volumes = require('./volumes');

var PATIENT_FILE = 'PatientData.txt';
var DRIVES_TO_SKIP = [ 'A:', 'B:', 'C:' ];

module.exports = function(msg, push, done) {
    logger.log('getVolumes');

    volumes.getVolumes(function(err, volumes) {
        var count = 0;
        var found = [];

        // Accessing drives A: and B: are slow.
        volumes = volumes.filter(function(vol) {
            return DRIVES_TO_SKIP.indexOf(vol.path.toUpperCase()) === -1;
        });

        logger.log('volumes: ' + volumes.map(function(vol) {
            return vol.path + (vol.name ? '(' + vol.name + ')' : '');
        }));

        if (!volumes.length) {
            push({ type: 'noVolumes' });
            done();
            return;
        }

        (function checkVolume(i) {
            var vol = volumes[i];

            var inputPath = path.join(vol.path, PATIENT_FILE);

            logger.log('checking: ' + inputPath);

            fs.exists(inputPath, function(exists) {
                if (exists) {
                    logger.log('found: ' + inputPath);
                    if (msg.read) {
                        readFile();
                    } else if (msg.write) {
                        writeFile();
                    } else {
                        push({ type: 'found', path: inputPath });
                    }
                } else {
                    if (i < volumes.length - 1) {
                        checkVolume(i + 1);
                    } else {
                        logger.log('not found');
                        if (msg.write) {
                            logger.log('trying to find RESTECH volume');
                            var vol = volumes.filter(function(vol) {
                                return (vol.name || '').toUpperCase() === 'RESTECH';
                            })[0];
                            if (vol) {
                                logger.log('found RESTECH volume at ' + vol.path);
                                inputPath = path.join(vol.path, PATIENT_FILE);
                                writeFile();
                            } else {
                                logger.log('could not find RESTECH volume');
                                push({ type: 'notFound', searched: volumes.map(function(vol) { return vol.path; }) });
                            }
                        } else {
                            push({ type: 'notFound', searched: volumes.map(function(vol) { return vol.path; }) });
                        }
                        done();
                    }
                }
            });

            function readFile() {
                logger.log('reading: ' + inputPath);

                fs.readFile(inputPath, 'utf8', function(err, data) {
                    if (err) {
                        logger.log('error reading: ' + err);
                        return done(err);
                    }

                    // Save a copy in the archive.
                    archive.save(data);

                    logger.log('length: ' + data.length);
                    push({ type: 'found', path: inputPath, length: data.length });

                    // Max message size from host to app is 1MB.
                    // Send file to app in 512KB chunks.

                    var i = 0;
                    var chunkSize = 512 * 1024;

                    setImmediate(function pushChunk() {
                        push({ type: 'foundData', offset: i, data: data.slice(i, i + chunkSize) });

                        i += chunkSize;

                        if (i < data.length) {
                            setImmediate(pushChunk);
                        } else {
                            push({ type: 'foundEnd', path: inputPath });
                            done();
                        }
                    });
                });
            }

            function writeFile() {
                logger.log('writing: ' + inputPath);

                fs.writeFile(inputPath, msg.write, 'utf8', function(err, data) {
                    if (err) {
                        logger.log('error writing: ' + err);
                        return done(err);
                    }

                    push({ type: 'wrote', path: inputPath });
                    done();
                });
            }
        })(0);
    });
};
