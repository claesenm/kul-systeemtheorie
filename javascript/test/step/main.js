var system = control.system,
    plot = control.plot;

var container = document.getElementById('step-plot');
var sys = system.tf([1], [1, 1, 10], 1);
var step_data = sys.step();

var plt = plot.step(container, sys);
