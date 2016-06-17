if (typeof chrome !== 'undefined' && chrome.runtime) {
    var application = 'com.restech.dataview';

    var CONFIG = {};

    function connect(handler, disconnect) {
        console.log('connecting');

        var port = chrome.runtime.connectNative(application);

        port.onMessage.addListener(handler);

        port.onDisconnect.addListener(function() {
            log({ type: 'disconnect' });

            if (disconnect) {
                disconnect();
            }
        });

        return port;
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
            callback(false);
        });

        send(port, req);
    }
}
