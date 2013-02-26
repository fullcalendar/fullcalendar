
var _ = require('underscore');

module.exports = function(grunt) {

	// Load required NPM tasks.
	// You must first run `npm install` in the project's root directory to get these dependencies.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch'); // Very useful for development. See README.


	// read config files, and combine into one "meta" object
	var packageConfig = grunt.file.readJSON('package.json');
	var componentConfig = grunt.file.readJSON('component.json');
	var pluginConfig = grunt.file.readJSON('fullcalendar.jquery.json');
	var meta = _.extend({}, packageConfig, componentConfig, pluginConfig);
	
	
	var config = { // this will eventually get passed to grunt.initConfig
		meta: meta, // do this primarily for templating (<%= %>)

		// initialize multitasks
		concat: {},
		uglify: {},
		copy: {},
		compress: {},
		clean: {},
		watch: {} // we will add watch tasks whenever we do concats, so files get re-concatenated upon save
	};


	// files that the demos might need in the distributable
	var depFiles = require('./build/deps.js');


	/* Important Top-Level Tasks
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('default', 'dist'); // what will be run with a plain old "grunt" command

	grunt.registerTask('dist', 'Create a distributable ZIP file', [
		'clean:build',
		'submodules',
		'uglify',
		'copy:deps',
		'copy:demos',
		'copy:misc',
		'compress'
	]);

	grunt.registerTask('dev', 'Build necessary files for developing and debugging', 'submodules');

	grunt.registerTask('submodules', 'Build all FullCalendar submodules', [
		'main',
		'gcal'
	]);


	/* Main FullCalendar Submodule
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('main', 'Build the main FullCalendar submodule', [
		'concat:mainJs',
		'concat:mainCss',
		'concat:mainPrintCss'
	]);

	// JavaScript

	config.concat.mainJs = {
		options: {
			process: true // replace template variables
		},
		src: [
			'src/intro.js',
			'src/defaults.js',
			'src/main.js',
			'src/Calendar.js',
			'src/Header.js',
			'src/EventManager.js',
			'src/date_util.js',
			'src/util.js',
			'src/basic/MonthView.js',
			'src/basic/BasicWeekView.js',
			'src/basic/BasicDayView.js',
			'src/basic/BasicView.js',
			'src/basic/BasicEventRenderer.js',
			'src/agenda/AgendaWeekView.js',
			'src/agenda/AgendaDayView.js',
			'src/agenda/AgendaView.js',
			'src/agenda/AgendaEventRenderer.js',
			'src/common/View.js',
			'src/common/DayEventRenderer.js',
			'src/common/SelectionManager.js',
			'src/common/OverlayManager.js',
			'src/common/CoordinateGrid.js',
			'src/common/HoverListener.js',
			'src/common/HorizontalPositionCache.js',
			'src/outro.js'
		],
		dest: 'build/out/fullcalendar/fullcalendar.js'
	};

	config.watch.mainJs = {
		files: config.concat.mainJs.src,
		tasks: 'concat:mainJs'
	};

	// CSS

	config.concat.mainCss = {
		options: {
			process: true // replace template variables
		},
		src: [
			'src/main.css',
			'src/common/common.css',
			'src/basic/basic.css',
			'src/agenda/agenda.css'
		],
		dest: 'build/out/fullcalendar/fullcalendar.css'
	};

	config.watch.mainCss = {
		files: config.concat.mainCss.src,
		tasks: 'concat:mainCss'
	};

	// CSS (for printing)

	config.concat.mainPrintCss = {
		options: {
			process: true // replace template variables
		},
		src: 'src/common/print.css',
		dest: 'build/out/fullcalendar/fullcalendar.print.css'
	};

	config.watch.mainPrintCss = {
		files: config.concat.mainPrintCss.src,
		tasks: 'concat:mainPrintCss'
	};


	/* Google Calendar Submodule
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('gcal', 'Build the Google Calendar submodule', 'concat:gcalJs');

	config.concat.gcalJs = {
		options: {
			process: true // replace template variables
		},
		src: 'src/gcal/gcal.js',
		dest: 'build/out/fullcalendar/gcal.js'
	};

	config.watch.gcalJs = {
		files: config.concat.gcalJs.src,
		tasks: 'concat:gcalJs'
	};


	/* Minify the JavaScript
	----------------------------------------------------------------------------------------------------*/

	config.uglify.all = {
		options: {
			preserveComments: 'some' // keep comments starting with /*!
		},
		expand: true,
		src: 'build/out/fullcalendar/fullcalendar.js',
		ext: '.min.js'
	}


	/* Copy Dependencies
	----------------------------------------------------------------------------------------------------*/

	config.copy.deps = {
		expand: true,
		flatten: true,
		src: depFiles,
		dest: 'build/out/jquery/' // all depenencies will go in the jquery/ directory for now
		                          // (because we only have jquery and jquery-ui)
	};


	/* Demos
	----------------------------------------------------------------------------------------------------*/

	config.copy.demos = {
		options: {
			// while copying demo files over, rewrite <script> and <link> tags for new dependency locations
			processContentExclude: 'demos/*/**', // don't process anything more than 1 level deep (like assets)
			processContent: function(content) {
				content = rewriteDemoStylesheetTags(content);
				content = rewriteDemoScriptTags(content);
				return content;
			}
		},
		src: 'demos/**',
		dest: 'build/out/'
	};

	function rewriteDemoStylesheetTags(content) {
		return content.replace(
			/(<link[^>]*href=['"])(.*?\.css)(['"][^>]*>)/g,
			function(full, before, href, after) {
				href = href.replace('../build/out/', '../');
				return before + href + after;
			}
		);
	}

	function rewriteDemoScriptTags(content) {
		return content.replace(
			/(<script[^>]*src=['"])(.*?)(['"][\s\S]*?<\/script>)/g,
			function(full, before, src, after) {
				if (src == '../build/deps.js') {
					return buildDepScriptTags();
				}
				else {
					src = src.replace('../build/out/', '../');
					src = src.replace('/fullcalendar.', '/fullcalendar.min.'); // use minified version of main JS file
					return before + src + after;
				}
			}
		);
	}

	function buildDepScriptTags() {
		var tags = [];
		for (var i=0; i<depFiles.length; i++) {
			var fileName = depFiles[i].replace(/.*\//, ''); // get file's basename
			tags.push("<script src='../jquery/" + fileName + "'></script>"); // all dependencies are in jquery/ for now
		}
		return tags.join("\n");
	}


	/* Copy Misc Files
	----------------------------------------------------------------------------------------------------*/

	config.copy.misc = {
		src: "*.txt", // licenses and changelog
		dest: 'build/out/'
	};


	/* Create ZIP file
	----------------------------------------------------------------------------------------------------*/

	config.compress.all = {
		options: {
			archive: 'dist/<%= meta.name %>-<%= meta.version %>.zip'
		},
		expand: true,
		cwd: 'build/out/',
		src: '**',
		dest: '<%= meta.name %>-<%= meta.version %>/' // have a top-level directory in the ZIP file
	};


	/* Bower Component
	----------------------------------------------------------------------------------------------------*/
	// http://twitter.github.com/bower/

	grunt.registerTask('component', 'Build the FullCalendar component for the Bower package manager', [
		'clean:build',
		'submodules',
		'uglify', // we want the minified JS in there
		'copy:component',
		'copy:componentReadme',
		'componentConfig'
	]);

	config.copy.component = {
		expand: true,
		cwd: 'build/out/fullcalendar/',
		src: '**',
		dest: 'build/component/',
	};

	config.copy.componentReadme = {
		src: 'build/component-readme.md',
		dest: 'build/component/readme.md'
	};

	grunt.registerTask('componentConfig', function() {
		grunt.file.write(
			'build/component/component.json',
			JSON.stringify(
				_.extend({}, pluginConfig, componentConfig), // combine the 2 configs
				null, // replacer
				2 // indent
			)
		);
	});


	/* Clean Up Files
	----------------------------------------------------------------------------------------------------*/

	config.clean.build = [
		'build/out/*',
		'build/component/*'
	];

	config.clean.dist = 'dist/*';



	// finally, give grunt the config object...
	grunt.initConfig(config);
};
