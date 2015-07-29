var control = require('../../control.js'),
    system = control.system,
    plot = control.plot;

var container = document.getElementById('bode-plot');
var sys = system.zpk([1], [10], 1);
var plt = plot.bode(container, sys);
