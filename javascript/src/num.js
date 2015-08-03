math = require('mathjs');
math.config({matrix: 'array'});
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
    polyval: function(p, s) {
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

        // Do simple case here
        if (poly.length === 2) {
            return [math.divide(math.unaryMinus(poly[1]), poly[0])];
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
        var a = this.diag(math.ones(c.length - 2), -1);
        a[0] = d;

        // Convert to mathjs.
        var eigs = numeric.eig(a).lambda;
        var result = [];
        eigs.x.map(function(e, i) {
            if (eigs.y === undefined || math.equal(eigs.y[i], 0)) {
                result.push(e);
            } else {
                result.push(math.complex(e, eigs.y[i]));
            }
        });
        return result;
    },


    /**
     * Adds 2 polynomials together.
     * @param {Array<(Number|Complex)>} poly1 - The first polynomial.
     * @param {Array<(Number|Complex)>} poly2 - The second polynomial.
     * @returns {Array<(Number|Complex)>} The sum of the given polynomials.
     */
    polyadd: function(poly1, poly2) {
        var smallest,
            biggest;

        if (poly1.length <= poly2.length) {
            smallest = poly1;
            biggest = poly2;
        } else {
            biggest = poly1;
            smallest = poly2;
        }

        var padding = Array.apply(null, Array(biggest.length - smallest.length)).map(function() { return 0; });
        var smallest_padded = padding.concat(smallest);

        return smallest_padded.map(function(e1, index){ return math.add(e1, biggest[index]); });
    },

    /**
     * Multiplies 2 polynomials together.
     * @param {Array<(Number|Complex)>} poly1 - The first polynomial.
     * @param {Array<(Number|Complex)>} poly2 - The second polynomial.
     * @returns {Array<(Number|Complex)>} The product of the given polynomials.
     */
    conv: function(poly1, poly2) {
        var intermediates = new Array(poly1.length),
            p1length = poly1.length;
        
        poly1.forEach(function(el1, i) {
            var intermediate = poly2.map(function(el2){ return math.multiply(el1, el2); });
            // Add padding to get the right degree
            intermediates[i] = intermediate.concat(Array.apply(null, Array(p1length - i - 1)).map(function() { return 0; }));
        });

        return intermediates.reduce(this.polyadd);
    },

    /**
     * Creates a square matrix with v as its diagonal.
     * @param {Array<(Number|Complex)>} v - The diagonal of the matrix.
     * @param {Number} [n=0] - The number of the diagonal to put v on.
     * @returns {Array<Array<(Number|Complex)>>} The created matrix.
     */
    diag: function(v, n) {
        n = n || 0;
        var dim = v.length + math.abs(n),
            mat = math.zeros(dim, dim),
            start = n > 0 ? [0, n] : [-n, 0],
            pos = start;

        v.forEach(function(val, i) {
            mat[pos[0]][pos[1]] = 1;
            pos[0] += 1;
            pos[1] += 1;
        });

        return mat;
    }
};
