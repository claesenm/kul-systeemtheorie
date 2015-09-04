
function surfaceFunc(x, y) 
{
    return [x, Math.cos(x*5) + Math.cos(y*5), y];
};


function main()
{
	var element = document.getElementById("drawing");
	
	var mathbox = mathBox(element,{
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
}



window.onload = main;