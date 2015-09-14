// Created by Maxime Feyerick, assisted by Oscar Mauricio Agudelo, for Prof. Bart de Moor as material to be used with the course "Systeemtheorie en Regeltechniek"

// dynamic system with default transfer function
var dyn_sys = new control.system.tf([2,3], [1,8,16]);
var chart	= null;

// range imaginary plane
// The coordinate system is right handed, the Y-axis is the default axis for function values.
var range = [ [-5,5], [-5,5] ];
var grid_range = [ [-6,6], [-6,6], [-6,6] ];

var CAMERA_ANGLE_PHI = Math.PI / 4; //around Y
var CAMERA_ANGLE_THETA = 0.3; // around X
var CAMERA_DIST = 5;

// determines how much further curve goes than surface
var CURVE_CONT = 0.5;

// offset so the curves appear on the surface and not beneath
var CURVE_Y_OFFSET = 0.01;

var GRID_OPTIONS = 	
{
  id: 'my-grid',
  axis: [0, 2],
  color: 0xc0c0c0,
  lineWidth: 1,
};
	
var SURFACE_OPTIONS =
{
	  id: 'tf-modulus', 
	  n: [ 60, 60 ],
	  expression: surfaceFunc,
	  points: false,
	  shaded: true,
	  mesh: true,
};

var CHART_OPTIONS =
{
	chart: {
		renderTo: 'chart'
    },
	
	credits: false,
	
	title: {
		text: ""
	},
	
	legend: {
		enabled: false
	},
	
	xAxis: {
		tickInterval: 1,
		gridLineWidth: 0,
		tickColor: "#c0c0c0",
		lineColor: "#c0c0c0",
		title: { text: "Frequency ω (rad/s)" },
		min: 0,
	},
	
	yAxis: {
		tickInterval: 1,
		gridLineWidth: 0,
		lineWidth: 1,
		tickWidth: 1,
		tickColor: "#c0c0c0",
		lineColor: "#c0c0c0",
		title: { text: "Magnitude |H(jω)|" },
	},
	
	tooltip: {
		formatter: function() { return "Frequency: " + this.x.toFixed(3) + "<br>Magnitude: "  + this.y.toFixed(3); }
	},
	
	
	plotOptions : {
		line: {
			// disable the initial animation (not others)
			animation: false,
			marker: { enabled: false}
		}
	},
};

var X_OPTIONS = 
{
	id: 'a',
	axis: 0,
	color: 0xa0a0a0,
	ticks: 5,
	lineWidth: 2,
	size: .05,
	labels: true,
	arrow: false,
	startOnTick: true,
};
var Y_OPTIONS =
{
	id: 'b',
	axis: 1,
	color: 0xa0a0a0,
	ticks: 5,
	lineWidth: 2,
	size: .05,
	zero: false,
	labels: true,
	arrow: false
};
var Z_OPTIONS =
{
	id: 'c',
	axis: 2,
	color: 0xa0a0a0,
	ticks: 5,
	lineWidth: 2,
	size: .05,
	zero: false,
	labels: true,
	arrow: false
};

var mathbox = null;

var stepMngr = null;

function surfaceFunc(x, z) 
{
    return dyn_sys.evalS(math.complex(z,x)).toPolar().r;
};

function imgCurveFunc(omega)
{
	// parametric
	return [omega, dyn_sys.evalS(math.complex(0,omega)).toPolar().r + CURVE_Y_OFFSET, 0 ];
}

// stepKeeper class
// --------------

// step container is the html element that contains the step titles and step content
// the children should be denoted by the class names "step-content" and "step-header"
// for content and headers of the step respectively
// further, it expects the id of a step header/container to begin with "step-x" where x
// is the number of the step

var stepKeeper = function(step_container, open_step)
{	
	this.step_container = step_container;
	
	// total time in ms of a transition between two arbitrary steps
	this.transition_time = 2000;
	
	this.step_headers	= step_container.getElementsByClassName("step-header");
	
	// the number of steps, does not include step 0 where nothing is open
	this.nb_steps		= this.step_headers.length;
	
	
	// add stepClick to all headers click event
	for( var i = 0; i < this.step_headers.length; i++)
	{
		this.step_headers[i].addEventListener('click', this);
	}
	
	// functions that have to be called when doing/undoing step
	// empty for now
	this.step_do_functions = new Array(this.step_headers.length + 1);
	this.step_undo_functions = new Array(this.step_headers.length + 1);
	
	// steps start by 1, zero means no open step
	this.current_step = 0;
	this.gotoStep(open_step);
	
}

