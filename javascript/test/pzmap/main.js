var system = control.system,
    plot = control.plot;

var container = document.getElementById('pzmap');
var sys = system.zpk([1, math.complex(-1, -1)], [10, math.complex(1, 1.2)], 1);
var plt = plot.pzmap(container, sys);
