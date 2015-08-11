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

        it('no zeros or poles', function() {
            var s = system.zpk([], [], 1);

            assert.deepEqual(s.getZeros(), []);
            assert.deepEqual(s.getPoles(), []);
            assert.equal(s.getK(), 1);
        });

        it('error on invalid system', function(){
            try {
                var s = system.zpk([1, 1], [0], 1);
            } catch(e) {
                return;
            }
            throw new Error("Didn't throw.");
        });

        it('error on not enough arguments', function(){
            try {
                var s = system.zpk([1, 1], [0]);
            } catch(e) {
                return;
            }
            throw new Error("Didn't throw.");
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
            assert.deepEqual(s.getDenominator(), [1, 0, 1]);
        });
        
        it('error on invalid system', function() {
            try {
                var s = system.tf([1, 1], [0]);
            } catch(e) {
                return;
            }
            throw new Error("Didn't throw.");
        });

        it('error on not enough arguments', function(){
            try {
                var s = system.tf([1, 1]);
            } catch(e) {
                return;
            }
            throw new Error("Didn't throw.");
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

        it('error on not enough arguments', function(){
            try {
                var s = system.ss();
            } catch(e) {
                return;
            }
            throw new Error("Didn't throw.");
        });
    });


    describe('Zpk#evalS()', function() {
        it('works with regular numbers', function() {
            var s = system.zpk([-4.2], [1, -1, 5.3], 7);

            assert.deepEqual(s.evalS(2), -4.383838383838385);
            assert.deepEqual(s.evalS(-3.7), -0.0306453025129148);
            assert.deepEqual(s.evalS(math.complex(0, 1)),
                             math.complex('2.5579236851151603 + 1.1430044688896528i'));
        });

        it('works with complex numbers', function() {
            var s = system.zpk([math.complex(1.2, -3)], [math.complex(1, 1), math.complex(-3, 2.5)], 4);

            assert.deepEqual(s.evalS(2), math.complex('-1.312+0.864i'));
            assert.deepEqual(s.evalS(math.complex('1.5 + 0.7i')),
                             math.complex('-3.9125535271579905+3.506874013973406i'));
        });
    });

    describe('Tf#evalS()', function() {
        it('works with regular numbers', function() {
            var s = system.tf([-4.2], [1, -1, 5.3]);

            assert(math.equal(s.evalS(2), -0.5753424658));
            assert(math.equal(s.evalS(-3.7), -0.1851035699));
            assert(math.equal(s.evalS(math.complex(0, 1)), math.complex(-0.9266290405, -0.2154951257)));
        });

        it('works with complex numbers', function() {
            var s = system.tf([math.complex(1.2, -3)], [math.complex(1, 1), math.complex(-3, 2.5)]);

            assert(math.equal(s.evalS(2), math.complex(-0.6917647059, -0.1129411765)));
            assert(math.equal(s.evalS(math.complex(1.5, 0.7)), math.complex(-0.6216115856, 0.03564797623)));
        });
    });


    describe('tf2zpk()', function(){
        it('zeros and poles', function(){
            var sys = system.tf([3, 3], [4, 2]);
            var sys_conv = system.tf2zpk(sys);
            assert.deepEqual(sys_conv.getZeros(), [-1]);
            assert.deepEqual(sys_conv.getPoles(), [-0.5]);
            assert.equal(sys_conv.getK(), 3);
        });

        it('no zeros', function() {
            var sys = system.tf([1], [1, -1]);
            var sys_conv = system.tf2zpk(sys);
            assert.deepEqual(sys_conv.getZeros(), []);
            assert.deepEqual(sys_conv.getPoles(), [1]);
            assert.equal(sys_conv.getK(), 1);
        });

        it('no zeros complex poles', function() {
            var sys = system.tf([1],[1, 2, 1]);
            var sys_conv = system.tf2zpk(sys);
            assert.deepEqual(sys_conv.getZeros(), []);
            assert.equal(sys_conv.getK(), 1);
            assert(math.deepEqual(sys_conv.getPoles(), [-1, -1]));

        });
    });


    describe('zpk2tf()', function() {
        it('simple', function() {
            var sys = system.zpk([-0.5], [1, 4], -2);
            var systf = system.zpk2tf(sys);
            assert.deepEqual(systf.getNumerator(), [-2, -1]);
            assert.deepEqual(systf.getDenominator(), [1, -5, 4]);
        });

        it('complex conjugate pair', function() {
            var sys = system.zpk([-0.5], [math.complex(1, 1), math.complex(1, -1)], -2);
            var systf = system.zpk2tf(sys);
            assert.deepEqual(systf.getNumerator(), [-2, -1]);
            assert.deepEqual(systf.getDenominator(), [1, -2, 2]);
        });

        it('no zeros or poles', function() {
            var sys = system.zpk([], [], 3);
            var systf = system.zpk2tf(sys);

            assert.deepEqual(systf.getNumerator(), [3]);
            assert.deepEqual(systf.getDenominator(), [1]);
        });
    });

    describe('tf2ss', function() {
        it('zeroth order', function() {
            var sys = system.tf([5], [1]);
            var ssys = system.tf2ss(sys);
            assert.deepEqual(ssys.A, [[1]]);
            assert.deepEqual(ssys.B, [1]);
            assert.deepEqual(ssys.C, [[0]]);
            assert.deepEqual(ssys.D, [5]);
        });
    });

    describe('tf2ss', function() {
        it('zeroth order', function() {
            var sys = system.tf([5], [1]);
            var ssys = system.tf2ss(sys);
            assert.deepEqual(ssys.A, []);
            assert.deepEqual(ssys.B, []);
            assert.deepEqual(ssys.C, []);
            assert.deepEqual(ssys.D, [5]);
        });


        it('first order', function() {
            var sys = system.tf([5], [1, 1]);
            var ssys = system.tf2ss(sys);
            console.log(ssys);
            assert.deepEqual(ssys.A, [[-1]]);
            assert.deepEqual(ssys.B, [2]);
            assert.deepEqual(ssys.C, [[2.5]]);
            assert.deepEqual(ssys.D, [0]);
        });
    });

    describe('Tf#toLatex()', function() {
        it('simple', function() {
            var sys = system.tf([1, 2], [3, 4, 5]);
            assert.deepEqual(sys.toLatex(), '\\frac{s + 2}{3s^{2} + 4s + 5}');
        });

        it('negatives', function() {
            var sys = system.tf([1], [-1, -2]);
            assert.deepEqual(sys.toLatex(), '\\frac{1}{-s - 2}');
        });

        it('ones', function() {
            var sys = system.tf([1, 1], [-1, -1]);
            assert.deepEqual(sys.toLatex(), '\\frac{s + 1}{-s - 1}');
        });

        it('zeros', function() {
            var sys = system.tf([2, 0], [-2, 0, -2]);
            assert.deepEqual(sys.toLatex(), '\\frac{2s}{-2s^{2} - 2}');
        });
    });

    describe('Zpk#toLatex()', function() {
        it('simple', function() {
            var sys = system.zpk([1], [2], 3);
            assert.deepEqual(sys.toLatex(), '3\\frac{\\left(s-1\\right)}{\\left(s-2\\right)}');
        });

        it('negatives', function() {
            var sys = system.zpk([-1], [-2], -3);
            assert.deepEqual(sys.toLatex(), '-3\\frac{\\left(s+1\\right)}{\\left(s+2\\right)}');
        });

        it('complex', function() {
            var sys = system.zpk([], [math.complex(1, 1)], -3);
            assert.deepEqual(sys.toLatex(), '\\frac{-3}{\\left(s-\\left(1 + j\\right)\\right)}');
        });

        it('correct order', function() {
            var sys = system.zpk([2, 1], [4, 3], 1);
            assert.deepEqual(sys.toLatex(), '\\frac{\\left(s-1\\right)\\left(s-2\\right)}{\\left(s-3\\right)\\left(s-4\\right)}');
        });
    });

    describe('add()', function() {
        it('works', function() {
            var sys1 = system.tf([1], [1, 2]),
                sys2 = system.tf([1, 2], [3, 4]),
                sys = system.add(sys1, sys2);
            assert.deepEqual(sys.getNumerator(), [1, 7, 8]);
            assert.deepEqual(sys.getDenominator(), [3, 10, 8]);
        });
    });

    describe('multiply()', function() {
        it('works', function() {
            var sys1 = system.tf([-2], [1, 2]),
                sys2 = system.tf([1, 3], [3, 4]),
                sys = system.multiply(sys1, sys2);
            assert.deepEqual(sys.getNumerator(), [-2, -6]);
            assert.deepEqual(sys.getDenominator(), [3, 10, 8]);
        });
    });


    describe('feedback()', function() {
        it('two tfs', function() {
            var sys1 = system.tf([1, 1], [2, 1]),
                sys2 = system.tf([3, 0], [-2, -6]),
                sys = system.feedback(sys1, sys2);

            assert.deepEqual(sys.getNumerator(), [-2, -8, -6]);
            assert.deepEqual(sys.getDenominator(), [-1, -11, -6]);
        });

        it('sys2 is number', function() {
            var sys1 = system.tf([1, 1], [2, 1]),
                sys = system.feedback(sys1, -2.5);

            assert.deepEqual(sys.getNumerator(), [1, 1]);
            assert.deepEqual(sys.getDenominator(), [-0.5, -1.5]);
        });
    });
});
