
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
		'copy:archiveDemoTheme',
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

	// copy the already-minified jQuery and jQuery UI files into the ./jquery/ directory
	config.copy.archiveDependencies = {
		files: [
			{ src: 'build/out/jquery.js', dest: 'build/archive/jquery/jquery.min.js' },
			{ src: 'build/out/jquery-ui.js', dest: 'build/archive/jquery/jquery-ui.custom.min.js' }
		]
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
		src: 'demos/*',
		dest: 'build/archive/'
	};

	// copy the "cupertino" jquery-ui theme into the demo directory (for demos/theme.html)
	config.copy.archiveDemoTheme = {
		expand: true,
		cwd: 'bower_components/jquery-ui/themes/cupertino/',
		src: [ 'jquery-ui.min.css', 'images/*' ],
		dest: 'build/archive/demos/cupertino/'
	};

	// in demo HTML, rewrites paths to work in the archive
	function transformDemoPath(path) {
		path = path.replace('../bower_components/jquery-ui/themes/', ''); // for demos/theme.html
		path = path.replace('/build/out/jquery.js', '/jquery/jquery.min.js');
		path = path.replace('/build/out/jquery-ui.js', '/jquery/jquery-ui.custom.min.js');
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



	/* Bower Component (http://bower.io/)
	----------------------------------------------------------------------------------------------------*/

	grunt.registerTask('bower', 'Build the FullCalendar Bower component', [
		'clean:modules',
		'clean:bower',
		'modules',
		'copy:bowerModules',
		'copy:bowerReadme',
		'bowerConfig'
	]);

	// copy FullCalendar modules into bower component's root
	config.copy.bowerModules = {
		expand: true,
		cwd: 'build/out/',
		src: [ '*.js', '*.css', '!jquery*' ],
		dest: 'build/bower/'
	};

	// copy the bower-specific README
	config.copy.bowerReadme = {
		src: 'build/bower-readme.md',
		dest: 'build/bower/readme.md'
	};

	// assemble the bower config from existing configs
	grunt.registerTask('bowerConfig', function() {
		var bowerConfig = grunt.file.readJSON('build/bower.json');
		grunt.file.write(
			'build/bower/bower.json',
			JSON.stringify(
				_.extend({}, pluginConfig, bowerConfig), // combine 2 configs
				null, // replacer
				2 // indent
			)
		);
	});

	config.clean.bower = 'build/bower/*';



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
