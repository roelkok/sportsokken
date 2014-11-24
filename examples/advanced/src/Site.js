var Backbone = require("backbone");
var css = require("./css/site.css");
var ComponentA = require("./ComponentA");
var ComponentB = require("./ComponentB");

var Site = Backbone.View.extend({

	el: "body",

	initialize: function(options) {
		this.componentA = new ComponentA();
		this.$("." + css.leftColumn).append(this.componentA.el);

		this.componentB = new ComponentB();
		this.$("." + css.rightColumn).append(this.componentB.el);
	}

});

module.exports = Site;