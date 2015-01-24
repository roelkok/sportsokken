var $ = require("jquery");
var Backbone = require("backbone");

Backbone.$ = $;

var ViewA = require("./ViewA");
var ViewB = require("./ViewB");

console.log("hello world");

$(function() {

	var viewA = new ViewA();
	var viewB = new ViewB();
	$("body")
		.append(viewA.el)
		.append(viewB.el);

});

