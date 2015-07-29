var _ = require('underscore');
var math = require('mathjs');

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
    this.z = [];

    /** @private */
    this.p = [];

    /** @private */
    this.k = 1;
}

/**
 * Evaluates a list of (Complex) numbers in s as is they are zeros/poles.
 * @param {Array<(Complex|Number)>} a - the array of numbers.
 * @param {(Complex|Number)} s - The point in which to evaluate.
 * @returns {(Complex|Number)} The result of the evaluation.
 */
System.evalzorp = function(a, s) {
    return _.chain(a)
        .map(function(val){ return math.subtract(s, val);} )
        .reduce(function(memo, val){ return math.multiply(memo, val); })
        .value();
};


/**
 * Evaluates the transfer function of this system in s.
 * @param {Complex|Number} s
 * @returns {Complex|Number} The value of the tf of this system evaluated in s.
 */
System.prototype.eval = function(s) {
    var num = System.evalzorp(this.z, s);
    var denom = System.evalzorp(this.p, s);
    var quotient = math.divide(num, denom);
    return math.multiply(this.k, quotient);
};


/**
 * Sets the zeros of the system's tf.
 * @param {Array<(Complex|Number)>} z - The zeros of the new tf.
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
                return sys;
            },
};
