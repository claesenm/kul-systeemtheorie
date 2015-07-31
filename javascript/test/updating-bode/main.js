var system = control.system;
var plot = control.plot;

var container = document.getElementById('bode-plot');
var sys = system.zpk([1], [10], 1);
var plts = plot.bode(container, sys);

var omegas = plts[0].file_.map(function(v){return v[0];});

var zero_el = document.getElementById('zero');
zero_el.addEventListener('input', function() {
    var zero = Number.parseFloat(zero_el.value);
    var sys = system.zpk([zero], [10], 1);
    var H = omegas.map(function(v){ return sys.eval(math.complex(0, v)); });

    var yRange0 = plts[0].yAxisRange(0);
    plts[0].updateOptions({
        file: omegas.map(function(e, i) { return [e, 20 * math.log10(math.abs(H[i]))];})
    });
    plts[0].updateOptions({
        valueRange: yRange0
    });

    var yRange1 = plts[1].yAxisRange(1);
    plts[1].updateOptions({
        file: omegas.map(function(e, i) { return [e, 180 / math.pi * math.arg(H[i])];}),
        valueRange: yRange1
    });
});
