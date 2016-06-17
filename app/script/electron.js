if (window.require) {
    // http://electron.atom.io/docs/faq/#i-can-not-use-jqueryrequirejsmeteorangularjs-in-electron
    window.nodeRequire = require;
    delete window.require;
    delete window.exports;
    delete window.module;

    var ipcRenderer = nodeRequire('electron').ipcRenderer;

    var CONFIG = {};

    var CONNECTED = [];
    var CURRENT_CONNECTION = null;

    ipcRenderer.on('reply', function(event, msg) {
        if (CONNECTED.length) {
            CONNECTED[0].handler(msg);
        }
    });

    function connect(handler, disconnect) {
        console.log('connecting');

        var connection = { handler, disconnect, pending: [] };

        CONNECTED.push(connection);

        return {
            postMessage: function(msg) {
                if (CONNECTED[0] === connection) {
                    ipcRenderer.send('message', msg);
                } else {
                    connection.pending.push(msg);
                }
            },

            disconnect: function() {
                if (disconnect) {
                    disconnect();
                }

                CONNECTED.shift();

                var nextConnection = CONNECTED[0];

                if (nextConnection) {
                    nextConnection.pending.forEach(function(msg) {
                        ipcRenderer.send('message', msg);
                    });
                }
            }
        };
    }

    function send(port, msg) {
        log(msg, 'sending');
        port.postMessage(msg);
    }

    function disconnect(port) {
        console.log('disconnecting');
        port.disconnect();
    }

    // connects, sends request, disconnects, calls back with response
    function request(req, callback) {
        var port = connect(function(res) {
            log(res, 'received');
            disconnect(port);
            callback(res);
        }, function() {
            //callback(false);
        });

        send(port, req);
    }
}
