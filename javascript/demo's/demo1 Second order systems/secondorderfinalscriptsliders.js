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
                var plt2 = plot.step(container2, sys, [0, 35], true);
				plt2.show_step_info({rise_time: true, settling_time: true, settled: true});

                var omegas = plts[0].series[0].data.map(function(v){return v.x;});
                var bounds = [math.log10(omegas[0]), math.log10(omegas[omegas.length - 1])];
			
				
				
	/* Creating Slider 1*/
		var Slider1 = document.getElementById('slider_1');

		noUiSlider.create(Slider1, {
			start: [ 1.5 ],
			step: 0.01,
			range: {
				'min': [  0.01 ],
				'max': [ 3 ]
			}
		});
		

		
		/*Creating Slider 2*/
		var Slider2 = document.getElementById('slider_2');

		noUiSlider.create(Slider2, {
			start: [ 50 ],
			step: 1,
			range: {
				'min': [  1 ],
				'max': [ 100 ]
			}
		});
		
		
		/*Displaying the current value of slider 1  */
		var Slider1_ValueElement = document.getElementById('slider-value');
		Slider1.noUiSlider.on('update', function( values, handle ) {
			Slider1_ValueElement.innerHTML = values[handle];
			});
		
		/*Displaying the current value of slider 2  */
		var Slider2_ValueElement = document.getElementById('slider-value2');
		Slider2.noUiSlider.on('update', function( values, handle ) {
			Slider2_ValueElement.innerHTML = values[handle];
			});	
			
		
		
		/*Storing the selected value for slider2 and executing a printing function  */
		var omega = 50;
		Slider2.noUiSlider.on('change', function( values, handle ) {
			omega = values[handle];
			fcn_generic (document.getElementById('omega_kwadr'),omega*omega);
			fcn_generic (document.getElementById('omega_kwadr2'),omega*omega);
			fcn_generic (document.getElementById('twee_zeta_omega'),Math.round(200*zeta*omega)/100);
			var system = control.system,
				plot = control.plot,
				num = control.num;
				var sys = system.tf([parseFloat(omega*omega)], [1,parseFloat(2*zeta*omega),parseFloat(omega*omega)]);
                var poles_data = sys.getPoles();
				plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true);
                var step_data = sys.step([0,20],true);
                plt2.series[0].setData(num.zip(step_data.t, step_data.x), true, false, true);
				plts.update(sys);
				var info = num.stepinfo(step_data);
				document.getElementById("rise_time").innerHTML=round(info.rise_time);
				document.getElementById("peak").innerHTML=round(info.peak);
				document.getElementById("settling_time").innerHTML=round(info.settling_time);
				document.getElementById("overshoot").innerHTML=round(info.overshoot);
				document.getElementById("final_value").innerHTML=1;
				//var bode_data = sys.bode(bounds);
				//plts[0].series[0].setData(num.zip(bode_data.omegas, bode_data.dBs), true, false, true);
				//plts[1].series[0].setData(num.zip(bode_data.omegas, bode_data.degrees), true, false, true);
		});
		
		var zeta = 5;
		Slider1.noUiSlider.on('change', function( values, handle ) {
			zeta = values[handle];
			fcn_generic (document.getElementById('twee_zeta_omega'),Math.round(200*zeta*omega)/100);
			var system = control.system,
				plot = control.plot,
				num = control.num;
				var sys = system.tf([parseFloat(omega*omega)], [1,parseFloat(2*zeta*omega),parseFloat(omega*omega)]);
                var poles_data = sys.getPoles();
				plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true);
                var step_data = sys.step([0,20],true);
                plt2.series[0].setData(num.zip(step_data.t, step_data.x), true, false, true);
				plts.update(sys);
				var info = num.stepinfo(step_data);
				document.getElementById("rise_time").innerHTML=round(info.rise_time);
				document.getElementById("peak").innerHTML=round(info.peak);
				document.getElementById("settling_time").innerHTML=round(info.settling_time);
				document.getElementById("overshoot").innerHTML=round(info.overshoot);
				document.getElementById("final_value").innerHTML=1;
				//var bode_data = sys.bode(bounds);
				//plts[0].series[0].setData(num.zip(sys.bode(bounds).omegas, sys.bode(bounds).dBs), true, false, true);
				//plts[1].series[0].setData(num.zip(sys.bode(bounds).omegas, sys.bode(bounds).degrees), true, false, true);
		});
			
	
		function fcn_generic(container, value_slider) {
		container.innerHTML = value_slider;
				}
				
				
	
					
}
	
window.onload = main;	
function round(value){
	return Math.round(10000*value)/10000;
}