(function() {
    var theLogo;


    $('.color-input').minicolors({
        theme: 'bootstrap',
        change: function(e) {
            console.log(this);
        }
    });

    $('#defaultColors').on('click', function(e) {
        e.preventDefault();
		//console.log('defaults' + CONFIG.defaults.acidNormals.upright[0]);
        $('#color-normal').val(CONFIG.defaults.colors.normal).minicolors('value', CONFIG.defaults.colors.normal);
        $('#color-mild').val(CONFIG.defaults.colors.mild).minicolors('value', CONFIG.defaults.colors.mild);
        $('#color-moderate').val(CONFIG.defaults.colors.moderate).minicolors('value', CONFIG.defaults.colors.moderate);
        $('#color-severe').val(CONFIG.defaults.colors.severe).minicolors('value', CONFIG.defaults.colors.severe);
        $('#color-meal').val(CONFIG.defaults.colors.meal).minicolors('value', CONFIG.defaults.colors.meal);
        $('#color-supine').val(CONFIG.defaults.colors.supine).minicolors('value', CONFIG.defaults.colors.supine);
        $('#color-cough').val(CONFIG.defaults.colors.cough).minicolors('value', CONFIG.defaults.colors.cough);
        $('#color-heartburn').val(CONFIG.defaults.colors.heartburn).minicolors('value', CONFIG.defaults.colors.heartburn);
        $('#color-symptom1').val(CONFIG.defaults.colors.symptom1).minicolors('value', CONFIG.defaults.colors.symptom1);
        $('#color-symptom2').val(CONFIG.defaults.colors.symptom2).minicolors('value', CONFIG.defaults.colors.symptom2);
        $('#color-symptom3').val(CONFIG.defaults.colors.symptom3).minicolors('value', CONFIG.defaults.colors.symptom3);
    });

    $('#settingsModal').on('show.bs.modal', function(e) {
        console.log('showing settings modal');


        $('#settings-name').val(CONFIG.name);
        $('#settings-address').val(CONFIG.address);
        $('#settings-city').val(CONFIG.city);
        $('#settings-state').val(CONFIG.state);
        $('#settings-zip').val(CONFIG.zip);
        $('#settings-phone').val(CONFIG.phone);

        $('#settings-acidNormalUpright1').val(CONFIG.acidNormals.upright[0]);
        $('#settings-acidNormalUpright2').val(CONFIG.acidNormals.upright[1]);
        $('#settings-acidNormalUpright3').val(CONFIG.acidNormals.upright[2]);
        $('#settings-acidNormalUpright4').val(CONFIG.acidNormals.upright[3]);
		//console.log('Acid Normals 75' + CONFIG.acidNormals75.upright[0]);
        $('#settings-acidNormalSupine1').val(CONFIG.acidNormals.supine[0]);
        $('#settings-acidNormalSupine2').val(CONFIG.acidNormals.supine[1]);
        $('#settings-acidNormalSupine3').val(CONFIG.acidNormals.supine[2]);
        $('#settings-acidNormalSupine4').val(CONFIG.acidNormals.supine[3]);
        $('#settings-acidNormal75Upright1').val(CONFIG.acidNormals75.upright[0]);
        $('#settings-acidNormal75Upright2').val(CONFIG.acidNormals75.upright[1]);
        $('#settings-acidNormal75Upright3').val(CONFIG.acidNormals75.upright[2]);
        $('#settings-acidNormal75Upright4').val(CONFIG.acidNormals75.upright[3]);
        $('#settings-acidNormal75Supine1').val(CONFIG.acidNormals75.supine[0]);
        $('#settings-acidNormal75Supine2').val(CONFIG.acidNormals75.supine[1]);
        $('#settings-acidNormal75Supine3').val(CONFIG.acidNormals75.supine[2]);
        $('#settings-acidNormal75Supine4').val(CONFIG.acidNormals75.supine[3]);

        $('#settings-eventDuration').val(CONFIG.eventDuration/1000);
        $('#settings-eventPercentLevel').val(CONFIG.eventPercentLevel*100);
        $('#settings-minEventTime').val(CONFIG.minEventTime);
        $('#settings-endEventThreshold').val(CONFIG.endEventThreshold);
        $('#settings-dataDir').val(CONFIG.dataDir);

        var colors = CONFIG.colors || {};

        if (colors.normal)    $('#color-normal').minicolors('value', colors.normal);
        if (colors.mild)      $('#color-mild').minicolors('value', colors.mild);
        if (colors.moderate)  $('#color-moderate').minicolors('value', colors.moderate);
        if (colors.severe)    $('#color-severe').minicolors('value', colors.severe);
        if (colors.meal)      $('#color-meal').minicolors('value', colors.meal);
        if (colors.supine)    $('#color-supine').minicolors('value', colors.supine);
        if (colors.cough)     $('#color-cough').minicolors('value', colors.cough);
        if (colors.heartburn) $('#color-heartburn').minicolors('value', colors.heartburn);
        if (colors.symptom1)  $('#color-symptom1').minicolors('value', colors.symptom1);
        if (colors.symptom2)  $('#color-symptom2').minicolors('value', colors.symptom2);
        if (colors.symptom3)  $('#color-symptom3').minicolors('value', colors.symptom3);
    });

    $('#saveSettings').on('click', function(e) {
        writeSettings({
            img: theLogo,
            name: $('#settings-name').val(),
            address: $('#settings-address').val(),
            city: $('#settings-city').val(),
            state: $('#settings-state').val(),
            zip: $('#settings-zip').val(),
            phone: $('#settings-phone').val(),
            acidNormals: {
                upright: [
                    +$('#settings-acidNormalUpright1').val(),
                    +$('#settings-acidNormalUpright2').val(),
                    +$('#settings-acidNormalUpright3').val(),
                    +$('#settings-acidNormalUpright4').val()
                ],
                supine: [
                    +$('#settings-acidNormalSupine1').val(),
                    +$('#settings-acidNormalSupine2').val(),
                    +$('#settings-acidNormalSupine3').val(),
                    +$('#settings-acidNormalSupine4').val()
                ]
            },

             acidNormals75: {
                upright: [
                    +$('#settings-acidNormal75Upright1').val(),
                    +$('#settings-acidNormal75Upright2').val(),
                    +$('#settings-acidNormal75Upright3').val(),
                    +$('#settings-acidNormal75Upright4').val()
                ],
                supine: [
                    +$('#settings-acidNormal75Supine1').val(),
                    +$('#settings-acidNormal75Supine2').val(),
                    +$('#settings-acidNormal75Supine3').val(),
                    +$('#settings-acidNormal75Supine4').val()
                ]
            },
            colors: {
                normal:    $('#color-normal').minicolors('value'),
                mild:      $('#color-mild').minicolors('value'),
                moderate:  $('#color-moderate').minicolors('value'),
                severe:    $('#color-severe').minicolors('value'),
                meal:      $('#color-meal').minicolors('value'),
                supine:    $('#color-supine').minicolors('value'),
                cough:     $('#color-cough').minicolors('value'),
                heartburn: $('#color-heartburn').minicolors('value'),
                symptom1:  $('#color-symptom1').minicolors('value'),
                symptom2:  $('#color-symptom2').minicolors('value'),
                symptom3:  $('#color-symptom3').minicolors('value')
            },
            //eventDuration:     $('#settings-eventDuration').val()*1000,
            //eventPercentLevel: $('#settings-eventPercentLevel').val()/100,
            minEventTime:      +$('#settings-minEventTime').val(),
            endEventThreshold: +$('#settings-endEventThreshold').val(),
            dataDir:	$('#settings-dataDir').val()
        }, function() {
            $('#settingsModal').modal('hide');
        });
    });

    $('#settings-logo').on('change', function(e) {
        var file = e.target.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function(e) {
                theLogo = e.target.result;
            };

            reader.readAsDataURL(file);
        } else {
            theLogo = null;
        }
    });
})();
