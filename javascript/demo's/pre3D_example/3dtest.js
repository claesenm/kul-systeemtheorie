

function start3d()
{
	// setup renderer
	var screen_canvas = document.getElementById('canvas');
	var renderer = new Pre3d.Renderer(screen_canvas);
	
	// make a default shape
	var shape = Pre3d.ShapeUtils.makeOctahedron();
	
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
	renderer.camera.transform.rotateX(1.2);
	renderer.camera.transform.rotateY(1.2);
	renderer.camera.transform.translate(0.2,0.4,-10);
	

	draw();
}

window.onload = start3d;