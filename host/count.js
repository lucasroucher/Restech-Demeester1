var fs = require('fs');
var path = require('path');

var archive = require('./archive');
var logger = require('./logger');

module.exports = function(msg, push, done) {
    archive.find(msg.value, function(err, results) {
        if (err) {
            push({ error: err.message || err });
        } else {
            push({ results: results.length });
        }

        done();
    });
};
