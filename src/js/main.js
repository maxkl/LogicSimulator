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

	app.editor.addComponent(new AndComponent(), 10, 70);

	// 1-1
	app.editor.addComponent(new NotComponent(), 10, 10);

	// 2-1
	app.editor.addComponent(new AndComponent(), 10, 30);

	// 2-2
	app.editor.addComponent(new HalfAdderComponent(), 20, 30);

	// 3-1
	app.editor.addComponent(new OrComponent(), 10, 50);

	// 3-2
	app.editor.addComponent(new FullAdderComponent(), 20, 50);
});