stepKeeper.prototype.getStep = function()
{
	return this.current_step;
}

stepKeeper.prototype.gotoStep = function(next_step)
{
	var step_headers	= this.step_headers; //step_container.getElementsByClassName("step-header");
	
	// see if there is an already expanded step
	var open_index = null;
	for( var i= 0; i < step_headers.length; i++)
	{
		if( step_headers[i].className.search("open") != -1)
		{
			open_index = i;
			
			// assumption: only one open step
			break;
		}
	}
	
	// close a pontential open step that is not the next step
	if(open_index !== null && (open_index + 1) != next_step)
	{
		removeClassName(step_headers[open_index], "open");
	}
	
	if(this.current_step != next_step)
	{
		var step_contents = document.getElementsByClassName("step-content")
		// TODO: is looping necessary or can we count on order? maybe auto order step_headers with update headerslist function?
		// it appears we can NOT count on order
		for(var i =0; i < step_headers.length; i++)
		{
			if ( step_headers[i].id.split('-')[1] == next_step)
			{
				// an extra class 'open'' on the headers marks open steps
				addClassName(step_headers[i], "open");
				break;
			}
				
		}

		// do/undo all animations until we get to the clicked step

		var advancing		= (this.current_step < next_step)? true : false;
		var animations	= advancing? this.step_do_functions : this.step_undo_functions;
		var amount_steps	= Math.abs(this.current_step - next_step);
		var one_step_duration = this.transition_time / amount_steps;
		
		for( var i = 0; i < amount_steps; i++)
		{
			var anim_step = advancing? this.current_step + i + 1 :  this.current_step - i;
			if(animations[anim_step])
				window.setTimeout(function(step) {animations[step](one_step_duration)}, one_step_duration*i, anim_step);
		}
	}
	this.current_step = next_step;
}

// goto next step if there is one
stepKeeper.prototype.nextStep = function()
{
	if( this.current_step != this.nb_steps)
		this.gotoStep(this.getStep() + 1);
}

// goto previous step if there is one
stepKeeper.prototype.prevStep = function()
{
	if(this.current_step != 0)
		this.gotoStep(this.getStep() - 1);
}

// to set the step internally without making any changes to plot or step list
stepKeeper.prototype.updateStep = function(nb_step)
{
	this.current_step = next_step;
}

// event handler for clicks
stepKeeper.prototype.handleEvent = function(e)
{
	var id_clicked = e.target.id;
	var className_clicked = e.target.className;
	
	if(className_clicked.search("nav-button") != -1)
	{
		switch(id_clicked)
		{
			case "forward-button":
				this.nextStep();
				break;
			case "back-button":
				this.prevStep();
				break;
		}
	}
	else
	{
		if(className_clicked.search("step-header") != -1)
		{
			// get index of clicked step
			var clicked_step = Number(id_clicked.split('-')[1]);
			
			this.gotoStep(clicked_step);
		}
	}
}
// end class
// -----------

