var through2 = require("through2");
var css = require("css");
var _ = require("underscore");
var path = require("path");
var source = require("vinyl-source-stream");
var dest = require("vinyl-fs").dest;

function deepCopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function adler32(a) {for(var b=65521,c=1,d=0,e=0,f;f=a.charCodeAt(e++);d=(d+c)%b)c=(c+f)%b;return c|d<<16}

function camelCase(str) {
	return str.replace(/-([a-z])/g, function(match) {
		return match[1].toUpperCase();
	});
}

/**
 * b - Browserify instance
 */
var Sportsokken = function(b, opts) {
	if(!(this instanceof Sportsokken)) {
		new Sportsokken(b, opts);
		return b;
	}

	_(this).bindAll(
		"transform"
	);
	var self = this;
	this.b = b;
	this.cache = {};

	b.transform(this.transform);

	b.on("bundle", function(pipeline) {
		self.cssStream = through2();
		self.deps = [];

		pipeline.push(through2.obj(
			{objectMode: true},
			null,
			function(end) {
				// Clean up cache
				self.cache = _(self.cache).pick(self.deps);
				self.cssStream
					.pipe(source("main.css"))
					.pipe(dest("./out/css"));
				end();
			}
		));
	});

	b.on("dep", function(dep) {
		// Add to css stream
		if(/\.css$/.test(dep.file)) {
			self.deps.push(dep.file);
			if(self.cache[dep.file]) {
				self.cssStream.write(self.cache[dep.file]);
			}
		}
	});
};

_.extend(Sportsokken.prototype, {

	cssStream: null,

	transform: function(file, opts) {
		if(!/\.css$/.test(file)) {
			return through2();
		}
		
		var self = this;
		var buffer = "";
		var rename = true;

		return through2(
			function(data, enc, next) {
				buffer += data.toString();
				next();
			},
			function(end) {
				var tree = css.parse(buffer);
				var newTree = {};
				var map = {};
				var prefix = "r" + adler32(buffer).toString(36);
				var counter = 0;
				var stream = this;

				_(tree).each(function(value, key, list) {
					if(key == "stylesheet") {
						newTree[key] = _(value).reduce(function(memo, value, key, list) {
							memo = Object.create(memo);

							if(key == "rules") {
								memo[key] = _(value).map(function(rule) {
									return _(rule).reduce(function(memo, value, key, list) {
										memo = Object.create(memo);

										if(key == "selectors") {
											memo[key] = _(value).map(function(selector) {
												// Check for stylesheet specific options
												// TODO If this is not at the top of the file there might be problems currently
												// TODO Remove declaration
												if(selector == "@sportsokken") {
													_(rule["declarations"]).each(function(declaration) {
														if(declaration["property"] == "rename" && declaration["value"] == "no") {
															rename = false;
														}
													});
												}

												// Search selector for class names and replace them
												// TODO Make sure this catches all situations (maybe use tokenizer?)
												return selector.replace(/\.([_a-z][_a-z0-9-]*)/gi, function(match, cssClassName) {
													var key = camelCase(cssClassName);
													if(!map[key]) {
														if(rename) {
															map[key] = prefix + counter.toString(36);
															counter++;
														}
														else {
															map[key] = cssClassName;
														}
													}
													return "." + map[key];
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

				self.cache[file] = css.stringify(newTree);

				this.push("module.exports = " + JSON.stringify(map));
				end();
			}
		);
	}

});

module.exports = Sportsokken;