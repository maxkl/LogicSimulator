/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

// app ends up in global scope in dev builds and is optimized out by UglifyJS in production builds
var app = new App();

function and(inputs, outputs) {
	outputs[0] = inputs[0] && inputs[1];
}

function dispAnd($container) {
	var $rect = SvgUtil.createElement("rect");
	$rect.setAttribute("width", "50");
	$rect.setAttribute("height", "100");
	$rect.setAttribute("fill", "white");
	$rect.setAttribute("stroke", "black");
	$rect.setAttribute("stroke-width", "4");
	$container.appendChild($rect);

	var $lineIn1 = SvgUtil.createElement("line");
	$lineIn1.setAttribute("x1", "0");
	$lineIn1.setAttribute("y1", "30");
	$lineIn1.setAttribute("x2", "-10");
	$lineIn1.setAttribute("y2", "30");
	$lineIn1.setAttribute("stroke", "black");
	$lineIn1.setAttribute("stroke-width", "4");
	$container.appendChild($lineIn1);

	var $lineIn2 = SvgUtil.createElement("line");
	$lineIn2.setAttribute("x1", "0");
	$lineIn2.setAttribute("y1", "70");
	$lineIn2.setAttribute("x2", "-10");
	$lineIn2.setAttribute("y2", "70");
	$lineIn2.setAttribute("stroke", "black");
	$lineIn2.setAttribute("stroke-width", "4");
	$container.appendChild($lineIn2);

	var $lineOut = SvgUtil.createElement("line");
	$lineOut.setAttribute("x1", "50");
	$lineOut.setAttribute("y1", "50");
	$lineOut.setAttribute("x2", "60");
	$lineOut.setAttribute("y2", "50");
	$lineOut.setAttribute("stroke", "black");
	$lineOut.setAttribute("stroke-width", "4");
	$container.appendChild($lineOut);

	var $and = SvgUtil.createElement("text");
	$and.setAttribute("x", "25");
	$and.setAttribute("y", "30");
	$and.setAttribute("text-anchor", "middle");
	$and.setAttribute("font-size", "25");
	$and.setAttribute("font-family", "Source Code Pro");
	$and.setAttribute("pointer-events", "none");
	$and.appendChild(document.createTextNode("&"));
	$container.appendChild($and);
}

var andc = new Component(2, 1, and, dispAnd);
app.addComponent(andc);
