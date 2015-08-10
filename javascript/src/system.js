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
 * Returns a string of the latex representation of this system.
 * @returns {String} The latex representation of this system.
 */
System.toLatex = function() {
    throw new Error('This is not a valid system.');
};

/**
 * Evaluates the transfer function of this system in s.
 * @param {Complex|Number} s
 * @returns {Complex|Number} The value of the tf of this system evaluated in s.
 * @abstract
 */
System.prototype.evalS = function(s) {
    throw new Error('This is not a valid system.');
    /* Implementation is defined in the children. */
};

/**
 * Calculates values for a bode plot.
 * @param {Array<Number>} [omega_exp_bounds] - The boundaries for omega in logspace.
 * @returns {Object} bode - An object containing three arrays with the values.
 * @config {Array<Number>} bode.omegas - The array of used omegas.
 * @config {Array<Number>} bode.dBs - The array with the values in dB.
 * @config {Array<Number>} bode.degrees - The array of degrees.
 */
System.prototype.bode = function(omega_exp_bounds) {
    var sys = this;
    omega_exp_bounds = omega_exp_bounds || num.interesting_region_logspace(sys);
    var omegas = num.logspace(omega_exp_bounds[0], omega_exp_bounds[1], 1000);


    var evaluated_omegas = omegas.map(function(omega) { return sys.evalS(math.complex(0, omega)); });
    var magnitudes_data = evaluated_omegas.map(function(H, i) { return 20 * math.log10(math.abs(H)); });
    var phases_data = evaluated_omegas.map(function(H, i) { return 180 / math.pi * math.arg(H); });
    return {
        'omegas': omegas,
        dBs: magnitudes_data,
        degrees: phases_data
    };
};


/**
 * Calculates the step response of the given system.
 * @param {Array<Number>} [bounds=[0, 20]] - The bounds of the simulation.
 * @param {Boolean} [settle=false] - Whether to terminate the simulation when the signal has settled.
 * @returns {Object} response - The step response of the system.
 * @returns {Array<Number>} response.t - The time values of the step response.
 * @returns {Array<Number>} response.x - The value of the response.
 */
System.prototype.step = function(bounds, settle) {
    return module.exports.ss(this).step(bounds, settle);
};


/**
 * Calculates the impulse reponse of the system.
 * @param {Array<Number>} [bounds=[0, 20]] - The bounds of the simulation.
 * @param {Boolean} [settle=false] - Whether to terminate the simulation when the signal has settled.
 * @returns {Object} response - An object containing the impulse response of the system.
 * @returns {Array<Number>} response.t - The time values of the calculated impulse response.
 * @returns {Array<Number>} response.x - The actual values of the calculated impulse response.
 */
System.prototype.impulse = function(bounds, settle) {
    var step = this.step(bounds, settle),
        len = step.t.length,
        diffs = new Array(len);
    for (var i = 0 ; i < len - 1; ++i) {
        var dt = math.subtract(step.t[i+1], step.t[i]),
            dx = math.subtract(step.x[i+1], step.x[i]);
        diffs[i] = math.divide(dx, dt);
    }
    diffs[len - 1] = math.divide(math.subtract(step.x[len - 1], step.x[len - 2]), math.subtract(step.t[len - 1], step.t[len - 2]));
    return {
        t: step.t,
        x: diffs
    };
};


/**
 * Returns a list of all the breakpoints of this system's transfer function.
 * The breakpoints are the zeros and the poles combined.
 * @returns {Array<(Number|Complex)>} The breakpoints.
 */
System.prototype.getBreakPoints = function() {
    return module.exports.zpk(this).getBreakPoints();
};



/**
 * Returns the zeros of this system's transfer function.
 * @returns {Array<(Complex|Number)>}
 */
System.prototype.getZeros = function() {
    return module.exports.zpk(this).getZeros();
};


/**
 * Returns the poles of this system's transfer function.
 * @returns {Array<(Complex|Number)>}
 */
System.prototype.getPoles = function() {
    return module.exports.zpk(this).getPoles();
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
    if (z.length > p.length) {
        throw new Error("The degree of the numerator can't be bigger than the degree of the denominator!");
    }
    this.z = z;
    this.p = p;
    this.k = k;
}
Zpk.prototype = new System();


/**
 * @inheritdoc
 */
