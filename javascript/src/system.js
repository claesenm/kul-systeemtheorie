var math = require('mathjs');
math.config({matrix: 'array'});
var num = require('./num');

/**
 * Module related to System object.
 * @module
 */

/**
 * Constructs a System object
 * @constructor
 * @abstract
 */
function System() {
}


/**
 * Evaluates the transfer function of this system in s.
 * @param {Complex|Number} s
 * @returns {Complex|Number} The value of the tf of this system evaluated in s.
 * @abstract
 */
System.prototype.eval = function(s) {
    throw new Error('This is not a valid system.');
    /* Implementation is defined in the children. */
};

/**
 * Creates a system with a zero-pole-gain representation.
 * @param {Array<(Number|Complex)>} z - The zeros of the transfer function.
 * @param {Array<(Number|Complex)>} p - The poles of the transfer function.
 * @param {Number|Complex} k - The gain of the transfer function.
 * @constructor
 * @augments System
 */
function Zpk(z, p, k) {
    this.z = z;
    this.p = p;
    this.k = k;
}
Zpk.prototype = new System();

/**
 * Sets the zeros of the system's tf.
 * @param {Array<(Complex|Number)>} z - The zeros of the new tf.
 * @private
 */
Zpk.prototype.setZeros = function(z) {
    this.z = z;
};


/**
 * Returns the zeros of this system's transfer function.
 * @returns {Array<(Complex|Number)>}
 */
Zpk.prototype.getZeros = function() {
    return this.z;
};

/**
 * Sets the poles of the system's tf.
 * @param {Array<(Complex|Number)>} p - The poles of the new tf.
 * @private
 */
Zpk.prototype.setPoles = function(p) {
    this.p = p;
};

/**
 * Returns the poles of this system's transfer function.
 * @returns {Array<(Complex|Number)>}
 */
Zpk.prototype.getPoles = function() {
    return this.p;
};

/**
 * Sets the k of the system's tf.
 * @param {Complex|Number} k - The k of the new tf.
 * @private
 */
Zpk.prototype.setK = function(k) {
    this.k = k;
};


/**
 * Returns the k of this system's transfer function.
 * @returns {(Complex|Number)}
 */
Zpk.prototype.getK = function() {
    return this.k;
};


/**
 * @inheritdoc
 */
Zpk.prototype.eval = function(s) {
    var numerator = num.evalzorp(this.z, s);
    var denom = num.evalzorp(this.p, s);
    var quotient = math.divide(numerator, denom);
    return math.multiply(this.k, quotient);
};

/**
 * Creates a system with a transfer function representation.
 * @param {Array<(Number|Complex)>} num - The numerator of the transfer function.
 * @param {Array<(Number|Complex)>} denom - The denominator of the transfer function.
 * @constructor
 * @augments System
 */
function Tf(num, denom) {
    this.numerator = num;
    this.denominator = denom;
}
Tf.prototype = new System();

/**
 * Sets the numerator of the tf of the system.
 * @param {Array<(Number|Complex)>} n - The numerator of the tf.
 * @private
 */
Tf.prototype.setNumerator = function(n) {
    this.numerator = n;
};


/**
 *  @returns {Array<(Number|Complex)>} the numerator of the transfer function.
 */
Tf.prototype.getNumerator = function() {
    return this.numerator;
};


/**
 * Sets the denominator of the tf of the system.
 * @param {Array<(Number|Complex)>} d - The denominator of the tf.
 * @private
 */
Tf.prototype.setDenominator = function(d) {
    this.denominator = d;
};

/**
 *  @returns {Array<(Number|Complex)>} the denominator of the transfer function.
 */
Tf.prototype.getDenominator = function() {
    return this.denominator;
};

/**
 * @inheritdoc
 */
Tf.prototype.eval = function(s) {
    return math.divide(num.polyval(this.numerator, s), num.polyval(this.denominator, s));
};

/**
 * Creates a system with a state-space representation.
 * @param {Array<Array<(Number|Complex)>>} A - The A matrix
 * @param {Array<Array<(Number|Complex)>>} B - The B matrix
 * @param {Array<Array<(Number|Complex)>>} C - The C matrix
 * @param {Array<Array<(Number|Complex)>>} D - The D matrix
 * @constructor
 * @augments System
 */
function Ss(A, B, C, D) {
    this.A = A;
    this.B = B;
    this.C = C;
    this.D = D;
}

Ss.prototype = new System();

/**
 * Calculates the step response of the given system.
 * @param {Number} [epsilon=1e-7] - The abolute error of the solution.
 * @returns {Object} response - The step response of the system.
 * @returns {Array<Number>} response.t - The time values of the step response.
 * @returns {Array<Number>} response.x - The value of the response.
 */
