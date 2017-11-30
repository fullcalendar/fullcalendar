const del = require('del');
const gulp = require('gulp');
const webpack = require('webpack-stream');
const gulpIgnore = require('gulp-ignore');

// configs
const createCoreConfig = require('./webpack/createCoreConfig');
const createPluginsConfig = require('./webpack/createPluginsConfig');


gulp.task('modules', [ 'core', 'plugins' ]);
gulp.task('modules:dev', [ 'core:dev', 'plugins:dev' ]);
gulp.task('modules:watch', [ 'core:watch', 'plugins:watch' ]);

// deletes all generated js/css files in the dist directory
gulp.task('modules:clean', function() {
	return del('dist/*.{js,ts,css,map}');
});


// core

gulp.task('core', [ 'ts-types' ], function() {
	const config = createCoreConfig();
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulpIgnore.exclude('*.css.js*'))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('core:dev', [ 'ts-types' ], function() {
	const config = createCoreConfig({ debug: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulpIgnore.exclude('*.css.js*'))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('core:watch', [ 'ts-types' ], function() {
	const config = createCoreConfig({ debug: true, watch: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulpIgnore.exclude('*.css.js*'))
		.pipe(gulp.dest(config.output.path));
});


// plugins

gulp.task('plugins', [ 'ts-types' ], function() {
	const config = createPluginsConfig();
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('plugins:dev', [ 'ts-types' ], function() {
	const config = createPluginsConfig({ debug: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('plugins:watch', [ 'ts-types' ], function() {
	const config = createPluginsConfig({ debug: true, watch: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});
