var bodePlot 	= 	null;
var bodeCharts	=	null;
var ouputPlot 	=	null;
var outputChart	=	null;
var dynSys 		= 	null;
var noUnstablePoles = true;

var buttonSubmit		= null;
var checkBoxAutoScale 	= null;


var tfNum		= [1,];
var tfDen		= [1,1];

var bodePlotChartOptions =	{ 
								tooltip: {
											enabled: false
										 }
							};
			
			
function Nyquistdata(){

		
var evaluation = function(Dyn, omega)
	{
		return Dyn.evalS(math.complex(0,omega));
	};
var points1 =[];
var points2 =[];

 for (i = 0; i<33;i++){
	 var j = evaluation(dynSys,2*math.PI*math.pow(10,i-36))
	 
	 points1.push([[j.im,j.re],math.pow(10,i-36)]);
	 points2.push([[-j.im,j.re],,math.pow(10,i-36)]);
	 
 }
 
  for (i = 33; i<533;i++){
	 var j = evaluation(dynSys,2*math.PI*(math.pow(1.14,i-93)))
	
	 points1.push([[j.im,j.re],math.pow(1.14,i-93)]);
	 points2.push([[-j.im,j.re],math.pow(1.14,i-93)]);
	 
 }
 
 for(i=533;i<566;i++){     
	 var j = evaluation(dynSys,2*math.PI*(math.pow(10,i-507)))
	
	 points1.push([[j.im,j.re],math.pow(10,i-507)]);
	 points2.push([[j.im,j.re],math.pow(10,i-507)]);
	 
 }

points2.reverse()
var points = points2.concat(points1);
points.pop
return [points1,points2];
}
	
function setup()
{var inputBoxNumerator = document.getElementById('input-numerator');
 var inputBoxDenominator = document.getElementById('input-denominator');
 var inputBoxValue = function(arr) 	{
											var returnStr = "";
											for (var i = 0; i < arr.length; i++)
											{
												returnStr += arr[i].toString() +  ( i==(arr.length - 1) ? "" : "," );
											}
											return returnStr;
										};

    inputBoxNumerator.value = inputBoxValue(tfNum);
	inputBoxDenominator.value = inputBoxValue(tfDen);
    // make math allign left
	MathJax.Hub.Config(
	{
		displayAlign: "left",
		displayIndent: "1em"
	});
	
	update_tf(tfNum, tfDen);
	
	// set up global variables to identify the various elements
	bodePlot 	= 	document.getElementById('bode-plot-container');
	dynSys		=	control.system.tf(tfNum,tfDen);
	outputplot  = document.getElementById("Nyquistcontainer");
	buttonSubmit		=	document.getElementById('submit-button');
    
	buttonSubmit.onclick = submit_transfer_function; 
	update_bode_plot();
	Nyquistplotting();
}

function update_tf(num, den)
{
	
	var tfLatex		= " $$ H(s) = \\frac{";
	
	/**	Makes a in latex formated polynom
	 *	
	 *	@param {Array} coeff -
	 *	Array containing the coefficients of the polynom
	 *
	*/
	var makeLatexPolynom = function(coeff)
		{
			var returnString = "";

			for(var i = 0; i < coeff.length; i++)
			{
				// Add sign expect for highest degree
				if( i != 0 )
					returnString += (coeff[i] < 0) ? '' : '+';
				switch(coeff[i])
				{
					case 0:
						// If the coefficient is zero, remove the sign
						returnString = returnString.slice(0,-1);
						break;
					default:
						returnString += coeff[i];
					case 1:
					case -1:
						// Minus sign in case of -1
						returnString += ( coeff[i] == -1 ) ? '-' : '';
						var degree = coeff.length - i - 1;
						switch(degree)
						{
							case 1:
								returnString += "s";
								break;
							case 0:
								if( Math.abs(coeff[i]) == 1)
									returnString += "1";
								break;
							default:
								returnString += "s^{" + (degree) + "}";
						}
						break;
				}
				
			}
			//console.log("Made Polynom: " + returnString)
			return returnString;
		};
			tfLatex += makeLatexPolynom(num) + "}{" + makeLatexPolynom(den) + "} $$";
	
	// update Math
	var math = document.getElementById('tf-function')
	math.innerHTML=tfLatex;
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,math]);
	
	// update MathJax 
	// this way is more efficiënt but it does not work if mathjax hasn't processed for the first time yet
	// var math = MathJax.Hub.getAllJax("tf-function")[0];
	//MathJax.Hub.Queue(["Text",math,tfLatex]);
};