function main()
{	
	var plot_container = document.getElementById("drawing");
	stepMngr = new stepKeeper(document.getElementById("left-pane"), 1);
	
	// link prev and next step buttons
	document.getElementById("back-button").addEventListener('click', stepMngr);
	document.getElementById("forward-button").addEventListener('click', stepMngr);
		
	calcUsefulRange()
	SURFACE_OPTIONS["domain"] = range;
	// STEP 1
	// -------
	
	
	var inputBoxNumerator = document.getElementById('input-tf-numerator');
	var inputBoxDenominator = document.getElementById('input-tf-denominator');
	var buttonSubmit = document.getElementById('button-step-1-submit');
	
	// fill in default transfer function in step1
	inputBoxNumerator.value = dyn_sys.getNumerator().join(',');
	inputBoxDenominator.value = dyn_sys.getDenominator().join(',');
	
	// add event to submit button
	buttonSubmit.addEventListener('click', step1Submit);
	
	// draw formula
	step1Formula();

	
	// STEP 2
	// --------
	
	// register animation for step2
	stepMngr.step_do_functions[2] = function(duration)
	{
		mathbox.animate	( '#img-curve', 
						{ domain: range[1].map(function(x){ return Math.sign(x) * (Math.abs(x) + CURVE_CONT);})},
						{ duration: duration}
					);
	};
	
	stepMngr.step_undo_functions[2] = function(duration)
	{
		mathbox.animate	('#img-curve', 
						{ domain: [0,0]},
						{ duration: duration}
					);
	};
	
	/* STEP 3
	  --------
		- remove surface plot
		- turn camera to 2D
		- remove grid
		- remove z-axis
	*/
	stepMngr.step_do_functions[3] = function(duration)
	{
		//var new_range = range.slice(); new_range[0] = [new_range[0][0], new_range[0][0]];
		
		
		mathbox.animate( 'camera',
						 {phi: Math.PI/2, theta: 0},
						 {duration: duration}
						);
		mathbox.remove(	"#tf-modulus",	{ duration: duration*2/3} );
		mathbox.remove( 'grid', { duration: duration/2});
		mathbox.remove( '#c', { duration: duration*2/3});
	};
	
	stepMngr.step_undo_functions[3] = function(duration)
	{
		mathbox.animate( 'camera',
						 {phi: CAMERA_ANGLE_PHI, theta: CAMERA_ANGLE_THETA},
						 {duration: duration}
						);
		mathbox.transition(duration * 2/3);
		mathbox.grid( GRID_OPTIONS );
		mathbox.surface(SURFACE_OPTIONS);
		mathbox.axis(Z_OPTIONS);
		mathbox.transition(0);
	};
	
	/* STEP 4
	  --------
		- Keep only positive part of curve 
		- Move the axes (or camera) to the bottom left
		- Convert plot to highcharts
	
	*/
	stepMngr.step_do_functions[4] = function(duration)
	{
		mathbox.animate( '#img-curve',
						 { domain: [ 0, CURVE_CONT + range[1][1] ] },
						 { duration: duration});
		mathbox.animate( 'viewport',
						 { range: [  [0, grid_range[0][1]], [0, grid_range[1][1]], [0, 1] ]},
						 { duration: duration});
		//mathbox.animate( 'camera', { orbit: 3});
		animatedOrbitChange(mathbox, 2, duration);
		
		// make highchart, generate data
		var data = chartData();
		
		// shallow copy of chart_options with own data points
		var options = CHART_OPTIONS;
		options['series'] = [ {data: data, color: "#FF0000"}];
		options.yAxis['max'] = grid_range[1][1];
		
		// show it when animation of this step is done
		window.setTimeout( function() 
							{
								
								// make chart appear, hide plot
								chart = new Highcharts.Chart(options);
								document.getElementById("chart").style.visibility = "visible";
								plot_container.style.display = 'none';
							}
							, duration*9/10);
		
		
	};
	
	
	stepMngr.step_undo_functions[4] = function(duration)
	{
		// restore curve as it should be in step 2
		stepMngr.step_do_functions[2](duration);
		mathbox.animate( 'viewport',
						 { range: grid_range},
						 { duration: duration});
		//mathbox.animate( 'camera', { orbit: CAMERA_DIST});
		animatedOrbitChange(mathbox, CAMERA_DIST, duration);
		
		chart.destroy();
		plot_container.style.display = '';
		window.dispatchEvent(new Event('resize'));
		document.getElementById("chart").style.visibility = "hidden";
		
		
	};
	
	/* STEP 5
	  --------
		- To log/db plot
	*/
	stepMngr.step_do_functions[5] = function(duration)
	{
				
		// new data for logarithmic scale
		var log_freq_range = control.num.interesting_region_logspace(dyn_sys);
		var data = [];
		var step = (log_freq_range[1] - log_freq_range[0]) / 200;
		for(var x = log_freq_range[0]; x <= log_freq_range[1] ; x+=step  )
		{
			var x_val = math.pow(10, x);
			data.push( [ x_val, 20*math.log(imgCurveFunc( x_val )[1], 10)] );
		}
		
		var xOptions =
		{
			min: data[0][0],
			type:"logarithmic"
		};
		var yOptions =
		{
			title: { text: "Magnitude |H(jω)| (dB)"},
		};
		chart.series[0].setData( data, false);
		chart.yAxis[0].update( yOptions, false);
		chart.xAxis[0].update( xOptions, true);
		
	};
	
	stepMngr.step_undo_functions[5] = function(duration)
	{
		var xOptions =
		{
			min: 0,
			type:"linear"
		};
		var yOptions =
		{
			title: { text: "Magnitude |H(jω)|" },
			max: grid_range[1][1],
			
		};
		var data = chartData();
		
		chart.series[0].setData( data, false);
		chart.yAxis[0].update(yOptions, false);
		chart.xAxis[0].update( xOptions, true);
	};
	
	
	// mathbox call
	// ---------
	
	mathbox = mathBox(plot_container,{
        cameraControls: true,
        cursor:         true,
        controlClass:   ThreeBox.OrbitControls,
        elementResize:  true,
        fullscreen:     true,
		stats: false,
      }).start();
					
	mathbox
	.viewport({
	  type: 'cartesian',
	  range: grid_range,
	  scale: [1.2, 1.2, 1.2],
	 })
	
	// Axes
        .axis(X_OPTIONS)
        .axis(Y_OPTIONS)
        .axis(Z_OPTIONS)

	// Grid
	.grid( GRID_OPTIONS)

	//Curve on imaginary axis, is invisible at first
	.curve({
	  id: 'img-curve',
	  
	  // Should not be visible yet:
	  domain: [0, 0],
	  expression: imgCurveFunc,
	  line: true,
	  points: false,
	  lineWidth: 8,
	  color: 0xFF0000,
	  n: 200
	})

	.surface(SURFACE_OPTIONS)
	.camera({
		orbit: CAMERA_DIST,
		phi: CAMERA_ANGLE_PHI,
		theta: CAMERA_ANGLE_THETA
	})
	;
	
}

