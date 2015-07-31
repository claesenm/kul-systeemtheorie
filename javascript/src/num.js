var math = require('mathjs');
var _ = require('underscore');

/**
 * Numeric utilities
 * @module
 */
module.exports = {
    /**
     * Creates an array of n equidistant points between start and end inclusive.
     * @param {Number|Complex} start - The start of the sequence
     * @param {Number|Complex} end - The end of the sequence
     * @param {Number|Complex} [n=50] - The amount of points to return
     * @param {Boolean|Complex} [inclusive=true] - Wheter or not the endpoint should be included.
     * @return {Array<(Number|Complex)>} The array of equidistant points.
     */
    linspace: function(start, end, n, inclusive) {
        //Set defaults
        n = n || 50;
        inclusive = inclusive !== undefined ? inclusive : true;

        var step = math.divide(math.subtract(end, start), inclusive ? n-1 : n);
        var result = new Array(n);
        for (var i = 0; i < n; ++i) {
            result[i] = start + i * step;
        }

        //Ensure that the last element is exactly equal to end
        if (inclusive) {
            result[n-1] = end;
        }
        return result;
    },

    /**
     * Creates an array of n equidistant points between start and end inclusive in logspace.
     * @param {Number|Complex} start - The start exponent of the sequence
     * @param {Number|Complex} end - The end exponent of the sequence
     * @param {Number|Complex} [n=50] - The amount of points to return
     * @param {Boolean|Complex} [inclusive=true] - Wheter or not the endpoint exponent should be included.
     * @return {Array<(Number|Complex)>} The array of equidistant points in logspace.
     */
    logspace: function(start, end, num, inclusive, base) {
        base = base || 10;
        return _.map(this.linspace(start, end, num, inclusive), function(exponent) { return math.pow(base, exponent); });
    },

    /**
     * Evaluates a list of (Complex) numbers in s as if the list containes zeros/poles.
     * @param {Array<(Complex|Number)>} a - the array of numbers.
     * @param {(Complex|Number)} s - The point in which to evaluate.
     * @returns {(Complex|Number)} The result of the evaluation.
     */
    evalzorp: function(a, s) {
        return _.chain(a)
        .map(function(val){ return math.subtract(s, val);} )
        .reduce(function(memo, val){ return math.multiply(memo, val); })
        .value();
    },


    /**
     * Evaluates the list in s as if the list contains coëfficients of a polynomial in descending order.
     * @param {Array<(Number|Complex)>} p - The polynomial to evaluate.
     * @param {(Number|Complex)} s - The value in which to evaluate the polynomial.
     * @returns {(Number|Complex)} Returns the result of evaluating the polynomial in s
     */
    eval_poly: function(p, s) {
        var s_power = 1;
        var result = 0;
        for (var i = p.length - 1; i >= 0; --i) {
            result = math.add(result, math.multiply(p[i], s_power));
            s_power = math.multiply(s_power, s);
        }
        return result;
    }
};
