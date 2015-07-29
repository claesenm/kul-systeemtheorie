require.config({
    baseUrl: '../../src',
    paths : {
        plot: "plot",
        system: "system"
    }
})
require(['plot', 'system'], function(plots, system) {
    var container = document.getElementById('bode-plot');
    var sys = system.zpk([1], [10], 1);
    var plot = plots.bode(container, sys);
});
