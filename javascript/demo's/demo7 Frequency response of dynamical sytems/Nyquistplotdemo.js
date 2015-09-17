var bodePlot 	= 	null;
var bodeCharts	=	null;
var ouputPlot 	=	null;
var outputChart	=	null;
var dynSys 		= 	null;
var stepresponse = null;
var stepCharts = null;
var impulseresponse = null;
var impulseCharts = null;
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
			
var stepResponseChartOptions =	{ 
								tooltip: {
											enabled: false
										 }
							};
var impulseResponseChartOptions =	{ 
								tooltip: {
											enabled: false
										 }
							};	

							
function Distance(list1,list2){

return math.sqrt(math.pow(list1[0]-list2[0],2)+math.pow(list1[1]-list2[1],2));

}	
  function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}


	
function Nyquistdata(){

		
var evaluation = function(Dyn, omega)
	{
		return Dyn.evalS(math.complex(0,omega));
	};


var points1 =[];
var points2 =[];
var a=1;
var step=10

var w = math.pow(10,-20);
var p = evaluation(dynSys,w);
points1.push([[p.im,p.re],w]);
points2.push([[-p.im,p.re],w]);

while (w < math.pow(10,15)){

a=a+1;	
var w_new = w*step;
var p_new = evaluation(dynSys,w_new);
var niter =0;

 while  ((Math.abs(Math.atan2(p_new.im,p_new.re) - Math.atan2(p.im,p.re)) > (0.5*math.PI/180)||math.abs(p.toPolar().r-p_new.toPolar().r)>0.05*p.toPolar().r) && niter<25){
     w_new = (w + w_new)/2;
     p_new = evaluation(dynSys,w_new);
	 niter = niter +1
	 var angdif = Math.abs(Math.atan2(p_new.im,p_new.re) - Math.atan2(p.im,p.re));
}	
step=2*(w_new/w);
if (step>10000){
step = 10000;
}
p =p_new;
w =w_new;
if(isNaN(p.im) == false && isNaN(p.re) == false){
points1.push([[p.im,p.re],w]);
points2.push([[-p.im,p.re],w]);
}
/*if (Math.abs(points1[points1.length-1][1]-points1[points1.length-2][1]>10 )){
var dif = points1[points1.length-2][1] - points1[points1.length-3][1]
for (i=0;i<10;i++){
var j = evaluation(dynSys,dif+(i+1));
points1.push([[j.im,j.re],w]);
points2.push([[-j.im,j.re],w]);	

}
}
*/	
}
points1.sort(function(a,b){return a[1]-b[1]});
points2.sort(function(a,b){return a[1]-b[1]});

return [points1,points2];
}

function impulse_data(){
	var coord = [];
	var time = dynSys.impulse().t;
	var xco = dynSys.impulse().x;
	for (i=0;i<time.length;i++){
	coord.push([time[i],xco[i]]);
	}
var v = 0;	
return coord;	
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
	stepresponse = document.getElementById('stepresponsecontainer');
	impulseresponse = document.getElementById('impulserespcontainer')
	dynSys		=	control.system.tf(tfNum,tfDen);
	outputplot  = document.getElementById("Nyquistcontainer");
	buttonSubmit		=	document.getElementById('submit-button');
    
	buttonSubmit.onclick = submit_transfer_function; 
	update_bode_plot();
	update_step_response();
	impulse_plot();
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
function update_step_response(){
	while (stepresponse.firstChild) {
		stepresponse.removeChild(stepresponse.firstChild);
	}
	stepCharts = control.plot.step(stepresponse, dynSys);
	
}

function impulse_plot(){
     var coordinates = impulse_data();  
	 new Highcharts.Chart({
		         chart: {
            //type: 'spline',
            inverted: false,
			renderTo: impulseresponse,
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
                text: 'Time',
				
            },
            labels: {
                formatter: function () {
                    return this.value; 
                }
            },
			offset: 0,
			gridLineWidth: 0,
            maxPadding: 0.05,
            showLastLabel: true
        },
        yAxis: {
			
            title: {
                text: ''
				
            },

            labels: {
                formatter: function () {
                    return this.value;  
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
            formatter: function(){
			 
			for (i=0;i<coordinates.length;i++){
			if (coordinates[i][0]== this.x ){
			return  'Time: <b>'+ Math.round(this.x*1000)/1000+'</b>'+ '<br> X: <b>'+Math.round(this.y*1000)/1000+'</b>';
			}	
			}	
			},
			pointFormat: "Value: {point.x:.2f} mm",

		  crosshairs: {
        color: 'grey',
        dashStyle: 'solid'
    },
    shared: true
        },
					        plotOptions: {
            spline: {
                marker: {
                    enable: false
                }
            }
        },
   
        series: [{
            name: '',
            data: coordinates
        }]
    });

	
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
	update_step_response();
	impulse_plot();
	Nyquistplotting();
	
	
	// change the range from the sliders according to new plot
	var bodeChartRange = bodeCharts[0].xAxis[0].getExtremes();
	var stepresponseChartRange = stepCharts[0].xAxis[0].getExtremes();
	
	
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
				
				for (i=0;i<coordinates1.length;i++){
				if (coordinates1[i][0][0] == this.x && coordinates1[i][0][1]==this.y){
				return 'Frequency:<b> '+Math.round(coordinates1[i][1]*1000)/1000+'</b>'+ ' rad/s <br>  Imaginary:<b> '+ Math.round(this.x*1000)/1000 +'</b>'+ ' <br>  Real:<b> ' + Math.round(this.y*1000)/1000 + '</b>'; 	
				}
                if (coordinates2[i][0][0] == this.x && coordinates2[i][0][1]==this.y){
				return 'Frequency:<b> '+Math.round(-coordinates2[i][1]*1000)/1000+'</b>'+ ' rad/s <br>  Imaginary:<b> '+ Math.round(this.x*1000)/1000 +'</b>'+ ' <br>  Real:<b> ' + Math.round(this.y*1000)/1000 + '</b>'; 	
				}				
				}
			},
			pointFormat: "Value: {point.y:.2f} mm",
		crosshairs: {
        color: 'grey',
        dashStyle: 'solid'
    },
    shared: true
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
            data: Nyquistdata()[1].map(function(element){return element[0];}),
			enableMouseTracking: false
        }]
		
    });
	
}


window.onload = setup;