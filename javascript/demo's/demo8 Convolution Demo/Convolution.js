//Credit to Lensyl Urbano for numerical integration algorithm
function numerically_integrate(a, b, dx, f) {
	
	// calculate the number of trapezoids
	n = (b - a) / dx;
	
	// define the variable for area
	Area = 0;
	
	//loop to calculate the area of each trapezoid and sum.
	for (i = 1; i <= n; i++) {
		//the x locations of the left and right side of each trapezpoid
		x0 = a + (i-1)*dx;
		x1 = a + i*dx;
		
		// the area of each trapezoid
		Ai = dx * (f(x0) + f(x1))/ 2.;
		
		// cumulatively sum the areas
		Area = Area + Ai	
		
	} 
	return Area;
}

//define function to be integrated
function f(x){
	return -0.25*Math.pow(x,2) + x + 4;
}

// define variables
a = 1;		// left boundary of area
b = 5;		// right boundary of area
dx = 1;		// width of the trapezoids
	
// print out output
alert("Area = "+ numerically_integrate(a, b, dx, f));