// CAN ONLY BE USED IN THE BROWSER, HAVING INCLUDED HIGHCHARTS
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
                },
                tooltip: {
                    valueSuffix: ' dB'
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
                },
                tooltip: {
                    valueSuffix: ' deg'
                }
            };

        var graphs = [new Highcharts.Chart(recursiveExtend(recursiveClone(options), magnitude_options)),
                      new Highcharts.Chart(recursiveExtend(recursiveClone(options), phase_options))];

        // Synch the charts
        container.addEventListener('mousemove', function(e) {
            graphs.forEach(function(chart) {
                e = chart.pointer.normalize(e);
                var point = chart.series[0].searchPoint(e, true);

                if (point) {
                    point.onMouseOver();
                    chart.tooltip.refresh(point);
                    chart.xAxis[0].drawCrosshair(e, point);
                }
            });
        });

        // Hides both pointers when the mouse leaves the graph
        var resetFunc = Highcharts.Pointer.prototype.reset;
        Highcharts.Pointer.prototype.reset = function() {
            graphs.forEach(function(graph) {
                resetFunc.call(graph.pointer);
            });
        };

        return graphs;
    },

    /**
     * Plots a pole zero map of the given system.
     * @param {HTMLElement} container - The container in which to put the plot.
     * @param {System} sys - The system of which to plot the poles and zeros.
     * @returns {Highcharts.Chart} A reference to the created plot
     */
    pzmap: function(container, sys) {

        // Define a cross symbol path (taken from the highcharts documentation)
        Highcharts.SVGRenderer.prototype.symbols.cross = function (x, y, w, h) {
            return ['M', x, y, 'L', x + w, y + h, 'M', x + w, y, 'L', x, y + h, 'z'];
        };
        if (Highcharts.VMLRenderer) {
            Highcharts.VMLRenderer.prototype.symbols.cross = Highcharts.SVGRenderer.prototype.symbols.cross;
        }

        function complexToArray(c) {
            return [math.re(c), math.im(c)];
        }

        // Prepare the data for Highcharts
        var zeros = sys.getZeros().map(complexToArray),
            poles = sys.getPoles().map(complexToArray);

        var options = {
            chart: {
                renderTo: container,
                type: 'scatter',
                panning: true,
                panKey: 'shift',
                zoomType: 'xy'
            },
            series: [{
                data: zeros,
                name: 'zeros',
                marker: {
                    fillColor: '#fff',
                    lineColor: '#00bbbb',
                    lineWidth: 2
                }
            },
            {
                data: poles,
                name: 'poles',
                marker: {
                    symbol: 'cross',
                    lineWidth: 2,
                    lineColor: '#00bbbb',
                }
            }],
            xAxis: {
                minPadding: 0.05,
                maxPadding: 0.05,
                title: {
                    text: 'Re'
                }
            },
            yAxis: {
                minPadding: 0.05,
                maxPadding: 0.05,
                title: {
                    text: 'Im'
                }
            },
            title: {
                text: '',
                y: 0
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '<b>{point.x} + {point.y}j</b>'
            }
        };

        var graph = new Highcharts.Chart(options);
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
