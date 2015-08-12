var system = control.system,
    plot = control.plot;

var container = document.getElementById('rlocus');
var sys = system.tf([2, 5, 1], [1, 2, 3], 1);
var plt = plot.rlocus(container, sys);
