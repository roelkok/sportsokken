var Backbone = require("backbone");
var template = require("./hbs/component-b.hbs");
var css = require("./css/component-b.css");
var baseCss = require("./css/base-component.css");

var ComponentB = Backbone.View.extend({

	initialize: function(options) {
		this.setElement(template({
			css: css,
			baseCss: baseCss
		}));
	}

});

module.exports = ComponentB;