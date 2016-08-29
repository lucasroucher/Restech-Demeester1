function importFile(file, cb) {
    console.log('importing file: ' + file.name);

    var timer = startTimer();

    var reader = new FileReader();

    reader.onload = function(e) {
        var text = e.target.result;
        timer('file read');
        processText(text, cb);
    };

    reader.onerror = function(e) {
        console.log(e);
        alert('error: ' + e);
    };

    reader.readAsText(file, 'utf-8');
}

function processText(text, cb) {
    var study = parseFile(text);
    study.data = normalizeData(study);
    study.data.forEach(function(d, i) {
        d.index = i;
    });
    cb(study, text);
}

function parseFile(text) {
    var timer = startTimer();

    var lines = text.replace(/\r/g, '').split('\n');

    var result = {
        firstName: undefined,
        lastName: undefined,
        studyDate: undefined,
        patientNumber: undefined,
        dob: undefined,
        gender: undefined,
        weight: undefined,
        height: undefined,
        physician: undefined,
        refPhysician: undefined,
        symptomNames: undefined,
        //ppiAM: false,
        //ppiPM: false,
        //ppiDose: undefined,
        //h2Blocker: false,
        //h2Dose: undefined,
        armeds: undefined,
        indication: undefined,
        offset: 0,
        gain: 0,
        data: []
    };

    var parser = parseIntroLine;

    var lineNumber = 0;

    $.each(lines, function(i, line) {
        lineNumber++;

        // Does this line start a new [section]?
        if (line && line.charAt(0) === '[') {
            if (line === '[keys]') {
                parser = parseKeysLine;
            } else if (line === '[data]') {
                parser = parseDataLine;
            } else {
                parser = null;
            }

            lineNumber = 0;
        } else if (parser) {
            // We have a parser for this section so let it parse this line.
            parser(line, lineNumber);
        }
    });

    timer('parse time');

    console.log('offset: ' + result.offset);
    console.log('gain: ' + result.gain);
    console.log('data.length: ' + result.data.length);

    return result;

    // Parses the lines at the beginning of the file.
    function parseIntroLine(line, lineNumber) {
        switch (lineNumber) {
            case 1: result.lastName = line; break;
            case 2: result.firstName = line; break;
            case 3: result.studyDate = line; break;
            case 4: result.patientNumber = line; break;
            case 5: result.dob = line; break;
            case 6: result.gender = line; break;
            case 7: result.weight = line; break;
            case 8: result.height = line; break;
            case 9: result.physician = line; break;
            case 10: result.refPhysician = line; break;
        }
    }

    // Parses the lines in the [keys] section.
    function parseKeysLine(line, lineNumber) {
        switch (lineNumber) {
            case 1: parseSymptoms(line); break;
            case 2: parseExtraStuff(line); break;
            case 5: parseOffsetAndGain(line); break;
        }
    }

    // Parses the tab-separated symptom names.
    function parseSymptoms(line) {
        result.symptomNames = line.split('\t');
        var counter = 1;
        for (var i=0; i<result.symptomNames.length; i++){
          if (result.symptomNames[i].length < 1 ){
            result.symptomNames[i] = "Sx" + counter;
          }
          counter++;
        }
    }

    // This line used to hold a path to something like:
    //
    // E:\PatientData.txt
    //
    // I guess that's not being used so we're changing it to
    // hold extra stuff like the flags for PPI and H2 Blocker.
    //
    // The new format for this line looks like this:
    //
    // {"ppiAM":true,"ppiPM":false,"h2Blocker":true}
    function parseExtraStuff(line) {
        // Make sure the line looks like it's using the new format.
        if (line.charAt(0) === '{') {
            // Parse it.
            var props = JSON.parse(line);
            // Merge the values into the result object.
            for (var prop in props) {
                result[prop] = props[prop];
            }
        }
    }

    // Parses the offset and gain line.
    function parseOffsetAndGain(line) {
        // They have to start with a + or a -?
        if (line.charAt(0) === '+' || line.charAt(0) === '-') {
            var splits = line.split('\t');

            if (splits.length === 2) {
                result.offset = parseInt(splits[0], 10);
                result.gain = parseInt(splits[1], 10);
            }
        }
    }

    // Parses the lines in the [data] section.
    function parseDataLine(line, lineNumber) {
        var datum = line.split('\t');

        if (datum.length === 6) {
            var date = datum[2];
            var time = datum[1];

            var year = parseInt(date.slice(6, 8), 10) + 2000;
            var month = parseInt(date.slice(0, 2), 10) - 1;
            var day = parseInt(date.slice(3, 5), 10);
            var hour = parseInt(time.slice(0, 2), 10);
            var min = parseInt(time.slice(3, 5), 10);
            var sec = parseInt(time.slice(6, 8), 10);
            var when = new Date(year, month, day, hour, min, sec);

            result.data.push({
                line: lineNumber,
                when: when,
                rawVal: datum[0],
                val: parseFloat(datum[0]),
                meal: parseInt(datum[3], 10),
                supine: parseInt(datum[4], 10),
                symptom: parseInt(datum[5], 10)
            });
        }
    }
}

