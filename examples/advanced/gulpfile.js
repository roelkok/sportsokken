var gulp = require("gulp");
var browserify = require("browserify");
var watchify = require("watchify");
var source = require("vinyl-source-stream");
var hbsfy = require("hbsfy");
var sportsokken = require("../../");

gulp.task("default", function() {

	var b = sportsokken(
		watchify(browserify("./src/main.js", watchify.args)),
		{
			dest: "./out/css/index.css",
			rename: true
		}
	)
		.transform(hbsfy);
	
	function rebundle() {
		return b
			.bundle()
			.pipe(source("main.js"))
			.pipe(gulp.dest("./out/js"));
	}

	b.on("update", rebundle);

	return rebundle();

});