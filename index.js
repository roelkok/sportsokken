var through = require("through");
var css = require("css");
var _ = require("underscore");
var fs = require("fs");
var path = require("path");

function deepCopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function adler32(a) {for(var b=65521,c=1,d=0,e=0,f;f=a.charCodeAt(e++);d=(d+c)%b)c=(c+f)%b;return c|d<<16}

module.exports = function(file, opts) {

	if(!/\.css$/.test(file)) {
		return through();
	}
	
	var buffer = "";


	// TODO This shouldn't be here
	var outputCssFile = "./out/css/main.css";

	fs.writeFile(path.resolve(outputCssFile), "", function(err) {
		if(err) {
			console.log("Couldn't create output css file. [" + outputCssFile + "]");
			console.log(err);
		}
	});

	return through(
		function(data) {
			buffer += data.toString();
		},
		function() {
			var tree = css.parse(buffer);
			var newTree = {};
			var map = {};
			var prefix = "r" + adler32(buffer).toString(36);
			var counter = 0;

			var _(tree).each(function(value, key, list) {
				if(key == "stylesheet") {
					newTree[key] = _(value).reduce(function(memo, value, key, list) {
						memo = Object.create(memo);

						if(key == "rules") {
							memo[key] = _(value).map(function(rule) {
								return _(rule).reduce(function(memo, value, key, list) {
									memo = Object.create(memo);

									if(key == "selectors") {
										memo[key] = _(value).map(function(selector) {
											// Search selector for class names and replace them
											// TODO Make sure this sures catches all situations (maybe use tokenizer?)
											return selector.replace(/\.([_a-z][_a-z0-9-]*)/gi, function(match, cssClassName) {
												if(!map[cssClassName]) {
													map[cssClassName] = prefix + counter.toString(36);
													counter++;
												}
												return "." + map[cssClassName];
											});
										});
									}
									else {
										memo[key] = deepCopy(value);
									}

									return memo;
								}, {});
							});

							return memo;
						}
						else {
							memo[key] = deepCopy(value);
						}
					}, {});
				}
				else {
					newTree[key] = deepCopy(value);
				}
			});


			// Append new css to output css
			fs.appendFile(outputCssFile, css.stringify(newTree), function(err) {
				if(err) {
					// TODO Handle append css file error
					console.log(err);
				}
			});

			this.queue("module.exports = " + JSON.stringify(map));
			return this.queue(null);
		}
	);

};