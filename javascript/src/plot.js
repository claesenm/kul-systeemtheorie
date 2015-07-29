var Dygraph = require('dygraphs');
var system = require('./system');
var _ = require('underscore');
var math = require('mathjs');
var num = require('./num');

module.exports = {

    /**
     * Plots a bode plot of the given system in container.
     * @param {HTMLElement} container - The container in which to show the plot.
     * @param {System} system - The system of which to show the bode plot.
     * @returns {Dygraph} - A reference to the plot.
     */
    bode: function(container, system) {
        function div_half_height() {
            var d = document.createElement('div');
            d.style.width = container.style.width;
            d.style.height = container.style.offsetHeight / 2 + "px";
            container.appendChild(d);
            return d;
        }

        var magnitude_div = div_half_height(container);
        var phase_div = div_half_height(container);

        var omegas = num.logspace(-1, 3, 1000);
        var magnitudes_data = _.zip(omegas, _.map(omegas, function(omega) 
                                       {
                                           return math.multiply(20, math.log10(math.abs(system.eval(math.complex(0, omega))))); 
                                       }));
        var common_options = {
            axes: {
                x: {
                    logscale: true
                }
            }
        };

        var magnitude_options = {
            title: 'Magnitude',
            labels: ['omega', 'magnitude'],
            xlabel: 'omega (rad/s)',
            ylabel: '|H(omega) (dB)|',
        };

        return new Dygraph(magnitude_div, magnitudes_data, _.extend(common_options, magnitude_options));
    }
};
