function main(){
	
	var current_arrayNumerator = [1];
	var current_arrayDenominator = [1,1];
	
	var container2 = document.getElementById('step-plot');
    var plt2 = control.plot.stepwithreference(container2, control.system.tf([0.5],[1,1.5]), [0.01, 20], true);
	plt2.show_step_info({rise_time: false, settling_time: false, settled: true});
	
	var Slider1 = document.getElementById('slider_1');

		noUiSlider.create(Slider1, {
			start: [ 0.5 ],
			step: 0.002,
			range: {
				'min': [  0.01 ],
				'max': [ 0.99 ]
			}
		});
		
	/*Displaying the current value of slider 1  */
		var Slider1_ValueElement = document.getElementById('slider-value');
		Slider1.noUiSlider.on('update', function( values, handle ) {
			Slider1_ValueElement.innerHTML = values[handle];
			});
			
	var container1 = document.getElementById('root-locus');
    var plt1 = control.plot.rlocus(container1, control.system.tf([1],[1,1]), true);
	plt1.set_k(0.501);
	
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
		for (i = 0; i < arrayNumerator.length; i++){
			if (isNaN(arrayNumerator[i]) || arrayNumerator[i].toString() == ""){
				correct = 0;
			}
		}
		for (i = 0; i < arrayDenominator.length; i++){
			if (isNaN(arrayDenominator[i]) || arrayDenominator[i].toString() == ""){
				correct = 0;
			}
		}
		
		if (correct == 1){
		
		var closedLoopNumerator = control.num.conv([0.5],arrayNumerator); // must be K
		while (closedLoopNumerator[0] == 0 && closedLoopNumerator.length > 1){
			closedLoopNumerator.shift();
		}
		var closedLoopDenominator = control.num.polyadd(arrayDenominator,control.num.conv([0.5],arrayNumerator)); // must be K
		while (closedLoopDenominator[0] == 0 && closedLoopDenominator.length > 1){
			closedLoopDenominator.shift();
		}
		var closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
		var closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
		}
		
		if (numeratorDegree > denominatorDegree){
			alert("The degree of the numerator of the plant is not allowed to be greater than the degree of his denominator to avoid causality problems!");
		} else if (closedLoopNumeratorDegree > closedLoopDenominatorDegree){
			alert("The closed loop system you developed has causility problems!");
		} else if (correct == 0){
			alert("Please write your transfer function as in the example!");
		} else if (denominatorDegree == 0 && arrayDenominator[0] == 0){
			alert("Don't divide by zero please!");
		} else if (numeratorDegree == 0 && arrayNumerator[0] == 0) {
			alert("Don't take a transfer function of zero please!");
		} else {
		var plant_simplified = doHorner(arrayNumerator,arrayDenominator);
		arrayNumerator = plant_simplified[0];
		numeratorDegree = arrayNumerator.length - 1;
		arrayDenominator = plant_simplified[1];
		denominatorDegree = arrayDenominator.length - 1;
		document.getElementById("numerator_plant").innerHTML = writeAsFormula(arrayNumerator,numeratorDegree);
		document.getElementById("denominator_plant").innerHTML = writeAsFormula(arrayDenominator,denominatorDegree);
		
		var closedLoop_simplified = doHorner(closedLoopNumerator,closedLoopDenominator);
		closedLoopNumerator = closedLoop_simplified[0];
		closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
		closedLoopDenominator = closedLoop_simplified[1];
		closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
		document.getElementById("numerator_comp").innerHTML = writeAsFormula(closedLoopNumerator,closedLoopNumeratorDegree);
		document.getElementById("denominator_comp").innerHTML = writeAsFormula(closedLoopDenominator,closedLoopDenominatorDegree);
		
		var sys = control.system.tf(closedLoopNumerator, closedLoopDenominator);
		
		var step_data = sys.step([0.00000000000001,10000000],true);
		
		plt2.series[0].setData(control.num.zip(step_data.t, step_data.x), true, false, true);
		
		
		var container1 = document.getElementById('root-locus');
		plt1 = control.plot.rlocus(container1, control.system.tf(arrayNumerator,arrayDenominator), true);
		
		current_arrayNumerator = arrayNumerator;
		current_arrayDenominator = arrayDenominator;
		
		plt1.set_k(0.5);
		
		Slider1.noUiSlider.set(0.5);
		
		document.getElementById('slider_1').noUiSlider.destroy();
		Slider1 = document.getElementById('slider_1');
		noUiSlider.create(Slider1, {
			start: [ 0.5 ],
			step: 0.002,
			range: {
				'min': [  0.01 ],
				'max': [ 10 ]
			}
		});
		Slider1_ValueElement = document.getElementById('slider-value');
		Slider1.noUiSlider.on('update', function( values, handle ) {
			Slider1_ValueElement.innerHTML = values[handle];
			});
			
			Slider1.noUiSlider.on('change', function( values, handle ) {
			K = values[handle];
			document.getElementById('used_value_K').innerHTML = K;
			var arrayNumerator = current_arrayNumerator;
			var arrayDenominator = current_arrayDenominator;
			var closedLoopNumerator = control.num.conv([K],arrayNumerator); 
			while (closedLoopNumerator[0] == 0 && closedLoopNumerator.length > 1){
				closedLoopNumerator.shift();
			}
			var closedLoopDenominator = control.num.polyadd(arrayDenominator,control.num.conv([K],arrayNumerator)); 
			while (closedLoopDenominator[0] == 0 && closedLoopDenominator.length > 1){
				closedLoopDenominator.shift();
			}
			var closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
			var closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
			
			var plant_simplified = doHorner(arrayNumerator,arrayDenominator);
			arrayNumerator = plant_simplified[0];
			numeratorDegree = arrayNumerator.length - 1;
			arrayDenominator = plant_simplified[1];
			denominatorDegree = arrayDenominator.length - 1;
			document.getElementById("numerator_plant").innerHTML = writeAsFormula(arrayNumerator,numeratorDegree);
			document.getElementById("denominator_plant").innerHTML = writeAsFormula(arrayDenominator,denominatorDegree);
		
			var closedLoop_simplified = doHorner(closedLoopNumerator,closedLoopDenominator);
			closedLoopNumerator = closedLoop_simplified[0];
			closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
			closedLoopDenominator = closedLoop_simplified[1];
			closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
			document.getElementById("numerator_comp").innerHTML = writeAsFormula(closedLoopNumerator,closedLoopNumeratorDegree);
			document.getElementById("denominator_comp").innerHTML = writeAsFormula(closedLoopDenominator,closedLoopDenominatorDegree);
			
		//	var plt1 = control.plot.rlocus(container1, control.system.tf(arrayNumerator,arrayDenominator), true);
			plt1.set_k(K);
			
			var sys = control.system.tf(closedLoopNumerator, closedLoopDenominator);
			
			var step_data = sys.step([0.00000000000001,10000000],true);
			
			plt2.series[0].setData(control.num.zip(step_data.t, step_data.x), true, false, true);
			});
		
		document.getElementById("slider-value").innerHTML = 0.5;
		document.getElementById("used_value_K").innerHTML = 0.5;
		
		}
	}
	
	Slider1.noUiSlider.on('change', function( values, handle ) {
			K = values[handle];
			document.getElementById('used_value_K').innerHTML = K;
			var arrayNumerator = current_arrayNumerator;
			var arrayDenominator = current_arrayDenominator;
			var closedLoopNumerator = control.num.conv([K],arrayNumerator); 
			while (closedLoopNumerator[0] == 0 && closedLoopNumerator.length > 1){
				closedLoopNumerator.shift();
			}
			var closedLoopDenominator = control.num.polyadd(arrayDenominator,control.num.conv([K],arrayNumerator)); 
			while (closedLoopDenominator[0] == 0 && closedLoopDenominator.length > 1){
				closedLoopDenominator.shift();
			}
			var closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
			var closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
		
			var closedLoop_simplified = doHorner(closedLoopNumerator,closedLoopDenominator);
			closedLoopNumerator = closedLoop_simplified[0];
			closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
			closedLoopDenominator = closedLoop_simplified[1];
			closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
			document.getElementById("numerator_comp").innerHTML = writeAsFormula(closedLoopNumerator,closedLoopNumeratorDegree);
			document.getElementById("denominator_comp").innerHTML = writeAsFormula(closedLoopDenominator,closedLoopDenominatorDegree);
			
		//	var plt1 = control.plot.rlocus(container1, control.system.tf(arrayNumerator,arrayDenominator), true);
			plt1.set_k(K);
			
			var sys = control.system.tf(closedLoopNumerator, closedLoopDenominator);
			
			var step_data = sys.step([0.00000000000001,10000000],true);
			
			plt2.series[0].setData(control.num.zip(step_data.t, step_data.x), true, false, true);
			});
			
		
	}

