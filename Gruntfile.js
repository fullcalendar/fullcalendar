
module.exports = function(grunt) {

	var _ = require('underscore');

	// Load required NPM tasks.
	// You must first run `npm install` in the project's root directory to get these dependencies.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('lumbar');

	// Parse config files
	var lumbarConfig = grunt.file.readJSON('lumbar.json');
	var packageConfig = grunt.file.readJSON('package.json');
	var pluginConfig = grunt.file.readJSON('fullcalendar.jquery.json');
	
	// This will eventually get passed to grunt.initConfig()
	// Initialize multitasks...
	var config = {
		concat: {},
		uglify: {},
		copy: {},
		compress: {},
		clean: {}
	};

	// Combine certain configs for the "meta" template variable (<%= meta.whatever %>)
	config.meta = _.extend({}, packageConfig, pluginConfig);

	// The "grunt" command with no arguments
	grunt.registerTask('default', 'archive');

	// Bare minimum for debugging
	grunt.registerTask('dev', 'lumbar:build');



	/* FullCalendar Modules
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('modules', 'Build the FullCalendar modules', [
		'lumbar:build',
		'concat:moduleVariables',
		'uglify:modules'
	]);

	// assemble modules
	config.lumbar = {
		build: {
			build: 'lumbar.json',
			output: 'build/out' // a directory. lumbar doesn't like trailing slash
		}
	};

	// replace template variables (<%= %>), IN PLACE
	config.concat.moduleVariables = {
		options: {
			process: true // replace
		},
		expand: true,
		cwd: 'build/out/',
		src: [ '*.js', '*.css', '!jquery*' ],
		dest: 'build/out/'
	};

	// create minified versions (*.min.js)
	config.uglify.modules = {
		options: {
			preserveComments: 'some' // keep comments starting with /*!
		},
		expand: true,
		src: 'build/out/fullcalendar.js', // only do it for fullcalendar.js
		ext: '.min.js'
	}

	config.clean.modules = 'build/out/*';



	/* Archive
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('archive', 'Create a distributable ZIP archive', [
		'clean:modules',
		'clean:archive',
		'modules',
		'copy:archiveModules',
		'copy:archiveDependencies',
		'copy:archiveDemos',
		'copy:archiveMisc',
		'compress:archive'
	]);

	// copy FullCalendar modules into ./fullcalendar/ directory
	config.copy.archiveModules = {
		expand: true,
		cwd: 'build/out/',
		src: [ '*.js', '*.css', '!jquery*' ],
		dest: 'build/archive/fullcalendar/'
	};

	// copy jQuery and jQuery UI into the ./jquery/ directory
	config.copy.archiveDependencies = {
		expand: true,
		flatten: true,
		src: [
			// we want to retain the original filenames
			lumbarConfig.modules['jquery'].scripts[0],
			lumbarConfig.modules['jquery-ui'].scripts[0]
		],
		dest: 'build/archive/jquery/'
	};

	// copy demo files into ./demos/ directory
	config.copy.archiveDemos = {
		options: {
			processContentExclude: 'demos/*/**', // don't process anything more than 1 level deep (like assets)
			processContent: function(content) {
				content = content.replace(/((?:src|href)=['"])([^'"]*)(['"])/g, function(m0, m1, m2, m3) {
					return m1 + transformDemoPath(m2) + m3;
				});
				return content;
			}
		},
		src: 'demos/**',
		dest: 'build/archive/'
	};

	// in demo HTML, rewrites paths to work in the archive
	function transformDemoPath(path) {
		path = path.replace('/build/out/jquery.js', '/' + lumbarConfig.modules['jquery'].scripts[0]);
		path = path.replace('/build/out/jquery-ui.js', '/' + lumbarConfig.modules['jquery-ui'].scripts[0]);
		path = path.replace('/lib/', '/jquery/');
		path = path.replace('/build/out/', '/fullcalendar/');
		path = path.replace('/fullcalendar.js', '/fullcalendar.min.js');
		return path;
	}

	// copy license and changelog
	config.copy.archiveMisc = {
		src: "*.txt",
		dest: 'build/archive/'
	};

	// create the ZIP
	config.compress.archive = {
		options: {
			archive: 'dist/<%= meta.name %>-<%= meta.version %>.zip'
		},
		expand: true,
		cwd: 'build/archive/',
		src: '**',
		dest: '<%= meta.name %>-<%= meta.version %>/' // have a top-level directory in the ZIP file
	};

	config.clean.archive = 'build/archive/*';
	config.clean.dist = 'dist/*';



	/* Bower Component (http://twitter.github.com/bower/)
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('component', 'Build the FullCalendar component for the Bower package manager', [
		'clean:modules',
		'clean:component',
		'modules',
		'copy:componentModules',
		'copy:componentReadme',
		'componentConfig'
	]);

	// copy FullCalendar modules into component root
	config.copy.componentModules = {
		expand: true,
		cwd: 'build/out/',
		src: [ '*.js', '*.css', '!jquery*' ],
		dest: 'build/component/'
	};

	// copy the component-specific README
	config.copy.componentReadme = {
		src: 'build/component-readme.md',
		dest: 'build/component/readme.md'
	};

	// assemble the component's config from existing configs
	grunt.registerTask('componentConfig', function() {
		var config = grunt.file.readJSON('build/component.json');
		grunt.file.write(
			'build/component/component.json',
			JSON.stringify(
				_.extend({}, pluginConfig, config), // combine 2 configs
				null, // replacer
				2 // indent
			)
		);
	});

	config.clean.component = 'build/component/*';



	/* CDN (http://cdnjs.com/)
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('cdn', 'Build files for CDNJS\'s hosted version of FullCalendar', [
		'clean:modules',
		'clean:cdn',
		'modules',
		'copy:cdnModules',
		'cdnConfig'
	]);

	config.copy.cdnModules = {
		expand: true,
		cwd: 'build/out/',
		src: [ '*.js', '*.css', '!jquery*' ],
		dest: 'build/cdn/<%= meta.version %>/'
	};

	grunt.registerTask('cdnConfig', function() {
		var config = grunt.file.readJSON('build/cdn.json');
		grunt.file.write(
			'build/cdn/package.json',
			JSON.stringify(
				_.extend({}, pluginConfig, config), // combine 2 configs
				null, // replace
				2 // indent
			)
		);
	});

	config.clean.cdn = 'build/cdn/<%= meta.version %>/*';
	// NOTE: not a complete clean. also need to manually worry about package.json and version folders



	// finally, give grunt the config object...
	grunt.initConfig(config);
};
