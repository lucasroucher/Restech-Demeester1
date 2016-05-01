var TIME_PER_DATUM_IN_MS = 500;
var FIVE_MINUTES_IN_MS = 5 * 60 * 1000; // mins * secs * ms
var MOVING_WINDOW_TIME_IN_MS = 15 * 60 * 1000; // mins * secs * ms
var PERCENT_THRESHOLD = 0.10;

var YDOMAIN;

function updateReport(study) {
    if (!study) return;

    if (!study.data) return;

    chartData(study, {
        container: '#reportChart',
        gutterHeight: 20,
        interactive: false,
        xTickFormat: '%H:%M',
        yDomain: YDOMAIN
    });

    var now = new Date();
    $('.auto-date').text(now.toLocaleDateString());

    $('#delMealsNote').hide();

    var unmodifiedStudy = study;
	console.log('EventMinTime :' + CONFIG.eventDuration + ' :: percent ' + CONFIG.eventPercentLevel );
    if (study.delMeals) {
        console.log('delete meals with padding: ' + study.delMeals);
        $('#delMealsNote').show();

        study = Object.create(study);

        study.data = study.data.slice();

        var padding = study.delMeals * 60 * 1000 / TIME_PER_DATUM_IN_MS;

        study.meals.forEach(function(meal) {
            var left = meal.start.index;
            var right = meal.end.index;

            left -= padding;
            right += padding;

            left = Math.max(left, 0);
            right = Math.min(right, study.data.length - 1);

            for (var i = left; i < right; i++) {
                var datum = study.data[i];

                study.data[i] = {
                    when: datum.when,
                    val: null,
                    meal: 0,
                    supine: 0,
                    symptom: 0
                };
            }
        });

        discoverPeriods(study);
    }

    var reportData = window.REPORT = getReportData(study.data, study);

    console.log('reportData:');
    console.log(reportData);

    $('tr.longest td')
        .eq(0).text(formatDur(reportData.lt65.longestEvent.dur)).end()
        .eq(1).text(formatDur(reportData.lt60.longestEvent.dur)).end()
        .eq(2).text(formatDur(reportData.lt55.longestEvent.dur)).end()
        .eq(3).text(formatDur(reportData.lt50.longestEvent.dur)).end()
        .eq(4).text(formatDur(reportData.percent.longestEvent.dur)).end()
    ;

    $('tr.total td')
        .eq(0).text(formatDur(reportData.lt65.totalTime)).end()
        .eq(1).text(formatDur(reportData.lt60.totalTime)).end()
        .eq(2).text(formatDur(reportData.lt55.totalTime)).end()
        .eq(3).text(formatDur(reportData.lt50.totalTime)).end()
        .eq(4).text(formatDur(reportData.percent.totalTime)).end()
    ;

    $('tr.total-upright td')
        .eq(0).text(formatDur(reportData.lt65.uprightTime)).end()
        .eq(1).text(formatDur(reportData.lt60.uprightTime)).end()
        .eq(2).text(formatDur(reportData.lt55.uprightTime)).end()
        .eq(3).text(formatDur(reportData.lt50.uprightTime)).end()
        .eq(4).text(formatDur(reportData.percent.uprightTime)).end()
    ;

    $('tr.total-supine td')
        .eq(0).text(formatDur(reportData.lt65.supineTime)).end()
        .eq(1).text(formatDur(reportData.lt60.supineTime)).end()
        .eq(2).text(formatDur(reportData.lt55.supineTime)).end()
        .eq(3).text(formatDur(reportData.lt50.supineTime)).end()
        .eq(4).text(formatDur(reportData.percent.supineTime)).end()
    ;

    $('tr.gt5 td')
        .eq(0).text(_.filter(reportData.lt65.all, function(e) { return e.dur > FIVE_MINUTES_IN_MS; }).length).end()
        .eq(1).text(_.filter(reportData.lt60.all, function(e) { return e.dur > FIVE_MINUTES_IN_MS; }).length).end()
        .eq(2).text(_.filter(reportData.lt55.all, function(e) { return e.dur > FIVE_MINUTES_IN_MS; }).length).end()
        .eq(3).text(_.filter(reportData.lt50.all, function(e) { return e.dur > FIVE_MINUTES_IN_MS; }).length).end()
        .eq(4).text(_.filter(reportData.percent.all, function(e) { return e.dur > FIVE_MINUTES_IN_MS; }).length).end()
    ;
    $('tr.totevent td')
    	.eq(0).text(reportData.lt65.all.length).end()
    	.eq(1).text(reportData.lt60.all.length).end()
    	.eq(2).text(reportData.lt55.all.length).end()
    	.eq(3).text(reportData.lt50.all.length).end()
    ;

    // var studyTime = _.filter(study.data, function(d) { return d.val !== null; }).length * 500;
    var studyTime = study.data[study.data.length - 1].when - study.data[0].when;

    console.log('studyTime is ' + studyTime);

    $('.study-dur').text(formatStudyDur(studyTime));
    //console.log('Will this time show up ' + formatStudyDur(167423000));

    $('#mealsRemoved').toggle(!!study.delMeals);

    $('tr.total-percent td')
        .eq(0).text(formatPercent(reportData.lt65.totalTime / studyTime)).end()
        .eq(1).text(formatPercent(reportData.lt60.totalTime / studyTime)).end()
        .eq(2).text(formatPercent(reportData.lt55.totalTime / studyTime)).end()
        .eq(3).text(formatPercent(reportData.lt50.totalTime / studyTime)).end()
        .eq(4).text(formatPercent(reportData.percent.totalTime / studyTime)).end()
    ;

    var uprightTime = studyTime - study.supineTime;

    var uprightPercents = [
        reportData.lt65.uprightTime / uprightTime,
        reportData.lt60.uprightTime / uprightTime,
        reportData.lt55.uprightTime / uprightTime,
        reportData.lt50.uprightTime / uprightTime
    ];

    var supinePercents = [
        reportData.lt65.supineTime / study.supineTime,
        reportData.lt60.supineTime / study.supineTime,
        reportData.lt55.supineTime / study.supineTime,
        reportData.lt50.supineTime / study.supineTime
    ];

    $('tr.total-percent-upright td')
        .eq(0).text(formatPercent(uprightPercents[0])).end()
        .eq(1).text(formatPercent(uprightPercents[1])).end()
        .eq(2).text(formatPercent(uprightPercents[2])).end()
        .eq(3).text(formatPercent(uprightPercents[3])).end()
        .eq(4).text(formatPercent(reportData.percent.uprightTime / uprightTime)).end()
    ;

    $('tr.total-percent-supine td')
        .eq(0).text(formatPercent(supinePercents[0])).end()
        .eq(1).text(formatPercent(supinePercents[1])).end()
        .eq(2).text(formatPercent(supinePercents[2])).end()
        .eq(3).text(formatPercent(supinePercents[3])).end()
        .eq(4).text(formatPercent(reportData.percent.supineTime / study.supineTime)).end()
    ;

    acidChart(study, {
        container: '#acidChart',
        width: 400,
        height: 500,
        uprightPercents: uprightPercents,
        supinePercents: supinePercents
    });
	console.log("Upright Normals : " + CONFIG.acidNormals.upright[0] + " : " + CONFIG.acidNormals.upright[1]);
    var ryan = getRyanScore(unmodifiedStudy);

    $('td.ryan-supine').text(ryan.supine.toFixed(2));
    $('td.ryan-upright').text(ryan.upright.toFixed(2));

    // SYMPTOM CORRELATIONS

    addCountsUnder(65, reportData.lt65.all);
    addCountsUnder(60, reportData.lt60.all);
    addCountsUnder(55, reportData.lt55.all);
    addCountsUnder(50, reportData.lt50.all);

    function addCountsUnder(what, events) {
        $('td.sym-cor-cough-' + what).text(countCorrelatedEvents(study, 1, events));
        $('td.sym-cor-heart-' + what).text(countCorrelatedEvents(study, 3, events));
        $('td.sym-cor-custom1-' + what).text(countCorrelatedEvents(study, 5, events));
        $('td.sym-cor-custom2-' + what).text(countCorrelatedEvents(study, 6, events));
        $('td.sym-cor-custom3-' + what).text(countCorrelatedEvents(study, 7, events));
    }

    $('td.sym-tot-cough').text(study.coughPeriods.length);
    $('td.sym-tot-heart').text(study.heartburnPeriods.length);
    $('td.sym-tot-custom1').text(study.symptoms[0].length);
    $('td.sym-tot-custom2').text(study.symptoms[1].length);
    $('td.sym-tot-custom3').text(study.symptoms[2].length);

    // PH CALCULATIONS

    var withoutNulls = _.filter(study.data, function(datum) {
        return typeof datum.val === 'number';
    });

    var min = _.min(withoutNulls, function(datum) {
        return datum.val;
    }).val;

    var mean = _.reduce(withoutNulls, function(sum, datum) {
        return sum + datum.val;
    }, 0) / withoutNulls.length;

    var max = _.max(withoutNulls, function(datum) {
        return datum.val;
    }).val;

    $('td.ph-min').text(min.toFixed(2));
    $('td.ph-mean').text(mean.toFixed(2));
    $('td.ph-max').text(max.toFixed(2));
}

