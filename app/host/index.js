const ipcMain = require('electron').ipcMain;
const logger = require('./logger');

const handlers = {
    ping: require('./ping'),
    discover: require('./discover'),
    count: require('./count'),
    query: require('./query'),
    read: require('./read'),
    write: require('./write'),
    'read-settings': require('./settings').read,
    'write-settings': require('./settings').write,
    'startFile': require('./startFile')
};

ipcMain.on('message', function(event, msg) {
    if (msg && msg.type && msg.type in handlers) {
        logger.log('received ' + msg.type);
        handlers[msg.type](msg, push, done);
    } else {
        done();
    }

    function push(msg) {
        event.sender.send('reply', msg);
    }

    function done() {
    }
});
