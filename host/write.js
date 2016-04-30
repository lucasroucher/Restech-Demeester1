var fs = require('fs');
var path = require('path');

var archive = require('./archive');
var logger = require('./logger');

module.exports = function(msg, push, done) {
    var data = msg.data || '';

    logger.log('write: ' + JSON.stringify(data).slice(0, 60) + '...');

    if (msg.location === 'discover') {
        logger.log('not implemented yet');
    } else {
        archive.save(data, function(err) {
            if (err) {
                logger.log('error writing: ' + err);
                return done(err);
            }

            push({ type: 'wrote' });
            done();
        });
    }
};
