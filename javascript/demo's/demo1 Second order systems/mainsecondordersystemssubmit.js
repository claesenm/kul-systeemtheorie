console.log("uitgevoerd");

function main(){
	var system = control.system,
    plot = control.plot;

	var container = document.getElementById('bode-plot');
	var sys = system.tf([2500],[1,150,2500]);
	var plts = plot.bode(container, sys);
	
	var container1 = document.getElementById('polezeroplot');
	var plt1 = plot.pzmap(container1, sys);
	
	var container2 = document.getElementById('step-plot');
	var plt2 = plot.step(container2, sys, [0, 20], true);
	plt2.show_step_info({rise_time: true, settling_time: true, settled: true});

	var omegas = plts[0].series[0].data.map(function(v){return v.x;});
	var bounds = [Math.log(omegas[0])/Math.LN10, Math.log(omegas[omegas.length - 1])/Math.LN10];

	var zeta_el = document.getElementById('zetaslider');
	var omega_el = document.getElementById('omegaslider');
	function update(){
		var zeta = parseFloat(zeta_el.value);
		var omegan = parseFloat(omega_el.value);
		var sys = system.tf([omegan*omegan], [1,2*omegan*zeta,omegan*omegan]);
		var bode_data = sys.bode(bounds);

		plts[0].series[0].setData(bode_data.omegas.map(function(omega, i) {return [omega, bode_data.dBs[i]];}), true, false, true);

		plts[1].series[0].setData(bode_data.omegas.map(function(omega, i) {return [omega, bode_data.degrees[i]];}), true, false, true);
	
		document.getElementById("twee_zeta_omega").innerHTML=Math.round(200*omegan*zeta)/100;
		document.getElementById("omega_kwadr").innerHTML=omegan*omegan;
		document.getElementById("omega_kwadr2").innerHTML=omegan*omegan;
		document.getElementById("valuezeta2").innerHTML=Math.round(100*zeta)/100;
		document.getElementById("valueomegan2").innerHTML=omegan;
		var poles_data = sys.getPoles();
		plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true);
		//plt1 = plot.pzmap(container1, sys);
		//plt2 = plot.step(container2, sys, [0, 20], true);
		var step_data = sys.step([0,20],true);
		plt2.series[0].setData(step_data.t.map(function(t, i){ return [t, step_data.x[i]]; }), true, false, true);
		var info = num.stepinfo(step_data);
		window.alert(info.peak_time);
		document.getElementById("peak_time").innerHTML=round(info.peak_time);
		document.getElementById("peak").innerHTML=round(info.peak);
		document.getElementById("settling_time").innerHTML=round(info.settling_time);
		document.getElementById("overshoot").innerHTML=round(info.overshoot);
	}
	document.getElementById('update').addEventListener('click', update);
	
	function updateValues(){
		var zeta = parseFloat(zeta_el.value);
		var omegan = parseFloat(omega_el.value);
		document.getElementById("valuezeta").innerHTML=Math.round(100*zeta)/100;
		document.getElementById("valueomegan").innerHTML=omegan;
	}
	zeta_el.addEventListener('input', updateValues);
	omega_el.addEventListener('input', updateValues);
	
}

function round(value){
	return Math.round(10000*value)/10000;
}

window.onload = main;