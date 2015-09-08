

var dyn_sys = new control.system.tf([2,3], [1,8,16])

var mathbox = null;

function surfaceFunc(x, y) 
{
    return dyn_sys.evalS(math.complex(x,y)).toPolar().r;
};


function main()
{
	MathJax.Hub.Config(
	{
		displayAlign: "left",
		displayIndent: "1em"
	});
	
	stepSetup();
	
	
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
	
	
	// mathbox
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
	  range: [[-3, 3], [-3, 3], [-3, 3]],
	  scale: [0.5, 0.5,0.5],
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

	// Curve, explicit function
	.curve({
	  id: 'my-curve',
	  domain: [-3, 3],
	  expression: function (x) { return Math.cos(x); },
	  line: true,
	  points: true,
	  lineWidth: 2,
	})

	.surface({
	  n: [ 40, 40 ],
	  id: 'my-plot',
	  domain: [[-3, 3],[-3, 3]],
	  expression: surfaceFunc,
	  points: false,
	  shaded: true,
	  mesh: true
	})
	.camera({
		orbit: 5
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
	var step_headers	= document.getElementsByClassName("step-header");
	var step_contents	= document.getElementsByClassName("step-content");
	
	var stepClick = function()
	{
		// an extra class open on the headers marks open steps
		
		// get index of clicked step and its content (first step is number 0)
		var clicked_step = this.id.split('-')[1] ;
		var	content_element = step_contents[clicked_step - 1] - 1;
		
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
		
	}
	
	// add stepClick to all headers click event
	for( var i = 0; i < step_headers.length; i++)
	{
		step_headers[i].addEventListener('click', stepClick);
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