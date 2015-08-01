math = require('mathjs');
_ = require('underscore');

var numeric = require('numeric');

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
    },


    /**
     * Finds all the (complex) roots of a polynomial with real coëfficients.
     * @param {Array<Number>} poly - The polynomial.
     * @returns {Array<(Number|Complex)>} The roots of the polynomial
     */
    roots: function(poly) {

        // Check for valid poly
        if (poly.length <= 1) {
            return [];
        }


        var end = poly.length;
        // Remove trailing zeros and add them as roots
        while (math.equal(poly[end-1], 0)) {
            end -= 1;
        }
        var c = poly.slice(0, end);


        var d = c.slice(1, c.length).map(function(coeff) {
            return math.unaryMinus(math.divide(coeff, poly[0]));
        });


        // Build companion matrix
        var len = c.length;
        var a = new Array(len - 1);
        for (var i = 1; i < a.length; ++i) {
            a[i] = new Array(c.length - 1);
            for (var j = 0; j < a[i].length; ++j) {
                a[i][j] = 0;
            } 
            a[i][i-1] = 1;
        }
        a[0] = d;


        // Prepare for numeric
        //var reals = new Array(a.length);
        //var imaginaries = new Array(a.length);
        //for (var k = 0; k < a.length; ++k) {
            //reals[k] = new Array(a.length);
            //imaginaries[k] = new Array(a.length);

            //for (var l = 0; l < a.length; ++l) {
                //if (_.isNumber(a[k][l])) {
                    //reals[k][l] = a[k][l];
                    //imaginaries[k][l] = 0;
                //} else {
                    //reals[k][l] = a[k][l].re;
                    //imaginaries[k][l] = a[k][l].im;
                //}
            //}
        //}
        //a = new numeric.T(reals, imaginaries);
        
        
        var eigs = numeric.eig(a).lambda;
        var result = [];
        _.map(eigs.x, function(e, i) {
            if (eigs.y === undefined || math.equal(eigs.y[i], 0)) {
                result.push(e);
            } else {
                result.push(math.complex(e, eigs.y[i]));
            }
        });
        return result;
    }
};
