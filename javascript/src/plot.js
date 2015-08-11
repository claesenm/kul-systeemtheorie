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
        if (prop in target && (typeof target[prop] == 'object')) {
            recursiveExtend(target[prop], source[prop]);
        } else {
            target[prop] = source[prop];
        }
    }
    return target;
}

/**
 * A module containing methods for plotting.
 * @module
 */
module.exports = {
    control: control,

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
            console.log(container.offsetWidth, container.offsetHeight);
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
                    headerFormat: ''
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
                    formatter: function() {
                        return '<b>' + 'omega: ' + math.round(this.x, 5) + ' rad/s' + '</b>' + '<br>' +
                               '<b>' + 'magnitude: ' + math.round(this.y, 5) + ' dB' + '</b>';
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
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + 'omega: ' + math.round(this.x, 5) + ' rad/s' + '</b>' + '<br>' +
                               '<b>' + 'phase: ' + math.round(this.y, 5) + ' degrees' + '</b>';
                    }
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

        var axes_svg = [];
        function draw_major_axes(event) {
            if (axes_svg.length !== 0) {
                axes_svg.forEach(function(axis){
                    if (axis !== undefined) {
                        axis.destroy();
                    }
                });
            }
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

            var xAxis_svg;
            if (yAxis.min < 0 && yAxis.max > 0) {
                xAxis_svg = renderer
                .path(['M', xAxis.toPixels(xAxis.min), xposy, 'L', xAxis.toPixels(xAxis.max), xposy])
                .attr(attributes)
                .add();
            }

            var yAxis_svg;
            if (xAxis.min < 0 && xAxis.max > 0) {
                yAxis_svg = renderer
                .path(['M', yposx, yAxis.toPixels(yAxis.min), 'L', yposx, yAxis.toPixels(yAxis.max)])
                .attr(attributes)
                .add();
            }

            axes_svg = [xAxis_svg, yAxis_svg];
        }

        // Prepare the data for Highcharts
        var zeros = sys.getZeros().map(complex_to_array),
            poles = sys.getPoles().map(complex_to_array);

        var options = {
            chart: {
                renderTo: container,
                type: 'scatter',
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
                lineWidth: 1,
                minRange: 1
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
                lineWidth: 1,
                minRange: 1
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
                formatter: function() {
                    return '<b>' + math.round(this.x, 4) + ' ' + (this.y < 0 ? '-' : '+') + ' ' + math.round(this.y, 4) + 'j' + '</b>';
                }
            }
        };

        var graph = new Highcharts.Chart(options);

        // DOESNT WORK FOR THE Y AXIS FOR SOME REASON
        // YAXIS KEEPS SCALING UP?

        // Enable panning
        //var mouseDown = false,
            //lastPos,
            //lastValue;
        //container.addEventListener('mousedown', function(e){
            //mouseDown = true; 
            //lastPos = [graph.pointer.normalize(e).chartX, graph.pointer.normalize(e).chartY];
            //lastValue = [graph.axes[0].toValue(lastPos[0]), graph.axes[1].toValue(lastPos[1])];
        //});
        //container.addEventListener('mouseup', function(){ mouseDown = false; });
        //container.addEventListener('mousemove', function(e) {
            //var xAxis = graph.axes[0],
                //yAxis = graph.axes[1];
            //// Means it's being dragged
            //if (mouseDown) {
                //var curPos = [graph.pointer.normalize(e).chartX, graph.pointer.normalize(e).chartY];
                    //curValue = [xAxis.toValue(curPos[0]), yAxis.toValue(curPos[1])];

                //var deltaPos = math.subtract(curPos, lastPos);
                //if ((deltaPos[0] * deltaPos[0] + deltaPos[1] * deltaPos[1]) > 10) {
                    //var deltaValue = math.subtract(curValue, lastValue),
                        //xExtremes = xAxis.getExtremes(),
                        //yExtremes = yAxis.getExtremes();

                    //xAxis.setExtremes(xExtremes.min - deltaValue[0], xExtremes.max - deltaValue[0], true, false);
                    //yAxis.setExtremes(yExtremes.min - deltaValue[1], yExtremes.max - deltaValue[1], true, false);
                    //lastPos = curPos;
                    //lastValue = curValue;
                //}
            //}
        //});
        return graph;
    },

    time_series_options: {
        chart: {
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
            },
            lineWidth: 1,
            gridLineWidth: 0,
            tickWidth: 1
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
            formatter: function() {
                return '<b>' + 't: ' + math.round(this.x, 5) + 's' + '</b>' + '<br>' +
                    '<b>' + 'x: ' + math.round(this.y, 5) + '</b>';
            }

        }
    },

    /**
     * Creates a default chart with a time series.
     * @param {HTMLElement} container - The container to render to.
     * @param {Array<Array<Number>>} data - The data for the plot.
     * @param {Object} [extra_options] - Extra options for Highcharts.
     * @returns {Highcharts.Chart} The reference to the created chart.
     */
    time_series: function(container, data, extra_options) {
        extra_options = extra_options || {};
        var options = {
            chart: {
                renderTo: container
            },
            series: [{
                data: data
            }]
        };
        return new Highcharts.Chart([this.time_series_options, options, extra_options].reduce(recursiveExtend));
    },

    /**
     * Plots the step response of sys to container.
     * @param {HTMLElement} container - The container to render to.
     * @param {System} sys - The system of which to plot the step response.
     * @param {Array<Number>} [bounds=[0, 20]] - The bounds of the simulation.
     * @param {Boolean} [settle=false] - Whether to terminate the simulation when the signal has settled.
     * @returns {Highcharts.Chart} The reference to the created chart.
     */
    step: function(container, sys, bounds, settle) {
        var step_data = sys.step(bounds, settle),
            input_data = step_data.t.map(function(t, i) { return [t, step_data.x[i]]; }),
            show_info = false;

        // Create graph and add drawing commands
        var svgs = [];
        var graph = this.time_series(container, input_data, {chart: {events: {redraw: function() {

            // Destroy previouse svgs
            svgs.forEach(function(svg) {
                if (svg) {
                    svg.destroy();
                }
            });
            svgs = [];


            var renderer = this.renderer,
                xAxis = this.axes[0],
                yAxis = this.axes[1],
                line_attrs = {
                'stroke-width': 1,
                stroke: 'blue',
                'stroke-dasharray': [1, 3]
            };

            function toX(v) {
                return math.round(xAxis.toPixels(v));
            }
            function toY(v) {
                return math.round(yAxis.toPixels(v));
            }
            // Add line for the final value
            var yfinal = this.series[0].data[this.series[0].data.length - 1].y;
            svgs.push(renderer.path(['M', toX(xAxis.min), toY(yfinal), 'L', toX(xAxis.max), toY(yfinal)]).attr(line_attrs).add());

            if (show_info) {

                // Gather new step data in case the plot's data has been updated
                var step_data_new = {
                    t: new Array(this.series[0].data.length),
                    x: new Array(this.series[0].data.length)
                };
                for (var i = 0; i < this.series[0].data.length; ++i) {
                    step_data_new.t[i] = this.series[0].data[i].x;
                    step_data_new.x[i] = this.series[0].data[i].y;
                }
                var step_info = num.stepinfo(step_data_new);


                // Render peak
                var peak_svg = renderer.path(['M', toX(xAxis.min), toY(step_info.peak),
                                             'L', toX(step_info.peak_time), toY(step_info.peak),
                                             'M', toX(step_info.peak_time), toY(yAxis.min),
                                             'L', toX(step_info.peak_time), toY(step_info.peak)])
                                       .attr(line_attrs)
                                       .add();
                svgs.push(peak_svg);

                // Render rise time
                var rise_time_svg = renderer.path([
                                                    // Rise time high
                                                   'M', toX(xAxis.min), toY(0.9*yfinal),
                                                   'L', toX(step_info.rise_time_high), toY(step_info.meta.high*yfinal),
                                                   'M', toX(step_info.rise_time_high), toY(yAxis.min),
                                                   'L', toX(step_info.rise_time_high), toY(step_info.meta.high*yfinal),

                                                   // Rise time low
                                                   'M', toX(xAxis.min), toY(0.1*yfinal),
                                                   'L', toX(step_info.rise_time_low), toY(step_info.meta.low*yfinal),
                                                   'M', toX(step_info.rise_time_low), toY(yAxis.min),
                                                   'L', toX(step_info.rise_time_low), toY(step_info.meta.low*yfinal),
                                                   ])
                                            .attr(line_attrs)
                                            .add();

                var ARROW_HEIGHT = toY(yAxis.min) + 8,
                    ARROW_FIN_LENGTH = 5,
                    ARROW_ANGLE = math.multiply([math.cos(math.pi / 4), math.sin(math.pi / 4)], ARROW_FIN_LENGTH),
                    X_PADDING = 5,
                    X_LOW = toX(step_info.rise_time_low) + X_PADDING,
                    X_HIGH = toX(step_info.rise_time_high) - X_PADDING;

                var rise_time_arrow_svg = renderer.path(['M', X_LOW, ARROW_HEIGHT,
                                                         'L', X_LOW + ARROW_ANGLE[0], ARROW_HEIGHT + ARROW_ANGLE[1],
                                                         'M', X_LOW, ARROW_HEIGHT,
                                                         'L', X_LOW + ARROW_ANGLE[0], ARROW_HEIGHT - ARROW_ANGLE[1],

                                                         'M', X_LOW, ARROW_HEIGHT,
                                                         'L', X_HIGH, ARROW_HEIGHT,

                                                         'L', X_HIGH - ARROW_ANGLE[0], ARROW_HEIGHT + ARROW_ANGLE[1],
                                                         'M', X_HIGH, ARROW_HEIGHT,
                                                         'L', X_HIGH - ARROW_ANGLE[0], ARROW_HEIGHT - ARROW_ANGLE[1],
                                                         ])
                                                  .attr({
                                                      'stroke-width': 2,
                                                      stroke: 'black'
                                                  })
                                                  .add();

                var rise_time_text_svg = renderer.text('' + math.round(step_info.rise_time, 4) + 's', math.round((X_LOW + X_HIGH) / 2 - (20)), ARROW_HEIGHT + 12)
                                                 .css({color: 'black', fontSize: '10px'})
                                                 .add();
                svgs.push(rise_time_svg);
                svgs.push(rise_time_arrow_svg);
                svgs.push(rise_time_text_svg);


                // Render settling time 
                var settling_time_svg = renderer.path(['M', toX(step_info.settling_time), toY(yAxis.min),
                                                       'L', toX(step_info.settling_time), toY(step_info.settling_value)])
                                                .attr(line_attrs)
                                                .add();
                var settling_band_svg = renderer.path(['M', toX(xAxis.min), toY(yfinal*(1 + step_info.meta.settling_threshold)),
                                                       'L', toX(xAxis.max), toY(yfinal*(1 + step_info.meta.settling_threshold)),
                                                       'M', toX(xAxis.min), toY(yfinal*(1 - step_info.meta.settling_threshold)),
                                                       'L', toX(xAxis.max), toY(yfinal*(1 - step_info.meta.settling_threshold))])
                                                .attr({
                                                    'stroke-width': 1,
                                                    stroke: 'black',
                                                    opacity: 0.5
                                                })
                                                .add();
                svgs.push(settling_time_svg);
                svgs.push(settling_band_svg);
            }
        }  }}});


        graph.show_step_info = function(show) {
            show = show === undefined ? true : show;
            show_info = show;
            this.redraw();
        };

        graph.redraw();
        return graph;
    },
};
