$(function() {
    var unflatten = nodeRequire('flat').unflatten;

    // This function loads all files required for a locale and sets it as the default..
    // Returns a Promise.
    // Examples of locale IDs can be found here:
    // https://github.com/jquery/globalize#locales
    window.CHANGE_LOCALE = function(locale) {
        console.log('changing locale to ' + locale);

        // Make sure we're initialized.
        return init()
            .then(function() {
                // Make sure the data for this locale is loaded.
                return load(locale);
            })
            .then(function() {
                // Set this locale as the default.
                Globalize.locale(locale);
            })
        ;
    };

    // Loads required files for all locales.
    // Safe to call more than once.
    var init = _.once(function() {
        // First we load the supplemental CLDR data we need.
        return $.when.apply($, supplementalFiles()).then(function() {
            console.log('all supplemental CLDR data loaded');
        }).then(function() {
            // Then we load the default messages.
            // return messageFile('root');
            return tsvMessageFile();
        });
    });

    // Loads the data for a locale and caches the result.
    // Safe to call more than once.
    var load = _.memoize(function(locale) {
        return $.when.apply($, mainFiles(locale)).then(function() {
            console.log('all main files loaded for ' + locale);
        }).then(function() {
            // return messageFile(locale);
        });
    });

    // Files to load are documented here:
    // https://github.com/jquery/globalize#2-cldr-content
    function supplementalFiles() {
        return [
            'node_modules/cldr-data/supplemental/likelySubtags.json',
            'node_modules/cldr-data/supplemental/numberingSystems.json',
        ].map(function(file) {
            return $.getJSON(file).then(function(result) {
                Globalize.load(result);
                console.log('loaded ' + file);
            });
        });
    }

    // Files to load are documented here:
    // https://github.com/jquery/globalize#2-cldr-content
    function mainFiles(locale) {
        return [
            'node_modules/cldr-data/main/{locale}/numbers.json',
        ].map(function(file) {
            file = file.replace('{locale}', locale);
            return $.getJSON(file).then(function(result) {
                Globalize.load(result);
                console.log('loaded ' + file);
            });
        });
    }

    // Message file format is documented here:
    // https://github.com/jquery/globalize/blob/master/doc/api/message/load-messages.md
    // Actual message format is documented here:
    // https://github.com/jquery/globalize/blob/master/doc/api/message/message-formatter.md
    function messageFile(locale) {
        var file = 'messages/' + locale + '.json';
        return $.getJSON(file).then(function(result) {
            Globalize.loadMessages(result);
            console.log('loaded ' + file);
        }, function(err) {
            console.error('there is probably an error in your JSON, buddy');
        });
    }

    // Load a TSV file and convert it to the JSON format required by Globalize.js.
    // The first column is the key.
    // The second column is English and will be used as the "root" messages.
    // All columns after that need to be labeled with their locale.
    // "de" for German, "es" for Spanish, "fr" for French, etc.
    // The file is supposed to be located at C:\Restech\DataView\messages.tsv.
    // If not there, falls back to app/messages/messages.tsv.
    function tsvMessageFile() {
        var fs = nodeRequire('fs');
        var path = nodeRequire('path');
        var root = nodeRequire('./host/config').root;
        var file = path.join(root, 'messages.tsv');

        if (!fs.existsSync(file)) {
            file = 'messages/messages.tsv';
        }

        console.log('loading messages from %s', file);

        return $.get(file).then(function(result) {
            var json = convertTSVtoJSON(result);
            console.log(json);
            Globalize.loadMessages(json);
            console.log('done loading %s', file);
        }, function(err) {
            console.error('error loading %s', file);
        });
    }

    function convertTSVtoJSON(tsv) {
        var lines = _.map(tsv.split('\n'), line => line.trim()).filter(Boolean);
        var header = lines.shift();
        var locales = header.split('\t').slice(1);

        // Rename English to "root" so other languages fall back to English:
        locales[0] = 'root';

        var translations = _.map(lines, line => line.split('\t'));

        var messages = _.object(_.map(locales, (locale, i) => [
            locale,
            unflatten(_.object(_.map(translations, t => [ t[0], t[i + 1] ])), { delimiter: '/' })
        ]));

        // English translations are in the "root" locale so just add an empty object for English:
        messages.en = {};

        return messages;
    }
});
