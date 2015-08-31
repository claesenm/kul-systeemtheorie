//TODO: zie blad + update plot alleen als slider klaar is
//TODO: Fixed axis for output so you can cleary see difference when using sliders

var bodePlot 	= 	null;
var ouputPlot 	=	null;
var dynSys 		= 	null;

var checkBoxAutoScale = null;
var sliderAmplitude = null;
var sliderFrequency = null;
var sliderAmpVal	= 1;
var	sliderOmegaVal	= 1;

var tfNum		= [1, 2];
var tfDen		= [8, 3, 4];

// HighChart plot options
var outputChartOptions = {
							chart: {
								type: 'line'
							},

							title: {
								text: '',
								y: 0
							},

							xAxis: {
								type: 'linear',
								title: {
									text: 't (s)'
								}
							},
							yAxis: {
								startOnTick: false,
								minPadding: 0.01,
								endOnTick: false,
								maxPadding: 0.01,
								title: {
									text: ''
								},
								lineWidth: 1,
								gridLineWidth: 0,
								tickWidth: 1
							},
							legend: {
								enabled: false
							},
							credits: {
								enabled: false
							},
							tooltip: {
								crosshairs: [true, false],
								headerFormat: '<b> t: {point.x} <\b> <br>',
								pointFormat: '<b style="color:{series.color}> {series.name}: <\b> {point.y}',
								valueDecimals: 4
							}
						};

var inputFunction = function(t, mult, phaseShift ) 	
	{
		// default values for optional parameters
		if (typeof(mult)==='undefined') mult = 1;
		if (typeof(phaseShift)==='undefined') phaseShift = 0;
		
		return sliderAmpVal * mult * Math.sin(t*sliderOmegaVal + phaseShift); 
	};
		
function setup()
{
	//confirm("Hello");
	
	// make math allign left
	MathJax.Hub.Config(
	{
		displayAlign: "left",
		displayIndent: "1em"
	});
	
	update_tf(tfNum, tfDen);
	
	// set up global variables to identify the various containers
	bodePlot 	= 	document.getElementById('bode-plot-container');
	outputPlot	=	document.getElementById('output-plot-container');
	
	// Add outputPlot container to HighChart plot options
	if( 'chart' in outputChartOptions)
	{
		outputChartOptions['chart']['renderTo'] = outputPlot;
	}
	else
	{
		outputChartOptions['chart'] = {renderTo: outputPlot};
	}
	
	dynSys		=	control.system.tf(tfNum,tfDen);
	
	checkBoxAutoScale	=	document.getElementById('check-auto-scale');
	
	sliderAmplitude 	= 	document.getElementById('slider-amplitude');
	sliderFrequency		=   document.getElementById('slider-omega');
	
	// create the sliders
	noUiSlider.create(sliderAmplitude, 
	{
		start: [ sliderAmpVal ],
		step: 0.01,
		range: 
		{
			'min': [  0 ],
			'max': [ 10 ]
		}
	});
	noUiSlider.create(sliderFrequency, 
	{
		start: [ sliderOmegaVal ],
		step: 0.01,
		range: 
		{
			'min': [ 0 ],
			'max': [ 5 ]
		}
	});
	
	//dispaly the values of the sliders
	sliderAmplitude.noUiSlider.on('update', function ( values, handle )
		{
			sliderAmpVal = parseFloat(values[handle]);
			document.getElementById('amplitude-value').innerHTML = values[handle];
			update_output_plot();
		});
	sliderFrequency.noUiSlider.on('update', function ( values, handle )
		{
			sliderOmegaVal = parseFloat(values[handle]);
			document.getElementById('omega-value').innerHTML = values[handle];
			update_output_plot();
		});
		
	// checkBox
	checkBoxAutoScale.onchange = update_output_plot;
	// populate graphs
	var plts = control.plot.bode(bodePlot, dynSys);
	
}
/**
 *	Updates the formula of the Transfer Function under input.
 *	
 *	@param {Array} num -
 *	Array containing the coëfficiënts of the numerator, highest degree first
 *
 *	@param {Array} den -
 *	Array containing the coëfficiënts of the denominator, highest degree first
*/
function update_tf(num, den)
{
	
	var tfLatex		= " $$ H(s) = \\frac{";
	
	/**
	 *	Makes a in latex formated polynom
	 *	
	 *	@param {Array} coeff -
	 *	Array containing the coëfficiënts of the polynom
	 *
	*/
	var makeLatexPolynom = function(coeff)
		{
			var returnString = "";
			
			for(var i = 0; i < coeff.length; i++)
			{
				switch(coeff[i])
				{
					case 0:
						break;
					default:
						returnString += coeff[i];
					case 1:
						var degree = coeff.length - i - 1;
						switch(degree)
						{
							case 1:
								returnString += "s+";
								break;
							case 0:
								break;
							default:
								returnString += "s^" + (degree) + "+";
						}
						break;
				}
				
			}
			//console.log("Made Polynom: " + returnString)
			return returnString;
		};
	
	tfLatex += makeLatexPolynom(num) + "}{" + makeLatexPolynom(den) + "} $$";
	
	// update Math
	var math = document.getElementById('tf-function').innerHTML = tfLatex;
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,math]);
	
	// update MathJax 
	// this way is more efficiënt but it does not work if mathjax hasn't processed for the first time yet
	// var math = MathJax.Hub.getAllJax("tf-function")[0];
	//MathJax.Hub.Queue(["Text",math,tfLatex]);
};

