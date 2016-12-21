/**
 * Created by dharmendra on 21/12/16.
 */

var intformat = require('biguint-format'),
    FlakeId = require('flake-idgen');
var generator = new FlakeId({
    worker: 1,
    datacenter: 31,
    epoch: 1300000000000
});


function nextId() {
    return intformat(generator.next(), 'dec');
}

var util = {
    nextId: nextId
};

module.exports = util;