window.onload = main;

function writeAsFormula(array,arrayDegree){
	var temp = "";
	if (arrayDegree > 1){
		for (i = 0; i < arrayDegree - 1; i++){
			if (i == 0){
				temp = writeFirstTermCaseDegreeGreaterThanOne(array,arrayDegree,temp,i);
			}
			else {
				temp = writeTermNotFirstButDegreeAtLeastTwo(array,arrayDegree,temp,i);
			}
		}
		if (array[arrayDegree - 1] > 0) {
			temp = writeTermDegreeOneCasePositiveAndDegreeArrayAtLeastTwo(array,arrayDegree,temp,i);
		}
		else if (array[arrayDegree - 1] != 0){
			temp = writeTermDegreeOneCaseNegativeAndDegreeArrayAtLeastTwo(array,arrayDegree,temp,i);
		}
		temp = writeConstantTermCaseDegreeAtLeastOne(array,arrayDegree,temp);
	}
		else {
			if (arrayDegree == 1){
				temp = writeDegreeOneCaseDegreeOne(array,arrayDegree,temp);
				temp = writeConstantTermCaseDegreeAtLeastOne(array,arrayDegree,temp);
			}
			else {
				temp = temp + array[0].toString();
			}
		}
	return temp;
}

function writeFirstTermCaseDegreeGreaterThanOne(array,arrayDegree,temp,i){
	var temp1 = temp;
	if (array[i] == 1) {
		temp1 = temp1 + "s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	else if (array[i] == -1) {
		temp1 = temp1 + "-s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	else {
		temp1 = temp1 + array[i].toString() + "s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	return temp1;
}

function writeTermNotFirstButDegreeAtLeastTwoPositive(array,arrayDegree,temp,i){
	var temp1 = temp;
	if (array[i] == 1) {
		temp1 = temp1 + " " + "+" + " " + "s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	else {
		temp1 = temp1 + " " + "+" + " " + array[i].toString() + "s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	return temp1;
}

function writeTermNotFirstButDegreeAtLeastTwoNegative(array,arrayDegree,temp,i){
	var temp1 = temp;
	if (array[i] == -1) {
		temp1 = temp1 + " " + "-" + " " + "s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	else {
		temp1 = temp1 + " " + "-" + " " + Math.abs(array[i]).toString() + "s<html><sup>b</sup></html>".replace("b", arrayDegree - i);
	}
	return temp1;
}

function writeTermNotFirstButDegreeAtLeastTwo(array,arrayDegree,temp,i){
	var temp1 = temp;
	if (array[i] > 0){
		temp1 = writeTermNotFirstButDegreeAtLeastTwoPositive(array,arrayDegree,temp1,i);
	}
	else if (array[i] != 0){
		temp1 = writeTermNotFirstButDegreeAtLeastTwoNegative(array,arrayDegree,temp1,i);
	}
	return temp1;
}

function writeTermDegreeOneCasePositiveAndDegreeArrayAtLeastTwo(array,arrayDegree,temp,i){
	var temp1 = temp;
	if (array[arrayDegree - 1] == 1) {
		temp1 = temp1 + " " + "+" + " " + "s";
	}
	else {
		temp1 = temp1 + " " + "+" + " " + array[i].toString() + "s";
	}
	return temp1;
}

function writeTermDegreeOneCaseNegativeAndDegreeArrayAtLeastTwo(array,arrayDegree,temp,i){
	var temp1 = temp;
	if (array[arrayDegree - 1] == -1) {
		temp1 = temp1 + " " + "-" + " " + "s";
	}
	else {
		temp1 = temp1 + " " + "-" + " " + Math.abs(array[i]).toString() + "s";
	}
	return temp1;
}

function writeConstantTermCaseDegreeAtLeastOne(array,arrayDegree,temp){
	var temp1 = temp;
	if (array[arrayDegree] > 0){
		temp1 = temp1 + " " + "+" + " " + array[arrayDegree].toString();
	}
	else if (array[arrayDegree] != 0){
		temp1 = temp1 + " " + "-" + " " + Math.abs(array[arrayDegree]).toString();
	}
	return temp1;
}

function writeDegreeOneCaseDegreeOne(array,arrayDegree,temp){
	var temp1 = temp;
	if (array[arrayDegree - 1] > 0) {
		if (array[arrayDegree - 1] == 1) {
			temp1 = temp1 + "s";
		}
		else {
			temp1 = temp1 + array[0].toString() + "s";
		}
	}
	else {
		if (array[arrayDegree - 1] == -1) {
			temp1 = temp1 + "-s";
		}
		else {
			temp1 = temp1 + "-" + Math.abs(array[0]).toString() + "s";
		}
	}
	return temp1;
}

function round(value){
	if (value > 0.99){
		return Math.round(10000*value)/10000;
	}
	else {
		return Math.round(10000*value*math.pow(10,-math.round(Math.log10(value))+1))/(10000*math.pow(10,-math.round(Math.log10(value))+1));
	}
}

function roundpolezero(value){
	return math.complex(Math.round(10000*math.re(value))/10000,(Math.round(10000*math.im(value))/10000));
}

function roundresultHorner(value){
	return Math.round(100*value)/100;
}

function doHorner(numeratorArray,denominatorArray){
	var sys = control.system.tf(numeratorArray,denominatorArray);
	var poles = sys.getPoles();
	var zeros = sys.getZeros();
	for (i = 0; i < poles.length; i++){
		poles[i] = roundpolezero(poles[i]);
	}
	for (i = 0; i < zeros.length; i++){
		zeros[i] = roundpolezero(zeros[i]);
	}
	var samevalue = [];
	var alreadyin = 0;
	for (i = 0; i < poles.length; i++){
		for (j = 0; j < zeros.length; j++){
			if (math.subtract(poles[i],zeros[j]) == 0){
				if (samevalue.length != 0){
					for (k = 0; k < samevalue.length; k++){
						if (math.subtract(samevalue[k],poles[i]) == 0){
							alreadyin = 1;
						}
					}
				}
				if (alreadyin == 0){
					samevalue.push(poles[i]);
				}
				else {
					alreadyin = 0;
				}
			}
		}
	}
	if (samevalue.length != 0){
	var samevaluemultiplicity = [];
	var timesinnumerator = 0;
	var timesindenominator = 0;
	var timesinboth = 0;
	for (i = 0; i < samevalue.length; i++){
		timesinnumerator = 0;
		timesindenominator = 0;
		for (j = 0; j < poles.length; j++){
			if (math.subtract(poles[j],samevalue[i]) == 0){
				timesindenominator = timesindenominator + 1;
			}
		}
		for (j = 0; j < zeros.length; j++){
			if (math.subtract(zeros[j],samevalue[i]) == 0){
				timesinnumerator = timesinnumerator + 1;
			}
		}
		if (timesinnumerator > timesindenominator){
			timesinboth = timesindenominator;
		}
		else {
			timesinboth = timesinnumerator;
		}
		for (k = 0; k < timesinboth; k++){
			samevaluemultiplicity.push(samevalue[i]);
		}
	}
	var samevaluemultiplicityreal = [];
	var samevaluemultiplicitycomplex = [];
	for (l = 0; l < samevaluemultiplicity.length; l++){
		if (math.im(samevaluemultiplicity[l]) > 0){
			samevaluemultiplicitycomplex.push(samevaluemultiplicity[l]);
		}
		else if (math.im(samevaluemultiplicity[l]) == 0){
			samevaluemultiplicityreal.push(samevaluemultiplicity[l]);
		}
	}
	for (l = 0; l < samevaluemultiplicityreal.length; l++){
		for (m = 1; m < numeratorArray.length; m++){
			numeratorArray[m] = math.add(parseFloat(numeratorArray[m].valueOf()),samevaluemultiplicityreal[l]*parseFloat(numeratorArray[m-1].valueOf()));
		}
		numeratorArray.pop();
	}
	for (l = 0; l < samevaluemultiplicitycomplex.length; l++){
		var temp1 = -2*math.re(samevaluemultiplicitycomplex[l]);
		var temp2 = math.re(samevaluemultiplicitycomplex[l])*math.re(samevaluemultiplicitycomplex[l]) 
		+ math.im(samevaluemultiplicitycomplex[l])*math.im(samevaluemultiplicitycomplex[l]);
		var tempresult = [];
		for (m = 0; m < numeratorArray.length -2; m++){
			var temp = parseFloat(numeratorArray[m].valueOf());
			tempresult.push(roundresultHorner(temp));
			numeratorArray[m] = 0;
			numeratorArray[m+1] = roundresultHorner(math.subtract(parseFloat(numeratorArray[m+1].valueOf()),math.multiply(temp,temp1)));
			numeratorArray[m+2] = roundresultHorner(math.subtract(parseFloat(numeratorArray[m+2].valueOf()),math.multiply(temp,temp2)));
		}
		numeratorArray = tempresult;
	}
	for (l = 0; l < samevaluemultiplicityreal.length; l++){
		for (m = 1; m < denominatorArray.length; m++){
			denominatorArray[m] = math.add(parseFloat(denominatorArray[m].valueOf()),samevaluemultiplicityreal[l]*parseFloat(denominatorArray[m-1].valueOf()));
		}
		denominatorArray.pop();
	}
	for (l = 0; l < samevaluemultiplicitycomplex.length; l++){
		var temp1 = -2*math.re(samevaluemultiplicitycomplex[l]);
		var temp2 = math.re(samevaluemultiplicitycomplex[l])*math.re(samevaluemultiplicitycomplex[l]) 
		+ math.im(samevaluemultiplicitycomplex[l])*math.im(samevaluemultiplicitycomplex[l]);
		var tempresult = [];
		for (m = 0; m < denominatorArray.length -2; m++){
			var temp = denominatorArray[m];
			tempresult.push(roundresultHorner(temp));
			denominatorArray[m] = 0;
			denominatorArray[m+1] = roundresultHorner(math.subtract(parseFloat(denominatorArray[m+1].valueOf()),math.multiply(temp,temp1)));
			denominatorArray[m+2] = roundresultHorner(math.subtract(parseFloat(denominatorArray[m+2].valueOf()),math.multiply(temp,temp2)));
		}
		denominatorArray = tempresult;
	}
	}
	
	return [numeratorArray, denominatorArray];
	
}