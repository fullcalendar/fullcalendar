
var _ = require('underscore');


module.exports = function(grunt) {


	// Load required NPM tasks.
	// You must first run `npm install` in the project's root directory to get these dependencies.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');


	var fileIndex = require('./files.js'); // lists of source/dependency files
	var loaderUtils = require('./build/loader.js');

	// read config files, and combine into one "meta" object
	var packageConfig = grunt.file.readJSON('package.json');
	var componentConfig = grunt.file.readJSON('component.json');
	var pluginConfig = grunt.file.readJSON('fullcalendar.jquery.json');
	var meta = _.extend({}, packageConfig, componentConfig, pluginConfig);
	
	// this will eventually get passed to grunt.initConfig
	var config = {
		meta: meta, // do this primarily for templating (<%= %>)
		concat: {}, // initialize multitasks...
		uglify: {},
		copy: {},
		compress: {},
		clean: {}
	};


	/* Important Top-Level Tasks
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('default', 'dist'); // what will be run with a plain old "grunt" command

	grunt.registerTask('dist', 'Create a distributable ZIP file', [
		'clean:build',
		'concat',
		'uglify',
		'copy:dependencies',
		'copy:demos',
		'copy:misc',
		'compress'
	]);


	/* Concatenate Submodules
	----------------------------------------------------------------------------------------------------*/

	_.each(fileIndex.fullcalendar, function(submodule, name) {

		if (submodule.js) {
			config.concat[name + '-js'] = {
				options: {
					process: true // replace template variables
				},
				src: submodule.js,
				dest: 'build/out/fullcalendar/' + name + '.js'
			};
		}

		if (submodule.css) {
			config.concat[name + '-css'] = {
				options: {
					process: true // replace template variables
				},
				src: submodule.css,
				dest: 'build/out/fullcalendar/' + name + '.css'
			};
		}

		if (submodule.printCss) {
			config.concat[name + '-print-css'] = {
				options: {
					process: true // replace template variables
				},
				src: submodule.printCss,
				dest: 'build/out/fullcalendar/' + name + '.print.css'
			};
		}

	});


	/* Minify the JavaScript
	----------------------------------------------------------------------------------------------------*/

	config.uglify.all = {
		options: {
			preserveComments: 'some' // keep comments starting with /*!
		},
		expand: true,
		src: 'build/out/fullcalendar/*.js',
		ext: '.min.js'
	}


	/* Copy Dependencies
	----------------------------------------------------------------------------------------------------*/

	config.copy.dependencies = {
		expand: true,
		flatten: true,
		src: [
			fileIndex['jquery'].js,
			fileIndex['jquery-ui'].js
		],
		dest: 'build/out/jquery/'
	};


	/* Demos
	----------------------------------------------------------------------------------------------------*/

	config.copy.demos = {
		options: {
			// while copying demo files over, replace loader.js <script> with actual tags
			processContentExclude: 'demos/*/**', // don't process anything more than 1 level deep (like assets)
			processContent: function(content) {
				content = content.replace(
					/<script[^>]*loader\.js[^>]*?(?:data-modules=['"](.*?)['"])?><\/script>/i, // match loader.js tag and modules param
					function(wholeMatch, moduleString) {
						return loaderUtils.buildTags('..', fileIndex, moduleString, 'dist');
					}
				);
				return content;
			}
		},
		src: 'demos/**',
		dest: 'build/out/'
	};


	/* Copy Misc Files
	----------------------------------------------------------------------------------------------------*/

	config.copy.misc = {
		src: "*.txt", // license and changelog
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
		'clean:component',
		'concat',
		'uglify', // we want the minified JS in there
		'copy:component',
		'copy:component-readme',
		'component.json'
	]);

	config.copy.component = {
		expand: true,
		cwd: 'build/out/fullcalendar/',
		src: '**',
		dest: 'build/component/',
	};

	config.copy['component-readme'] = {
		src: 'build/component-readme.md',
		dest: 'build/component/readme.md'
	};

	grunt.registerTask('component.json', function() {
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

	config.clean.build = 'build/out/*';
	config.clean.component = 'build/component/*';
	config.clean.dist = 'dist/*';



	// finally, give grunt the config object...
	grunt.initConfig(config);
};
