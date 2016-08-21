
var baseConfig = {
	bitwise: true,
	curly: true,
	//forin: true, // couldn't handle `for (k in o) if (!`
	freeze: true,
	immed: true,
	noarg: true,
	smarttabs: true,
	trailing: true,
	eqnull: true,
	'-W032': true, // Unnecessary semicolon. (lumbar's ;;)
	'-W008': true // A leading decimal point can be confused with a dot (ex: .5) // TODO: think about enabling!
};

var browserConfig = Object.assign({}, baseConfig, { // extends the base config
	browser: true,
	esversion: 3, // for IE9
	globals: {
		// `false` means read-only
		define: false,
		exports: false,
		module: false,
		require: false,
		moment: false,
		jQuery: false,
		JSON: false // esversion:3 complains, but IE9 has this
	}
});

// for concatenated JS files that end up in browser
var builtConfig = Object.assign({}, browserConfig, { // extends the browser config
	// Built modules are ready to be checked for...
	undef: true, // use of undeclared globals
	unused: 'vars' // functions/variables (excluding function arguments) that are never used
	//latedef: 'nofunc' // variables that are referenced before their `var` statement // TODO: revisit
});

module.exports = {
	base: baseConfig,
	browser: browserConfig,
	built: builtConfig
};
