var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');

var logger = require('./logger');
var settings = require('./settings');

var fileRegexp = /(.+) (\d{2}-\d{2}-\d{2})(\.modified)?\.txt$/i;

exports.find = function(query, callback) {
    settings.getDataDir(function(dataDir) {
        logger.log(`ensuring ${dataDir} exists`)
        mkdirp(dataDir, function(err) {
            if (err) {
                logger.log(`error creating ${dataDir}`);
            }
            fs.readdir(dataDir, function(err, files) {
                if (err) {
                    logger.log('error finding: ' + err);
                    return callback(err);
                }

                try {
                    logger.log(`found ${files.length} files`);

                    var matching = files
                        .filter(function(file) {
                            // require files to have a .txt extension
                            return (/.txt$/i).test(file);
                        })
                        .filter(function(file) {
                            // if query is defined, require files to contain the query text
                            return !query || queryMatches(query, file);
                        })
                        .map(function(file) {
                            var m = fileRegexp.exec(file);

                            if (m) {
                                return {
                                    file: file,
                                    name: m[1],
                                    date: parseDate(m[2]),
                                    modified: !!m[3]
                                };
                            }
                        })
                        .filter(Boolean)
                    ;

                    callback(null, matching);
                } catch (err) {
                    logger.log('catch: ' + err);
                    callback(err);
                }
            });
        });
    });
};

function queryMatches(query, file) {
    query = query.toLowerCase();

    var m = fileRegexp.exec(file);

    if (m) {
        var name = m[1];

        if (name.toLowerCase().indexOf(query) !== -1) return true;

        var dt = parseDate(m[2]).toDateString();

        if (dt.toLowerCase().indexOf(query) !== -1) return true;
    }

    return false;
}

function parseDate(str) {
    return new Date(2000 + parseInt(str.slice(6, 8)), parseInt(str.slice(0, 2)) - 1, parseInt(str.slice(3, 5)));
}

exports.save = function(data, callback) {
    callback = callback || function() {};
    var lines = data.split('\n');
    var name = ((lines[0] || '').trim() + ' ' + (lines[1] || '').trim()).trim();
    var dt = lines[2].trim();

    settings.getDataDir(function(dataDir) {
        mkdirp(dataDir, function(err) {
            var file = path.resolve(dataDir, name + ' ' + dt + '.txt');

            logger.log('archiving: ' + file);

            fs.exists(file, function(exists) {
                if (exists) {
                    logger.log('%s already exists', file);
                    file = file.replace(/(\.[^.]+)?$/, '.modified$&');
                }

                fs.writeFile(file, data, 'utf8', function(err) {
                    if (err) {
                        logger.log('error archiving: ' + err);
                        return callback(err);
                    }

                    logger.log('archived: ' + file);

                    callback(null);
                });
            });
        });
    });
};
