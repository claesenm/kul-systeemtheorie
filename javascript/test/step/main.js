var system = control.system;

var container = document.getElementById('step-plot');
var sys = system.ss(system.tf([1], [1, 1, 10], 1));
var step_data = sys.step();

var plt = plot.default_chart(container);
plt.addSeries({
    data: step_data.t.map(function(time, i){return [time, step_data.x[i]];})
}, true);