Zpk.prototype.toLatex = function() {
    function sort_on_real_inplace(arr) {
        arr.sort(function(a, b) {
            return math.abs(math.re(a)) - math.abs(math.re(b));
        });
    }

    var latexified = new Array(2),
        zeros = this.getZeros(),
        poles = this.getPoles();

    sort_on_real_inplace(zeros);
    sort_on_real_inplace(poles);

    [zeros, poles].forEach(function (points, idx) {
        var latexed = '';
        points.forEach(function(point, i) {
            latexed += '\\left(s';
            if (math.isNumeric(point) && point < 0) {
                latexed += '+' + (-point);
            } else if (math.isNumeric(point)){
                latexed += '-' + point;
            } else {
                latexed += '-' + '\\left(' + point.toString().replace('i', 'j') + '\\right)';
            }

            latexed += '\\right)';
        });
        latexified[idx] = latexed;
    });

    // For when there are no zeros or poles
    var k_latex = this.getK() === 1 ? '' : ('' + this.getK());
    if (latexified[0] === '') {
        latexified[0] = k_latex;
        k_latex = '';
    }
    if (latexified[1] === '') {
        latexified[1] = '1';
    }

    return k_latex + '\\frac{' + latexified[0] + '}{' + latexified[1] + '}';
};

/**
 * Sets the zeros of the system's tf.
 * @param {Array<(Complex|Number)>} z - The zeros of the new tf.
 * @private
 */
Zpk.prototype.setZeros = function(z) {
    this.z = z;
};


/**
 * @inheritdoc
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
 * @inheritdoc
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
Zpk.prototype.evalS = function(s) {
    var numerator = num.evalzorp(this.z, s);
    var denom = num.evalzorp(this.p, s);
    var quotient = math.divide(numerator, denom);
    return math.multiply(this.k, quotient);
};

/**
 * @inheritdoc
 */
Zpk.prototype.getBreakPoints = function() {
    var zeros = this.getZeros(),
        poles = this.getPoles();
    return zeros.concat(poles);
};

/**
 * Creates a system with a transfer function representation.
 * @param {Array<(Number|Complex)>} num - The numerator of the transfer function.
 * @param {Array<(Number|Complex)>} denom - The denominator of the transfer function.
 * @constructor
 * @augments System
 */
function Tf(num, denom) {
    if (num.length > denom.length) {
        throw new Error("The degree of the numerator can't be bigger than the degree of the denominator!");
    }
    this.setNumerator(num);
    this.setDenominator(denom);
}
Tf.prototype = new System();


/**
 * @inheritdoc
 */
Tf.prototype.toLatex = function() {

    function poly_to_latex(poly) {
        var degree = poly.length - 1,
            poly_latex = '',
            ROUNDING = 4;

        for (var i = 0; i < poly.length; ++i) {
            var power = (degree - i),
                s_factor;

            switch (power) {
                case 1:
                    s_factor = 's'; break;
                case 0:
                    s_factor = ''; break;
                default:
                    s_factor = 's^{' + power + '}';
            }

            var op = (poly[i] < 0) ? '-' : '+',
                coeff = math.round(math.abs(poly[i]), ROUNDING);
            if (i !== degree && coeff === 1) {
                coeff = '';
            }

            if (i === 0) {
                poly_latex += (poly[i] < 0 ? '-' : '') + coeff + s_factor;
                continue;
            }

            if (! math.equal(coeff, 0)) {
                poly_latex += ' ' + op + ' ' + coeff + s_factor;
            }
        }

        return poly_latex;
    }

    var latexified = new Array(2);
    [this.getNumerator(), this.getDenominator()].forEach(function(poly, idx) {
        latexified[idx] = poly_to_latex(poly);
    });

    return '\\frac{' + latexified[0] + '}{' + latexified[1] + '}';
};


/**
 * Sets the numerator of the tf of the system.
 * @param {Array<(Number|Complex)>} n - The numerator of the tf.
 * @private
 */
