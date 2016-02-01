module.exports = {

	options: {
		requireCurlyBraces: [ 'if', 'else', 'for', 'while', 'do', 'try', 'catch' ],
		requireSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true },
		disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true },
		disallowSpacesInsideParentheses: true,
		requireSpacesInsideObjectBrackets: 'all',
		disallowQuotedKeysInObjects: 'allButReserved',
		disallowSpaceAfterObjectKeys: true,
		requireCommaBeforeLineBreak: true,
		requireOperatorBeforeLineBreak: [ '?', '+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=' ],
		disallowLeftStickedOperators: [ '?' ],
		requireRightStickedOperators: [ '!' ],
		requireLeftStickedOperators: [ ',' ],
		disallowRightStickedOperators: [ ':' ],
		disallowSpaceAfterPrefixUnaryOperators: [ '++', '--', '+', '-', '~', '!' ],
		disallowSpaceBeforePostfixUnaryOperators: [ '++', '--' ],
		disallowKeywords: [ 'with' ],
		disallowMultipleLineStrings: true,
		requireDotNotation: true,
		requireParenthesesAroundIIFE: true
	},

	srcModules: [
		'src/**/*.js',
		'!**/intro.js',
		'!**/outro.js'
	],

	srcLanguages: 'lang/*.js',

	tests: {
		options: {
			// more restrictions.
			// we eventually want these to apply to all other code too.
			requireSpaceAfterKeywords: [ 'if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch' ],
			requireSpacesInsideArrayBrackets: 'all',
			requireKeywordsOnNewLine: [ 'else', 'catch' ],
			disallowTrailingWhitespace: true,
			validateQuoteMarks: '\'',
			maximumLineLength: 120
		},
		src: 'tests/automated/*.js'
	},

	misc: [
		'*.js', // ex: Gruntfile.js
		'build/*.js' // ex: this file
	]

};