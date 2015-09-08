
function surfaceFunc(x, y) 
{
    return [x, Math.cos(x*5) + Math.cos(y*5), y];
};


function main()
{
	animationSetup();
	
	var element = document.getElementById("drawing");
	
	// TODO: keep matbox in it's right pane
	var mathbox = mathBox(element,{
        cameraControls: true,
        cursor:         true,
        controlClass:   ThreeBox.OrbitControls,
        elementResize:  true,
        fullscreen:     true,
      }).start();
											 
	/*mathbox
	.viewport({
	  type: 'cartesian',
	  range: [[-3, 3], [-3, 3], [-3, 3]],
	  //scale: [0.5, 0.5,0.5],
	  scale: [1,1,1]
	 })
	// Add XYZ axes
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
	// .curve({
	  // id: 'my-curve',
	  // domain: [-3, 3],
	  // expression: function (x) { return Math.cos(x); },
	  // line: true,
	  // points: true,
	  // lineWidth: 2,
	// })

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
	*/
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

// set's up the folding of the steps
function animationSetup()
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
window.onload = main;