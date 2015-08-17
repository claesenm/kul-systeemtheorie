function main(){
				var system = control.system,
				plot = control.plot,
				num = control.num;

                var container = document.getElementById('bode-plot');
                var sys = system.tf([50],[5,1]);
                var plts = plot.bode(container, sys);
                
                var container1 = document.getElementById('polezeroplot');
                var plt1 = plot.pzmap(container1, sys);
                
                var container2 = document.getElementById('step-plot');
                var plt2 = plot.step(container2, sys, [0, 35], true);
				plt2.show_step_info({rise_time: true, settling_time: true, settled: true});

                var omegas = plts[0].series[0].data.map(function(v){return v.x;});
                var bounds = [math.log10(omegas[0]), math.log10(omegas[omegas.length - 1])];

                var K_el = document.getElementById('Kslider');
                var tau_el = document.getElementById('tauslider');
	function update(){
		var K = parseFloat(K_el.value);
		var tau = parseFloat(tau_el.value);
		var sys = system.tf([K], [tau,1]);
		var bode_data = sys.bode(bounds);

		plts[0].series[0].setData(bode_data.omegas.map(function(omega, i) {return [omega, bode_data.dBs[i]];}), true, false, true);

		plts[1].series[0].setData(bode_data.omegas.map(function(omega, i) {return [omega, bode_data.degrees[i]];}), true, false, true);
	
		document.getElementById("K").innerHTML=K;
		document.getElementById("tau").innerHTML=Math.round(100*tau)/100;
		document.getElementById("valuetau2").innerHTML=Math.round(100*tau)/100;
		document.getElementById("valueK2").innerHTML=K;
		var poles_data = sys.getPoles();
		plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true)
		var step_data = sys.step([0,7*tau],true);
		plt2.series[0].setData(step_data.t.map(function(t, i){ return [t, step_data.x[i]]; }), true, false, true);
		var info = num.stepinfo(step_data);
		document.getElementById("peak_time").innerHTML=round(info.peak_time);
		document.getElementById("peak").innerHTML=round(info.peak);
		document.getElementById("settling_time").innerHTML=round(info.settling_time);
		document.getElementById("overshoot").innerHTML=round(info.overshoot);
		document.getElementById("rise_time").innerHTML=round(info.rise_time);
	}
	document.getElementById('update').addEventListener('click', update);
	
	function updateValues(){
		var K = parseFloat(K_el.value);
		var tau = parseFloat(tau_el.value);
		document.getElementById("valuetau").innerHTML=Math.round(100*tau)/100;
		document.getElementById("valueK").innerHTML=K;
	}
	
	duringExecution();
	
	function duringExecution(){
	if (document.attachEvent){
		K_el.attachEvent('onchange',updateValues);
		tau_el.attachEvent('onchange',updateValues);
	}
	else {
		K_el.addEventListener('input',updateValues);
		tau_el.addEventListener('input',updateValues);
	}
	}
	
}
window.onload = main;

function round(value){
	return Math.round(10000*value)/10000;
}
