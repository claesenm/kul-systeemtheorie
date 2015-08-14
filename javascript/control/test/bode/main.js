var system = control.system,
    plot = control.plot;


var container = document.getElementById('bode-plot');
var sys = system.zpk([10], [1], 1);
var plt = plot.bode(container, sys);
