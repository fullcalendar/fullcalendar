/*jshint node: true */
module.exports = function( grunt ) {

"use strict";

var files = [
	"jquery.simulate.js",
	"Gruntfile.js",
	"test/*.js",
	"test/unit/*.js"
];

grunt.loadNpmTasks( "grunt-bowercopy" );
grunt.loadNpmTasks( "grunt-compare-size" );
grunt.loadNpmTasks( "grunt-git-authors" );
grunt.loadNpmTasks( "grunt-contrib-qunit" );
grunt.loadNpmTasks( "grunt-contrib-uglify" );
grunt.loadNpmTasks( "grunt-contrib-jshint" );

grunt.initConfig({
	pkg: grunt.file.readJSON( "package.json" ),

	bowercopy: {
		all: {
			options: {
				destPrefix: "external"
			},
			files: {
				"qunit/qunit.js": "qunit/qunit/qunit.js",
				"qunit/qunit.css": "qunit/qunit/qunit.css",
				"qunit/LICENSE.txt": "qunit/LICENSE.txt",

				"jquery-1.6.0/jquery.js": "jquery-1.6.0/jquery.js",
				"jquery-1.6.0/MIT-LICENSE.txt": "jquery-1.6.0/MIT-LICENSE.txt",

				"jquery-1.6.1/jquery.js": "jquery-1.6.1/jquery.js",
				"jquery-1.6.1/MIT-LICENSE.txt": "jquery-1.6.1/MIT-LICENSE.txt",

				"jquery-1.6.2/jquery.js": "jquery-1.6.2/jquery.js",
				"jquery-1.6.2/MIT-LICENSE.txt": "jquery-1.6.2/MIT-LICENSE.txt",

				"jquery-1.6.3/jquery.js": "jquery-1.6.3/jquery.js",
				"jquery-1.6.3/MIT-LICENSE.txt": "jquery-1.6.3/MIT-LICENSE.txt",

				"jquery-1.6.4/jquery.js": "jquery-1.6.4/jquery.js",
				"jquery-1.6.4/MIT-LICENSE.txt": "jquery-1.6.4/MIT-LICENSE.txt",

				"jquery-1.7.0/jquery.js": "jquery-1.7.0/jquery.js",
				"jquery-1.7.0/MIT-LICENSE.txt": "jquery-1.7.0/MIT-LICENSE.txt",

				"jquery-1.7.1/jquery.js": "jquery-1.7.1/jquery.js",
				"jquery-1.7.1/MIT-LICENSE.txt": "jquery-1.7.1/MIT-LICENSE.txt",

				"jquery-1.7.2/jquery.js": "jquery-1.7.2/jquery.js",
				"jquery-1.7.2/MIT-LICENSE.txt": "jquery-1.7.2/MIT-LICENSE.txt"
			}
		}
	},

	jshint: {
		options: {
			jshintrc: true
		},
		all: files
	},

	qunit: {
		files: "test/index.html"
	},

	uglify: {
		options: {
			banner: "/*! jQuery Simulate v@<%= pkg.version %> http://github.com/jquery/jquery-simulate | jquery.org/license */"
		},
		build: {
			src: "dist/jquery.simulate.js",
			dest: "dist/jquery.simulate.min.js"
		}
	},

	compare_size: {
		files: [ "dist/jquery.simulate.js", "dist/jquery.simulate.min.js" ]
	}
});

function git_date( fn ) {
	grunt.util.spawn({
		cmd: "git",
		args: [ "log", "-1", "--pretty=format:%ad" ]
	}, function( error, result ) {
		if ( error ) {
			grunt.log.error( error );
			return fn( error );
		}

		fn( null, result );
	});
}

grunt.registerTask( "max", function() {
	var dist = "dist/jquery.simulate.js",
		done = this.async(),
		version = grunt.config( "pkg.version" );

	if ( process.env.COMMIT ) {
		version += " " + process.env.COMMIT;
	}

	git_date(function( error, date ) {
		if ( error ) {
			return done( false );
		}

		grunt.file.copy( dist.replace( "dist/", "" ), dist, {
			process: function( source ) {
				return source
					.replace( /@VERSION/g, version )
					.replace( /@DATE/g, date );
			}
		});

		done();
	});
});

grunt.registerTask( "testswarm", function( commit, configFile ) {
	var testswarm = require( "testswarm" ),
		config = grunt.file.readJSON( configFile ).jquerycolor;
	config.jobName = "jQuery Simulate commit #<a href='https://github.com/jquery/jquery-simulate/commit/" + commit + "'>" + commit.substr( 0, 10 ) + "</a>";
	config["runNames[]"] = "jQuery Simulate";
	config["runUrls[]"] = config.testUrl + commit + "/test/index.html";
	config["browserSets[]"] = ["popular"];
	testswarm({
		url: config.swarmUrl,
		pollInterval: 10000,
		timeout: 1000 * 60 * 30,
		done: this.async()
	}, config);
});

grunt.registerTask( "manifest", function() {
	var pkg = grunt.config( "pkg" );
	grunt.file.write( "simulate.jquery.json", JSON.stringify({
		name: "color",
		title: pkg.title,
		description: pkg.description,
		keywords: pkg.keywords,
		version: pkg.version,
		author: {
			name: pkg.author.name,
			url: pkg.author.url.replace( "master", pkg.version )
		},
		maintainers: pkg.maintainers,
		licenses: pkg.licenses.map(function( license ) {
			return license.url.replace( "master", pkg.version );
		}),
		bugs: pkg.bugs,
		homepage: pkg.homepage,
		docs: pkg.homepage,
		dependencies: {
			jquery: ">=1.6"
		}
	}, null, "\t" ) );
});

grunt.registerTask( "default", ["jshint", "qunit", "build", "compare_size"] );
grunt.registerTask( "build", ["max", "uglify"] );

};
