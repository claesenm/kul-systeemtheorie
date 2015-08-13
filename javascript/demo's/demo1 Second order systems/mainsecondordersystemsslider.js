function main(){
    var system = control.system,
		plot = control.plot,
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
	var bounds = [math.log10(omegas[0]), math.log10(omegas[omegas.length - 1])];

	var zeta_el = document.getElementById('zetaslider');
	var omega_el = document.getElementById('omeganslider');

                function update(){
                               var zeta = Number.parseFloat(zeta_el.value);
                               var omega = Number.parseFloat(omega_el.value);
                               var sys = system.tf([omega*omega], [1,2*zeta*omega,omega*omega]);
                               var bode_data = sys.bode(bounds);
                               plts[0].series[0].setData(bode_data.omegas.map(function(omega, i) {return [omega, bode_data.dBs[i]];}), true, false, true);

							   plts[1].series[0].setData(bode_data.omegas.map(function(omega, i) {return [omega, bode_data.degrees[i]];}), true, false, true);
                               document.getElementById("zetavalue").innerHTML=Math.round(100*zeta)/100;
                               document.getElementById("omeganvalue").innerHTML=omega;
							   document.getElementById("omega_kwadr").innerHTML=omega*omega;
                               document.getElementById("omega_kwadr2").innerHTML=omega*omega;
							   document.getElementById("twee_zeta_omega").innerHTML=Math.round(200*zeta*omega)/100;
                               var poles_data = sys.getPoles();
							   plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true);

							   var step_data = sys.step([0,20],true);
							   plt2.series[0].setData(step_data.t.map(function(t, i){ return [t, step_data.x[i]]; }), true, false, true);
							  
							  // document.getElementById("peak_time").innerHTML=num.stepinfo.({peak_time});
                }              
                zeta_el.addEventListener('input', update);
                omega_el.addEventListener('input', update);
}
window.onload = main;