function makeFile(study) {
    if (console.time) {
        console.time('makeFile');
    }

    var data = [
        study.lastName,
        study.firstName,
        study.studyDate,
        study.patientNumber,
        study.dob,
        study.gender,
        study.weight,
        study.height,
        study.physician,
        study.refPhysician,
        '[keys]',
        study.symptomNames.join('\t'),
        JSON.stringify({
            //ppiAM: !!study.ppiAM,
            //ppiPM: !!study.ppiPM,
            //ppiDose: study.ppiDose,
            //h2Blocker: !!study.h2Blocker,
            //h2Dose: study.h2Dose,
            armeds: study.armeds,
            indication: study.indication,
            notes: study.notes,
            technician: study.technician
        }),
        //''//, // What is this number?
        //''//, // And this one?
        //'+' + (study.offset || 0) + '\t' + (study.gain || 0),
        //'[decipher]',
        //'', // removing these lines from PatientData.txt because the recorder inserts these and if they are there recorder thinks study already exists
        //'[data]',
        //''
    ];
	console.log("I'm in the reduced data Save File!!!");
	console.log("here is the study date" + study.studyDate);
    if (study.data) {
        data = data.concat(study.data.map(function(datum) {
            return [
                datum.rawVal || '00000',
                moment(datum.when).format('HH:mm:ss'),
                moment(datum.when).format('MM/DD/YY'),
                datum.meal,
                datum.supine,
                datum.symptom
            ].join('\t');
        }));
    }

    // Add line endings.
    var file = data.join('\r\n') + '\r\n';

    if (console.timeEnd) {
        console.timeEnd('makeFile');
    }

    return file;
}

function makeFileOrig(study) {
    if (console.time) {
        console.time('makeFile');
    }
	var sign = '+';
	if (study.offset < 0) {
		sign = '';
	}
	console.log("Sign is " + sign);
    var data = [
        study.lastName,
        study.firstName,
        study.studyDate,
        study.patientNumber,
        study.dob,
        study.gender,
        study.weight,
        study.height,
        study.physician,
        study.refPhysician,
        '[keys]',
        study.symptomNames.join('\t'),
        JSON.stringify({
            //ppiAM: !!study.ppiAM,
            //ppiPM: !!study.ppiPM,
            //ppiDose: study.ppiDose,
            //h2Blocker: !!study.h2Blocker,
            //h2Dose: study.h2Dose,
            armeds: study.armeds,
            indication: study.indication,
            notes: study.notes,
            technician: study.technician
        }),
        '', // What is this number?
        '', // And this one?
        sign + (study.offset || 0) + '\t' + (study.gain || 0),
        '[decipher]',
        '',
        '[data]',
        ''
    ];
	console.log("I made it to the OG save function");
    if (study.data) {
        data = data.concat(study.data.map(function(datum) {
            return [
                datum.rawVal || '00000',
                moment(datum.when).format('HH:mm:ss'),
                moment(datum.when).format('MM/DD/YY'),
                datum.meal,
                datum.supine,
                datum.symptom
            ].join('\t');
        }));
    }

    // Add line endings.
    var file = data.join('\r\n') + '\r\n';

    if (console.timeEnd) {
        console.timeEnd('makeFile');
    }

    return file;
}
