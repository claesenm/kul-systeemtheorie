var system = control.system;

var container = document.getElementById('bode-plot');
var sys = system.zpk([1], [10], 1);
var plts = plot.bode(container, sys);

var omegas = plts[0].series[0].data.map(function(v){return v.x;});

var zero_el = document.getElementById('zero');
zero_el.addEventListener('input', function() {
    var zero = Number.parseFloat(zero_el.value);
    var sys = system.zpk([zero], [10], 1);
    var H = omegas.map(function(v){ return sys.eval(math.complex(0, v)); });

    plts[0].series[0].setData( omegas.map(function(e, i) { return [e, 20 * math.log10(math.abs(H[i]))];}), true, false, true);

    plts[1].series[0].setData( omegas.map(function(e, i) { return [e, 180 / math.pi * math.arg(H[i])];}), true, false, true);
});
