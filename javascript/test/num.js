var assert = require('assert');
var math = require('mathjs');
var num = require('../src/num');

math.config({epsilon: 1e-2});


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

    describe('logspace()', function() {
        it('correct defaults', function() {
            var ls = num.logspace(0, 1);
            assert.equal(ls.length, 50);
            assert.equal(ls[0], 1);
            assert.equal(ls[ls.length - 1], 10);
        });

        it('non-default length', function() {
            var ls = num.logspace(0, 1, 1000);
            assert.equal(ls.length, 1000);
        });

        it('not inclusive', function() {
            var ls = num.logspace(0, 1, 1000, false);
            assert.notEqual(ls[999], 10);
        });

        it('correct sequence inclusive', function() {
            var ls = num.logspace(0, 1, 3);
            assert.deepEqual(ls, [1, 3.162277660168379, 10]);
        });

        it('correct sequence not inclusive', function() {
            var ls = num.logspace(0, 1, 2, false);
            assert.deepEqual(ls, [1, 3.162277660168379]);
        });

        it('descending sequence', function() {
            var ls = num.logspace(0, -2, 3);
            assert.deepEqual(ls, [1, 0.1, 0.01]);
        });

        it('non-default base', function() {
            var ls = num.logspace(0, 3, 4, true, 2);
            assert.deepEqual(ls, [1, 2, 4, 8]);
        });
    });

    describe('evalzorp()', function() {
        it('regular numbers', function() {
            var zeros = [2, -3];
            assert.equal(num.evalzorp(zeros, 2), 0);
            assert.equal(num.evalzorp(zeros, 7), 50);
            assert.deepEqual(num.evalzorp(zeros, math.complex(1, -1)), math.complex(-5, -3));
        });

        it('complex numbers', function() {
            var zeros = [math.complex(-1.6, 1.9), math.complex(0, 4.4)];
            assert(math.equal(num.evalzorp(zeros, -3.2), math.complex(-3.24, 13.12)));
            assert(math.equal(num.evalzorp(zeros, math.complex(0.7, -3.1)), math.complex(-35.89, -20.75)));
        });
    });

    describe('eval_poly()', function() {
        it('regular numbers', function() {
            var poly = [2, -3];
            assert.equal(num.eval_poly(poly, 2), 1);
            assert.equal(num.eval_poly(poly, 7), 11);
            assert.deepEqual(num.eval_poly(poly, math.complex(1, -1)), math.complex(-1, -2));
        });

        it('complex numbers', function() {
            var poly = [math.complex(-1.6, 1.9), math.complex(0, 4.4)];
            assert(math.equal(num.eval_poly(poly, -3.2), math.complex(5.12, -1.68)));
            assert(math.equal(num.eval_poly(poly, math.complex(0.7, -3.1)), math.complex(4.77, 10.69)));
        });
    });


    describe('roots()', function() {
        it('simple root', function() {
            assert.deepEqual(num.roots([1, 2.3]), [-2.3]);
        });

        it('no roots', function() {
            assert.deepEqual(num.roots([5]), []);
        });
    });
});