// adds a class name to an HTMLelement, does not add duplicates
function addClassName(element, newClassName)
{
	if( element.className.search(newClassName) == -1)
		element.className = element.className.concat(" " + newClassName);
}

// removes a class name to an HTMLelement
function removeClassName(element, class_name_to_remove)
{
	var element_class_names = element.className.split(" ");
	var element_new_class_names = [];
	
	element_class_names.forEach( function(class_name) 
			{
				if(class_name != class_name_to_remove)
						element_new_class_names.push(class_name);
			});
	
	element.className = element_new_class_names.join(" ");
}

// checks if all entries in array are numbers
function areAllNumbers( chkArray )
{
	var allNumbers = true;
	for(var i = 0; ((i < chkArray.length) && allNumbers); i++)
	{
		allNumbers = allNumbers && !(isNaN(chkArray[i]));
	}
	return allNumbers;
}

// better performance than innerHTML, uses textContent or innerText according to browser support
function setTextOfNode(node, str)
{
	if ('textContent' in node) 
	{
		node.textContent = str;
	} 
	else 
	{
		node.innerText = str;
	}
}


// function for when submitting tf in step 1
function step1Submit()
{
	var arrayNumerator 		= document.getElementById('input-tf-numerator').value.toString().split(/[,;:]+/);
	var arrayDenominator	= document.getElementById('input-tf-denominator').value.toString().split(/[,;:]+/);
	
	// Remove possible empty string element on end
	if(arrayDenominator[arrayDenominator.length - 1] == "")
		arrayDenominator.pop();
	if(arrayNumerator[arrayNumerator.length -1] == "")
		arrayNumerator.pop();
	
	// Remove possible leading zeros
	while(arrayNumerator[0]=="0")
		arrayNumerator.shift();
	while(arrayDenominator[0]=="0")
		arrayDenominator.shift();
	
	// check for mistakes
	if( (arrayNumerator.length == 0) || (arrayDenominator.length==0) )
		{alert("Please fill in a transfer function. One or more boxes is empty.");return;}
	if( !(areAllNumbers(arrayNumerator) && areAllNumbers(arrayDenominator)) )
		{alert("Please fill in a correct transfer function according to the given syntax");return}
	if(arrayDenominator.length == 1 && arrayDenominator[0] == "0")
		{alert("Please do not devide by zero");return;}
	if(arrayDenominator.length < arrayNumerator.length)
		{alert("The order of the denominator should be greater than the order of the numerator.");return;}
	
	// convert array to numbers
	arrayNumerator		= arrayNumerator.map( function(el) { return parseFloat(el);});
	arrayDenominator	= arrayDenominator.map( function(el) { return parseFloat(el);});
	
	// use these array to update dynsys
	dyn_sys = new control.system.tf(arrayNumerator,arrayDenominator);
	
	// the plot updates automatically because the math functions are continuously evaluated
	
	//update formula
	step1Formula();
	
	// calc new ranges
	var ranges = calcUsefulRange();
	mathbox.set( "#tf-modulus", {domain: ranges[0]});
	mathbox.set( "viewport", {range: ranges[1]} );
}

