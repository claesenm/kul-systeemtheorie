var dygraphs = require('dygraphs');
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
        var omegas = num.linspace(math.pow(10, -1), math.pow(10, 3), 1000);
        var data = _.zip(omegas, _.map(omegas, function(omega) { return system.eval(math.complex(0, omega)); }));
        var options = {
            labels: ['omega (rad/s)', '|H(omega) (dB)|'],
            axes: {
                x: {
                    logscale: true
                },
                y: {
                    logscale: true
                }
            }
        };
        return new Dygraph(container, data, options);
    }
};
