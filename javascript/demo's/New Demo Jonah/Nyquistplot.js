function Nyquist(){
var numerator = [1];
var denominator = [1,1,1];	
var dynsys = control.system.tf(numerator,denominator);		
var evaluation = function(Dyn, omega)
	{
		return Dyn.evalS(math.complex(0,omega));
	};
var punten1 =[];
var punten2 =[];
for (i=0;i<100000;i++){
	var j = evaluation(dynsys,i/10 + math.pow(1.05,i/20));
	punten1[i] = [j.im,j.re];
	punten2[i] = [-j.im,j.re];
}	

	var output = document.getElementById("Nyquist");
    new Highcharts.Chart({
        chart: {
            type: 'spline',
            inverted: true,
			renderTo: output
        },
		title: {
            text: 'Frequency Response of Dynamical Systems'
        },
        subtitle: {
            text: 'Nyquist Plot'
        },
        xAxis: {
            reversed: false,
            title: {
                enabled: true,
                text: 'Real'
            },
            labels: {
                formatter: function () {
                    return this.value; //+ 'km';
                }
            },
            maxPadding: 0.05,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Imaginary'
            },
            labels: {
                formatter: function () {
                    return this.value;  //+ '°';
                }
            },
            lineWidth: 2
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: '{point.x} : {point.y}'
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
            data: punten1
        },{name: 'Points2',
		    data: punten2}]
		
    });
	
}
window.onload = Nyquist;
		
	