function countCorrelatedEvents(study, value, events) {
    var count = 0;
    events = events.slice();

    for (var i = 0, n = study.data.length; i < n; i++) {
        var datum = study.data[i];

        if (datum.val === null) continue;

        if (datum.symptom == value) {
            if (hasCorrelatedEvent(events, datum.when)) {
                count++;
            }
        }
    }

    return count;
}

function hasCorrelatedEvent(events, when) {
    var before = +when - FIVE_MINUTES_IN_MS;
    var after = +when + FIVE_MINUTES_IN_MS;
    var found = _.find(events, function(e) {
        return before <= e.end.when && e.start.when <= after;
    });
    if (found) {
        // console.log('correlated event for symptom at ' + when + ':');
        // console.log(found);
        events.splice(events.indexOf(found), 1);
        return true;
    }
}

function formatDur(dur) {
    if (!dur) { return '0:00'; }
    dur = moment.duration(dur);
    var s = dur.hours() + ':';
    if (dur.minutes() < 10) {
        s += '0';
    }
    return s + dur.minutes();
}

function formatStudyDur(dur) {
    if (!dur) { return '0:00'; }
    dur = moment.duration(dur);
    return Math.floor(dur.asHours()) + moment.utc(dur).format(":mm:ss");

}


function formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
}

