var through2 = require("through2");
var css = require("css");
var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var source = require("vinyl-source-stream");
var dest = require("vinyl-fs").dest;
var mkdirp = require("mkdirp");

var INITIALIZED = false;
var outputCssFile = path.resolve("./out/css/main.css");

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
	_(this).bindAll(
		"transform"
	);
	var self = this;

	this.cssStream = null;

	this.b = b;

	this.cache = {};

	b.transform(this.transform);

	b.on("bundle", function(pipeline) {
		self.cssStream = through2();

		pipeline.push(through2.obj(
			{objectMode: true},
			null,
			function(end) {
				self.cssStream
					.pipe(source("main.css"))
					.pipe(dest("./out/css"));

				end();
			}
		));

		console.log("onbuncdle");
	});

	b.on("dep", function(dep) {
		console.log(dep.id, dep.file);

		// TODO Add to css stream
		if(/\.css$/.test(file)) {
			if(self.cache[dep.file]) {
				self.cssStream.write(self.cache[dep.file]);
			}
		}
	});

	b.on("update", function(changingDeps) {

	});

};

_.extend(Sportsokken.prototype, {

	transform: function(file, opts) {
		if(!/\.css$/.test(file)) {
			return through2();
		}
		
		var self = this;
		var buffer = "";

		return through2(
			function(data, enc, next) {
				// if(!INITIALIZED) {
				// 	console.log("Initialize");
				// 	INITIALIZED = true;

				// 	// TODO This shouldn't be here
				// 	mkdirp(path.dirname(outputCssFile), function(err) {
				// 		if(err) {
				// 			// TODO Should stop
				// 			console.log(err);
				// 		}
				// 		else {
				// 			fs.writeFile(outputCssFile, "", function(err) {
				// 				if(err) {
				// 					// TODO Should stop
				// 					console.log("Couldn't create output css file. [" + outputCssFile + "]");
				// 					console.log(err);
				// 				}
				// 				else {
				// 					console.log("Cleared file");
				// 					buffer += data.toString();
				// 					next();
				// 				}
				// 			});
				// 		}
				// 	});
				// }
				// else {
					buffer += data.toString();
					next();
				// }
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
												// Search selector for class names and replace them
												// TODO Make sure this sures catches all situations (maybe use tokenizer?)
												return selector.replace(/\.([_a-z][_a-z0-9-]*)/gi, function(match, cssClassName) {
													cssClassName = camelCase(cssClassName);
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

				// TODO Check if this is the right point in the pipeline to write to stream.
				// 		Probably doesn't matter if css class names are obfuscated anyway
				self.cssStream.write(css.stringify(newTree), function() {

					stream.push("module.exports = " + JSON.stringify(map));
					console.log("Finished parsing css file: " + file);
					end();
				});


				// // Append new css to output css
				// fs.appendFile(outputCssFile, css.stringify(newTree), function(err) {
				// 	if(err) {
				// 		// TODO Handle append css file error
				// 		console.log(err);
				// 	}

				// 	stream.push("module.exports = " + JSON.stringify(map));
				// 	console.log("Finished parsing css file: " + file);
				// 	end();
				// });
			}
		);
	}

});

var transform = function(file, opts) {

	if(!/\.css$/.test(file)) {
		return through2();
	}
	
	var buffer = "";

	return through2(
		function(data, enc, next) {
			if(!INITIALIZED) {
				console.log("Initialize");
				INITIALIZED = true;

				// TODO This shouldn't be here
				mkdirp(path.dirname(outputCssFile), function(err) {
					if(err) {
						// TODO Should stop
						console.log(err);
					}
					else {
						fs.writeFile(outputCssFile, "", function(err) {
							if(err) {
								// TODO Should stop
								console.log("Couldn't create output css file. [" + outputCssFile + "]");
								console.log(err);
							}
							else {
								console.log("Cleared file");
								buffer += data.toString();
								next();
							}
						});
					}
				});
			}
			else {
				buffer += data.toString();
				next();
			}
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
											// Search selector for class names and replace them
											// TODO Make sure this sures catches all situations (maybe use tokenizer?)
											return selector.replace(/\.([_a-z][_a-z0-9-]*)/gi, function(match, cssClassName) {
												cssClassName = camelCase(cssClassName);
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

				stream.push("module.exports = " + JSON.stringify(map));
				console.log("Finished parsing css file: " + file);
				end();
			});
		}
	);
};

module.exports = Sportsokken;