
module.exports = {
	browser: true,
	globals: {
		// `false` means read-only
		define: false,
		exports: false,
		module: false,
		require: false,
		moment: false,
		jQuery: false
	},
	es3: true,
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
