

function bode() {
var bodecont = document.getElementById("BODE");
var bodecont2 = document.getElementById("POLE");
var bodecont3 = document.getElementById("LOCUS")
var numerator = prompt("Enter the numerator");
var denominator = prompt("Enter the denominator");
var array = numerator.split(',');
var array2 = denominator.split(',');
var len1 = array.length;
var len2 = array2.length;
var a =[];
var b = [];
for (i=0;i<len1;i++){
	a[i]=parseInt(array[i]) ;
}
for (i=0;i<len2;i++){
	b[i]=parseInt(array2[i]) ;
}
var dynsys = control.system.tf(a,b);	
control.plot.bode(bodecont,dynsys);
control.plot.pzmap(bodecont2,dynsys);
control.plot.rlocus(bodecont3,dynsys);	
}

window.onload = bode;