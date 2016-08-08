
var baseConfig = require('./.jscs');

module.exports = Object.assign({}, baseConfig, {
	// more restrictions.
	// we eventually want these to apply to all other code too.
	requireSpaceAfterKeywords: [ 'if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch' ],
	requireSpacesInsideArrayBrackets: 'all',
	requireKeywordsOnNewLine: [ 'else', 'catch' ],
	disallowTrailingWhitespace: true,
	validateQuoteMarks: '\'',
	maximumLineLength: 120
});
