var Dygraph = require('dygraphs');
var synchronize = require('../lib/dygraph-extras/synchronizer');
var shapes = require('../lib/dygraph-extras/shapes');
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
     * @param {Array<Number>} omega_bounds - The boundaries of the pulsation to plot in logspace (e.g. 10^2 is entered as 2).
     * @returns {Array<Dygraph>} - An array of 2 plots. The first is the magnitude plot and the second is the phase plot.
     */
    bode: function(container, system, omega_bounds) {
        function div_half_height() {
            var d = document.createElement('div');
            d.style.width = container.offsetWidth + "px";
            d.style.height = container.offsetHeight / 2 + "px";
            container.appendChild(d);
            return d;
        }

        var magnitude_div = div_half_height(container);
        var phase_div = div_half_height(container);

        omega_bounds = omega_bounds || this.interesting_region_logspace(system);
        var omegas = num.logspace(omega_bounds[0], omega_bounds[1], 1000);


        var evaluated_omegas = _.map(omegas, function(omega) { return system.eval(math.complex(0, omega)); });
        var magnitudes_data = _.zip(omegas, _.map(evaluated_omegas, function(H) { return 20 * math.log10(math.abs(H)); }));
        var phases_data = _.zip(omegas, _.map(evaluated_omegas, function(omega) { return 180 / math.pi * math.arg(omega); }));

        var options = {
            legend: 'follow',
            labelsDivStyles: {
                'background-color':  'rgba(0, 0, 0, 0)'
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
            xlabel: '',
            ylabel: 'Magnitude (dB)',
        };
        
        var phase_options = {
            labels: ['Pulsation', 'Phase'],
            xlabel: 'Pulsation (rad/s)',
            ylabel: 'Phase (degrees)'
        };

        var graphs = [new Dygraph(magnitude_div, magnitudes_data, _.extend(options, magnitude_options)),
                      new Dygraph(phase_div, phases_data, _.extend(options, phase_options))];
        synchronize(graphs, {zoom: true, selection: true, range: false });
        return graphs;
    },

    /**
     * Plots a pole zero map of the given system.
     * @param {HTMLElement} container - The container in which to put the plot.
     * @param {System} sys - The system of which to plot the poles and zeros.
     * @returns {Dygraph} A reference to the created plot
     */
    pzmap: function(container, sys) {
        // Create an html element to display a custom legend.
        container.style.position = 'relative';
        var custom_legend = document.createElement('div');
        custom_legend.style.position = 'absolute';
        custom_legend.style.right = '0px';
        custom_legend.style.top = '0px';
        custom_legend.style['z-index'] = 1;
        console.log(custom_legend);
        container.appendChild(custom_legend);


        // Create new div for plot itself
        var plot_div = document.createElement('div');
        plot_div.style.width = container.offsetWidth + "px";
        plot_div.style.height = container.offsetHeight + "px";
        container.appendChild(plot_div);

        var zeros = sys.getZeros();
        var poles = sys.getPoles();

        var data = [];
        for (var i = 0; i < zeros.length; ++i) {
            var zero = zeros[i];
            data.push([math.re(zero), math.im(zero), NaN]);
        }
        for (var j = 0; j < poles.length; ++j) {
            var pole = poles[j];
            data.push([math.re(pole), NaN, math.im(pole)]);
        }

        data = _.sortBy(data, function(el) { return el[0]; });

        var options = {
            labelsDivWidth: 0,
            highlightCallback: function(event, x, points, row, seriesName) {
                var im = points[seriesName == 'zeros' ? 0 : 1].yval;
                var op = im >= 0 ? '+' : '';
                custom_legend.innerHTML = math.round(x, 5) + ' ' + op + ' ' + math.round(im, 5) + 'j';
            },
            drawGrid: false,
            labels: ['real', 'zeros', 'poles'],
            drawPoints: true,
            pointSize: 5,
            xlabel: "Re",
            ylabel: "Im",
            xRangePad: 50,
            yRangePad: 50,
            strokeWidth: 0.0,
            series: {
                zeros: {
                    drawPointCallback: shapes.CIRCLE,
                    drawHighlightPointCallback: shapes.CIRCLE
                },
                poles: {
                    drawPointCallback: shapes.EX,
                    drawHighlightPointCallback: shapes.EX
                }
            },
            axes: {
                y: {
                    valueFormatter: function(num) {
                        return math.round(num, 5) + "j";
                    }
                }
            },
            highlightSeriesOpts: {
                strokeBorderWidth: 1,
                highlightCircleSize: 5
            }
        };
        return new Dygraph(plot_div, data, options);
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
