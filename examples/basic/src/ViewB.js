var Backbone = require("backbone");
var css = require("./css/view-b.css");
var template = require("./hbs/view-b.hbs");

var ViewB = Backbone.View.extend({

	initialize: function(options) {
		this.setElement(template({
			css: css
		}));
	}

});

module.exports = ViewB;