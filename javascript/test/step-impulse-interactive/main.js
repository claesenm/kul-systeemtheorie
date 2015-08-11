var system = control.system,
    plot = control.plot;

var container = document.getElementById('step-plot');


var opts = plot.time_series_options;
var plt;


var omega_el = document.getElementById('omega_n'),
    zeta_el  = document.getElementById('zeta');


function update() {
    var omega_n = Number.parseFloat(omega_el.value),
        zeta    = Number.parseFloat(zeta_el.value),
        sys     = system.tf([omega_n * omega_n], [1, 2*omega_n*zeta, omega_n * omega_n]),
        step_data = sys.step([0, 20], true),
        impulse_data = sys.impulse([step_data.t[0], step_data.t[step_data.t.length - 1]], false);

    plt.series[0].setData(step_data.t.map(function(time, i){return [time, step_data.x[i]];}), true, false, false);
    plt.series[1].setData(impulse_data.t.map(function(time, i){ return [time, impulse_data.x[i]]; }), true, false, false);
}

omega_el.addEventListener('input', update);
zeta_el.addEventListener('input', update);

var omega_n = parseFloat(omega_el.value),
    zeta    = parseFloat(zeta_el.value),
    sys     = system.tf([omega_n * omega_n], [1, 2*omega_n*zeta, omega_n * omega_n]),

plt = plot.step(container, sys, [0, 20], true);
var impulse_data = sys.impulse([plt.series[0].data[0].x, plt.series[0].data[plt.series[0].data.length - 1].x], false);
//plt.addSeries({data: step_data.t.map(function(time, i){return [time, step_data.x[i]];}), name: 'Step'}, true);
plt.addSeries({data: impulse_data.t.map(function(time, i){return [time, impulse_data.x[i]];}), color:'green', name:'Impulse'}, true);


var show = false;
var btn = document.getElementById('button');
btn.onclick = function(){
    show = ! show;
    plt.show_step_info(show);
    btn.value = (show ? 'Show' : 'Hide') + ' Info';
};
