
function main(){
	var system = control.system,
    plot = control.plot;
	num = control.num;

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
		var step_data = sys.step([0,20],true);
		plt2.series[0].setData(step_data.t.map(function(t, i){ return [t, step_data.x[i]]; }), true, false, true);
		
		var info = num.stepinfo(step_data);
		if (omegan > 1){
			var pole1 = (-2*zeta*omegan + Math.sqrt(4*zeta*zeta*omegan*omegan - 4*omegan*omegan))/2;
			var pole2 = (-2*zeta*omegan - Math.sqrt(4*zeta*zeta*omegan*omegan - 4*omegan*omegan))/2;
			document.getElementById("rise_time").innerHTML=timeZetaGreaterThanOne(pole1,pole2,0.90)-timeZetaGreaterThanOne(pole1,pole2,0.10);
			document.getElementById("peak").innerHTML=1;
			document.getElementById("settling_time").innerHTML=timeZetaGreaterThanOne(pole1,pole2,0.98);
			document.getElementById("overshoot").innerHTML=0;
			document.getElementById("final_value").innerHTML=1;
		}
							   document.getElementById("peak").innerHTML=round(info.peak);
							   document.getElementById("settling_time").innerHTML=round(info.settling_time);
							   document.getElementById("overshoot").innerHTML=round(info.overshoot);
							   document.getElementById("final_value").innerHTML=1;
	}
	
	document.getElementById('update').addEventListener('click', update);
	
	function updateValues(){
		var zeta = parseFloat(zeta_el.value);
		var omegan = parseFloat(omega_el.value);
		document.getElementById("valuezeta").innerHTML=Math.round(100*zeta)/100;
		document.getElementById("valueomegan").innerHTML=omegan;
	}
	
	duringExecution();
	
	function duringExecution(){
	if (document.attachEvent){
		zeta_el.attachEvent('onchange',updateValues);
		omega_el.attachEvent('onchange',updateValues);
	}
	else {
		zeta_el.addEventListener('input',updateValues);
		omega_el.addEventListener('input',updateValues);
	}
	}

	
}


function round(value){
	return Math.round(10000*value)/10000;
}

window.onload = main;

function timeZetaGreaterThanOne(pole1,pole2,value){
	var temp1 = 0;
	var temp2 = 50;
	var result = 0;
	while ((temp2 - temp1) > 0.000001){
		result = evalStepZetaGreaterThanOne(pole1,pole2,(temp1 + temp2)/2);
		if (result < value){
			temp1 = (temp1 + temp2)/2.0;
		} else {
			temp2 = (temp1 + temp2)/2.0;
		}
	}
	return ((temp1 + temp2)/2.0);
}

function evalStepZetaGreaterThanOne(pole1,pole2,time){
	return (1 + ((pole2)/(pole1-pole2))*Math.exp(-pole1*time) + ((pole1)/(pole2-pole1))*Math.exp(-pole2*time));
}