var Backbone = require("backbone");
var css = require("./css/view-a.css");
var template = require("./hbs/view-a.hbs");

var ViewA = Backbone.View.extend({
	
	initialize: function(options) {
		this.setElement(template({
			css: css
		}));
	}

});

module.exports = ViewA;