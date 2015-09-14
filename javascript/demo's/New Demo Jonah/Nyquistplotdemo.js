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
			

function sortPoints(a,b){

return a[1] - b[1];

}	
  function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}
	
function Nyquistdata(){

		
var evaluation = function(Dyn, omega)
	{
		return Dyn.evalS(math.complex(0,omega));
	};

var points4 = [];
var points5 = [];
var points6 =[];
var points7 =[];
var points8 =[];

	for (i=0;i<2000;i++){
	var j = evaluation(dynSys,math.pow(1.005,i-1000));
	points4.push([[j.im,j.re],math.pow(1.005,i-1000)]);	
	points5.push([[-j.im,j.re],math.pow(1.005,i-1000)]);
	var z = evaluation(dynSys,math.pow(10,i-1000));
	if (z!= Infinity && isNaN(z)== false){
	points4.push([[z.im,z.re],math.pow(10,z-1000)]);	
	points5.push([[-z.im,z.re],math.pow(10,z-1000)]);
	}
	var x = evaluation(dynSys,i/1000);
	if (x!= Infinity && isNaN(x)== false){
	points4.push([[x.im,x.re],i/1000]);	
    points5.push([[-x.im,x.re],i/1000]);
	 }
  	}
	
	points4.sort(function(a,b){
	 return a[1] - b[1];  
   });
   	points5.sort(function(a,b){
	 return a[1] - b[1];  
   });
   
	var fstep = 4;
	var f = math.pow(10,-10);
	var j = evaluation(dynSys,2*math.PI*f);
	points6.push([[j.im,j.re],f]);
	points7.push([[-j.im,j.re],f]);
    for (i=0;i<4000;i++){
		
	
	
	if (fstep>1){
	f= f*fstep;
	}
	
	if(f== Infinity){
	break;
	}
	j  = evaluation(dynSys,2*math.PI*f);
	points6.push([[j.im,j.re],f]);
    points7.push([[-j.im,j.re],f]);
	if(points6[i+1][0][0]== 0 && points6[i+1][0][1]==0){
	fstep = fstep*10;
	}
    var distance = math.sqrt(math.pow(points6[i+1][0][0]-points6[i][0][0],2)+math.pow(points6[i+1][0][1]-points6[i][0][1],2));
	if (distance<math.pow(10,-60)){
	fstep = fstep*1.25;
	}
	if (distance>math.pow(10,-1)){
	fstep = fstep/3;	
	var back = getBaseLog(10,f);
    f = f/math.pow(10,1);	
	}
	
	}
   

// for (i=0;i=500;i++){
// var j  = evaluation(dynSys,2*math.PI*math.pow(1.05,i-200));
// points8.push([[j.im,j.re],math.pow(1.05,i)]);	
	
// }
// for (i=0;i=500;i++){
// var j  = evaluation(dynSys,2*math.PI*math.pow(5,i-250));
// if (j != Infinity && isNaN(j)== false){
// points8.push([[j.im,j.re],math.pow(5,i-250)]);		
// }	
// } 
// for (i=0;i=500;i++){
// var j  = evaluation(dynSys,2*math.PI*(i/100));
// if (j != Infinity && isNaN(j)== false){
// points8.push([[j.im,j.re],i/100]);		
// }	
// } 
  
   points6.sort(function(a,b){
	 return a[1] - b[1];  
   });
   
   points7.sort(function(a,b){
	 return a[1] - b[1];  
   });	
   
   // points8.sort(function(a,b){
	 // return a[1] - b[1];  
   // });	
points5.reverse()
points7.reverse()

	// var z = control.system.bode.omegas([-20,20]);
	// for(i=0;i<z.length;i++){
	// var b = evaluation(dynSys,2*math.PI*z[i]);	
	// points8.push([[b.im,b.re],z[i]]);
	// }
return [points6,points7];
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
            //type: 'spline',
            inverted: true,
			renderTo: outputplot,
			polar: true
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
			gridLineWidth: 1,
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
			gridLineWidth: 1
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
				return 'The frequency is <b>'+coordinates1[i][1]+'</b>'+ '<br>  Imaginary is <b> '+ this.x +'</b>'+ ' <br>  Real is <b>' + this.y + '</b>'; 	
				}
                if (coordinates2[i][0][0] == this.x && coordinates2[i][0][1]==this.y){
				return 'The frequency is <b>'+coordinates2[i][1]+'</b>'+ ' <br>  Imaginary is <b>'+ this.x +'</b>'+ ' <br>  Real is <b>' + this.y + '</b>'; 	
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