function getReportData(data, study) {
    return {
        lt65: getStatsForBaseline(6.5, data, study),
        lt60: getStatsForBaseline(6.0, data, study),
        lt55: getStatsForBaseline(5.5, data, study),
        lt50: getStatsForBaseline(5.0, data, study),
        percent: getPercentBasedEvents(data, study)
    };
}

function getStatsForBaseline(baseline, data, study) {
    var events = getEventsUnder(baseline, data);
    return getEventStats(events, data, study);
}

function getEventsUnderOriginal(baseline, data) {
    var events = [];

    var datum;
    var startIndex = null;
    var endIndex;
    var endTime;
    var endEventThreshold = baseline + CONFIG.endEventThreshold;

    for (var i = 0, n = data.length; i < n; i++) {
        datum = data[i];

        // skip holes
        if (datum.val === null) continue;

        // is this the start or continuation of an event?
        if (datum.val < baseline) {
            // if an event hasn't started, this is it
            if (startIndex === null) {
                startIndex = i;
            }

            // reset the end time to ignore random measurements above baseline
            endTime = datum.when.getTime() + (CONFIG.minEventTime * 1000);
        } else if (startIndex !== null && datum.when >= endTime) {
            // this is the end of the event
            events.push({
                start: data[startIndex],
                end:   datum,
                dur:   datum.when - data[startIndex].when
            });

            // reset to find the next event
            startIndex = null;
        }
    }

    if (startIndex !== null) {
        events.push({
            start: data[startIndex],
            end:   data[data.length - 1],
            dur:   data[data.length - 1].when - data[startIndex].when
        });
    }

    return events;
}

