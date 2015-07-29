var assert = require('assert');
var math = require('mathjs');
var num = require('../src/num');

describe('num tests', function() {

    describe('linspace()', function() {
        it('correct defaults', function() {
            var ls = num.linspace(0, 1);
            assert.equal(ls.length, 50);
            assert.equal(ls[ls.length - 1], 1);
        });

        it('non-default length', function() {
            var ls = num.linspace(0, 1, 1000);
            assert.equal(ls.length, 1000);
        });

        it('not inclusive', function() {
            var ls = num.linspace(0, 1, 1000, false);
            assert.notEqual(ls[999], 1);
        });

        it('correct sequence inclusive', function() {
            var ls = num.linspace(0, 1, 3);
            assert.deepEqual(ls, [0, 0.5, 1]);
        });

        it('correct sequence not inclusive', function() {
            var ls = num.linspace(0, 1, 2, false);
            assert.deepEqual(ls, [0, 0.5]);
        });

        it('descending sequence', function() {
            var ls = num.linspace(0, -2, 3);
            assert.deepEqual(ls, [0, -1, -2]);
        });
    
    });
});
