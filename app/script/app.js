function log(msg, dir) {
    var str = JSON.stringify(msg);
    console.log((dir ? dir + ': ' : '') + str.slice(0, 80) + (str.length > 80 ? '...' : ''));
}

$('#retrieveLink').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $('#retrievingModal').modal('show');

    var port = connect(handle);
    send(port, { type: 'discover', read: true });

    var foundPath = '';
    var foundLength = 0;
    var foundData = '';

    function handle(msg) {
        log(msg);

        switch (msg.type) {
            case 'found':
                foundPath = msg.path;
                foundLength = msg.length;
                console.log('foundPath: ' + foundPath);
                console.log('foundLength: ' + foundLength);
                break;
            case 'foundData':
                foundData += msg.data;
                break;
            case 'foundEnd':
                console.log('foundData.length: ' + foundData.length);
                //Totally lame way to check to see if there is actual pH vals in the file they are retrieving ... this will change
                if ( foundData.length > 5000 ){
                    processText(foundData, displayStudy);
                }
                else {
                     bootbox.alert({
                                      title: 'Sorry',
                                      message: 'There was no data in the retrieved file.'
                     });
                 }

                $('#retrievingModal').modal('hide');
                done();
                break;
            case 'noVolumes':
                bootbox.alert('No drives. =(');
                done();
            case 'notFound':
                bootbox.alert({
                    title: Globalize.formatMessage('noData/title'),
                    message: Globalize.formatMessage('noData/text')
                });
                $('#retrievingModal').modal('hide');
                done();
        }
    }

    function done() {
        disconnect(port);
    }
});

var archiveCount;

$('#openLink').on('click', function(e) {
    $('#openFile').hide();
    $('#openFileList').show();
    $('#openStudy').val('');

    var port = connect(function(msg) {
        console.log(msg);
        disconnect(port);
        $('.archive-count').text(msg.results);
        archiveCount = msg.results;
    });

    send(port, { type: 'count' });

    sendQuery('');
});

$('#openModal').on('shown.bs.modal', function() {
    $('#openStudyFilter').focus();
});

$('#openStudyFilter').on('input', _.debounce(function(e) {
    var val = $('#openStudyFilter').val();
    sendQuery(val);
}, 250));

function sendQuery(val) {
    console.log('sending query');
    request({ type: 'query', value: val }, setLinks);
}

function setLinks(res) {
    $('#openStudyLinks').empty();

    if (res && res.results) {
        res.results.forEach(function(file) {
            $('#openStudyLinks').append(
                $('<a href="#" class="list-group-item clearfix">')
                .data('file', file.file)
                .append($('<span class="pull-left">').text(file.name + (file.modified ? ' (modified)' : '')))
                .append($('<span class="pull-right">').text(new Date(file.date).toDateString()))
            );
        });

        $('#fileCountMessage').text(Globalize.formatMessage('fileCountMessage', {
            displayCount: res.results.length,
            archiveCount: archiveCount
        }));
    } else {
        $('#fileCountMessage').text(Globalize.formatMessage('fileCountMessage', {
            displayCount: 0,
            archiveCount: archiveCount
        }));
    }
}

$('#openStudyLinks').on('click', 'a', function(e) {
    e.preventDefault();

    readFile($(this).data('file'));

    $('#openModal').modal('hide');
});

function readFile(file) {
    var port = connect(handle);

    send(port, { type: 'read', file: file });

    var filePath = '';
    var fileLength = 0;
    var fileData = '';

    function handle(msg) {
        log(msg);

        switch (msg.type) {
            case 'fileBegin':
                filePath = msg.path;
                fileLength = msg.length;
                console.log('filePath: ' + filePath);
                console.log('fileLength: ' + fileLength);
                break;
            case 'fileData':
                fileData += msg.data;
                break;
            case 'fileEnd':
                console.log('fileData.length: ' + fileData.length);
                processText(fileData, displayStudy);
                done();
                break;
        }
    }

    function done() {
        disconnect(port);
    }
}

$(document).on('newFile', function(e, study) {
    request({ type: 'discover' }, function(res) {
        if (res && res.type === 'found') {
            bootbox.dialog({
                title: 'File exists',
                message: 'Overwrite?',
                buttons: {
                    no: {
                        label: "No, cancel saving",
                        className: "btn-default",
                        callback: function() {
                        }
                    },
                    yes: {
                        label: "Yes, overwrite it",
                        className: "btn-primary",
                        callback: function() {
                            saveIt();
                        }
                    }
                }
            });
        } else if (res && res.type === 'notFound') {
            saveIt();
        }
    });

    function saveIt() {
        $('#savingModal').one('shown.bs.modal', function() {
            setTimeout(function() {
                var file = makeFile(study);
                // console.log(file.split('\r\n'));

                console.time('saveFile');

                request({ type: 'discover', write: file }, function(res) {
                    console.timeEnd('saveFile');
                    $('#savingModal').modal('hide');
                    log(res);
                    if (res && res.type === 'notFound') {
                      bootbox.alert('No Restech Data Card Found.  Please insert the Data Card into the USB Card Reader');
                    }
                });
            }, 250);
        }).modal('show');
    }
});

