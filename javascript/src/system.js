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
 */
function System() {
    /** @private */
    this.z = null;

    /** @private */
    this.p = null;

    /** @private */
    this.k = null;

    /** @private */
    this.numerator = null;

    /** @private */
    this.denominator = null;
}

/**
 * Returns whether or not this system has valid zpk internals.
 * @private
 */
System.prototype.hasZPK = function() {
    return (this.z !== null && this.p !== null && this.k !== null);
};


/**
 * Returns whether or not this system has valid numerator/denominator internals.
 * @private
 */
System.prototype.hasNumDenom = function() {
    return (this.numerator !== null && this.denominator !== null);
};


/**
 * Evaluates the transfer function of this system in s.
 * @param {Complex|Number} s
 * @returns {Complex|Number} The value of the tf of this system evaluated in s.
 */
System.prototype.eval = function(s) {
    throw new Error('This is not a valid system.');
    /* Implementation is in the different constructor functions */
};


/**
 * Sets the zeros of the system's tf.
 * @param {Array<(Complex|Number)>} z - The zeros of the new tf.
 * @private
 */
System.prototype.setZeros = function(z) {
    this.z = z;
};


/**
 * Returns the zeros of this system's transfer function.
 * @returns {Array<(Complex|Number)>}
 */
System.prototype.getZeros = function() {
    return this.z;
};

/**
 * Sets the poles of the system's tf.
 * @param {Array<(Complex|Number)>} p - The poles of the new tf.
 * @private
 */
System.prototype.setPoles = function(p) {
    this.p = p;
};

/**
 * Returns the poles of this system's transfer function.
 * @returns {Array<(Complex|Number)>}
 */
System.prototype.getPoles = function() {
    return this.p;
};

/**
 * Sets the k of the system's tf.
 * @param {Complex|Number} k - The k of the new tf.
 * @private
 */
System.prototype.setK = function(k) {
    this.k = k;
};


/**
 * Returns the k of this system's transfer function.
 * @returns {(Complex|Number)}
 */
System.prototype.getK = function() {
    return this.k;
};


/**
 * Sets the numerator of the tf of the system.
 * @param {Array<(Number|Complex)>} n - The numerator of the tf.
 * @private
 */
System.prototype.setNumerator = function(n) {
    this.numerator = n;
};


/**
 *  @returns {Array<(Number|Complex)>} the numerator of the transfer function.
 */
System.prototype.getNumerator = function() {
    return this.numerator;
};


/**
 * Sets the denominator of the tf of the system.
 * @param {Array<(Number|Complex)>} d - The denominator of the tf.
 * @private
 */
System.prototype.setDenominator = function(d) {
    this.denominator = d;
};

/**
 *  @returns {Array<(Number|Complex)>} the denominator of the transfer function.
 */
System.prototype.getDenominator = function() {
    return this.denominator;
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
        var sys = new System();
        sys.setZeros(z);
        sys.setPoles(p);
        sys.setK(k);

        sys.eval = function(s) {
            var numerator = num.evalzorp(this.z, s);
            var denom = num.evalzorp(this.p, s);
            var quotient = math.divide(numerator, denom);
            return math.multiply(this.k, quotient);
        };

        return sys;
    },


    /**
     * Constructs a system from a transfer function.
     * @param {Array<(Number|Complex)>} numerator - The numerator of the transfer function.
     * @param {Array<(Number|Complex)>} denom - The denominator of the transfer function.
     * @return {System} A system with the given transfer function.
     */
    tf: function(numerator, denom) {
        var sys = new System();
        sys.setNumerator(numerator);
        sys.setDenominator(denom);


        sys.eval = function(s) {
            return math.divide(num.polyval(this.numerator, s), num.polyval(this.denominator, s));
        };

        return sys;
    }
};
