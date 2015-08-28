
var bodePlot 	= 	null;
var ouputPlot 	=	null;
var dynSys 		= 	null;

var sliderAmplitude = null;
var sliderFrequency = null;
var sliderAmpVal	= 1;
var	sliderOmegaVal	= 1;

var tfNum		= [1, 2];
var tfDen		= [8, 3, 4];

var inputFunction = function(t) { return sliderAmpVal * Math.sin(t*sliderOmegaVal); };
		
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
	
	// set up global variable to identify the various containers
	bodePlot 	= 	document.getElementById('bode-plot-container');
	outputPlot	=	document.getElementById('output-plot-container');
	
	dynSys		=	control.system.tf(tfNum,tfDen);
	
	sliderAmplitude 	= 	document.getElementById('slider-amplitude');
	sliderFrequency		=   document.getElementById('slider-omega');
	
	// Load and Display the Transfer function
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
			sliderAmpVal = values[handle];
			document.getElementById('amplitude-value').innerHTML = values[handle];
		});
	sliderFrequency.noUiSlider.on('update', function ( values, handle )
		{
			sliderOmegaVal = values[handle];
			document.getElementById('omega-value').innerHTML = values[handle];
		});
	
	// populate graphs
	var plts = control.plot.bode(bodePlot, dynSys);
	
	console.log(get_amp_phase_shift(dynSys,sliderOmegaVal));
}
/*
 *	Updates the formula of the Transfer Function under input.
 *	
 *	@param {Array} num
 *	Array containing the coëfficiënts of the numerator, highest degree first
 *
 *	@param {Array} den
 *	Array containing the coëfficiënts of the denominator, highest degree first
*/
function update_tf(num, den)
{
	
	var tfLatex		= " $$ H(s) = \\frac{";
	
	/*
	 *	Makes a in latex formated polynom
	 *	
	 *	@param {Array} coeff
	 *	Array containing the coëfficiënts of the polynom
	 *
	*/
	var makeLatexPolynom = function(coeff)
		{
			var returnString = "";
			
			for(var i = 0; i < coeff.length; i++)
			{
				returnString += coeff[i];
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
	var tf_eval = sys.evalS( freq *math.complex(0,1) );
	console.log(tf_eval);
	return tf_eval.toPolar();
}
window.onload = setup;
	