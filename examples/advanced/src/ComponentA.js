var Backbone = require("backbone");
var template = require("./hbs/component-a.hbs");
var css = require("./css/component-a.css");
var baseCss = require("./css/base-component.css");

var ComponentA = Backbone.View.extend({

	initialize: function(options) {
		this.setElement(template({
			baseCss: baseCss,
			css: css
		}));
	}

});

module.exports = ComponentA;