function step1Formula()
{
	var span_formula = document.getElementById("step-1-tf-function");
	
	var latexStr = dyn_sys.toLatex();
	latexStr = "H(s) = " + latexStr;
	
	var jaxMath = MathJax.Hub.getAllJax("step-1-tf-function")[0];
	if(jaxMath)
	{
		MathJax.Hub.Queue(["Text",jaxMath,latexStr]);
	}
	else
	{
		setTextOfNode(span_formula, "$$" + latexStr + "$$");
		MathJax.Hub.Queue(["Typeset",MathJax.Hub,span_formula]);
	}
}

function chartData()
{
	var data = [];
	var x_max = range[0][1] + CURVE_CONT, step = x_max / 200;
	for(var x = 0; x < x_max ; x+=step  )
	{
		data.push( [x, imgCurveFunc(x)[1] ] );
	}
	
	return data;
}

function animatedOrbitChange(boxInst, new_orbit, duration)
{
	var camera	= boxInst.select("camera")[0];
	var old_orbit = camera.__attributes.orbit;
	var delta_orbit = new_orbit - old_orbit;
	
	var step = duration/(1000);
	
	for( var t = 0; t < duration; t+= step)
	{
		window.setTimeout( function(time) {boxInst.set("camera", {orbit: old_orbit + time/duration*(delta_orbit)}); }, t, t);
	}
	
}

// returns a square range for 
function calcUsefulRange()
{
	var intrest_pt = dyn_sys.getBreakPoints();
	var max = 0;
	intrest_pt.forEach( function(el) 
	{
		if(el.re)
		{
			var re = math.abs(el.re), im = math.abs(el.im);
			max = ( re > max)? re : max;
			max = ( im > max)? im : max;
		}
		else
		{
			var val = math.abs(el);
			max = ( val > max)? val : max;
		}
	});
	
	// Get y-axis range from DC gain 
	var poles = dyn_sys.getPoles();
	var zeros = dyn_sys.getZeros();
	
	// count how many more poles at 0 than zeros 
	var cnt = 0
	poles.forEach( function(el) { if (el==0) cnt++;});
	zeros.forEach( function(el) { if (el==0) cnt--;});
	
	if( cnt )
	{
		
		if( cnt >= 0)
		{
			//approximate gain as if there were no poles at zero
			var diff = Infinity;
			var eval_val = 0.01;
			var gain = dyn_sys.evalS(eval_val)*math.pow(eval_val,cnt);
			while( diff > 0.0001 && eval_val > 0.00000001)
			{
				eval_val /= 2;
				var new_gain = math.abs( dyn_sys.evalS(eval_val)*math.pow(eval_val,cnt) );
				diff = math.abs( gain - new_gain );
				gain = new_gain;
			}
		}
		else
		{
			gain = 5;
		}
		
	}
	else
	{
		gain = math.abs(dyn_sys.evalS(0));
	}
	
	max *= 1.5;
	gain *= 10;
	
	// rounds to a given amount of significant numbers. If second argument is omitted, returns nb rounded to most significant number
	var rnd = function(nb, sign_digits)
		{
			if( sign_digits === undefined){ sign_digits = 1};
			
			var order = math.floor( math.log(nb, 10) );
			var signifacant_nb = math.round( nb/math.pow(10, order - (sign_digits -1) ));
			return signifacant_nb * math.pow(10, order - (sign_digits -1));
		}
	gain = rnd(gain);
	max = rnd(max);
	
	// grid extends a bit further
	var grid_max = rnd( 6/5*max, 2);
	
	// modify the global var
	range = [ [-max, max], [-max, max]];
	grid_range = [ [-grid_max, grid_max], [- gain/3, gain], [-grid_max, grid_max]];
	
	return [ range, grid_range];
}
window.onload = main;