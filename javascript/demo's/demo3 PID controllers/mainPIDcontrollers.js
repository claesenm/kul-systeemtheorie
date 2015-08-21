function main(){
	
	
	var P_box = document.getElementById("P");
	var I_box = document.getElementById("I");
	var D_box = document.getElementById("D");
	
	var container2 = document.getElementById('step-plot');
    var plt2 = control.plot.step(container2, control.system.tf([1],[2]), [0, 20], true);
	plt2.show_step_info({rise_time: true, settling_time: true, settled: true});
	
	document.getElementById('update').addEventListener('click', update);
	
	function update(){
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
		} else if (denominatorDegree == 0 && arrayDenominator[0] == 0){
			alert("Don't divide by zero please!");
		} else if (numeratorDegree == 0 && arrayNumerator[0] == 0) {
			alert("Don't take a transfer function of zero please!");
		} else if (P == 0 && I == 0 && D == 0){
			alert("Don't take zero for every PID constant, please.");
		} else if (numeratorDegree == denominatorDegree && D!= 0){
			alert("If the degree of the numerator is equal to the degree of the denominator, the value of K_d has\n" + 
			"to be equal to zero. Otherwise, the closed-loop system will become unstable.");
		} else {
			
		document.getElementById("numerator_C").innerHTML = writeAsFormula(PIDnumerator,PIDnumeratordegree);
		document.getElementById("denominator_C").innerHTML = writeAsFormula([1,0],1);
		document.getElementById("numerator_plant").innerHTML = writeAsFormula(arrayNumerator,numeratorDegree);
		document.getElementById("denominator_plant").innerHTML = writeAsFormula(arrayDenominator,denominatorDegree);
		
		
		
		document.getElementById("numerator_comp").innerHTML = writeAsFormula(closedLoopNumerator,closedLoopNumeratorDegree);
		document.getElementById("denominator_comp").innerHTML = writeAsFormula(closedLoopDenominator,closedLoopDenominatorDegree);
		
		control.plot.pzmap(document.getElementById('polezeroplot'), control.system.tf(closedLoopNumerator,closedLoopDenominator));
		
		
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).A[0][0]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).A[0][1]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).A[1][0]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).A[1][1]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).B[0]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).B[1]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).C[0][0]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).C[0][1]);
		window.alert(control.system.tf2ss(control.system.tf(closedLoopNumerator,closedLoopDenominator)).D);
		
	//	var constant = 0;
		
	//	if (closedLoopNumeratorDegree == closedLoopDenominatorDegree){
	//		constant = closedLoopNumerator[0]/(closedLoopDenominator[0] + 0.0);
	//		for (i = 1; i <= closedLoopNumeratorDegree; i++){
	//			closedLoopNumerator[i] = closedLoopNumerator[i] - constant*closedLoopDenominator[i];
	//		}
	//		closedLoopNumerator.shift();
	//	}
		
	//	var sys = control.system.tf(closedLoopNumerator, closedLoopDenominator);
		
	//	var step_data = sys.step([0,20],false);
	//	for (i= 0; i < step_data.x.length; i++){
	//	step_data.x[i] = step_data.x[i] + constant;
	//	}
    //    plt2.series[0].setData(control.num.zip(step_data.t, step_data.x), true, false, true);
	
	//	control.plot.step(container2, sys, [0, 20], true);
	//	var info = control.num.stepinfo(step_data);
	//	document.getElementById("rise_time").innerHTML=round(info.rise_time);
	//	document.getElementById("final_value").innerHTML=Math.round(1000*step_data.x[step_data.x.length - 1])/1000;	
	//	document.getElementById("settling_time").innerHTML=round(info.settling_time);
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