var system = control.system;

var container = document.getElementById('bode-plot');
var sys = system.zpk([1], [10], 1);
var plt = plot.bode(container, sys);
