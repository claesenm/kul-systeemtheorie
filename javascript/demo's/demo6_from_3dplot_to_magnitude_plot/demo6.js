

// dynamic system with default transfer function
var dyn_sys = new control.system.tf([2,3], [1,8,16])

// range imaginary plane
// The coordinate system is right handed, the Y-axis is the default axis for function values.
var RANGE = [ [-5,5], [-5,5] ];
var GRID_RANGE = [ [-6,6], [-6,6], [-6,6] ];

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
	  n: [ 40, 40 ],
	  domain: RANGE,
	  expression: surfaceFunc,
	  points: false,
	  shaded: true,
	  mesh: true,
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
	
	// TODO: store this or call this every time?
	var step_headers	= step_container.getElementsByClassName("step-header");
	
	// add click events to all steps
	var _my_this = this;
	var stepClick = function()
	{
		
		// get index of clicked step and its content
		var clicked_step = Number(this.id.split('-')[1]);
		
		_my_this.gotoStep(clicked_step);
	}
	
	// add stepClick to all headers click event
	for( var i = 0; i < step_headers.length; i++)
	{
		step_headers[i].addEventListener('click', stepClick);
	}
	
	// functions that have to be called when doing/undoing step
	// empty for now
	this.step_do_functions = new Array(step_headers.length + 1);
	this.step_undo_functions = new Array(step_headers.length + 1);
	
	// steps start by 1, zero means no open step
	this.current_step = 0;
	this.gotoStep(open_step);
	
}

stepKeeper.prototype.getStep = function()
{
	return current_step;
}

stepKeeper.prototype.gotoStep = function(next_step)
{
	var step_headers	= this.step_container.getElementsByClassName("step-header");
	
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
	
	// close a pontential open step that is not the current step
	if(open_index !== null && (open_index - 1) != this.current_step)
	{
		removeClassName(step_headers[open_index], "open");
	}
	
	if(this.current_step != next_step)
	{
		// delay to ensure close transition start before other opens
		// window.setTimeout(function()
		// {
			
			// set this step to open
			
			// TODO: is looping necessary or can we count on order? maybe auto order step_headers with update headerslist function?
			// it appears we can NOT count on order
			for(var i =0; i < step_headers.length; i++)
			{
				if ( step_headers[i].id.split('-')[1] == next_step)
					// an extra class open on the headers marks open steps
					addClassName(step_headers[i], "open");
					
			}
		//}, 200);

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
	console.log("Went from step to step " + this.current_step + " to step " + next_step );
	this.current_step = next_step;
}

// to set the step internally without making any changes to plot or step list
stepKeeper.prototype.updateStep = function(nb_step)
{
	this.current_step = next_step;
}

// end class
// -----------

function main()
{	
	
	stepMngr = new stepKeeper(document.getElementById("left-pane"), 1);
	
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
						{ domain: RANGE[1].map(function(x){ return Math.sign(x) * (Math.abs(x) + CURVE_CONT);})},
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
		//var new_range = RANGE.slice(); new_range[0] = [new_range[0][0], new_range[0][0]];
		
		
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
		- Keep only positive part of curve (which is actually -z)
		- Move the axes (or camera) to the bottom left
	
	*/
	
	stepMngr.step_do_functions[4] = function(duration)
	{
		mathbox.animate( '#img-curve',
						 { domain: [ 0, CURVE_CONT + RANGE[1][1] ] },
						 { duration: duration});
		mathbox.animate( 'viewport',
						 { range: [  [0, GRID_RANGE[0][1]], [0, GRID_RANGE[1][1]], [0, 1] ]},
						 { duration: duration});
		mathbox.animate( 'camera', { orbit: 3});
		
	};
	
	stepMngr.step_undo_functions[4] = function(duration)
	{
		// restore curve as it should be in step 2
		stepMngr.step_do_functions[2](duration);
		mathbox.animate( 'viewport',
						 { range: GRID_RANGE},
						 { duration: duration});
		mathbox.animate( 'camera', { orbit: CAMERA_DIST});
	};
	
	// mathboxcall
	// ---------
	var element = document.getElementById("drawing");
	
	// TODO: keep matbox in it's right pane
	mathbox = mathBox(element,{
        cameraControls: true,
        cursor:         true,
        controlClass:   ThreeBox.OrbitControls,
        elementResize:  true,
        fullscreen:     true,
      }).start();
					
	mathbox
	.viewport({
	  type: 'cartesian',
	  range: GRID_RANGE,
	  scale: [1,1,1]
	 })
	
	// Axes
        .axis(X_OPTIONS)
        .axis(Y_OPTIONS)
        .axis(Z_OPTIONS)

	// Grid
	.grid( GRID_OPTIONS)

	//Curve on imaginairy axis, is invisble at first
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
	
	//update mathbox plot
	mathbox.surface();
	mathbox.curve();
	
	//update formula
	step1Formula();
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

window.onload = main;