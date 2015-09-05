var ACPToolKit = (function () {
    // ACPToolKit depends on DataStorage. Must be loaded after DataStorage.js.
    var module = {};

    module.setCurrentParticipantId = function (pid) {
        if (pid.length == 3 && /P[0|1][0-9]/.test(pid)) {
            DataStorage.setItem('pid', pid);    
            return true;
        } else {
            return false;
        }
    }

    module.getCurrentParticipantId = function () {
        var pid = DataStorage.getItem('pid');
        while (!pid) {
            alert('Current participant not set!');
            pid = prompt('Enter current participant ID:').toString();
            if(!this.setCurrentParticipantId(pid)) {
                pid = null;
                alert('Please enter a valid Participant ID (pid)!');
            }
        }
        return pid;
    }

    module.clearAllData = function () {
        ['pid', 'pretest', 'trials', 'posttest'].forEach(function (key) {
            DataStorage.removeItem(key);
        });
    }

    module.downloadFormData = function (formResponses, type) {
        var headers = [];
        var data = [];
        var pid = ACPToolKit.getCurrentParticipantId();
        formResponses.unshift({ name: 'pid', value: pid });
        formResponses.forEach(function (item) {
            headers.push(item.name);
            data.push(item.value);
        });
        arrayToCSV([headers, data], 'acp-' + pid + '-' + type);
    }

    module.downloadTrialResults = function (data) {
        var pid = ACPToolKit.getCurrentParticipantId();
        arrayToCSV(data, 'acp-' + pid + '-trials');
    }

    function arrayToCSV (twoDiArray, fileName) {
        //  http://stackoverflow.com/questions/17836273/export-javascript-data
        //  -to-csv-file-without-server-interaction
        var csvRows = [];
        for (var i = 0; i < twoDiArray.length; ++i) {
            for (var j = 0; j < twoDiArray[i].length; ++j) {
                twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';
            }
            csvRows.push(twoDiArray[i].join(','));
        }

        var csvString = csvRows.join('\r\n');
        var $a = $('<a></a>', {
                href: 'data:attachment/csv;charset=utf-8,' + escape(csvString),
                target: '_blank',
                download: fileName + '.csv'
            });

        $('body').append($a[0]);
        $a.get(0).click();
        $a.remove();
    }

    $(function () {
        // Populate interface with current participant's ID
        var $pidEl = $('.js-pid');
        if ($pidEl.length > 0) {
           $pidEl.text(module.getCurrentParticipantId());
        }
    });

    if (window.location.pathname.indexOf('practice') > -1) {
        var wm = new WindowManager('autocompaste-display');
        var currentTrialOptions = null;

        module.presentPractice = function (options) {
            currentTrialOptions = options;

            var data_file = options.data_file;
            var window_width = options.window_width;
            var font_size = options.font_size;
            var stimuli = options.stimuli;

            $('.js-expt-technique').text(options.technique);
            $('.js-expt-granularity').text(options.granularity);
            $('.js-expt-window-width').text(options.window_width + "px");
            $('.js-expt-font-size').text(options.font_size + "pt");
            $('.js-expt-stimuli').text(options.stimuli);

            // Clean up DOM
            wm.destroyAllWindows();
            $('#autocompaste-completion').remove();
            $('#autocompaste-measure-num-wrapped-lines').remove();
            $('#autocompaste-measure-get-single-line-height').remove();
            $('#autocompaste-measure-text-length-in-pixels').remove();

            // $('.next-task-btn').prop('disabled', true);

            switch (options.technique) {
                case 'TRADITIONAL':
                    var engine = null;
                    break;
                case 'ACP':
                default:
                    var engine = new AutoComPaste.Engine();
                    break;
            }

            var iface = new AutoComPaste.Interface(wm, engine, data_file, window_width, font_size);
            
            // Highlight the relevant text.
            iface.addEventListener('loaded', function () {
                var lines_to_highlight = stimuli.split("\n\n");

                var windows = wm.getWindowList();
                for (var i = 0; i < windows.length; i++) {
                    if (windows[i] == 'text_editor') {
                        continue;
                    }

                    var win = wm.getWindowContent(windows[i]);
                    var content = $(win).find('pre').html();
                    lines_to_highlight.map (function (value, index, array) {
                        content = content.replace (value,
                        "<span class=\"highlighted\">" + value + "</span>");
                    });

                  $(win).find('pre').empty().append(content);
                }
            });
        }
    }

    if (window.location.pathname.indexOf('experiment') > -1) {
        var wm = new WindowManager('autocompaste-display');
        var currentTrialOptions = null;
        var startTime = null;

        module.presentTrial = function (options) {
            startTime = new Date().getTime();
            currentTrialOptions = options;

            var data_file = options.data_file;
            var window_width = options.window_width;
            var font_size = options.font_size;
            var stimuli = options.stimuli;

            $('.js-expt-technique').text(options.technique);
            $('.js-expt-granularity').text(options.granularity);
            $('.js-expt-window-width').text(options.window_width + "px");
            $('.js-expt-font-size').text(options.font_size + "pt");
            $('.js-expt-stimuli').text(options.stimuli);

            // Clean up DOM
            wm.destroyAllWindows();
            $('#autocompaste-completion').remove();
            $('#autocompaste-measure-num-wrapped-lines').remove();
            $('#autocompaste-measure-get-single-line-height').remove();
            $('#autocompaste-measure-text-length-in-pixels').remove();
            
            // $('.next-task-btn').prop('disabled', true);

            switch (options.technique) {
                case 'TRADITIONAL':
                    var engine = null;
                    break;
                case 'ACP':
                default:
                    var engine = new AutoComPaste.Engine();
                    break;
            }

            var iface = new AutoComPaste.Interface(wm, engine, data_file, window_width, font_size);
            // Highlight the relevant text.
            iface.addEventListener('loaded', function () {
                var lines_to_highlight = stimuli.split("\n\n");

                var windows = wm.getWindowList();
                for (var i = 0; i < windows.length; i++) {
                    if (windows[i] == 'text_editor') {
                        continue;
                    }

                    var win = wm.getWindowContent(windows[i]);
                    var content = $(win).find('pre').html();
                    lines_to_highlight.map (function (value, index, array) {
                        content = content.replace (value,
                        "<span class=\"highlighted\">" + value + "</span>");
                    });

                  $(win).find('pre').empty().append(content);
                }
            });
        }

        module.getCurrentTrialState = function (breakStart, breakStop) {
            if (!currentTrialOptions) {
                console.error('There is no trial running right now!');
                return {};
            }
            var endTime = new Date().getTime();
            var breakTime = sumBreaks(breakStart, breakStop);

            // var endTime = enteredDoneTime;
            // console.log("new end time: " + enteredDoneTime);
            currentTrialOptions.start_time = startTime;
            currentTrialOptions.end_time = endTime;
            currentTrialOptions.break_time = breakTime;
            currentTrialOptions.duration = endTime - startTime - breakTime;
            currentTrialOptions.user_response = $.trim($('.autocompaste-textarea').val());
            
            return currentTrialOptions;
        }

        function sumBreaks (breakStart, breakStop) {
            var len = breakStart.length;
            var sum = 0;
            for (var i = 0; i < len; ++i) {
                sum += (breakStop[i] - breakStart[i]);
            }
            return sum;
        }
    }

    return module;
})();
