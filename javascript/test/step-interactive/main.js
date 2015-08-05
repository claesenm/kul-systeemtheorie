var system = control.system;

var container = document.getElementById('step-plot');
var sys = system.tf([1], [1, 1, 10], 1);
var step_data = sys.step();

var plt = plot.default_chart(container);

var omega_el = document.getElementById('omega_n'),
    zeta_el  = document.getElementById('zeta');


function update() {
    var omega_n = Number.parseFloat(omega_el.value),
        zeta    = Number.parseFloat(zeta_el.value),
        sys     = system.tf([omega_n], [1, 2*omega_n*zeta, omega_n * omega_n]),
        step_data = sys.step();

    plt.series[0].setData(step_data.t.map(function(time, i){return [time, step_data.x[i]];}), true, false, true);
    plt.redraw();
}

omega_el.addEventListener('input', update);
zeta_el.addEventListener('input', update);

var omega_n = parseFloat(omega_el.value),
    zeta    = parseFloat(zeta_el.value),
    sys     = system.tf([omega_n], [1, 2*omega_n*zeta, omega_n * omega_n]);

plt.addSeries({data: step_data.t.map(function(time, i){return [time, step_data.x[i]];})}, true);
