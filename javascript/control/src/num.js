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

        // Remove leading zeros
        var begin;
        for (begin = 0; begin < poly.length; ++i) {
            if (poly[begin] !== 0) {
                break;
            }
        }
        poly = poly.slice(begin, poly.length);

        var end = poly.length;
        // Remove trailing zeros and add them as roots
        while (math.equal(poly[end-1], 0)) {
            end -= 1;
        }
        var c = poly.slice(0, end);


        // Remove small leading coefficients that introduce infinities
        function calc_d(coeff) {
            return math.unaryMinus(math.divide(coeff, c[0]));
        }
        var d = c.slice(1, c.length).map(calc_d);
        while (!d.every(isFinite)) {
            c = c.slice(1, c.length);
            d = c.slice(1, c.length).map(calc_d);
        }


        // Used for returning the roots, appends the roots
        // found when removing the trailing zeros
        function append_zeros(s) {
            return s.concat(math.zeros(poly.length - end));
        }

        // Check for valid poly
        if (c.length <= 1) {
            return append_zeros([]);
        }

        // Do simple case here
        if (c.length === 2) {
            return append_zeros([math.divide(math.unaryMinus(poly[1]), poly[0])]);
        }

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
        return append_zeros(result);
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
            return [0, 1];
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
    * Linearly interpolates from fst to snd using alpha.
    * alpha=0 returns fst and alpha=1 returns snd.
    * @param {Mixed} fst - The starting element.
    * @param {Mixed} snd - The end element.
    * @param {Mixed} alpha - The progress element.
    * @returns {Mixed} The linear interpolation.
    */
   lerp: function(fst, snd, alpha) {
       return math.add(fst, math.multiply(alpha, math.subtract(snd, fst)));
   },


   /**
    * Get element from arr at position i, linearly interpolated. (No bounds checking).
    * @param {Array<Mixed>} arr - The array to access.
    * @param {Number} i - The fractional index.
    * @returns {Mixed} The value at i linearly interpolated.
    */
   at: function (arr, i) {
       var low = math.floor(i),
           high = math.ceil(i);
       return module.exports.lerp(arr[low], arr[high], i-low);
   },

   /**
    * Finds val in arr and returns the linearly interpolated index.
    * @param {Array<Number>} arr - The array to search in.
    * @param {Number} val - The value to find.
    * @returns {Number} The linearly interpolated index. -1 if not found.
    */
   find: function (arr, val) {
       for (var i = 0; i < arr.length - 1; ++i) {
           if (arr[i] < val && arr[i+1] > val) {
               return i + (val - arr[i]) / (arr[i+1] - arr[i]);
           }
       }
       return -1;
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
       y_final = y_final || step.x[step.x.length - 1];

       var meta = {high: 0.9, low: 0.1, settling_threshold: settling_time_threshold};


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

       var find = module.exports.find;

       var len = step.t.length;

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
               rise_time_high: NaN,
               meta: meta
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
           t_low = i_low == -1 ? NaN : module.exports.at(t, i_low),
           t_high = i_high == -1 ? NaN : module.exports.at(t, i_high);

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
       var settling_time,
           settling_value;
       if (i_settle === 0) {
           settling_time = 0;
           settling_value = y[0];
       } else if (i_settle == -1) {
           settling_time = NaN;
           settling_value = NaN;
       } else {
           settling_time = t[i_settle];
           settling_value = y[i_settle];
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
           settling_value: settling_value,
           settling_min: settling_min,
           settling_max: settling_max,
           overshoot: overshoot,
           undershoot: undershoot,
           peak: peak,
           peak_time: peak_time,
           rise_time_low: t_low,
           rise_time_high: t_high,
           meta: meta
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
   },

   /**
    * Strips away the leading zeros of the given array.
    * @param {Array<(Complex|Number)>} arr - The array to strip.
    * @returns {Array<(Complex|Number)>} The same array with the leading zeros stripped away.
    */
   strip_leading_zeros: function(arr) {
       var begin = 0;

       while (math.equal(arr[begin], 0)) {
           begin += 1;
       }

       return arr.slice(begin, arr.length);
   },
   
   /**
    * Returns the phase and gain margin and their corresponding pulsations.
    * @param {Object} bode - The result from a call to System.bode.
    * @returns {Object} result - The phase and gain margin and their corresponding pulsations.
    * @returns {Number} result.gain - The gain margin in dB.
    * @returns {Number} result.phase - The phase margin in dB.
    * @returns {Number} result.gain_omega - The omega at which the gain margin is calculated.
    * @returns {Number} result.phase_omega - The omega at which the phase margin is calculated.
    */
   margin: function(bode) {
       var find = module.exports.find,
           phase_idx = find(bode.dBs, 0),
           phase_omega = phase_idx === -1 ? Infinity : at(bode.omegas, phase_idx),
           phase = phase_idx === -1 ? Infinity : 180 + mathh.abs(at(bode.degrees, phase_idx)),
           gain_idx = find(bode.degrees.map(function(deg){ return math.abs(deg); }), 180),
           gain_omega = gain_idx === -1 ? Infinity : at(bode.omegas, phase_idx),
           gain = gain_idx === -1 ? Infinity : -at(bode.dBs, phase_idx);

       return {
           gain: gain,
           phase: phase,
           gain_omega: gain_omega,
           phase_omega: phase_omega
       };
   },


   /**
    * Zips together multiple lists.
    * @param {Array<Mixed>} arrays - Multiple arrays.
    * @returns {Array<Array<Mixed>>} The zipped arrays.
    */
   zip: function() {
       var res = new Array(arguments[0].length);
       for(var i = 0; i < res.length; ++i) {
           res[i] = new Array(arguments.length);
           for(var j = 0; j < arguments.length; ++j) {
               res[i][j] = arguments[j][i];
           }
       }
       return res;
   }
};
