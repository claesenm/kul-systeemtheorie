// CAN ONLY BE USED IN THE BROWSER, HAVING INCLUDED HIGHCHARTS
var math = require('mathjs');

var control = require('./control');
var system = control.system;
var num = control.num;

function recursiveClone(obj) {
    var r = {};
    for (var prop in obj) {
        if ((typeof obj[prop] == 'object') && !(Object.prototype.toString.call(obj[prop]) === '[object Array]')) {
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
        omega_bounds = omega_bounds || num.interesting_region_logspace(system);
        function div_half_height() {
            var d = document.createElement('div');
            d.style.width = container.offsetWidth + "px";
            d.style.height = container.offsetHeight / 2 + "px";
            container.appendChild(d);
            return d;
        }

        var magnitude_div = div_half_height(container);
        var phase_div = div_half_height(container);

        var bode_data = system.bode(omega_bounds);
        var magnitudes_data = bode_data.dBs.map(function(dB, i) { return [bode_data.omegas[i], dB]; });
        var phases_data = bode_data.degrees.map(function(degree, i) { return [bode_data.omegas[i], degree]; });


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
                    min: math.pow(10, omega_bounds[0]),
                    max: math.pow(10, omega_bounds[1]),
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
        function sync(e) {
            graphs.forEach(function(chart) {
                e = chart.pointer.normalize(e);
                var point = chart.series[0].searchPoint(e, true);

                if (point) {
                    point.onMouseOver();
                    chart.tooltip.refresh(point);
                    chart.xAxis[0].drawCrosshair(e, point);
                }

                // Hides both pointers when the mouse leaves the graph
                chart.pointer.reset = function() {
                    graphs.forEach(function(graph) {
                        Highcharts.Pointer.prototype.reset.call(graph.pointer);
                    });
                };
            });
        }
        magnitude_div.addEventListener('mousemove', sync);
        phase_div.addEventListener('mousemove', sync);

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

        function complex_to_array(c) {
            return [math.re(c), math.im(c)];
        }

        function draw_major_axes(event) {
            var renderer = this.renderer,
                xAxis = this.axes[0],
                yAxis = this.axes[1],
                xposy = yAxis.toPixels(0),
                yposx = xAxis.toPixels(0),
                attributes = {
                'stroke-width': 1,
                stroke: 'black',
                'stroke-dasharray': [1, 3]
            };

            // Draw xAxis
            if (yAxis.min < 0 && yAxis.max > 0) {
                var xAxis_svg = renderer
                .path(['M', xAxis.toPixels(xAxis.min), xposy, 'L', xAxis.toPixels(xAxis.max), xposy])
                .attr(attributes)
                .add();
            }

            if (xAxis.min < 0 && xAxis.max > 0) {
                var yAxis_svg = renderer
                .path(['M', yposx, yAxis.toPixels(yAxis.min), 'L', yposx, yAxis.toPixels(yAxis.max)])
                .attr(attributes)
                .add();
            }
        }

        // Prepare the data for Highcharts
        var zeros = sys.getZeros().map(complex_to_array),
            poles = sys.getPoles().map(complex_to_array);

        var options = {
            chart: {
                renderTo: container,
                type: 'scatter',
                panning: true,
                panKey: 'shift',
                zoomType: 'xy',
                events: {
                    load: function() {this.redraw();},
                    redraw: draw_major_axes
                }
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
                },
                gridLineWidth: 0,
                tickPosition: 'inside',
                tickWidth: 1,
                lineWidth: 1
            },
            yAxis: {
                minPadding: 0.05,
                maxPadding: 0.05,
                title: {
                    text: 'Im'
                },
                gridLineWidth: 0,
                tickPosition: 'inside',
                tickWidth: 1,
                lineWidth: 1
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


    default_chart: function(container) {
        var options = {
            chart: {
                renderTo: container,
                type: 'line'
            },
            title: {
                text: '',
                y: 0
            },
            xAxis: {
                type: 'linear',
                title: {
                    text: 't (s)'
                }
            },
            yAxis: {
                startOnTick: false,
                minPadding: 0.01,
                endOnTick: false,
                maxPadding: 0.01,
                title: {
                    text: ''
                }
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
        };
        return new Highcharts.Chart(options);
    }
};