function areAllNumbers( chkArray )
{
	var allNumbers = true;
	for(var i = 0; ((i < chkArray.length) && allNumbers); i++)
	{
		allNumbers = allNumbers && !(isNaN(chkArray[i]));
	}
	return allNumbers;
}

function  update_bode_plot()
{
	// workaround for bug in lib: first clear containter, than fill it up.
	// otherwise a new plot is created beneath the old one
	while (bodePlot.firstChild) {
		bodePlot.removeChild(bodePlot.firstChild);
	}
	
	// populate bode plot, without the automatic syncing because we are going to define our own
	bodeCharts = control.plot.bode(bodePlot, dynSys);
	
	//New sync function  that will highlight the frequency when mouse is not on chart
	
	
	// Attach the new sync to the mousemove event handler
	
	
	
}

function submit_transfer_function()
{
	var arrayNumerator 		= document.getElementById('input-numerator').value.toString().split(/[,;:]+/);
	var arrayDenominator	= document.getElementById('input-denominator').value.toString().split(/[,;:]+/);
	
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

	// Update everything
	dynSys		=	control.system.tf(arrayNumerator,arrayDenominator);
	
	// Check on unstable poles
	var poles = dynSys.getPoles();
	
	noUnstablePoles = true;
	for( var i = 0; (i < poles.length) && noUnstablePoles; i++)
	{
			if(math.complex(poles[i]).re >=0)
			{
				noUnstablePoles = false;
				alert("This transfer function contains poles in the right-half plane and/or poles on the imaginary axis.  This application only computes the output signal for stable systems.  Keep in mind that for unstable systems the transient response never dies out, and the output of the system goes to infinity.");
			}
	}
	
	update_tf(arrayNumerator, arrayDenominator);
	update_bode_plot();
	Nyquistplotting();
	
	
	// change the range from the sliders according to new plot
	var bodeChartRange = bodeCharts[0].xAxis[0].getExtremes();
	
	
	
}




function Nyquistplotting(){

    new Highcharts.Chart({
        chart: {
            type: 'spline',
            inverted: true,
			renderTo: outputplot
        },
		title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
			
            reversed: false,
            title: {
                enabled: true,
                text: 'Imaginary',
				//align: 'low'
            },
            labels: {
                formatter: function () {
                    return this.value; //+ 'km';
                }
            },
			offset: 0,
            maxPadding: 0.05,
            showLastLabel: true
        },
        yAxis: {
			
            title: {
                text: 'Real'
				
            },
            labels: {
                formatter: function () {
                    return this.value;  //+ '°';
                }
            },
			offset: 0,
            lineWidth: 2,
			gridLineWidth: 0
        },
        legend: {
            enabled: false
        },
        tooltip: {
            
			formatter: function () {
				var coordinates1 = Nyquistdata()[0];
				var coordinates2 = Nyquistdata()[1];
				for (i=0;i<1132;i++){
				if (coordinates1[i][0][0] == this.x && coordinates1[i][0][1]==this.y){
				return 'The frequency is <b>'+coordinates1[i][1]+'</b>'+ '<b> <br> Imaginary is '+ this.x +'</b>'+ '<b> <br> Real is ' + this.y + '</b>'; 	
				}
                if (coordinates2[i][0][0] == this.x && coordinates2[i][0][1]==this.y){
				return 'The frequency is <b>'+coordinates2[i][1]+'</b>'+ '<b> <br> Imaginary is '+ this.x +'</b>'+ '<b> <br> Real is ' + this.y + '</b>'; 	
				}				
				}
			},
			pointFormat: "Value: {point.y:.2f} mm"
        },
        plotOptions: {
            spline: {
                marker: {
                    enable: false
                }
            }
        },
        series: [{
            name: 'Points',
            data: Nyquistdata()[0].map(function(element){return element[0];})
        },{
            name: 'Points',
            data: Nyquistdata()[1].map(function(element){return element[0];})
        }]
		
    });
	
}


window.onload = setup;