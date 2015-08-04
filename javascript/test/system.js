var assert = require('assert');
var math = require('mathjs');
var system = require('../src/system');

describe('System testing', function() {

    describe('zpk', function() {
        it('correct construction from zpk', function() {
            var z = [1, math.complex(1, 1)];
            var p = [8, math.complex(-5.7, 0)];
            var k = math.complex(8, -3.7);
            
            var s = system.zpk(z, p, k);

            assert.deepEqual(s.getZeros(), z);
            assert.deepEqual(s.getPoles(), p);
            assert.deepEqual(s.getK(), k);
        });

        it('correct construction from tf', function() {
            var s = system.zpk(system.tf([1], [1, 0, 1]));

            assert.deepEqual(s.getZeros(), []);
            assert(math.equal(s.getPoles(), [math.complex(0, 1), math.complex(0, -1)]));
            assert.equal(s.getK(), 1);
        });
    });

    describe('tf', function() {
        it('correct construction from num denom', function() {
            var num = [1, 2, 3, 4];
            var denom = [-1, -2, -3, -4, -5];
            var s = system.tf(num, denom);

            assert.deepEqual(s.getNumerator(), num);
            assert.deepEqual(s.getDenominator(), denom);
        });

        it('correct construction from zpk', function() {
            var s = system.tf(system.zpk([-2], [math.complex(0, 1), math.complex(0, -1)], 3));
            
            assert.deepEqual(s.getNumerator(), [3, 6]);
            assert.deepEqual(s.getDenominator(), [1, math.complex(0, 0), math.complex(1, 0)]);
        });
    });


    describe('ss', function() {
        it('correct construction from ABCD', function() {
            var A = [[1, -1], [2, 3]],
                B = [0, 1],
                C = [-3, 4],
                D = [7];
            var s = system.ss(A, B, C, D);

            assert.deepEqual(s.A, A);
            assert.deepEqual(s.B, B);
            assert.deepEqual(s.C, C);
            assert.deepEqual(s.D, D);
        });
    });


    describe('Zpk#eval()', function() {
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

    describe('Tf#eval()', function() {
        it('works with regular numbers', function() {
            var s = system.tf([1, -1, 5.3], [-4.2]);

            assert(math.equal(s.eval(2), -1.738095238));
            assert(math.equal(s.eval(-3.7), -5.402380952));
            assert(math.equal(s.eval(math.complex(0, 1)), math.complex(-1.023809524, 0.2380952381)));
        });

        it('works with complex numbers', function() {
            var s = system.tf([math.complex(1, 1), math.complex(-3, 2.5)], [math.complex(1.2, -3)]);

            assert(math.equal(s.eval(2), math.complex(-1.408045977, 0.2298850575)));
            assert(math.equal(s.eval(math.complex(1.5, 0.7)), math.complex(-1.603448276, -0.09195402299)));
        });
    });
});
