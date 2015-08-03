var assert = require('assert');
var math = require('mathjs');
var system = require('../src/system');

describe('System testing', function() {

    describe('constructor', function() {
        it('default values', function() {
            var s = new system.System();
            assert.deepEqual(s.z, null);
            assert.deepEqual(s.p, null);
            assert.deepEqual(s.k, null);
            assert.deepEqual(s.numerator, null);
            assert.deepEqual(s.denominator, null);
        });
    });


    describe('zpk', function() {
        it('correct construction', function() {
            var z = [1, math.complex(1, 1)];
            var p = [8, math.complex(-5.7, 0)];
            var k = math.complex(8, -3.7);
            
            var s = system.zpk(z, p, k);

            assert.deepEqual(s.getZeros(), z);
            assert.deepEqual(s.getPoles(), p);
            assert.deepEqual(s.getK(), k);
        });
    });


    describe('System#eval()', function() {
        it('works with regular numbers', function() {
            var s = system.zpk([1, -1, 5.3], [-4.2], 7);

            assert.deepEqual(s.eval(2), -11.177419354838708);
            assert.deepEqual(s.eval(-3.7), -1598.94);
            assert.deepEqual(s.eval(math.complex(0, 1)),
                             math.complex('15.967811158798284 - 7.135193133047211i'));
        });

        it('works with complex numbers', function() {
            var s = system.zpk([math.complex(1, 1), math.complex(-3, 2.5)], [math.complex(1.2, -3)], 4);

            assert.deepEqual(s.eval(2), math.complex('-8.5062240663900414938 - 5.6016597510373443983i'));
            assert.deepEqual(s.eval(math.complex('1.5 + 0.7i')),
                             math.complex('-2.2676342525399129173 - 2.0325108853410736i'));
        });
    });
});
