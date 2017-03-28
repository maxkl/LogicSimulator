/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'App',
	'editor/components/AndComponent',
	'editor/components/ClockComponent',
	'editor/components/ConstComponent',
	'editor/components/DFlipFlopComponent',
	'editor/components/FullAdderComponent',
	'editor/components/HalfAdderComponent',
	'editor/components/NotComponent',
	'editor/components/OrComponent'
], function (SvgUtil, App, AndComponent, ClockComponent, ConstComponent, DFlipFlopComponent, FullAdderComponent, HalfAdderComponent, NotComponent, OrComponent) {
	var app = new App();
	app.editor.addComponent(new AndComponent(), 10, 10);
	app.editor.addComponent(new ClockComponent(), 20, 10);
	app.editor.addComponent(new ConstComponent(true), 10, 30);
	app.editor.addComponent(new DFlipFlopComponent(), 20, 30);
	app.editor.addComponent(new FullAdderComponent(), 10, 50);
	app.editor.addComponent(new HalfAdderComponent(), 20, 50);
	app.editor.addComponent(new NotComponent(), 10, 70);
	app.editor.addComponent(new OrComponent(), 20, 70);
});
