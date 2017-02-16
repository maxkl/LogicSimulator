/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'App',
	'editor/components/AndComponent',
	'editor/components/NotComponent',
	'editor/components/HalfAdderComponent',
	'editor/components/OrComponent',
	'editor/components/FullAdderComponent'
], function (SvgUtil, App, AndComponent, NotComponent, HalfAdderComponent, OrComponent, FullAdderComponent) {
	var app = new App();

	app.addComponent(new AndComponent(), 100, 700);

	// 1-1
	app.addComponent(new NotComponent(), 100, 100);

	// 2-1
	app.addComponent(new AndComponent(), 100, 300);

	// 2-2
	app.addComponent(new HalfAdderComponent(), 200, 300);

	// 3-1
	app.addComponent(new OrComponent(), 100, 500);

	// 3-2
	app.addComponent(new FullAdderComponent(), 200, 500);
});
