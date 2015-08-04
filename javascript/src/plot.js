// CAN ONLY BE USED IN THE BROWSER, HAVING INCLUDED HIGHCHARTS
var Dygraph = require('dygraphs');
var synchronize = require('../lib/dygraph-extras/synchronizer');
var shapes = require('../lib/dygraph-extras/shapes');
var _ = require('underscore');
var math = require('mathjs');

var control = require('./control');
var system = control.system;
var num = control.num;

function recursiveClone(obj) {
    var r = {};
    for (var prop in obj) {
        if (_.isObject(obj[prop]) && !_.isArray(obj[prop])) {
            r[prop] = recursiveClone(obj[prop]);
        } else {
            r[prop] = obj[prop];
        }
    }
    return r;
}

function recursiveExtend(target, source) {
    for (var prop in source) {
        if (prop in target) {
            recursiveExtend(target[prop], source[prop]);
        } else {
            target[prop] = source[prop];
        }
    }
    return target;
}


control.plot =
/**
 * A module containing methods for plotting.
 * @module
 */
module.exports = {

    /**
     * Plots a bode plot of the given system in container.
     * @param {HTMLElement} container - The container in which to show the plot.
     * @param {System} system - The system of which to show the bode plot.
     * @param {Array<Number>} [omega_bounds] - The boundaries of the pulsation to plot in logspace (e.g. 10^2 is entered as 2).
     * @returns {Array<Highcharts.Chart>} - An array of 2 plots. The first is the magnitude plot and the second is the phase plot.
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

        omega_exp_bounds = omega_bounds || this.interesting_region_logspace(system);
        var omegas = num.logspace(omega_exp_bounds[0], omega_exp_bounds[1], 1000);


        var evaluated_omegas = omegas.map(function(omega) { return system.eval(math.complex(0, omega)); });
        var magnitudes_data = _.zip(omegas, evaluated_omegas.map(function(H) { return 20 * math.log10(math.abs(H)); }));
        var phases_data = _.zip(omegas, evaluated_omegas.map(function(omega) { return 180 / math.pi * math.arg(omega); }));


        var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: '',
                    y: 0
                },
                xAxis: {
                    type: 'logarithmic',
                    min: math.pow(10, omega_exp_bounds[0]),
                    max: math.pow(10, omega_exp_bounds[1]),
                    minorTickInterval: 0.1,
                },
                yAxis: {
                    startOnTick: false,
                    minPadding: 0.01,
                    endOnTick: false,
                    maxPadding: 0.01
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    crosshairs: [true, false],
                    headerFormat: '',
                    pointFormat: '<b>{point.y}</b>'
                }
            },
            magnitude_options = {
                chart: {
                    renderTo: magnitude_div
                },
                series: [{
                    data: magnitudes_data
                }],
                yAxis: {
                    title: {
                        text: 'Magnitude (dB)'
                    }
                }
            },
            phase_options = {
                chart: {
                    renderTo: phase_div
                },
                series: [{
                    data: phases_data
                }],
                yAxis: {
                    title: {
                        text: 'Phase (degrees)'
                    }
                },
                xAxis: {
                    title: {
                        text: 'Omega (rad/s)'
                    }
                }
            };

        var graphs = [new Highcharts.Chart(recursiveExtend(recursiveClone(options), magnitude_options)),
                      new Highcharts.Chart(recursiveExtend(recursiveClone(options), phase_options))];
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
        container.appendChild(custom_legend);


        // Create new div for plot itself
        var plot_div = document.createElement('div');
        plot_div.style.width = container.offsetWidth + "px";
        plot_div.style.height = container.offsetHeight + "px";
        container.appendChild(plot_div);


        // Prepare the data for dygraphs
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

        // Has to be sorted on x (because of how dygraphs determines its bounds)
        data = _.sortBy(data, function(el) { return el[0]; });


        var options = {
            labelsDivWidth: 0, // Hide the default legend
            highlightCallback: function(event, x, points, row, seriesName) { // Used to update the custom legend
                var im = points[seriesName == 'zeros' ? 0 : 1].yval;
                var op = im >= 0 ? '+' : '-';
                custom_legend.innerHTML = math.round(x, 5) + ' ' + op + ' ' + math.abs(math.round(im, 5)) + 'j';
            },
            unhighlightCallback: function() { // Empty the legend on unhighlight
                custom_legend.innerHtml = '';
            },
            underlayCallback: function(context, area, graph) {
                // Use canvas drawing to render only the axes, instead of a grid
                context.save();
                context.lineWidth = 2.0;
                var path = new Path2D();

                var xRange = graph.xAxisRange();
                if (xRange[0] < 0 && xRange[1] > 0) {
                    var x = graph.toDomXCoord(0);
                    // Y axis
                    path.moveTo(x, 0);
                    path.lineTo(x, context.canvas.offsetHeight);
                }

                var yRange = graph.yAxisRange();
                if (yRange[0] < 0 && yRange[1] > 0) {
                    // X axis
                    var y = graph.toDomYCoord(0);
                    path.moveTo(0, y);
                    path.lineTo(context.canvas.offsetWidth, y);
                }
                context.stroke(path);
                context.restore();
            },
            drawGrid: false,
            labels: ['real', 'zeros', 'poles'], // Used to refer to these series
            drawPoints: true,
            pointSize: 5,
            xlabel: "Re",
            ylabel: "Im",
            xRangePad: 50,
            yRangePad: 50,
            strokeWidth: 0.0, // Don't draw connecting lines
            series: {
                // Set appropriate shapes for zeros/poles
                zeros: {
                    drawPointCallback: shapes.CIRCLE,
                    drawHighlightPointCallback: shapes.CIRCLE
                },
                poles: {
                    drawPointCallback: shapes.EX,
                    drawHighlightPointCallback: shapes.EX
                }
            },
            // This somehow makes it possible to take the y coördinate into account to highlight a series
            // instead of just the x coördinate
            highlightSeriesOpts: {
                strokeBorderWidth: 1,
                highlightCircleSize: 5
            }
        };

        var graph = new Dygraph(plot_div, data, options);

        function scale_interval(scale, interval) {
            var mid = (interval[0] + interval[1]) / 2;
            return [(interval[0] - mid)*scale + mid, (interval[1] - mid)*scale + mid];
        }

        graph.ready(function() {
            var starting_value_range = graph.yAxisRange(0);
            // Zoom using the scroll wheel
            container.addEventListener('wheel', function(event) {
                var scale = math.pow(1.5, event.deltaY / 100);
                graph.updateOptions({
                    dateWindow: scale_interval(scale, graph.xAxisRange()),
                    valueRange: scale_interval(scale, graph.yAxisRange(0))
                });
                event.preventDefault();
            }, false);

            // Reset zoom on right click
            container.addEventListener('contextmenu', function(event) {
                event.preventDefault();
                graph.updateOptions({valueRange: starting_value_range});
                graph.resetZoom();
            });
        });

        return graph;
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
