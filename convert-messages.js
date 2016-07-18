#!/usr/bin/env node

var flatten = require('flat');
var _ = require('lodash');

var root = require('./app/messages/root.json');
var de = require('./app/messages/de.json');

function makeFlat(nested) {
    return flatten(nested[Object.keys(nested)[0]], { delimiter: '/' });
}

var flattened = makeFlat(root);

var transformed = _(flattened)
    .toPairs()
    .map(pair => [ pair[0], { en: pair[1] } ])
    .fromPairs()
    .value()
;

_(makeFlat(de)).toPairs().forEach(p => {
    if (transformed[p[0]]) {
        transformed[p[0]].de = p[1];
    }
});

// console.log(JSON.stringify(transformed, null, 2));

// Start with a byte-order mark to get Excel to detect that it's UTF-8:
console.log('\ufeffkey,en,de');

_(transformed).toPairs().forEach(p => {
    console.log('%s,%s,%s', p[0], JSON.stringify(p[1].en), JSON.stringify(p[1].de || ''));
});
