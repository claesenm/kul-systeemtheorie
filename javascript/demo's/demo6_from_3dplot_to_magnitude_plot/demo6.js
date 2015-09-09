

// dynamic system with default trasfer function
var dyn_sys = new control.system.tf([2,3], [1,8,16])

// range imaginairy plane
var RANGE = [ [-5,5], [-5,5] ];
var GRID_RANGE = [ [-6,6], [-6,6], [-6,6] ];

// determines how much further curve goest than surface
var CURVE_CONT = 0.5;

// ofset so the curves appear on the surface and not beneath
var CURVE_Y_OFFSET = 0.01;

var mathbox = null;

var stepMngr = null;

function surfaceFunc(x, y) 
{
    return dyn_sys.evalS(math.complex(x,y)).toPolar().r;
};

function imgCurveFunc(omega)
{
	// parametric
	return [0, dyn_sys.evalS(math.complex(0,omega)).toPolar().r + CURVE_Y_OFFSET, omega ];
}

// stepKeper class
// --------------

// step container is the html element that contains the step titles and step content
// the children should be denoted by the class names "step-content" and "step-header"
// for content and headers of the step respectively
// further, it expects the id of a step header/container to begin with "step-x" where x
// is the number of the step

var stepKeeper = function(step_container, open_step)
{
	if ( open_step === undefined)
			open_step = 0;
	// steps start by 1, zero means no open step
	this.current_step = open_step;
	
	this.step_container = step_container;
	
	// TODO: store this or call this every time?
	var step_headers	= step_container.getElementsByClassName("step-header");
	
	// add click events to all steps
	var _my_this = this;
	var stepClick = function()
	{
		
		// an extra class open on the headers marks open steps
		
		// get index of clicked step and its content (first step is number 0)
		var clicked_step = this.id.split('-')[1] - 1;
		
		// see if there is an already expanded step
		var open_step = null;
		
		for( var i= 0; i < step_headers.length; i++)
		{
			if( step_headers[i].className.search("open") != -1)
			{
				open_step = i;
				
				// assumption: only one open step
				break;
			}
		}
		
		// close a pontential open step that is not the current step
		if(open_step !== null && open_step != clicked_step)
		{
			removeClassName(step_headers[open_step], "open");
		}
		
		// set this step to open
		addClassName(this, "open");
		
		_my_this.gotoStep(clicked_step);
	}
	
	// add stepClick to all headers click event
	for( var i = 0; i < step_headers.length; i++)
	{
		step_headers[i].addEventListener('click', stepClick);
	}
	
	// functions that have to be called when step is left/enter functions
	this.step_leave_functions = [];
	this.step_enter_functions = [];
}

stepKeeper.prototype.getStep = function()
{
	return current_step;
}

stepKeeper.prototype.gotoStep = function(nxt_step)
{
	console.log("Went from step to step " + this.current_step + " to step " + nxt_step );
	this.current_step = nxt_step;
}

// to set the step internally without making any changes to plot or step list
stepKeeper.prototype.updateStep = function(nb_step)
{
	this.current_step = nxt_step;
}

// end class
// -----------

function main()
{	
	// stepSetup();
	
	stepMngr = new stepKeeper(document.getElementById("left-pane"));
	
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
	//Add XYZ axes
	// Axes
        .axis({
          id: 'a',
          axis: 0,
          color: 0xa0a0a0,
          ticks: 5,
          lineWidth: 2,
          size: .05,
          labels: true,
        })
        .axis({
          id: 'b',
          axis: 1,
          color: 0xa0a0a0,
          ticks: 5,
          lineWidth: 2,
          size: .05,
          zero: false,
          labels: true,
        })
        .axis({
          id: 'c',
          axis: 2,
          color: 0xa0a0a0,
          ticks: 5,
          lineWidth: 2,
          size: .05,
          zero: false,
          labels: true,
        })

	// Grid
	.grid({
	  id: 'my-grid',
	  axis: [0, 2],
	  color: 0xc0c0c0,
	  lineWidth: 1,
	})

	//Curve on imaginairy axis, is invisble at first
	.curve({
	  id: 'img-curve',
	  
	  // Should not be visible yet:
	  domain: [0,0 ],
	  expression: imgCurveFunc,
	  line: true,
	  points: false,
	  lineWidth: 8,
	  color: 0xFF0000,
	  n: 200
	})

	.surface({
	  id: 'tf-modulus', 
	  n: [ 40, 40 ],
	  domain: RANGE,
	  expression: surfaceFunc,
	  points: false,
	  shaded: true,
	  mesh: true
	})
	.camera({
		orbit: 5,
		phi: Math.PI / 4
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

// set's up the folding of the steps
function stepSetup()
{
	
	//var step_contents	= document.getElementsByClassName("step-content");
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

// defines what has to happen in the plot when step 2 is entered
function enterStep2(previous_step)
{
	mathbox.animate	(	'curve', 
						{ domain: RANGE[1].map(function(x){ return Math.sign(x) * (Math.abs(x) + CURVE_CONT);})},
						{duration: 2000}
					);
}
// defines what has to happen in the plot when step 2 is left
function leaveStep2(next_step)
{
	return;
}
window.onload = main;