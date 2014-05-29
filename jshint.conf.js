module.exports = {

	options: {
		browser: true,
		globals: {
			// `false` means read-only
			define: false,
			moment: false,
			jQuery: false
		},
		bitwise: true,
		camelcase: true,
		curly: true,
		forin: true,
		freeze: true,
		immed: true,
		noarg: true,
		smarttabs: true,
		trailing: true,
		eqnull: true,
		'-W032': true, // Unnecessary semicolon. (lumbar's ;;)
		'-W008': true // A leading decimal point can be confused with a dot (ex: .5)
	},

	srcModules: [
		'src/**/*.js',
		'!**/intro.js',
		'!**/outro.js'
	],

	builtModules: {
		options: {
			// Built modules are ready to be checked for...
			undef: true, // use of undeclared globals
			unused: 'vars', // functions/variables (excluding function arguments) that are never used
			latedef: 'nofunc' // variables that are referenced before their `var` statement
		},
		src: 'build/out/{fullcalendar,gcal}.js'
	},

	srcLanguages: 'lang/*.js',

	tests: 'tests/automated/*.js',

	misc: '*.js' // config files in root

};