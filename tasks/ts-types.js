var gulp = require('gulp');
var generateDts = require('dts-generator').default;
var replace = require('gulp-replace');

gulp.task('ts-types', [ 'ts-types-raw' ], function() {
	return gulp.src('tmp/fullcalendar.d.ts')
		.pipe(replace(moduleDeclarationRegex, filterModuleDeclaration))
		.pipe(gulp.dest('dist/'));
});

gulp.task('ts-types-raw', function() {
	return generateDts({
		project: '.', // where the tsconfig is
		name: 'fullcalendar',
		main: 'fullcalendar/src/main',
		out: 'tmp/fullcalendar.d.ts',
	});
});

gulp.task('ts-types:watch', [ 'ts-types' ], function() {
	// HACK
	// if we watched src/**/*.js files,
	// it blocked webpack compilation until dts-generator finished for some reason.
	// instead, wait until we know core compilation has finished before rerunning dts-generator.
	gulp.watch('dist/fullcalendar.js', [ 'ts-types' ]);
});


// Typedef Source Code Transformation Hacks
// ----------------------------------------

var moduleDeclarationRegex = /^declare module '([^']*)' \{([\S\s]*?)[\n\r]+\}/mg;
var importFromRegex = /from '([^']*)'/g;

function filterModuleDeclaration(whole, id, body) {
	return "declare module '" + filterModuleId(id) + "' {" + filterModuleBody(body) + "\n}";
}

function filterModuleId(id) {
	// fullcalendar/src/something/MyClass -> fullcalendar/MyClass
	return id.replace(
		/\/src\/([^\/]*\/)*([A-Z][A-Za-z]*)$/,
		'/$2'
	);
}

function filterModuleBody(s) {
	var defaultExportName;

	// changes the name of the default export to `Default` and exports it as a *named* export.
	// this allows ambient declaration merging to grab onto it.
	// workaround for https://github.com/Microsoft/TypeScript/issues/14080
	s = s.replace(/export default( abstract)? class ([A-Z][A-Za-z]*)/, function(m0, m1, m2) {
		defaultExportName = m2;
		return 'export' + (m1 || '') + ' class Default';
	});

	if (defaultExportName) {
		// replace any references to the original class' name
		s = s.replace(new RegExp('\\b' + defaultExportName + '\\b'), 'Default');

		// still needs to be exported as default
		s += "\n\texport default Default;";
	}

	s = s.replace(importFromRegex, function(whole, id) {
		return "from '" + filterModuleId(id) + "'";
	});

	return s;
}
