var math = require('mathjs');
math.config({matrix: 'array'});

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
        return this.linspace(start, end, num, inclusive).map(function(exponent) { return math.pow(base, exponent); });
    },

    /**
     * Evaluates a list of (Complex) numbers in s as if the list containes zeros/poles.
     * @param {Array<(Complex|Number)>} a - the array of numbers.
     * @param {(Complex|Number)} s - The point in which to evaluate.
     * @returns {(Complex|Number)} The result of the evaluation.
     */
    evalzorp: function(a, s) {
        return a
        .map(function(val){ return math.subtract(s, val);} )
        .reduce(function(memo, val){ return math.multiply(memo, val); }, 1);
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

        return intermediates.reduce(this.polyadd, []);
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

        v.forEach(function(val) {
            mat[pos[0]][pos[1]] = val;
            pos[0] += 1;
            pos[1] += 1;
        });

        return mat;
    },

    /**
     * Determines what the interesting region is for this system in log10space.
     * @param {System} system - The system
     * @returns {Array<Number>} An array of 2 elements containing the bounds in log10space. Result[0] is the smallest exponent, result[1] is the biggest exponent.
     */
    interesting_region_logspace: function(system) {
        var points = system.getBreakPoints();
            points = points.filter(function(val) { return val !== 0; });

        if (points.length === 0) {
            return [-2, 3];
        }
        var smallest_omega = this.extreme_by(points, Math.min, function(v){ return math.abs(v); });
        var biggest_omega = this.extreme_by(points, Math.max, function(v){ return math.abs(v); });

        var log_bound_small = math.subtract(math.fix(math.log10(math.abs(smallest_omega))), 2);
        var log_bound_big = math.add(math.fix(math.log10(math.abs(biggest_omega))), 2);

        return [log_bound_small, log_bound_big];
   },


   /**
    * Finds an extreme of an array.
    * @param {Array<Mixed>} arr - The array in which to search.
    * @param {Function} extreme - The function to compare with (e.g. Math.min)
    * @param {Function} on - Comparison happens on what 'on' returns. Gets called for each element.
    */
   extreme_by: function(arr, extreme, on) {
       var mapped = arr.map(on);
       var minVal = extreme.apply(Math, mapped);
       return arr[mapped.indexOf(minVal)];
   },


   /**
    * Determines performance indicators of a step response.
    * @param {Object} step - The step response of a system.
    * @param {Number} settling_time_threshold - The threshold for the settling time.
    * @param {Number} [y_final] - The end value of the response. The last value of step is used when y_final is undefined.
    * @returns {Object} info - An object containing the info.
    */
   stepinfo: function(step, settling_time_threshold, y_final) {
       settling_time_threshold = settling_time_threshold || 0.02;

       // Finds an interpolated index of val in array
       function find(arr, val) {
           for (var i = 0; i < arr.length - 1; ++i) {
               if (arr[i] < val && arr[i+1] > val) {
                   return i + (val - arr[i]) / (arr[i+1] - arr[i]);
               }
           }
           return -1;
       }

       // Finds the index of the last element for which fun is true.
       function findLastIndex(arr, fun) {
           var last = -1;
           for (var i = 0; i < arr.length; ++i) {
               if (fun(arr[i])) {
                   last = i;
               }
           }
           return last;
       }

       // Linear interpolation
       function lerp(fst, snd, alpha) {
           return math.add(fst, math.multiply(alpha, math.subtract(snd, fst)));
       }

       // Get element in arr at i, linearly interpolated
       function at(arr, i) {
           var low = math.floor(i),
               high = math.ceil(i);
           return lerp(arr[low], arr[high], i-low);
       }

       var len = step.t.length;
       y_final = y_final || step.x[len - 1];

       var t = step.t,
           y = step.x,
           rise_time_lims = [0.1, 0.9];

       if (!y.every(isFinite)) {
           return {
               rise_time: NaN,
               settling_time: NaN,
               settling_min: NaN,
               settling_max: NaN,
               overshoot: NaN,
               undershoot: NaN,
               peak: NaN,
               peak_time: NaN,
               rise_time_low: NaN,
               rise_time_high: NaN
           };
       }

       // Get the peak, peak_time and y values for the rise time
       var peak = this.extreme_by(y, Math.max, function(v){ return math.abs(v); }),
           peak_time = t[y.indexOf(peak)],
           y_low = y[0] + rise_time_lims[0] * (y_final - y[0]),
           y_high = y[0] + rise_time_lims[1] * (y_final - y[0]);

       //console.log(t.map(function(val, i){ return [val, y[i]]; }));
       // Index and time of the rise time bounds
       var i_low = find(y, y_low),
           i_high = find(y, y_high),
           t_low = i_low == -1 ? NaN : at(t, i_low),
           t_high = i_high == -1 ? NaN : at(t, i_high);

       var settling_min = NaN,
           settling_max = NaN;

       // If i_high is -1 then the signal hasn't reached y_high yet
       if (i_high !== -1) {
           var y_settling = y.slice(i_high, len);
           settling_min = Math.min.apply(Math, y_settling);
           settling_max = Math.max.apply(Math, y_settling);
       }

       var rise_time = t_high - t_low,
           err = math.subtract(y, y_final).map(function(v){ return math.abs(v); }),
           tol = settling_time_threshold * Math.max.apply(Math, err);

       // Calculate index of settle in err
       var i_settle = findLastIndex(err, function(err) { return err > tol; });

       // Settling time
       var settling_time;
       if (i_settle === 0) {
           settling_time = 0;
       } else if (i_settle == -1) {
           settling_time = NaN;
       } else {
           settling_time = t[i_settle];
       }
       
       // Determine overshoot and undershoot
       var overshoot, undershoot;
       if (y_final === 0) {
           overshoot = Infinity;
           if (y.every(function(val) {return val >= 0;})) {
               undershoot = 0;
           } else {
               undershoot = Infinity;
           }
       } else {
           var y_rel = y.map(function(val) { return math.divide(val, y_final); });
           overshoot = 100 * Math.max(0, Math.max.apply(Math, math.subtract(y_rel, 1)));
           undershoot = -100 * Math.min(0, Math.min.apply(Math, y_rel));
       }



       return {
           rise_time: rise_time,
           settling_time: settling_time,
           settling_min: settling_min,
           settling_max: settling_max,
           overshoot: overshoot,
           undershoot: undershoot,
           peak: peak,
           peak_time: peak_time,
           rise_time_low: t_low,
           rise_time_high: t_high
       };
   },

   /**
    * Convert a (possibly) complex number to a Number if the imaginary part is smaller than threshold.
    * @param {(Complex|Number)} c - The (possibly) complex number.
    * @param {Number} [threshold=1e-7] - The threshold for the imaginary part.
    * @returns {(Complex|Number)} The converted complex number, or the number itself if it wasn't converted.
    */
   complex_to_real_if_real: function(c, threshold) {
       threshold = threshold || 1e-7;
       if (c.im !== undefined && c.im <= threshold) {
           return c.re;
       }
       return c;
   }
};
