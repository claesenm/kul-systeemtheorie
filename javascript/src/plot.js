var Dygraph = require('dygraphs');
var _ = require('underscore');
var math = require('mathjs');
var system = require('./system');
var num = require('./num');

/**
 * A module containing methods for plotting.
 * @module
 */
module.exports = {

    /**
     * Plots a bode plot of the given system in container.
     * @param {HTMLElement} container - The container in which to show the plot.
     * @param {System} system - The system of which to show the bode plot.
     * @returns {Array<Dygraph>} - An array of 2 plots. The first is the magnitude plot and the second is the phase plot.
     */
    bode: function(container, system) {
        function div_half_height() {
            var d = document.createElement('div');
            d.style.width = container.offsetWidth + "px";
            d.style.height = container.offsetHeight / 2 + "px";
            container.appendChild(d);
            return d;
        }

        var magnitude_div = div_half_height(container);
        var phase_div = div_half_height(container);

        omega_bounds = this.interesting_region_logspace(system);
        var omegas = num.logspace(omega_bounds[0], omega_bounds[1], 1000);


        var evaluated_omegas = _.map(omegas, function(omega) { return system.eval(math.complex(0, omega)); });
        var magnitudes_data = _.zip(omegas, _.map(evaluated_omegas, function(H) { return 20 * math.log10(math.abs(H)); }));
        var phases_data = _.zip(omegas, _.map(evaluated_omegas, function(omega) { return 180 / math.pi * math.arg(omega); }));

        var common_options = {
            legend: 'follow',
            labelsDivStyles: {
                backgroundColor:  "rgba(0, 0, 0, 0)"
            },
            axes: {
                x: {
                    logscale: true,
                    valueFormatter: function(num) {
                        return math.round(num, 5);
                    }
                }
            }
        };

        var magnitude_options = {
            labels: ['Pulsation', 'Magnitude'],
            xlabel: 'Pulsation (rad/s)',
            ylabel: 'Magnitude (dB)',
        };
        
        var phase_options = {
            labels: ['Pulsation', 'Phase'],
            xlabel: 'Pulsation (rad/s)',
            ylabel: 'Phase (degrees)'
        };

        return [new Dygraph(magnitude_div, magnitudes_data, _.extend(common_options, magnitude_options)),
                new Dygraph(phase_div, phases_data, _.extend(common_options, phase_options))];
    },

    /**
     * Determines what the interesting region is for this system in log10space.
     * @param {System} system - The system
     * @returns {Array<Number>} An array of 2 elements containing the bounds in log10space. Result [0] is the smallest exponent, result[1] is the biggest exponent.
     */
    interesting_region_logspace: function(system) {
        var points = _.union(system.getZeros(), system.getPoles());
        var smallest_omega = _.min(points, function(v){ return math.abs(v); });
        var biggest_omega = _.max(points, function(v){ return math.abs(v); });

        var log_bound_small = math.subtract(math.fix(math.log10(math.abs(smallest_omega))), 2);
        var log_bound_big = math.add(math.fix(math.log10(math.abs(biggest_omega))), 2);

        return [log_bound_small, log_bound_big];
    }
};
