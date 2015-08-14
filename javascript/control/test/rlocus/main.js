var system = control.system,
    plot = control.plot;

var container = document.getElementById('rlocus'),
    slider = document.getElementById('k-slider'),
    label = document.getElementById('k-value'),
    syss = [system.tf([5, 1, 1, 2], [1, 2, 3, -1]),
            system.zpk([math.complex(10, 10), math.complex(10, -10), -5], [math.complex(-10, 15), math.complex(-10, -15), 5], 1),
            system.zpk([math.complex(100, 100), math.complex(100, -100), -50], [math.complex(-100, 150), math.complex(-100, -150), 50], 1),
            system.zpk([math.complex(10, 10), math.complex(10, -10)], [1, -1, 2], 1),
            system.tf([1], [1, 0])],
    plt = plot.rlocus(container, syss[0], true);

for (var i = 0; i < syss.length; ++i) {
    var btn = document.createElement('input');
    btn.value = i;
    btn.system = syss[i];
    btn.type = "button";
    btn.addEventListener('click', function(e){plt = plot.rlocus(container, e.target.system, true);});
    container.parentElement.appendChild(btn);
}



slider.addEventListener('input', function(e) {
    label.innerHTML = slider.value;
    plt.set_k(Number.parseFloat(slider.value));
});
