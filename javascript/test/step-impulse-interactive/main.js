var system = control.system;

var container = document.getElementById('step-plot'),
    container2 = document.getElementById('impulse-plot');

var plt = plot.default_chart(container),
    plt2 = plot.default_chart(container2);


var omega_el = document.getElementById('omega_n'),
    zeta_el  = document.getElementById('zeta');


function update() {
    var omega_n = Number.parseFloat(omega_el.value),
        zeta    = Number.parseFloat(zeta_el.value),
        sys     = system.tf([omega_n], [1, 2*omega_n*zeta, omega_n * omega_n]),
        step_data = sys.step(),
        impulse_data = sys.impulse();

    plt.series[0].setData(step_data.t.map(function(time, i){return [time, step_data.x[i]];}), true, false, true);
    plt2.series[0].setData(impulse_data.t.map(function(time, i){ return [time, impulse_data.x[i]]; }), true, false, true);
}

omega_el.addEventListener('input', update);
zeta_el.addEventListener('input', update);

var omega_n = parseFloat(omega_el.value),
    zeta    = parseFloat(zeta_el.value),
    sys     = system.tf([omega_n], [1, 2*omega_n*zeta, omega_n * omega_n]),
    step_data = sys.step(),
    impulse_data = sys.impulse();

plt.addSeries({data: step_data.t.map(function(time, i){return [time, step_data.x[i]];})}, true);
plt2.addSeries({data: impulse_data.t.map(function(time, i){return [time, impulse_data.x[i]];})}, true);
