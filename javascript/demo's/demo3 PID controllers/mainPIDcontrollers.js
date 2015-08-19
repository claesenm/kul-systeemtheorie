function main(){
	
	var P_box = document.getElementById("P");
	var I_box = document.getElementById("I");
	var D_box = document.getElementById("D");
	
	document.getElementById('update').addEventListener('click', update);
	
	function update(){
		var arrayNumerator = document.getElementById("numerator").value.toString().split(',');
		while (arrayNumerator[0] == 0 && arrayNumerator.length > 1){
			arrayNumerator.shift();
		}
		var numeratorDegree = arrayNumerator.length - 1;
		var arrayDenominator = document.getElementById("denominator").value.toString().split(',');
		while (arrayDenominator[0] == 0 && arrayDenominator.length > 1){
			arrayDenominator.shift();
		}
		var denominatorDegree = arrayDenominator.length - 1;
		var correct = 1;
		//for (i = 0; i < arrayNumerator.length; i++){
		//	if (!(arrayNumerator[i] typeof number)){
		//		correct = 0;
		//	}
		//}
		//for (i = 0; i < arrayDenominator.length; i++){
		//	if (!(arrayDenominator[i] typeof number)){
		//		correct = 0;
		//	}
		//}
		if (numeratorDegree > denominatorDegree){
			alert("The degree of the numerator can not be bigger than the degree of the denominator.");
		} else if (correct == 0){
			alert("Please write your transfer function as in the example!");
		} else if (denominatorDegree == 0 && arrayDenominator[0] == 0){
			alert("Don't divide by zero please!");
		} else if (numeratorDegree == 0 && arrayNumerator[0] == 0) {
			alert("Don't take a transfer function of 0 please!");
		}
		else {
		document.getElementById("Pvalue").innerHTML = parseFloat(P_box.value || 1);
		document.getElementById("Ivalue").innerHTML = parseFloat(I_box.value || 1);
		document.getElementById("Dvalue").innerHTML = parseFloat(D_box.value || 1);
		var tempnumerator = "";
		var tempdenominator = "";
		if (numeratorDegree > 1){
		for (i = 0; i < numeratorDegree - 1; i++){
			if (i == 0){
				if (arrayNumerator[i] == 1) {
					tempnumerator = tempnumerator + "s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
				else if (arrayNumerator[i] == -1) {
					tempnumerator = tempnumerator + "-s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
				else {
					tempnumerator = tempnumerator + arrayNumerator[i].toString() + "s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
			}
			else {
			if (arrayNumerator[i] > 0){
				if (arrayNumerator[i] == 1) {
					tempnumerator = tempnumerator + " " + "+" + " " + "s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
				else {
					tempnumerator = tempnumerator + " " + "+" + " " + arrayNumerator[i].toString() + "s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
			}
			else if (arrayNumerator[i] != 0){
				if (arrayNumerator[i] == -1) {
					tempnumerator = tempnumerator + " " + "-" + " " + "s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
				else {
					tempnumerator = tempnumerator + " " + "-" + " " + Math.abs(arrayNumerator[i]).toString() + "s<html><sup>b</sup></html>".replace("b", numeratorDegree - i);
				}
			}
			}
		}
		if (arrayNumerator[numeratorDegree - 1] > 0) {
			if (arrayNumerator[numeratorDegree - 1] == 1) {
				tempnumerator = tempnumerator + " " + "+" + " " + "s";
			}
			else {
				tempnumerator = tempnumerator + " " + "+" + " " + arrayNumerator[i].toString() + "s";
			}
		}
		else if (arrayNumerator[numeratorDegree - 1] != 0){
			if (arrayNumerator[numeratorDegree - 1] == -1) {
				tempnumerator = tempnumerator + " " + "-" + " " + "s";
			}
			else {
				tempnumerator = tempnumerator + " " + "-" + " " + Math.abs(arrayNumerator[i]).toString() + "s";
			}
		}
		if (arrayNumerator[numeratorDegree] > 0){
			tempnumerator = tempnumerator + " " + "+" + " " + arrayNumerator[numeratorDegree].toString();
		}
		else if (arrayNumerator[numeratorDegree] != 0)
			tempnumerator = tempnumerator + " " + "-" + " " + Math.abs(arrayNumerator[numeratorDegree]).toString();
		}
		else {
			if (numeratorDegree == 1){
				if (arrayNumerator[numeratorDegree - 1] > 0) {
					if (arrayNumerator[numeratorDegree - 1] == 1) {
						tempnumerator = tempnumerator + "s";
					}
				else {
					tempnumerator = tempnumerator + arrayNumerator[0].toString() + "s";
					}
				}
				else {
					if (arrayNumerator[numeratorDegree - 1] == -1) {
						tempnumerator = tempnumerator + "-s";
					}
					else {
						tempnumerator = tempnumerator + "-" + Math.abs(arrayNumerator[0]).toString() + "s";
					}
				}
				if (arrayNumerator[numeratorDegree] > 0){
					tempnumerator = tempnumerator + " " + "+" + " " + arrayNumerator[numeratorDegree].toString();
				}
				else if (arrayNumerator[numeratorDegree] != 0){
					tempnumerator = tempnumerator + " " + "-" + " " + Math.abs(arrayNumerator[numeratorDegree]).toString();
				}
			}
			else {
				tempnumerator = tempnumerator + arrayNumerator[0].toString();
			}
		}
		
		if (denominatorDegree > 1){
		for (i = 0; i < denominatorDegree - 1; i++){
			if (i == 0){
				if (arrayDenominator[i] == 1) {
					tempdenominator = tempdenominator + "s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
				else if (arrayDenominator[i] == -1) {
					tempdenominator = tempdenominator + "-s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
				else {
					tempdenominator = tempdenominator + arrayDenominator[i].toString() + "s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
			}
			else {
			if (arrayDenominator[i] > 0){
				if (arrayDenominator[i] == 1) {
					tempdenominator = tempdenominator + " " + "+" + " " + "s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
				else {
					tempdenominator = tempdenominator + " " + "+" + " " + arrayDenominator[i].toString() + "s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
			}
			else if (arrayDenominator[i] != 0){
				if (arrayDenominator[i] == -1) {
					tempdenominator = tempdenominator + " " + "-" + " " + "s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
				else {
					tempdenominator = tempdenominator + " " + "-" + " " + Math.abs(arrayDenominator[i]).toString() + "s<html><sup>b</sup></html>".replace("b", denominatorDegree - i);
				}
			}
			}
		}
		if (arrayDenominator[denominatorDegree - 1] > 0) {
			if (arrayDenominator[denominatorDegree - 1] == 1) {
				tempdenominator = tempdenominator + " " + "+" + " " + "s";
			}
			else {
				tempdenominator = tempdenominator + " " + "+" + " " + arrayDenominator[i].toString() + "s";
			}
		}
		else if (arrayDenominator[denominatorDegree - 1] != 0){
			if (arrayDenominator[denominatorDegree - 1] == -1) {
				tempdenominator = tempdenominator + " " + "-" + " " + "s";
			}
			else {
				tempdenominator = tempdenominator + " " + "-" + " " + Math.abs(arrayDenominator[i]).toString() + "s";
			}
		}
		if (arrayDenominator[denominatorDegree] > 0){
			tempdenominator = tempdenominator + " " + "+" + " " + arrayDenominator[denominatorDegree].toString();
		}
		else if (arrayDenominator[denominatorDegree] != 0)
			tempdenominator = tempdenominator + " " + "-" + " " + Math.abs(arrayDenominator[denominatorDegree]).toString();
		}
		else {
			if (denominatorDegree == 1){
				if (arrayDenominator[denominatorDegree - 1] > 0) {
					if (arrayDenominator[denominatorDegree - 1] == 1) {
						tempdenominator = tempdenominator + "s";
					}
				else {
					tempdenominator = tempdenominator + arrayDenominator[0].toString() + "s";
					}
				}
				else {
					if (arrayDenominator[denominatorDegree - 1] == -1) {
						tempdenominator = tempdenominator + "-s";
					}
					else {
						tempdenominator = tempdenominator + "-" + Math.abs(arrayDenominator[0]).toString() + "s";
					}
				}
				if (arrayDenominator[denominatorDegree] > 0){
					tempdenominator = tempdenominator + " " + "+" + " " + arrayDenominator[denominatorDegree].toString();
				}
				else if (arrayDenominator[denominatorDegree] != 0){
					tempdenominator = tempdenominator + " " + "-" + " " + Math.abs(arrayDenominator[denominatorDegree]).toString();
				}
			}
			else {
				tempdenominator = tempdenominator + arrayDenominator[0].toString();
			}
		}
		document.getElementById("numerator_plant").innerHTML = tempnumerator;
		document.getElementById("denominator_plant").innerHTML = tempdenominator;
		// here must come the changes of the diagrams.
		}
	}
}

window.onload = main;