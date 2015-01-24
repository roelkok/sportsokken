var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var hbsfy = require("hbsfy");
var sportsokken = require("../../");

gulp.task("default", function() {

	return sportsokken(browserify("./src/main.js"))
		.transform(hbsfy)
		.bundle()
		.pipe(source("main.js"))
		.pipe(gulp.dest("./out/js"));

});