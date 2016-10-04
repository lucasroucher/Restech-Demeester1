var cmds = (function() {
    var printToPDF = true;

    var currentlyShowing = 'graph';

    var undoables = [];
    var zoomed = false;
    var xDomain;
    var yDomain;

    function rechartData(study) {
        // we heart global vars.
        window.YDOMAIN = yDomain;
        chartData(study, {
            xDomain: xDomain,
            yDomain: yDomain
        });
    }

    return {
        undo: function() {
            if (undoables.length) {
                undoables.pop()();
            }
        },
        clearUndoables: function() {
            undoables.length = 0;
        },

        add: function(el, study) {
            var type = $(el).data('type');
            var val = $(el).data('val');

            var sel = getSel();
            var left = sel.left;
            var right = sel.right;

            if (val !== 2 && val !== 4) {
                right = left + 1;
            }

            var oldValues = [];

            for (var i = left; i < right; i++) {
                var datum = study.data[i];

                oldValues.push(datum[type]);

                if (datum.val !== null) {
                    datum[type] = val;
                }
            }

            discoverPeriods(study);
            rechartData(study);

            undoables.push(function() {
                for (var i = left; i < right; i++) {
                    var datum = study.data[i];
                    datum[type] = oldValues[i - left];
                }

                discoverPeriods(study);
                rechartData(study);
            });
        },

        clear: function(el, study) {
            var type = $(el).data('type');
            var val = $(el).data('val');

            var sel = getSel();
            var left = sel.left;
            var right = sel.right;

            var oldValues = [];

            for (var i = left; i < right; i++) {
                var datum = study.data[i];
                var oldValue = datum[type];

                oldValues.push(oldValue);

                if (oldValue === +val) {
                    datum[type] = 0;
                }
            }

			//console.log("Old vals : " + oldValues );
            discoverPeriods(study);
            rechartData(study);

            undoables.push(function() {
                for (var i = left; i < right; i++) {
                    var datum = study.data[i];
                    datum[type] = oldValues[i - left];
                }

                discoverPeriods(study);
                rechartData(study);
            });
        },

        clearAll: function(el, study) {
            var sel = getSel();
            var left = sel.left;
            var right = sel.right;

            var oldValues = [];

            for (var i = left; i < right; i++) {
                var datum = study.data[i];

                oldValues.push({
                    meal: datum.meal,
                    supine: datum.supine,
                    symptom: datum.symptom
                });

                datum.meal = datum.supine = datum.symptom = 0;
            }

            discoverPeriods(study);
            rechartData(study);

            undoables.push(function() {
                for (var i = left; i < right; i++) {
                    var datum = study.data[i];
                    var oldValue = oldValues[i - left];
                    datum.meal = oldValue.meal;
                    datum.supine = oldValue.supine;
                    datum.symptom = oldValue.symptom;
                }

                discoverPeriods(study);
                rechartData(study);
            });
        },

        del: function(el, study) {
            var sel = getSel();
            var left = sel.left;
            var right = sel.right;

            delRange(study, left, right);
        },

        zoomIn: function(el, study) {
            var sel = getSel();

            if (sel) {
                var left = sel.left;
                var right = sel.right;

                xDomain = [ study.data[left].when, study.data[right].when ];
                rechartData(study);
                updateLeftRight([ study.data[left], study.data[right] ]);

                clearSel();
                zoomed = true;
            } else {
                xDomain = null;
                yDomain = null;
                rechartData(study);
            }
        },

        zoomOut: function(el, study) {
            if (zoomed) {
                xDomain = null;
                rechartData(study);
                zoomed = false;
            } else {
                yDomain = [ 0, 10 ];
                rechartData(study);
            }
            clearSel();
        },

        zoomY: function(el, study) {
            var from = $(el).data('from');
            var to = $(el).data('to');
            yDomain = [ from, to ];
            rechartData(study);
            clearSel();
        },

        customZoomY: function(el, study) {
            bootbox.prompt({
                title: 'Top pH value',
                value: '10',
                callback: function(to) {
                    if (typeof to !== 'string') return;

                    bootbox.prompt({
                        title: 'Bottom pH value',
                        value: '0',
                        callback: function(from) {
                            if (typeof from !== 'string') return;

                            yDomain = [ from, to ];
                            rechartData(study);
                            clearSel();
                        }
                    });
                }
            });
        },

        showReport: function(el, study) {
            currentlyShowing = 'report';
            updateReport(study);
            $('#chart').addClass('hide');
            $('#report').removeClass('hide');
            $('.report-hide').addClass('hide');
            $('.report-only').removeClass('hide');
        },

        hideReport: function(el, study) {
            currentlyShowing = 'graph';
            $('.report-hide').removeClass('hide');
            $('.report-only').addClass('hide');
            $('#report').addClass('hide');
            if (study && study.data) {
                $('#chart').removeClass('hide');
            }
        },

        print: function() {
            // console.log(study);

            const BrowserWindow = nodeRequire('electron').remote.BrowserWindow;
            const win = BrowserWindow.getFocusedWindow();

            var newTitle = study.lastName + ' ' + study.firstName + ' ' + study.studyDate;
            var graph = false;
            newTitle += '_' + currentlyShowing;
            if(currentlyShowing == 'graph')
              graph = true;

            document.title = newTitle;

            if (printToPDF) {
                const dialog = nodeRequire('electron').remote.dialog;
                const fs = nodeRequire('fs');

                dialog.showSaveDialog(win, {
                    title: 'Save as PDF',
                    defaultPath: newTitle + '.pdf'
                }, function(filename) {
                    console.log('saving PDF to %s', filename);

                    win.webContents.printToPDF({
                        marginsType: 2, // 0 = default margin, 1 = no margin, 2 = minimal margin
                        printBackground: true,
                        landscape: graph
                    }, function(err, data) {
                        if (err) throw err;

                        fs.writeFile(filename, data, function(err) {
                          if (err) throw err;

                          console.log('PDF saved successfully');

                          restoreTitle();
                      });
                    });
                });
            } else {
                console.log('begin printing');

                // window.print();

                win.webContents.print({
                    printBackground: true
                });

                console.log('done printing');

                restoreTitle();
            }

            function restoreTitle() {
                document.title = 'Restech DataView';
            }
        },

        delMeals: function(el, study) {
            if (!study.meals) { return };

            study.meals.forEach(function(meal) {
                var left = meal.start.index;
                var right = meal.end.index;

                left -= MEAL_BUFFER_COUNT;
                right += MEAL_BUFFER_COUNT;

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
            rechartData(study);
        },

        flagDelMeals: function(el, study) {
            if (study.delMeals) {
                study.delMeals = false;
                $(el).text(Globalize.formatMessage('chart/deleteMeals'));
            } else {
                bootbox.prompt({
                    title: 'Delete how many minutes before/after each meal period?',
                    value: '5',
                    callback: function(value) {
                        console.log(value);
                        study.delMeals = +value;
                        $(el).text(study.delMeals ? Globalize.formatMessage('chart/undeleteMeals') : Globalize.formatMessage('chart/deleteMeals'));
                    }
                });
            }
        },

        saveFile: function(el, study) {
            console.log('triggering saveFile event');
            console.log(study);
            $(document).trigger('saveFile', study);
        }
    };

    function delRange(study, left, right) {
        if (left === 0) {
            console.log('deleting from left edge');

            var oldData = study.data.slice(0, right);
            study.data = study.data.slice(right);

            undoables.push(function() {
                study.data = oldData.concat(study.data);

                discoverPeriods(study);
                rechartData(study);
            });
        } else if (right === study.data.length - 1) {
            console.log('deleting to right edge');

            var oldData = study.data.slice(left);
            study.data = study.data.slice(0, left);

            undoables.push(function() {
                study.data = study.data.concat(oldData);

                discoverPeriods(study);
                rechartData(study);
            });
        } else {
            console.log('deleting from middle');

            var oldData = [];

            for (var i = left; i < right; i++) {
                var datum = study.data[i];

                oldData.push(datum);

                study.data[i] = {
                    when: datum.when,
                    val: null,
                    meal: 0,
                    supine: 0,
                    symptom: 0
                };
            }

            undoables.push(function() {
                for (var i = left; i < right; i++) {
                    study.data[i] = oldData[i - left];
                }

                discoverPeriods(study);
                rechartData(study);
            });
        }

        discoverPeriods(study);
        rechartData(study);
    }

})();
