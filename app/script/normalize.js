function normalizeData(study) {
    var offset = study.offset;
    var gain = study.gain;
    var data = study.data;
    var TwentyFourHoursInMillis = 24 * 60 * 60 * 1000;
    var fiveMinutesInMillis = 5 * 60 * 1000;
    var validDateWindow = 60 * 60 * 60 * 1000; // hours * mins * secs * ms
    var results = [];

    if (!data.length) {
        // Nothing to normalize so GTFO.
        return results;
    }

    var skipped = 0;
    var badPH = 0;
    var firstWhen = data[0].when;
    // If the dates are the same, sort by line number, else sort by the dates.
    //data.sort(function(a, b) { return a.when === b.when ? a.lineNumber - b.lineNumber : a.when - b.when; });

	/* I commented out the above line because it was causing some unwanted behavior on 2015.10.29.
	   I believe this was originally in here for some other problem prevention but I do not recall the reason.
	   It would probably have been better to figure out what is causing the strange initial supine remnant from the
	   bad date ( or outside the window date ) problem */

    var lastWhen;
    var whenAdjustment;

    console.log('First: ' + firstWhen);

    var dataWithGoodDates = data.filter(function(d) {
        var diffFromFirstWhen = Math.abs(d.when.getTime() - firstWhen.getTime());

        return diffFromFirstWhen < validDateWindow;
    });

    console.log('entries with bad dates: ' + (data.length - dataWithGoodDates.length));

    data = dataWithGoodDates;

    $.each(data, function(i, d) {
        if (!lastWhen || (d.when.getTime() !== lastWhen.getTime())) {
            lastWhen = d.when;
            whenAdjustment = 0;
        } else {
            whenAdjustment += 500;
            d.when = new Date(d.when.getTime() + whenAdjustment);
        }
    });

	var pHOffset = -0.0000022; // use this if study goes over 24hr and increment each pH val by offset
	var currentpHOffset = 0;

    $.each(data, function(i, d) {
        if (d.val > 1400 || d.val < 150) {
            skipped++;
        } else {
            d.val = pH(d.val, gain, offset);
			// Add if statement here for 24 hour offset
			if (d.when - firstWhen >= TwentyFourHoursInMillis) {
			   currentpHOffset += pHOffset;
			   d.val = d.val + currentpHOffset;
			}

            if (d.val < 1 || d.val > 14) {
                badPH++;

                if (i > 0) {
                    d.val = data[i - 1].val;
                }
            }

            results.push(d);
        }
    });

    console.log('entries with values above threshold: ' + skipped);
    console.log('entries with bad pH values: ' + badPH);
    console.log('pH offset: ' + currentpHOffset);

    // null out first 5 minutes because reasons
    var countUpTo5Minutes = 0;

    $.each(data, function(i, d) {
        d.val = null;

        countUpTo5Minutes += 500;

        if (countUpTo5Minutes >= fiveMinutesInMillis) {
            return false;
        }
    });

    discoverPeriods(study);

    study.totalSupineTime = _.reduce(study.data, function(sum, d) { return sum + (d.supine ? 1 : 0); }, 0) * 500;
	  return results;
}

function pH(value, gain, offset) {
    // Multiply and then divide to try to prevent rounding errors.
    var mul = 10;
    var result = ((value / gain) * mul - (offset / 100) * mul - 0.4 * mul) / mul;
    //console.log("Result from val " + value + " gain of " + gain + " offset of " + offset + "equals = " + result);
    return result;
}

function discoverPeriods(study) {
    study.meals = findPeriods(study, 'meal');

    study.supines = findPeriods(study, 'supine');
    study.supineTime = _.reduce(study.supines, function(sum, period) { return sum + getPeriodDuration(period); }, 0);

    normalizeSymptoms(study, 1);
    normalizeSymptoms(study, 3);
    normalizeSymptoms(study, 7);
    normalizeSymptoms(study, 6);
    normalizeSymptoms(study, 5);

    study.coughPeriods = findPeriods(study, 'symptom', 1);
    study.heartburnPeriods = findPeriods(study, 'symptom', 3);

    study.symptoms = [];
    study.symptoms[0] = findPeriods(study, 'symptom', 7);
    study.symptoms[1] = findPeriods(study, 'symptom', 6);
    study.symptoms[2] = findPeriods(study, 'symptom', 5);

    console.log('meals: ' + study.meals.length);
    console.log('supines: ' + study.supines.length);
    console.log('coughs: ' + study.coughPeriods.length);
    console.log('heartburns: ' + study.heartburnPeriods.length);
    console.log('symptom 1: ' + study.symptoms[0].length);
    console.log('symptom 2: ' + study.symptoms[1].length);
    console.log('symptom 3: ' + study.symptoms[2].length);
}

function getPeriodDuration(period) {
    // return period.count * 500;
    return period.end.when.getTime() - period.start.when.getTime();
}

function findPeriods(study, type, value) {
    var periods = [];

    var start;
    var startIndex;
    var count = 0;

    for (var i = 0; i < study.data.length; i++) {
        var datum = study.data[i];

        if (start && (!datum[type] || datum.val === null)) {
            periods.push({ start: start, startIndex: startIndex, end: datum, endIndex: i, count: count });
            start = null;
            count = 0;
        } else if (!start && datum[type]) {
            if (!value || (parseInt(datum[type], 10) === value)) {
                start = datum;
                startIndex = i;
                count = 1;
            }
        } else {
            if (datum.val !== null) {
                count++;
            }
        }
    }

    if (start) {
        periods.push({ start: start, startIndex: startIndex, end: study.data[study.data.length - 1], endIndex: study.data.length - 1, count: count });
    }

    return periods;
}

function normalizeSymptoms(study, value) {
    var removed = 0;
    for (var i = 0, n = study.data.length; i < n; i++) {
        var datum = study.data[i];
        if (datum.symptom == value) {
            var end = i + 5 * 60 * 2; // mins * secs * twice a second
            for (i++; i < n && i < end; i++) {
                datum = study.data[i];
                if (datum.symptom == value) {
                    removed++;
                    datum.symptom = 0;
                }
            }
        }
    }
    console.log('removed ' + removed + ' button ' + value + ' presses');
}
