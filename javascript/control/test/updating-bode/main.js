var system = control.system,
    plot = control.plot;

var container = document.getElementById('bode-plot');
var sys = system.zpk([1], [10], 1);
var plts = plot.bode(container, sys);

var omegas = plts[0].series[0].data.map(function(v){return v.x;});
var bounds = [math.log10(omegas[0]), math.log10(omegas[omegas.length - 1])];

var zero_el = document.getElementById('zero');
zero_el.addEventListener('input', function() {
    var zero = Number.parseFloat(zero_el.value);
    var sys = system.zpk([zero], [10], 1);

    plts.update(sys);
});
