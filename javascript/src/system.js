var _ = require('underscore');
var math = require('mathjs');
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
                z = num.roots(sys.numerator);
                p = num.roots(sys.denominator);
                k = sys.numerator[0];
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
                numerator = num.conv([sys.k], sys.z.map(function(z){ return [1, math.unaryMinus(z)]; }).reduce(function(acc, val){return num.conv(acc, val); }));
                 denom = sys.p.map(function(p) { return [1, math.unaryMinus(p)]; }).reduce(function(acc, val){ return num.conv(acc, val); });
            }
        }
        return new Tf(numerator, denom);
    }
};
