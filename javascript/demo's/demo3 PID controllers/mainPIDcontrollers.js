function main(){
	
	var P_box = document.getElementById("P");
	var I_box = document.getElementById("I");
	var D_box = document.getElementById("D");
	
	document.getElementById('update').addEventListener('click', update);
	
	function update(){
		var arrayNumerator = document.getElementById("numerator").value.toString().split(',');
		var numeratorDegree = arrayNumerator.length - 1;
		var arrayDenominator = document.getElementById("denominator").value.toString().split(',');
		var denominatorDegree = arrayDenominator.length - 1;
		if (numeratorDegree > denominatorDegree){
			alert("The degree of the numerator can not be bigger than the degree of the denominator.");
		}
		else {
		document.getElementById("Pvalue").innerHTML = parseFloat(P_box.value || 1);
		document.getElementById("Ivalue").innerHTML = parseFloat(I_box.value || 1);
		document.getElementById("Dvalue").innerHTML = parseFloat(D_box.value || 1);
		}
	}
}

window.onload = main;