$('#about').click(function(e, study) {
        console.log("Earl is the man");
        $('#helpModal').modal('hide');
        $('#aboutModal').modal('show');

});

$('#licenseAgreement').click(function(e, study) {
    // $('#helpModal').modal('hide');
    // $('#aboutModal').modal('show');

    request({ type: 'startFile', file: 'eula' }, function(res) {
        log(res);
    });
});

$('#userGuide').click(function(e, study) {
    // $('#helpModal').modal('hide');
    // $('#userGuideModal').modal('show');

    request({ type: 'startFile', file: 'guide' }, function(res) {
        log(res);
    });
});

$('#normativeChart').click(function(e, study) {

    request({ type: 'startFile', file: 'normchart' }, function(res) {
        log(res);
    });
});

$('#calcRyan').click(function(e, study) {

    request({ type: 'startFile', file: 'score' }, function(res) {
        log(res);
    });
});

$(document).on('saveFile', function(e, study) {
    console.log('handling saveFile event');

    if (!study) return;

    $('#savingModal').one('shown.bs.modal', function() {
        setTimeout(function() {
            var file = makeFileOrig(study);
            // console.log(file.split('\r\n'));

            console.time('saveFile');
            console.log("I'm in this place!!!");

            request({ type: 'write', data: file }, function(res) {
                console.timeEnd('saveFile');
                $('#savingModal').modal('hide');
                log(res);
            });
        }, 250);
    }).modal('show');
});

var gotPong = false;

request({ type: 'ping' }, function(res) {
    if (res && res.type === 'pong') {
        gotPong = true;
    }

    checkPong();
});

function checkPong() {
    if (!gotPong) {
        bootbox.alert({
            title: 'Sorry',
            message: 'Native host not detected. Please install.'
        });
    } else {
        readSettings();
    }
}

function readSettings() {
    console.log('reading settings');

    request({
        type: 'read-settings'
    }, function(res) {
        console.log('settings read');
        console.log(res.settings);

        CONFIG = res.settings;

        updateSettingsOnPage();

        var desiredLocale = res.settings.locale || 'en';
        var currentLocale = Globalize.locale();

        if (!currentLocale || currentLocale.locale !== desiredLocale) {
            updateLocale(desiredLocale);
        }
    });
}

function updateLocale(desiredLocale) {
    CHANGE_LOCALE(desiredLocale).then(function() {
        console.log('locale changed to ' + desiredLocale + ', updating messages');

        $('[data-loc-text]').each(function() {
            var $this = $(this);
            var key = $this.data('locText');

            if (key) {
                var text = Globalize.formatMessage(key);

                if (!text) {
                    console.error('message key not found %s', key);
                }

                $this.text(text);
            }
        });
    });
}

function writeSettings(settings, callback) {
    console.log('writing settings');
    console.log(settings);

    request({
        type: 'write-settings',
        settings: _.omit(settings, 'defaults')
    }, function(res) {
        console.log('settings written');

        readSettings();

        if (callback) {
            callback();
        }
    });
}

function updateSettingsOnPage() {
    $('.custom-img').prop('src', CONFIG.img);
    $('.custom-line1').text(CONFIG.name);
    $('.custom-line2').text(CONFIG.address);
    $('.custom-line3').text(CONFIG.city + ', ' + CONFIG.state + ' ' + CONFIG.zip);
    $('.custom-line4').text(CONFIG.phone);
    $('.settings-eventDuration').text(CONFIG.eventDuration);
    //$('.custom-line4').text(CONFIG.phone);
    console.log('Log CONFIG : ' + CONFIG.eventDuration);

    updateColors();
}

function updateColors() {
    var styleSheet = [].filter.call(document.styleSheets, function(ss) { return ss.href.indexOf('/colors.css') !== -1; })[0];

    if (!styleSheet) { return; }

    console.log(styleSheet);

    Object.keys(CONFIG.colors || {}).forEach(function(color) {
        var sel = '.' + color;
        var rule = [].filter.call(styleSheet.rules, function(rule) { return rule.selectorText === sel; })[0];
        var newColor = CONFIG.colors[color];

        if (rule && newColor) {
            rule.style.setProperty('fill', newColor, 'important');
            rule.style.setProperty('background-color', newColor, 'important');
        }
    });
}

$('#notes-area').on('input', function() {
    if (window.study) {
        window.study.notes = $(this).val();
    }
});
