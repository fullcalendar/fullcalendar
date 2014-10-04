
module.exports = function(grunt) {

	var _ = require('underscore');

	// Load required NPM tasks.
	// You must first run `npm install` in the project's root directory to get these dependencies.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-jscs-checker');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('lumbar');
	
	// This will eventually get passed to grunt.initConfig()
	// Initialize multitasks...
	var config = {
		concat: {},
		uglify: {},
		cssmin: {},
		copy: {},
		compress: {},
		shell: {},
		clean: {
			temp: 'build/temp'
		}
	};

	// for the "meta" template variable (<%= meta.whatever %>)
	config.meta = grunt.file.readJSON('fullcalendar.jquery.json');

	// The "grunt" command with no arguments
	grunt.registerTask('default', 'dist');

	// Builds all distributable files, for a new release possibly
	grunt.registerTask('dist', [
		'clean',
		'modules',
		'languages',
		'karma:single',
		'archiveDist',
		'cdnjsDist'
	]);

	// Bare minimum for debugging
	grunt.registerTask('dev', [
		'shell:assume-unchanged',
		'lumbar:build',
		'languages'
	]);



	/* FullCalendar Modules
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('modules', 'Build the FullCalendar modules', [
		'jscs:srcModules',
		'clean:modules',
		'lumbar:build',
		'concat:moduleVariables',
		'jshint:builtModules',
		'uglify:modules',
		'cssmin:modules'
	]);

	// assemble modules
	config.lumbar = {
		build: {
			build: 'lumbar.json',
			output: 'dist', // a directory. lumbar doesn't like trailing slash
			background: false // lumbar complains otherwise
		},
		watch: {
			watch: 'lumbar.json',
			output: 'dist', // a directory. lumbar doesn't like trailing slash
			background: false, // lumbar complains otherwise
			sourceMap: true
		}
	};

	// replace template variables (<%= %>), IN PLACE
	config.concat.moduleVariables = {
		options: {
			process: true // replace
		},
		expand: true,
		cwd: 'dist/',
		src: [ '*.js', '*.css' ],
		dest: 'dist/'
	};

	// create minified versions of JS
	config.uglify.modules = {
		options: {
			preserveComments: 'some' // keep comments starting with /*!
		},
		expand: true,
		src: 'dist/fullcalendar.js', // only do it for fullcalendar.js
		ext: '.min.js'
	};

	// create minified versions of CSS
	config.cssmin.modules = {
		expand: true,
		src: 'dist/fullcalendar.css', // only do it for fullcalendar.css
		ext: '.min.css'
	};

	config.clean.modules = [
		'dist/*.{js,css,map}', // maps created by lumbar sourceMap
		'dist/src' // created by lumbar sourceMap
	];



	/* Languages
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('languages', [
		'jscs:srcLanguages',
		'jshint:srcLanguages',
		'clean:languages',
		'generateLanguages',
		'uglify:languages',
		'uglify:languagesAll'
	]);

	config.generateLanguages = {
		moment: grunt.file.expand('lib/moment/{locale,lang}/')[0], // lang directory is pre-moment-2.8
		datepicker: 'lib/jquery-ui/ui/i18n/',
		fullCalendar: 'lang/',
		dest: 'build/temp/lang/',
		allDest: 'build/temp/lang-all.js'
	};

	config.uglify.languages = {
		expand: true,
		cwd: 'build/temp/lang/',
		src: '*.js',
		dest: 'dist/lang/'
	};

	config.uglify.languagesAll = {
		src: 'build/temp/lang-all.js',
		dest: 'dist/lang-all.js'
	};

	config.clean.languages = [
		'build/temp/lang',
		'build/temp/lang-all.js',
		'dist/lang',
		'dist/lang-all.js'
	];



	/* Automated Tests
	----------------------------------------------------------------------------------------------------*/

	config.karma = {
		options: {
			configFile: 'build/karma.conf.js'
		},
		url: {}, // visit a URL in a browser
		headless: { browsers: [ 'PhantomJS' ] },
		single: { browsers: [ 'PhantomJS' ], singleRun: true, autoWatch: false }
	};



	/* Archive
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('archive', 'Create a distributable ZIP archive', [
		'modules',
		'languages',
		'karma:single',
		'archiveDist'
	]);

	grunt.registerTask('archiveDist', [
		'clean:archive',
		'copy:archiveModules',
		'copy:archiveLanguages',
		'copy:archiveLanguagesAll',
		'copy:archiveMoment',
		'copy:archiveJQuery',
		'concat:archiveJQueryUI',
		'copy:archiveDemos',
		'copy:archiveDemoTheme',
		'copy:archiveMisc',
		'compress:archive'
	]);

	// copy FullCalendar modules into ./fullcalendar/ directory
	config.copy.archiveModules = {
		expand: true,
		cwd: 'dist/',
		src: [ '*.js', '*.css' ],
		dest: 'build/temp/archive/'
	};

	config.copy.archiveLanguages = {
		expand: true,
		cwd: 'dist/lang/',
		src: '*.js',
		dest: 'build/temp/archive/lang/'
	};

	config.copy.archiveLanguagesAll = {
		src: 'dist/lang-all.js',
		dest: 'build/temp/archive/lang-all.js'
	};

	config.copy.archiveMoment = {
		src: 'lib/moment/min/moment.min.js',
		dest: 'build/temp/archive/lib/moment.min.js'
	};

	config.copy.archiveJQuery = {
		src: 'lib/jquery/dist/jquery.min.js',
		dest: 'build/temp/archive/lib/jquery.min.js'
	};

	config.concat.archiveJQueryUI = {
		src: [
			'lib/jquery-ui/ui/minified/core.min.js',
			'lib/jquery-ui/ui/minified/widget.min.js',
			'lib/jquery-ui/ui/minified/mouse.min.js',
			'lib/jquery-ui/ui/minified/draggable.min.js'
		],
		dest: 'build/temp/archive/lib/jquery-ui.custom.min.js'
	};

	// copy demo files into ./demos/ directory
	config.copy.archiveDemos = {
		options: {
			processContent: function(content) {
				content = content.replace(/((?:src|href)=['"])([^'"]*)(['"])/g, function(m0, m1, m2, m3) {
					return m1 + transformDemoPath(m2) + m3;
				});
				return content;
			}
		},
		src: 'demos/**',
		dest: 'build/temp/archive/'
	};

	// copy the "cupertino" jquery-ui theme into the demo directory (for demos/theme.html)
	config.copy.archiveDemoTheme = {
		expand: true,
		cwd: 'lib/jquery-ui/themes/cupertino/',
		src: [ 'jquery-ui.min.css', 'images/*' ],
		dest: 'build/temp/archive/lib/cupertino/'
	};

	// in demo HTML, rewrites paths to work in the archive
	function transformDemoPath(path) {
		path = path.replace('../lib/moment/moment.js', '../lib/moment.min.js');
		path = path.replace('../lib/jquery/dist/jquery.js', '../lib/jquery.min.js');
		path = path.replace('../lib/jquery-ui/jquery-ui.js', '../lib/jquery-ui.custom.min.js');
		path = path.replace('../lib/jquery-ui/themes/cupertino/', '../lib/cupertino/');
		path = path.replace('../dist/', '../');
		path = path.replace('/fullcalendar.js', '/fullcalendar.min.js');
		return path;
	}

	// copy license and changelog
	config.copy.archiveMisc = {
		files: {
			'build/temp/archive/license.txt': 'license.txt',
			'build/temp/archive/changelog.txt': 'changelog.md'
		}
	};

	// create the ZIP
	config.compress.archive = {
		options: {
			archive: 'dist/<%= meta.name %>-<%= meta.version %>.zip'
		},
		expand: true,
		cwd: 'build/temp/archive/',
		src: '**',
		dest: '<%= meta.name %>-<%= meta.version %>/' // have a top-level directory in the ZIP file
	};

	config.clean.archive = [
		'build/temp/archive',
		'dist/*.zip'
	];



	/* Release Utilities
	----------------------------------------------------------------------------------------------------*/

	config.bump = { // changes the version number in the configs
		options: {
			files: [
				'package.json',
				'bower.json',
				'fullcalendar.jquery.json'
			],
			commit: false,
			createTag: false,
			push: false
		}
	};



	/* CDNJS (http://cdnjs.com/)
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('cdnjs', 'Build files for CDNJS\'s hosted version of FullCalendar', [
		'modules',
		'languages',
		'karma:single',
		'cdnjsDist'
	]);

	grunt.registerTask('cdnjsDist', [
		'clean:cdnjs',
		'copy:cdnjsModules',
		'copy:cdnjsLanguages',
		'copy:cdnjsLanguagesAll',
		'cdnjsConfig'
	]);

	config.copy.cdnjsModules = {
		expand: true,
		cwd: 'dist/',
		src: [ '*.js', '*.css' ],
		dest: 'dist/cdnjs/<%= meta.version %>/'
	};

	config.copy.cdnjsLanguages = {
		expand: true,
		cwd: 'dist/lang/',
		src: '*.js',
		dest: 'dist/cdnjs/<%= meta.version %>/lang/'
	};

	config.copy.cdnjsLanguagesAll = {
		src: 'dist/lang-all.js',
		dest: 'dist/cdnjs/<%= meta.version %>/lang-all.js'
	};

	grunt.registerTask('cdnjsConfig', function() {
		var jqueryConfig = grunt.file.readJSON('fullcalendar.jquery.json');
		var cdnjsConfig = grunt.file.readJSON('build/cdnjs.json');
		grunt.file.write(
			'dist/cdnjs/package.json',
			JSON.stringify(
				_.extend({}, jqueryConfig, cdnjsConfig), // combine 2 configs
				null, // replace
				2 // indent
			)
		);
	});

	config.clean.cdnjs = 'dist/cdnjs';



	/* Linting and Code Style Checking
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('check', 'Lint and check code style', [
		'jscs',
		'jshint:srcModules', // so we can fix most quality errors in their original files
		'lumbar:build',
		'jshint' // will run srcModules again but oh well
	]);

	// configs located elsewhere
	config.jshint = require('./build/jshint.conf');
	config.jscs = require('./build/jscs.conf');



	/* dist & git hacks
	----------------------------------------------------------------------------------------------------
	// These shell commands are used to force/unforce git from thinking that files have changed.
	// Used to ignore changes when dist files are overwritten, but not committed, during development.
	*/

	config.shell['assume-unchanged'] = {
		command: 'git update-index --assume-unchanged `git ls-files dist`'
	};
	config.shell['no-assume-unchanged'] = {
		command: 'git update-index --no-assume-unchanged `git ls-files dist`'
	};
	config.shell['list-assume-unchanged'] = {
		command: 'git ls-files -v | grep \'^h\''
	};



	// finally, give grunt the config object...
	grunt.initConfig(config);

	grunt.loadTasks('./build/tasks/');
};