Tf.prototype.setNumerator = function(n) {
    this.numerator = num.strip_leading_zeros(n);
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
    this.denominator = num.strip_leading_zeros(d);
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
Tf.prototype.evalS = function(s) {
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
 * @inheritdoc
 */
Ss.prototype.step = function(bounds, settle) {
    bounds = bounds || [0, 20];
    settle = (settle !== undefined ? settle : false);


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


    // Put the results in a queue
    var QUEUESIZE = 100,
        resultsT = math.zeros(QUEUESIZE),
        resultsX = math.zeros(QUEUESIZE),
        current = 0;
    function mod_subtract(a, b, m) {
        if (a >= b) {
            return a - b;
        }
        return m - (b - a);
    }
    function terminate(t, x) {
        resultsT[current] = t;
        resultsX[current] = x;
        var i = 0,
            toUse = [],
            timeSeen = 0;
        while (i < QUEUESIZE && timeSeen < 1) {
            var idx = mod_subtract(current, i, QUEUESIZE);
            toUse.push(sol(t, resultsX[idx]));
            timeSeen = t - resultsT[idx];
            i += 1;
        }

        current = (current + 1) % QUEUESIZE;

        if (timeSeen < 1) {
            return -1;
        }
        var mean = toUse.reduce(function(acc, val){ return acc + val; }) / toUse.length,
            absolute_error = toUse.map(function(val){ return math.abs(val - mean); }).reduce(function(acc, val){ return acc + val; }),
            relative_error = math.abs(absolute_error / mean);

        if (relative_error > 1e-2) {
            return -1;
        }
        return 1;
    }

    var terminator = settle ? terminate : function() {return -1;},
        response = numeric.dopri(0, 20, math.zeros(this.A.length), dx, 1e-8, 1000, terminator),
        response_val = response.at(response.x).map(function(val, i){ return sol(response.x[i], val); });
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
            if (sys instanceof Ss) {
                return this.ss2zpk(sys);
            }
            if (sys instanceof Zpk) {
                return sys;
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
            if (sys instanceof Tf) {
                return sys;
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
            if (sys instanceof Ss) {
                return sys;
            }
            if (sys instanceof Zpk) {
                return this.zpk2ss(sys);
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
        // Controlable canonical form
        var A, B, C, D,
            numer = sys.getNumerator(),
            denom = sys.getDenominator(),
            as = denom.map(function(a){ return math.unaryMinus(math.divide(a, denom[0])); });

        if (denom.length == 1) {
            return new Ss([[1]], [1], [[0]], [numer[0]]);
        }
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
        function toPoly(zorp){
            return [1, math.unaryMinus(zorp)];
        }
        var numerator = num.conv([sys.k], sys.z.map(toPoly).reduce(function(acc, val){return num.conv(acc, val); }, [1]).map(num.complex_to_real_if_real)),
            denom = sys.p.map(toPoly).reduce(function(acc, val){ return num.conv(acc, val); }, [1]).map(num.complex_to_real_if_real);
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
    },

    /**
     * Converts a Zpk system to a Ss system.
     * @param {Zpk} sys - The system to convert
     * @returns {Ss} The state-space representation of sys.
     */
    zpk2ss: function(sys) {
        return this.tf2ss(this.zpk2tf(sys));
    },

    /**
     * Gives the system with a transfer function of TF_sys1 + TF_sys2.
     * @param {(Zpk|Tf)} sys1 - The first term of the addition.
     * @param {(Zpk|Tf)} sys2 - The second term of the addition.
     * @returns {Tf} The addition of both transfer functions.
     */
    add: function(sys1, sys2) {
        var newNum,
            newDenom,
            sys,
            sys1tf = this.tf(sys1),
            sys2tf = this.tf(sys2);


        newDenom = num.conv(sys1tf.getDenominator(), sys2tf.getDenominator());
        newNum   = num.polyadd(num.conv(sys1.getNumerator(), sys2.getDenominator()), num.conv(sys2.getNumerator(), sys1.getDenominator()));
        return new Tf(newNum, newDenom);
    },

    /**
     * Returns the multiplication of the transfer function of two systems.
     * @param {(Zpk|Tf)} sys1 - The left factor of the multiplication.
     * @param {(Zpk|Tf)} sys2 - The right factor of the multiplication.
     * @returns {Tf} The multiplication of both transfer functions.
     */
    multiply: function(sys1, sys2) {
        var sys1tf = this.tf(sys1),
            sys2tf = this.tf(sys2);

        return new Tf(num.conv(sys1tf.getNumerator(), sys2tf.getNumerator()), num.conv(sys1tf.getDenominator(), sys2tf.getDenominator()));
    },

    /**
     * Returns the transfer function of the sytem corresponding to the closed loop negative feedback system of sys1 with sys2 on the feeback connection.
     * @param {(Zpk|Tf)} G - The system of which the feedback should be calculated.
     * @param {(Zpk|Tf|Number)} [H=1] - The system on the feedback connection.
     */
    feedback: function(G, H) {
        if (! (H instanceof System)) {
            H = new Tf([H], [1]);
        }

        return new Tf(num.conv(G.getNumerator(), H.getDenominator()),
                      num.polyadd(num.conv(G.getDenominator(), H.getDenominator()), num.conv(G.getNumerator(), H.getNumerator())));
    }
};
