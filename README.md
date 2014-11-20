Sportsokken
===========

Require css from your js files in your Browserify project and obfuscate class names in each stylesheet with a prefix to avoid collisions.

## Install

```
npm install sportsokken
```

## Setup (using Gulp)

Wrap your Browserify instance in `sportsokken()`. This function returns the Browserify instance so you can use all its methods after wrapping it.

```
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var hbsfy = require("hbsfy");
var sportsokken = require("sportsokken");

gulp.task("default", function() {

	return sportsokken(browserify("./src/main.js"))
		.transform(hbsfy)
		.bundle()
		.pipe(source("bundle.js"))
		.pipe(gulp.dest("./out/js"));

});
```

## Basic example using Hbsfy (Handlebars transform)

my-module.css
```
.root {
	padding: 20px;
	background: red;
}

.head {
	font-size: 30px;
	font-weight: bold;
}

.body {
	line-height: 1.5;
}
```

my-module.hbs
```
<div class="{{css.root}}">
	<div class="{{css.head}}">
		My Module
	</div>
	<div class="{{css.body}}">
		This is my module
	</div>
</div>
```

MyModule.js
```
var css = require("./my-module.css");
var template = require("./my-module.hbs");

template({
	css: css
});

```

Note than you can create a new stylesheet for another module and use the same css class names (.root, .head etc) without worrying about collisions.