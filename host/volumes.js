var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

exports.getVolumes = function(cb) {
    if (process.platform === 'win32') {
        var cmd = 'wmic logicaldisk get caption,volumename';

        child_process.exec(cmd, function(err, stdout, stderr) {
            if (err) { return cb(err); }

            var volumes = stdout.split('\r\n')
                .slice(1)                                        // Skip the "Caption" line
                .map(function(volume) { return volume.trim(); }) // Trim whitespace
                .filter(function(volume) { return !!volume; })   // Remove empty lines
                .map(function(volume) {
                    var m = /(\S+)(\s+(.+))?/.exec(volume);

                    return {
                        path: m && m[1] || volume,
                        name: m && m[3]
                    };
                })
            ;

            cb(null, volumes);
        });
    } else if (process.platform === 'darwin') {
        fs.readdir('/Volumes', function(err, files) {
            if (err) { return cb(err); }

            cb(null, files.map(function(file) {
                return {
                    path: path.join('/Volumes', file),
                    name: undefined
                };
            }));
        });
    } else {
        cb(new Error('unsupported platform (' + process.platform + ')'));
    }
};
