/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define(function () {
	function Simulator() {
		this.circuit = null;
	}

	Simulator.prototype.init = function (circuit) {
		this.circuit = circuit;

		this.circuit.init();
	};

	Simulator.prototype.reset = function () {
		this.circuit = null;
	};

	Simulator.prototype.start = function () {
		//
	};

	Simulator.prototype.stop = function () {
		//
	};

	Simulator.prototype.step = function () {
		this.circuit.cycle();
		
		if (this.stepCallback) {
			this.stepCallback();
		}
	};

	return Simulator;
});
