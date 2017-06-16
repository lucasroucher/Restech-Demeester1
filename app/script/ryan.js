function getRyanScore(study) {
    console.log('calculating RYAN score:');

    var dataWithoutMeals = getDataWithoutMeals(study);
    var fakeStudy = study;
    var studyTime = _.filter(dataWithoutMeals, function(d) { return d.val !== null; }).length * 500;

    console.log('data length before removing meals: ' + study.data.length);
    console.log('data length after removing meals: ' + dataWithoutMeals.length);

    var lt50 = getStatsForBaseline(5.0, dataWithoutMeals, fakeStudy);
    var lt55 = getStatsForBaseline(5.5, dataWithoutMeals, fakeStudy);

    console.log('supine events for RYAN:');
    console.log(lt50.supine);
    console.log('upright events for RYAN:');
    console.log(lt55.upright);

    var totalSupineTime = study.supineTime;
    var totalUprightTime = studyTime - study.supineTime;
    console.log('this is what is seen for supine time: ' + totalSupineTime);
    console.log('totalStudyTime: ' + formatDur(studyTime));
    console.log('totalSupineTime: ' + formatDur(totalSupineTime));
    console.log('totalUprightTime: ' + formatDur(totalUprightTime));

    var totalPercentTimeSupine  = lt50.supineTime / totalSupineTime;
    var numEventsSupine         = lt50.supine.length;
    var longestEventTimeSupine  = _.max(lt50.supine, function(event) { return event.dur; }).dur / 60 / 1000;
    var totalPercentTimeUpright = lt55.uprightTime / totalUprightTime;
    var numEventsUpright        = lt55.upright.length;
    var longestEventTimeUpright = _.max(lt55.upright, function(event) { return event.dur; }).dur / 60 / 1000;

    console.log('totalPercentTimeSupine: '  + totalPercentTimeSupine);
    console.log('numEventsSupine: '         + numEventsSupine);
    console.log('longestEventTimeSupine: '  + longestEventTimeSupine);
    console.log('totalPercentTimeUpright: ' + totalPercentTimeUpright);
    console.log('numEventsUpright: '        + numEventsUpright);
    console.log('longestEventTimeUpright: ' + longestEventTimeUpright);

    var div = Math.floor((studyTime / 60 / 60 / 1000 + 12) / 24);
    // Need to handle the case of Math.floor returning 0 to avoid Infinity readings
    if( div < 1 ){
		div = 1;
	}
	console.log("Study time is: " + studyTime);
    console.log('dividing time by: ' + div);

    var num1 = (((totalPercentTimeSupine * 100)         - 1.3299) / 6.89816)  + 1;
    var num2 = (((numEventsSupine / div)        - 0.5455) / 1.37192)  + 1;
    var num3 = (((longestEventTimeSupine)  - 2.9071) / 12.30695) + 1;
    var num4 = ((totalPercentTimeUpright        - 0.0146) / 0.05769)  + 1;
    var num5 = (((numEventsUpright / div)       - 0.2545) / 0.6727)   + 1;
    var num6 = (((longestEventTimeUpright) - 0.0675) / 0.27358)  + 1;

    // This hack is because they want Ryan score supine to be 2.17 for supine even if no events occurred ... now they want it to be '0' instead
    if (numEventsSupine == 0 ){
        num1=0;
        num2=0;
        num3 = 0;
    }

    //I am using less than 6000 because with no supine period totalSupineTime is 6000 ... probably from 60*1000 somewhere
    if (totalSupineTime <= 6000 ){
        num1=0;
        num2=0;
        num3 = NaN;
    }

    // This hack is because they want Ryan score upright to be 2.12 for upright even if no events occurred... now they want it to be '0' instead
    if ( numEventsUpright == 0 ){
        num4 = 0;
        num5 = 0;
        num6 = 0;
    }

    return {
        supine:  num1 + num2 + num3,
        upright: num4 + num5 + num6
    };
}

function getDataWithoutMeals(study) {
    return getDataWithoutMeals2(study);
}

function getDataWithoutMeals1(study) {
    return study.data.filter(function(datum) { return !datum.meal; });
}

var MEAL_BUFFER_TIME_IN_MS = 5 * 60 * 1000; // mins * secs * ms set it 5 minutes
var MEAL_BUFFER_COUNT = MEAL_BUFFER_TIME_IN_MS / TIME_PER_DATUM_IN_MS;

function getDataWithoutMeals2(study) {
    var newData = [];
    console.log("Meal Buffer Count is :" + MEAL_BUFFER_COUNT);
    for (var i = 0, n = study.data.length; i < n; i++) {
        var datum = study.data[i];

        if (datum.meal) {
            console.log("Made it in the datum.meal");
            // Need to add a non event value to the datum to end a possible event scenario

            if(i>MEAL_BUFFER_COUNT && study.data[i-MEAL_BUFFER_COUNT].val !== null) {
                console.log("Value = " + study.data[i-MEAL_BUFFER_COUNT].val);
                console.log("This is the iteration of the study with meal :: " + i);
                newData[newData.length - MEAL_BUFFER_COUNT-1].val = null;

            //console.log("Value in newData After buff " + newData[newData.length -MEAL_BUFFER_COUNT-1].val);
            //newData[i-MEAL_BUFFER_COUNT].datum.val=7.5;
            // Remove data before meal.
            // Need to add a case to combat the situation of the study not having 5 minutes to chop off at the start of the study if meal exists


                newData = newData.slice(0, -MEAL_BUFFER_COUNT);
              }

            // Skip meal.
            for (; i < n; i++) {
                if (!study.data[i].meal) break;
            }

            // Skip data after meal.
            i += MEAL_BUFFER_COUNT;
        } else {
            newData.push(datum);
        }
    }
    return newData;
}
