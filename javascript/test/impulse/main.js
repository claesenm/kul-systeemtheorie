var system = control.system;

var container = document.getElementById('impulse-plot');
var sys = system.ss(system.tf([1], [1, 1, 10], 1));
var impulse_data = sys.impulse();

var plt = plot.time_series(container, impulse_data.t.map(function(time, i){return [time, impulse_data.x[i]];}));
