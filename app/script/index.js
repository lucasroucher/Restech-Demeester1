$(function() {

    $.fn.output = function(str) {
        if (str) {
            this.text(str.charAt(0).toUpperCase() + str.slice(1));
        } else {
            this.html('&nbsp;');
        }

        return this;
    };

    $('body').removeClass('before-ready');

    // window.onerror = function(msg, url, line) {
    //     console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + line);
    //
    //     return false;
    // };

    function displayStudy(study) {
        window.study = study;
        // console.log("This is after I select a file from open?????");
        //essentially want cmd undoables.length=0
        cmds.clearUndoables();
        console.log(study);

        $('button[data-cmd="flagDelMeals"]').text('Delete Meals');

        $('#patientName').text(study.firstName + ' ' + study.lastName);
        $('.study-lastName').output(study.lastName);
        $('.study-firstName').output(study.firstName);
        $('.study-date').text(study.studyDate);
        $('.study-patientNumber').output(study.patientNumber);
        $('.study-dob').output(study.dob);
        $('.study-gender').text(study.gender);
        $('.study-weight').text(study.weight);
        $('.study-height').text(study.height);
        $('.study-physician').output(study.physician);
        $('.study-refPhysician').output(study.refPhysician);

        $('.symptom1name').output(study.symptomNames[0] || 'Symptom 1');
        $('.symptom2name').output(study.symptomNames[1] || 'Symptom 2');
        $('.symptom3name').output(study.symptomNames[2] || 'Symptom 3');

        $('#study-reason').text(study.reasonForStudy);

        $('.ppi-am-checkbox').prop('checked', study.ppiAM);
        $('.ppi-am-checkbox').prop('checked', study.ppiAM);

        $('.study-indications').text(study.indication);
        $('.study-armeds').text(study.armeds);

        chartData(study);


        $('#chart').removeClass('hide');


        $('#importing').hide().addClass('hide');

        $('#openModal').modal('hide');

        cmds.hideReport();

    }

    window.displayStudy = displayStudy;

    $('#file, #openFileInput').change(function(e) {
        if (this.files && this.files.length) {
            var file = this.files[0];

            if (file) {
                console.log('file selected');
                console.log(file);

                $('#importing').show().removeClass('hide');

                importFile(file, displayStudy);
            }

            this.value = null;
        } else {
            clearChart();
            cmds.hideReport();
        }
    });

    var retrievedStudy;
    var retrievedStudyText;
    var retrievedStudyName;

    $('#retrieving').hide();

    $('#retrieveFile').change(function(e) {
        if (this.files && this.files.length) {
            var file = this.files[0];

            if (file) {
                $('#retrieving').show();

                importFile(file, function(study, text) {
                    $('#retrieving').hide();

                    console.log('we got this:');
                    console.log(study);

                    retrievedStudy = study;
                    retrievedStudyText = text;
                    retrievedStudyName = study.lastName + ' ' + study.firstName + ' ' + study.studyDate + '.txt';

                    $('#retrieveMessage').html('Save as: <a href="#" class="saveAs">' + retrievedStudyName + '</a>');
                });
            }
        } else {
            // Clear?
        }
    });

    $('#retrieveModal').on('click', 'a.saveAs', function(e) {
        e.preventDefault();

        var blob = new Blob([ retrievedStudyText ]);
        saveAs(blob, retrievedStudyName);

        $('#retrieveModal').modal('hide');
    });

    $('#legend').on('click', '[data-flag]', function(e) {
        var $cb = $(this);
        var flag = $cb.data('flag');
        toggleFlags(flag, this.checked);
    });

    $('#legend').on('click', '[data-flag-all]', function(e) {
        $('[data-flag]').prop('checked', this.checked).each(function() {
            toggleFlags($(this).data('flag'), this.checked);
        });
    });

    $(document).on('click', '[data-cmd]', function(e) {
        e.preventDefault();
        var cmd = cmds[$(this).data('cmd')];
        if (cmd) {
            cmd(this, window.study);
        }
    });

    $('.date-dd').each(function() {
        for (var i = 1; i <= 31; i++) {
            $('<option>').text(i).appendTo(this);
        }
    });

    $('.date-mm').each(function() {
        for (var i = 1; i <= 12; i++) {
            $('<option>').text(i).appendTo(this);
        }
    });

    $('.date-yyyy').each(function() {
        var thisYear = new Date().getFullYear();
        for (var i = thisYear; i >= thisYear - 100; i--) {
            $('<option>').text(i).appendTo(this);
        }
    });

    $('[data-toggle=tooltip], .tip').tooltip({
        container: 'body',
        placement: 'bottom',
        delay: { show: 1000, hide: 0 }
    });

    var requiredFields = [
        '#lastName',
        '#firstName',
        '#study-dd',
        '#study-mm',
        '#study-yyyy'
    ];

    $('#downloadNewStudy').click(function(e) {
        e.preventDefault();

        var canSave = true;

        $('#newModal .has-error').removeClass('has-error');

        requiredFields.forEach(function(field) {
            var $field = $(field);
            var val = $field.val();
            var isValid = !!val && val !== 'NaN';
            if (!isValid) {
                $field.closest('.form-group').addClass('has-error');
            }
            canSave = canSave && isValid;
        });

        if (canSave) {
            var study = {
                lastName:       $('#lastName').val(),
                firstName:      $('#firstName').val(),
                studyDate:      getDate('study'),
                patientNumber:  $('#patientID').val(),
                dob:            getDate('birthdate'),
                gender:         $('#gender').val(),
                weight:         $('#weight').val(),
                height:         $('#height').val(),
                physician:      $('#physician').val(),
                refPhysician:   $('#refPhysician').val(),
                symptomNames:   [ $('#custom1').val(), $('#custom2').val(), $('#custom3').val() ],
                ppiAM:          $('#ppiAm').prop('checked'),
                ppiPM:          $('#ppiPm').prop('checked'),
                ppiDose:        $('#ppiDose').val(),
                h2Blocker:      $('#h2Blocker').prop('checked'),
                h2Dose:         $('#h2Dose').val(),
                armeds:         $('#armeds').val(),
                indication: $('#indication').val()
            };

            $('#newModal').modal('hide');

            setTimeout(function() {
                $(document).trigger('newFile', study);
            }, 100);
        }

        function saveIt() {
            var blob = new Blob([ makeFile(study) ]);

            saveAs(blob, 'PatientData.txt');

            $('#newModal').modal('hide');
        }
    });

    function getDate(prefix) {
        /*if (prefix === "study"){
			var mnth = $('#study-mm').val();
			var mnthVal = parseInt(mnth);
			if (mnthVal<9){
				mnth = '0'+mnth;
			}
			var dd = $('#study-dd').val();
			var ddVal = parseInt(dd);
					if (ddVal<10){
						dd = '0'+ dd;
			}
			var s = mnth + '-' +
					dd + '-' +
				   ($('#' + prefix + '-yyyy').val().slice(-2));
			if (s.indexOf('NaN') !== -1) {
				return '';
			}
			//if (month<9) { month = ("0"+month).slice(-2));

			console.log("Here is date stuff : " + prefix + "::" + s);
			return s;
		}
		else{*/
			var s = padNumber(($('#' + prefix + '-mm').val())) + "-" +
					padNumber(($('#' + prefix + '-dd').val())) + "-" +
					($('#' + prefix + '-yyyy').val().slice(-2));
			if (s.indexOf('NaN') !== -1) {
				return '';
			}
			console.log("What's this???" + s);
		return s ;
		//}
	}
	function padNumber(padIt){
		if ( parseInt(padIt) < 10 ){
			padIt = "0" + padIt;
		}
		return padIt;
	}

});
