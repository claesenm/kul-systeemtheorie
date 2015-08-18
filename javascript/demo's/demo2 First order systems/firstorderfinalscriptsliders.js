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
			
				
				
	/* Creating Slider 1*/
		var Slider1 = document.getElementById('slider_1');

		noUiSlider.create(Slider1, {
			start: [ 5 ],
			step: 0.01,
			range: {
				'min': [  0.1 ],
				'max': [ 10 ]
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
		var K = 50;
		Slider2.noUiSlider.on('change', function( values, handle ) {
			K = values[handle];
			fcn_generic (document.getElementById('slider-value2aftermouse'),K);
			var system = control.system,
				plot = control.plot,
				num = control.num;
				document.getElementById("settling_time").innerHTML=round(tau*3.9120);
				document.getElementById("rise_time").innerHTML=round(tau*2.1972);
				document.getElementById("final_value").innerHTML=K;
				var sys = system.tf([K], [tau,1]);
                var poles_data = sys.getPoles();
				plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true);
                var step_data = sys.step([0,7*tau]);
                plt2.series[0].setData(num.zip(step_data.t, step_data.x), true, false, true);
				document.getElementById('bode-plot').innerHTML = "";
				plot.bode(container,sys);
				
				//var bode_data = sys.bode(bounds);
				//plts[0].series[0].setData(num.zip(bode_data.omegas, bode_data.dBs), true, false, true);
				//plts[1].series[0].setData(num.zip(bode_data.omegas, bode_data.degrees), true, false, true);
		});
		
		var tau = 5;
		Slider1.noUiSlider.on('change', function( values, handle ) {
			tau = values[handle];
			fcn_generic (document.getElementById('slider-valueaftermouse'),tau);
			var system = control.system,
				plot = control.plot,
				num = control.num;
				document.getElementById("settling_time").innerHTML=round(tau*3.9120);
				document.getElementById("rise_time").innerHTML=round(tau*2.1972);
				document.getElementById("final_value").innerHTML=K;
				var sys = system.tf([K], [tau,1]);
                var poles_data = sys.getPoles();
				plt1.series[1].setData(poles_data.map(function(pole){ return [math.re(pole),math.im(pole)]; }), true, false, true);
                var step_data = sys.step([0,7*tau]);
                plt2.series[0].setData(num.zip(step_data.t, step_data.x), true, false, true);
				document.getElementById('bode-plot').innerHTML = "";
				plot.bode(container,sys);
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
			