function get_amp_phase_shift( sys, freq)
{
	var tf_eval = sys.evalS( math.multiply(math.complex(0,1),freq));
	return tf_eval.toPolar();
}

/**	Generates an array of points to plot the ouput function
 *	
 *	@param {number} lowerBound -
 *	Where the x-value should start
 *
 *	@param {number} upperBound -
 *	Where the x-value should stop
 *
 *	@param {number} step -
 *	Distance between the x-values
 *
 *	@param {Polar Coord Complex Number} gainPolar -
 *	The complex Gain in polar notation.
 *
 *	@return {Array} -
 *	Array of (x,y) points 
 *	
 */
function generate_output_data(lowerBound, upperBound, step, gainPolar)
{
	if (typeof(gainPolar)==='undefined') gainPolar = 1;
	
	var ptList = [];
	
	// populate with x-values
	for(var i = lowerBound; i <= upperBound; i+= step)	ptList.push(math.round(i,4));
	
	// map function
	var outputVal = function(t_val)
	{
		return [t_val, inputFunction(t_val, gainPolar.r, gainPolar.phi) ];
	}
	
	// Apply map funciton on x-values by (x,y) points and return
	return ptList.map(outputVal);
	
}

function update_output_plot()
{
	var lowBound = 0;
	var highBound = 10;
	var step = 0.07;
	var seriesChartOptions = {
								series:	[
											{
												name: 'input',
												data: generate_output_data(lowBound, highBound, step)
											},
											{
												name: 'output',
												data: generate_output_data(lowBound, highBound, step, get_amp_phase_shift(dynSys, sliderOmegaVal))
											}
										]
							 };
	
	if (checkBoxAutoScale.checked)
	{
		var yScaleOptions = {
								yAxis: 	{
											min: null,
											max: null
										}
		};
	}
	else
	{
		var yScaleOptions =	{
								yAxis:	{
											min: -2*sliderAmpVal,
											max:  2*sliderAmpVal
										}	
							};
	}
	
	var finalChartOptions = [outputChartOptions, seriesChartOptions,yScaleOptions].reduce(recursiveExtend);
	return new Highcharts.Chart(finalChartOptions);
}

function recursiveExtend(target, source) {
    for (var prop in source) {
        if (prop in target && ( target[prop] && (target[prop].toString() === '[object Object]') )) {
            recursiveExtend(target[prop], source[prop]);
        } else {
            target[prop] = source[prop];
        }
    }
    return target;
}

window.onload = setup;
	