function getEventsUnder(baseline, data) {
    var events = [];

    var datum;
    var startIndex = null;
    var endIndex = null;
    var endEventThreshold = baseline + +CONFIG.endEventThreshold;
    var thresholdStartTime = null;

    for (var i = 0, n = data.length; i < n; i++) {
        datum = data[i];

        // skip holes
        if (datum.val === null) continue;

        // is this the start or continuation of an event?
        if (datum.val < baseline) {
            // if an event hasn't started, this is it
            if (startIndex === null) {
                startIndex = i;
            }

            // start or keep looking for a possible end to this event
            endIndex = null;
            thresholdStartTime = null;
        } else if (startIndex !== null && datum.val >= baseline) {
            if (endIndex === null) {
                endIndex = i;
            }

            if (datum.val >= endEventThreshold) {
                if (thresholdStartTime === null) {
                    // the value has to stay above the threshold for minEventTime seconds
                    // minEventTime should really be named minThresholdEventTime or whatever
                    thresholdStartTime = datum.when;
                } else if ((datum.when - thresholdStartTime) >= (CONFIG.minEventTime * 1000)) {
                    // this is the end of the event
                    events.push({
                        start: data[startIndex],
                        end:   data[endIndex],
                        dur:   data[endIndex].when - data[startIndex].when
                    });

                    // reset to find the next event
                    startIndex = null;
                    endIndex = null;
                    thresholdStartTime = null;
                }
            } else {
                // reset the threshold start time
                thresholdStartTime = null;
            }
        }
    }

    if (startIndex !== null) {
        events.push({
            start: data[startIndex],
            end:   data[data.length - 1],
            dur:   data[data.length - 1].when - data[startIndex].when
        });
    }
    //console.log("There are " + events.length + " events for the baseline " + baseline + " :-)");
    return events;
}

function getPercentBasedEvents(data, study) {
    var events = [];

    var WINDOW_SIZE = MOVING_WINDOW_TIME_IN_MS / TIME_PER_DATUM_IN_MS;

    var sum = data[0].val;
    var len = 1;
    var avg = data[0].val;
    var threshold;

    for (var i = 1, n = data.length; i < n; i++) {
        var datum = data[i];

        updateStats();

        if (datum.val < threshold) {
            // console.log('detected percent based event at ' + datum.when);

            var startIndex = i;
            var expectedEndTime = datum.when.getTime() + CONFIG.eventDuration;

            // Now loop forward until the event ends.
            for (; i < n; i++) {
                datum = data[i];

                updateStats();

                if (datum.val < threshold) {
                    expectedEndTime = datum.when.getTime() + CONFIG.eventDuration;
                } else if (datum.when > expectedEndTime) {
                    break;
                }
            }

            var endIndex = i - 1;

            events.push({
                start: data[startIndex],
                end: data[endIndex],
                dur: data[endIndex].when.getTime() - data[startIndex].when.getTime()
            });
        }
    }

    console.log('%-based events:');
    console.log(events);

    return getEventStats(events, data, study);

    function updateStats() {
        sum += datum.val;
        len++;

        if (len > WINDOW_SIZE && i >= WINDOW_SIZE) {
            var lastDatum = data[i - WINDOW_SIZE];
            sum -= lastDatum.val;
            len = WINDOW_SIZE;
        }

        avg = sum / len;

        threshold = avg * (1 - CONFIG.eventPercentLevel);
    }
}

function getEventStats(events, data, study) {
    var stats = {
        longestEvent: _.max(events, function(event) { return event.dur; }),
        totalTime:    _.reduce(events, function(sum, event) { return sum + event.dur; }, 0),
        all:          events,
        upright:      _.filter(events, function(event) { return !event.start.supine; }),
        supine:       _.filter(events, function(event) { return event.start.supine; }),
        uprightTime:  getAdjustedUprightTime(),
        supineTime:   getAdjustedSupineTime()
    };

    return stats;

    function getAdjustedUprightTime() {
        var dur = 0;

        events.forEach(function(e) {
            dur += e.dur;

            study.supines.forEach(function(sup) {
                if (dateRangesOverlap(sup, e)) {
                    dur -= dateRangeDuration(dateRangeIntersection(sup, e));
                }
            });
        });

        return dur;
    }

    function getAdjustedSupineTime() {
        var dur = 0;

        events.forEach(function(e) {
            study.supines.forEach(function(sup) {
                if (dateRangesOverlap(sup, e)) {
                    dur += dateRangeDuration(dateRangeIntersection(sup, e));
                }
            });
        });

        return dur;
    }

    function dateRangesOverlap(range1, range2) {
        return range1.start.when <= range2.end.when && range2.start.when <= range1.end.when;
    }

    function dateRangeIntersection(range1, range2) {
        return {
            start: { when: new Date(Math.max(range1.start.when.getTime(), range2.start.when.getTime())) },
            end: { when: new Date(Math.min(range1.end.when.getTime(), range2.end.when.getTime())) }
        };
    }

    function dateRangeDuration(range) {
        return range.end.when.getTime() - range.start.when.getTime();
    }
}
