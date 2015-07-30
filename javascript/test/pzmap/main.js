var system = control.system;
var plot = control.plot;

var container = document.getElementById('bode-plot');
var sys = system.zpk([1], [10, math.complex(1, 1.2)], 1);
var plt = plot.pzmap(container, sys);
