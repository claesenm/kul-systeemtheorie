function Nyquist(){
var numerator = [1];
var denominator = [1,5,4];	
var dynsys = control.system.tf(numerator,denominator);		
var evaluation = function(Dyn, omega)
	{
		return Dyn.evalS(math.complex(0,omega));
	};
var punten1 =[];

for (i=-1000;i<1000;i++){
	
	var j = evaluation(dynsys,i/10 + math.pow(1.05,i/20));
	punten1[i+1000] = [j.im,j.re];
	

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
			offset: -52,
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
			offset: -126,
            lineWidth: 2,
			gridLineWidth: 0
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: '{point.y} : {point.x}'
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
        }]
		
    });
	
}
window.onload = Nyquist;
		
	
