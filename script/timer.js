function startTimer() {
    var start;

    var timer = function(message) {
        var end = +new Date();
        var elapsed = end - start;
        console.log(message + ': ' + elapsed + 'ms');
        return this;
    };

    timer.start = timer.restart = function() {
        start = +new Date();
        return this;
    };

    return timer.start();
}
