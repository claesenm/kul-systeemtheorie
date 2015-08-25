function main(){
	
	
	var P_box = document.getElementById("P");
	var I_box = document.getElementById("I");
	var D_box = document.getElementById("D");
	
	var container2 = document.getElementById('step-plot');
    var plt2 = control.plot.step(container2, control.system.tf([1],[1,2]), [0.01, 20], true);
	document.getElementById("rise_time").innerHTML=1.0985;
	document.getElementById("final_value").innerHTML=0.5;	
	document.getElementById("settling_time").innerHTML=1.956;
	plt2.show_step_info({rise_time: false, settling_time: false, settled: true});
	control.plot.pzmap(document.getElementById('polezeroplot'), control.system.tf([1],[1,2]));
	
	document.getElementById('update').addEventListener('click', update);
	
	function update(){
		var correctPID = 1;
		if (document.getElementById("P").value.toString().split(',').length > 1 || isNaN(document.getElementById("P").value.toString().split(',')[0])){
			correctPID = 0;
		}
		if (document.getElementById("I").value.toString().split(',').length > 1 || isNaN(document.getElementById("I").value.toString().split(',')[0])){
			correctPID = 0;
		}
		if (document.getElementById("D").value.toString().split(',').length > 1 || isNaN(document.getElementById("D").value.toString().split(',')[0])){
			correctPID = 0;
		}
		var P = parseFloat(P_box.value || 1);
		var I = parseFloat(I_box.value || 0);
		var D = parseFloat(D_box.value || 0);
			
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
		var PIDnumerator = [D,P,I];
		while (PIDnumerator[0] == 0 && PIDnumerator.length > 1){
			PIDnumerator.shift();
		}
		var PIDnumeratordegree = PIDnumerator.length - 1;
		
		var closedLoopNumerator = control.num.conv(arrayNumerator,PIDnumerator);
		while (closedLoopNumerator[0] == 0 && closedLoopNumerator.length > 1){
			closedLoopNumerator.shift();
		}
		var closedLoopDenominator = control.num.polyadd(control.num.conv(arrayDenominator,[1,0]),control.num.conv(arrayNumerator,PIDnumerator));
		while (closedLoopDenominator[0] == 0 && closedLoopDenominator.length > 1){
			closedLoopDenominator.shift();
		}
		var closedLoopNumeratorDegree = closedLoopNumerator.length - 1;
		var closedLoopDenominatorDegree = closedLoopDenominator.length - 1;
		}
		
		if (numeratorDegree > denominatorDegree){
			alert("The degree of the numerator of the plant is not allowed to be greater than the degree of his denominator to avoid causality problems!");
		} else if (closedLoopNumeratorDegree > closedLoopDenominatorDegree){
			alert("The closed loop system you developed is not stable!");
		} else if (correct == 0){
			alert("Please write your transfer function as in the example!");
		} else if (correctPID == 0){
			alert("Please write correct PID constants.");
		} else if (denominatorDegree == 0 && arrayDenominator[0] == 0){
			alert("Don't divide by zero please!");
		} else if (numeratorDegree == 0 && arrayNumerator[0] == 0) {
			alert("Don't take a transfer function of zero please!");
		} else if (P == 0 && I == 0 && D == 0){
			alert("Don't take zero for every PID constant, please.");
		} else if (numeratorDegree == denominatorDegree && D!= 0){
			alert("If the degree of the numerator is equal to the degree of the denominator, the value of K_d has\n" + 
			"to be equal to zero to avoid causality problems in the closed-loop system.");
		} else if (isNaN(P) || isNaN(I) || isNaN(D)) {
			alert("Please enter valid numbers for the PID constants.")
		} else {
		document.getElementById("numerator_C").innerHTML = writeAsFormula(PIDnumerator,PIDnumeratordegree);
		document.getElementById("denominator_C").innerHTML = writeAsFormula([1,0],1);
		
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
		
		control.plot.pzmap(document.getElementById('polezeroplot'), control.system.tf(closedLoopNumerator,closedLoopDenominator));
		
		var sys = control.system.tf(closedLoopNumerator, closedLoopDenominator);
		
		var step_data = sys.step([0.00000000000001,10000000],true);
		
		plt2.series[0].setData(control.num.zip(step_data.t, step_data.x), true, false, true);
		//plt2.forceY([-0.1,1.1]);
		
		var sys_poles = sys.getPoles();
		var stable = 1;
		for (i = 0; i < sys_poles.length; i++){
			if (math.re(sys_poles[i]) >= 0){
				stable = 0;
			}
		}
		if (stable == 1){
			var info = control.num.stepinfo(step_data);
			document.getElementById("rise_time").innerHTML=round(info.rise_time);
			document.getElementById("final_value").innerHTML=Math.round(10000*step_data.x[step_data.x.length - 1])/10000;	
			document.getElementById("settling_time").innerHTML=round(info.settling_time);
			plt2.show_step_info({rise_time: false, settling_time: false, settled: true});
		}
		else {
			document.getElementById("rise_time").innerHTML="None";
			document.getElementById("final_value").innerHTML="None";	
			document.getElementById("settling_time").innerHTML="None";
			plt2.show_step_info({rise_time: false, settling_time: false, settled: false});
		}
	}
	}
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
	return Math.round(10000*value)/10000;
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
			tempresult.push(temp);
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
			tempresult.push(temp);
			denominatorArray[m] = 0;
			denominatorArray[m+1] = roundresultHorner(math.subtract(parseFloat(denominatorArray[m+1].valueOf()),math.multiply(temp,temp1)));
			denominatorArray[m+2] = roundresultHorner(math.subtract(parseFloat(denominatorArray[m+2].valueOf()),math.multiply(temp,temp2)));
		}
		denominatorArray = tempresult;
	}
	}
	
	return [numeratorArray, denominatorArray];
	
}