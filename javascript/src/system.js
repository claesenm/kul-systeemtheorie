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
    this.z = [];

    /** @private */
    this.p = [];

    /** @private */
    this.k = 1;
}



/**
 * Evaluates the transfer function of this system in s.
 * @param {Complex|Number} s
 * @returns {Complex|Number} The value of the tf of this system evaluated in s.
 */
System.prototype.eval = function(s) {
    var numerator = num.evalzorp(this.z, s);
    var denom = num.evalzorp(this.p, s);
    var quotient = math.divide(numerator, denom);
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
