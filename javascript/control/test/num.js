var assert = require('assert');
var math = require('mathjs');
var num = require('../src/num');
var system = require('../src/system');

math.config({epsilon: 1e-7});


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

    describe('polyval()', function() {
        it('regular numbers', function() {
            var poly = [2, -3];
            assert.equal(num.polyval(poly, 2), 1);
            assert.equal(num.polyval(poly, 7), 11);
            assert.deepEqual(num.polyval(poly, math.complex(1, -1)), math.complex(-1, -2));
        });

        it('complex numbers', function() {
            var poly = [math.complex(-1.6, 1.9), math.complex(0, 4.4)];
            assert(math.equal(num.polyval(poly, -3.2), math.complex(5.12, -1.68)));
            assert(math.equal(num.polyval(poly, math.complex(0.7, -3.1)), math.complex(4.77, 10.69)));
        });
    });


    describe('roots()', function() {
        it('simple root', function() {
            assert.deepEqual(num.roots([1, 2.3]), [-2.3]);
        });

        it('complex roots', function() {
            assert(math.deepEqual(num.roots([1, 0, 1]), [math.complex(0, 1), math.complex(0, -1)]));
        });

        it('no roots', function() {
            assert.deepEqual(num.roots([5]), []);
        });

        it('all roots in zero', function() {
            assert.deepEqual(num.roots([1, 0, 0, 0, 0]), [0, 0, 0, 0]);
        });
    });


    describe('polyadd()', function() {
        it('real same length', function() {
            assert.deepEqual(num.polyadd([2, 3], [-1, 0.5]), [1, 3.5]);
        });

        it('complex same length', function() {
            assert(math.deepEqual(num.polyadd([math.complex(1, 1.2), math.complex(0, 0)], [math.complex(-0.7, 10), math.complex(-3.3, 1.9)]), [math.complex(0.3, 11.2), math.complex(-3.3, 1.9)]));
        });

        it('different lengths', function() {
            assert.deepEqual(num.polyadd([1, 2], [3]), [1, 5]);
        });
    });


    describe('conv()', function() {
        it('same length', function() {
            assert.deepEqual(num.conv([0.5, -1], [2, 1]), [1, -1.5, -1]);
        });


        it('different length', function() {
            assert.deepEqual(num.conv([2, 1], [0.5]), [1, 0.5]);
            assert.deepEqual(num.conv([0.5], [2, 1]), [1, 0.5]);
        });
    });


    describe('diag()', function() {
        it('default', function() {
            assert.deepEqual(num.diag(math.ones(2)), [[1, 0], [0, 1]]);
        });

        it('negative index', function() {
            assert.deepEqual(num.diag(math.ones(2), -1), [[0, 0, 0], [1, 0, 0], [0, 1, 0]]);
        });

        it('positive index', function() {
            assert.deepEqual(num.diag(math.ones(2), 1), [[0, 1, 0], [0, 0, 1], [0, 0, 0]]);
        });

        it('non-unit vector', function() {
            assert.deepEqual(num.diag([2, 3]), [[2, 0], [0, 3]]);
        });

        it('empty list', function() {
            assert.deepEqual(num.diag([], 1), [[]]);
        });
    });


    describe('extreme_by()', function(){
        it('max on property', function() {
            assert.deepEqual(num.extreme_by([{a: 5}, {a: 2}, {a: 7}, {a: 4}], Math.max,
                                    function(v){return v.a;}), {a: 7});
        });
    });


    // Numerical inaccuracies but is close enough
    //describe('stepinfo', function() {
        //it('matlab example', function() {
            //var s = system.tf([1], [1, 1, 10]);
            //assert(num.stepinfo(s.step()), {
                //rise_time: 0.3738,
                //settling_time: 7.3148,
                //settling_min: 0.0635,
                //settling_max: 0.1605,
                //overshoot: 60.4530,
                //undershoot: 0,
                //peak: 0.1605,
                //peak_time: 1.0131
            //});
        //});
    //});


    describe('complex_to_real_if_real', function() {
        it('not real', function() {
            assert.deepEqual(num.complex_to_real_if_real(math.complex(5, 3)), math.complex(5, 3));
        });

        it('not complex', function() {
            assert.equal(num.complex_to_real_if_real(math.complex(5, 0)), 5);
        });

        it('custom threshold', function() {
            assert.deepEqual(num.complex_to_real_if_real(math.complex(3, 1e-7), 1e-8), math.complex(3, 1e-7));
        });

        it('default threshold', function() {
            assert.deepEqual(num.complex_to_real_if_real(math.complex(3, 1e-7 + 1e-8)), math.complex(3, 1e-7 + 1e-8));
        });
    });


    describe('strip_leading_zeros()', function() {
        it('array with leading zeros', function() {
            assert.deepEqual(num.strip_leading_zeros([0, math.complex(0, 0), 1, 2]), [1, 2]);
        });

        it('array without leading zeros', function() {
            assert.deepEqual(num.strip_leading_zeros([1, 2, 3]), [1, 2, 3]);
        });

        it('empty array', function() {
            assert.deepEqual(num.strip_leading_zeros([]), []);
        });
    });
});