Ss.prototype.step = function(epsilon) {
    epsilon = epsilon || 1e-7;
    var A = this.A,
        B = this.B,
        C = this.C,
        D = this.D;

    function eps(t) {
        if (t < 0) return 0;
        if (t === 0) return 1/2;
        return 1;
    }

    function dx(t, x){
        return math.add(math.multiply(A, x), math.multiply(B, eps(t)));
    }

    function sol(t, x) {
        return math.add(math.multiply(C, x), math.multiply(D, eps(t)));
    }

    function err(t, x) {
        return math.abs(sol(t, x) - eps(t));
    }

    
    var prevError = Infinity;
    function terminate(t, x) {
        var currentError = err(t, x);
        if (currentError < epsilon && math.abs(math.divide(currentError, prevError) - 1) < 1e-7) {
            return 1;
        }
        return -1;
    }

    var response = numeric.dopri(0, 20, math.zeros(this.A.length), dx, 1e-8, 1000, terminate);
    var response_val = response.at(response.x).map(function(val, i){ return sol(response.x[i], val); });
    return {t: response.x, x: response_val};
};


module.exports = {
    System: System,

    /**
     * Constructs a system with the given zeros, poles and k.
     * @param {Array<(Complex|Number)>} z - The zeros of the system's tf.
     * @param {Array<(Complex|Number)>} p - The poles of the system's tf.
     * @param {Array<(Complex|Number)>} k - The gain of the system's tf.
     * @returns {System}
     */
    zpk: function(z, p, k) {
        if (arguments.length === 1 && arguments[0] instanceof System) {
            var sys = arguments[0];
            // Convert from Tf to Zpk
            if (sys instanceof Tf) {
                return this.tf2zpk(sys);
            }
        }
        return new Zpk(z, p, k);
    },


    /**
     * Constructs a system from a transfer function.
     * @param {Array<(Number|Complex)>} numerator - The numerator of the transfer function.
     * @param {Array<(Number|Complex)>} denom - The denominator of the transfer function.
     * @return {System} A system with the given transfer function.
     */
    tf: function(numerator, denom) {
        if (arguments.length === 1 && arguments[0] instanceof System) {
            var sys = arguments[0];
            // Convert from Zpk to Tf
            if (sys instanceof Zpk) {
                return this.zpk2tf(sys);
            }
        }
        return new Tf(numerator, denom);
    },


    /**
     * Constructs a system from a state-space representation.
     * @param {Array<Array<(Number|Complex)>>} A - The A matrix.
     * @param {Array<Array<(Number|Complex)>>} B - The B matrix.
     * @param {Array<Array<(Number|Complex)>>} C - The C matrix.
     * @param {Array<Array<(Number|Complex)>>} D - The D matrix.
     * @returns {Ss} The state-space system.
     */
    ss: function(A, B, C, D) {
        if (arguments.length === 1 && arguments[0] instanceof System) {
            var sys = arguments[0];
            // Convert from Tf to Ss
            if (sys instanceof Tf) {
                return this.tf2ss(sys);
            }
        }
        return new Ss(A, B, C, D);
    },

    /**
     * Converts a Tf system to a Ss system.
     * @param {Tf} sys - The system to convert.
     * @returns {Ss} The state-space representation of sys.
     */
    tf2ss: function(sys) {
        var A, B, C, D,
            numer = sys.getNumerator(),
            denom = sys.getDenominator(),
            as = denom.map(function(a){ return math.unaryMinus(math.divide(a, denom[0])); });

        // Make numer same length as denom
        numer = math.zeros(denom.length - numer.length).concat(numer);

        // Matrix
        A = num.diag(math.ones(as.length - 2), 1);
        var Aend = A.length - 1;
        as.slice(1, as.length).forEach(function(val, i) {
            A[Aend][Aend - i] = val;
        });

        // Column vector
        B = math.zeros(as.length - 1);
        B[B.length - 1] = 1;

        // Row vector
        C = [numer.slice(1, numer.length).map(function(b, i) { 
            return math.subtract(numer[numer.length - 1 - i], math.multiply(as[as.length - 1 - i], numer[0]));
        })];

        // Scalar
        D = numer[0];
        return new Ss(A, B, C, D);
    },

    /**
     * Converts a Zpk system to a Tf system.
     * @param {Zpk} sys - The system to convert
     * @returns {Tf} The transfer function representation of sys.
     */
    zpk2tf: function(sys) {
        var numerator = num.conv([sys.k], sys.z.map(function(z){ return [1, math.unaryMinus(z)]; }).reduce(function(acc, val){return num.conv(acc, val); })),
            denom = sys.p.map(function(p) { return [1, math.unaryMinus(p)]; }).reduce(function(acc, val){ return num.conv(acc, val); });
        return new Tf(numerator, denom);
    },
    
    /**
     * Converts a Tf system to a Zpk system.
     * @param {Tf} sys - The system to convert
     * @returns {Zpk} The zero-pole-gain representation of sys.
     */
    tf2zpk: function(sys) {
        var z = num.roots(sys.numerator),
            p = num.roots(sys.denominator),
            k = sys.numerator[0];
        return new Zpk(z, p, k);
    }
};
