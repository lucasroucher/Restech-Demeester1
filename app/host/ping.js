module.exports = function(msg, push, done) {
    msg.type = 'pong';
    push(msg);
    done();
};
