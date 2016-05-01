var path = require('path');

exports.root = process.platform === 'win32'
    ? 'C:\\Restech\\DataView'
    : path.resolve(__dirname, '..')
;
