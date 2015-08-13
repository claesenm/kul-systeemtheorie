var system = control.system,
    plot = control.plot;

var container = document.getElementById('rlocus'),
    slider = document.getElementById('k-slider'),
    label = document.getElementById('k-value'),
    sys = system.tf([5, 1, 1, 2], [1, 2, 3, -1]),
    plt = plot.rlocus(container, sys, true);

slider.addEventListener('input', function(e) {
    label.innerHTML = slider.value;
    plt.set_k(Number.parseFloat(slider.value));
});
