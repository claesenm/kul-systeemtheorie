
function start3d()
{
	// setup renderer
	var screen_canvas = document.getElementById('canvas');
	var renderer = new Pre3d.Renderer(screen_canvas);
	
	// make a shape
	var shape = makePlotShape(funcToPlot, -10,10,-10,10);
	
	// set stroke and fill
	renderer.fill_rgba = new Pre3d.RGBA(10/255,0,200/255,0.2);
	renderer.stroke_rgba = new Pre3d.RGBA(1,0,0,1);
	renderer.camera.focal_length = 5;
	
	// fucntion for drawing the shape
	function draw()
	{
		renderer.clearBackground();
		// all shapes and other drawings are kept in buffer before be
		renderer.bufferShape(shape);
		renderer.drawBuffer();
		renderer.emptyBuffer();
	}
	
	// setting up the camera: when it is in the shape, you see only blank
	// the coordinate system is a left handed with x horizontal to the right and y vertical pointing to the top
	renderer.camera.transform.reset();
	
	// The z-axis goes into the screen: rotate camera so it points up
	//renderer.camera.transform.rotateX(Math.PI/2);
	//renderer.camera.transform.rotateY(1.2);
	renderer.camera.transform.translate(0,0,-300);
	

	draw();
	
	//function to rotate canvas on mouse movement
	var lastClickCoord;
	function cameraTransform(e)
	{
		var x = (e.clientX - lastClickCoord[0]);
		var y = (e.clientY - lastClickCoord[1]);
		lastClickCoord = [e.clientX, e.clientY];
		var ct = renderer.camera.transform;
		
		ct.translate(0, 0, 300);
		//ct.rotateZ(0.0);
		ct.rotateY( 0.001* x);
		ct.rotateX(0.01 * y);
		ct.translate(0, 0, -300);
		draw();
	}
	
	// add events to canvas to enable dragging the graph
	screen_canvas.addEventListener('mousedown', function(e)
					{
						screen_canvas.addEventListener('mousemove', cameraTransform);
						lastClickCoord = [e.clientX, e.clientY];
					});
	screen_canvas.addEventListener('mouseup', function()
					{
						// removing following the mouse
						// removing event that does not exist is no problem
						screen_canvas.removeEventListener('mousemove', cameraTransform, false);
					});
					
}

function makePlotShape(func, x_min, x_max, y_min, y_max)
{
	s = new Pre3d.Shape();
	
	
	for(var y= y_min; y <= y_max; y++)
	{
		for(var x = x_min; x <= x_max; x++)
		{
			s.vertices.push({x: x, y: y, z: func(x,y) });
			
			// Make quadfaces (connecting the vertices) starting with the second element of the second row,
			if( (y > y_min) && (x > x_min) )
			{
				// Connect the adjacent vertices: one left, one under, and one on the diagonal left-under
				// the numbering of the vertices you have to pass to QuadFace is the index in s.vertices
				
				// the vertex just added
				var currVertex = (x_max - x_min + 1)*(y - y_min) + (x - x_min);
				// the vertex added just before
				var leftVertex = (x_max - x_min + 1)*(y - y_min) + (x - x_min - 1);
				// the vertex beneath te one just added
				var downVertex = (x_max - x_min + 1)*(y - y_min - 1) + (x - x_min);
				// the vertex left-under
				var diagVertex = (x_max - x_min + 1)*(y - y_min - 1) + (x - x_min - 1);
				
				//console.log(leftVertex + ", " + currVertex + ", " + diagVertex + ", " +  downVertex);
				
				// TODO: the order of vertices in quad appearantly matters! Investigate!
				
				// exterior
				s.quads.push( new Pre3d.QuadFace(	leftVertex,
													currVertex,
													downVertex, 
													diagVertex											 
												));
				// interior
				s.quads.push( new Pre3d.QuadFace(	diagVertex,
													downVertex,
													currVertex,
													leftVertex														 
												));
			}
		}
	}
	Pre3d.ShapeUtils.rebuildMeta(s);
	return s;
}

function funcToPlot(x,y)
{
	// paraboloid
	// return Math.pow(x,2) + Math.pow(y,2);
	return (Math.cos(x*0.5) + Math.cos(y*0.5))*3;
}
window.onload = start3d;