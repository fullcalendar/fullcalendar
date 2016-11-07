
module.exports = {
	requireCurlyBraces: [ 'if', 'else', 'for', 'while', 'do', 'try', 'catch' ],
	requireSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true },
	disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true },
	//disallowSpacesInsideParentheses: true, // can't handle `something( //`
	requireSpacesInsideObjectBrackets: 'all',
	disallowQuotedKeysInObjects: 'allButReserved',
	disallowSpaceAfterObjectKeys: true,
	requireCommaBeforeLineBreak: true,
	requireOperatorBeforeLineBreak: [ '?', '+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=' ],
	requireSpacesInConditionalExpression: true,
	requireSpaceAfterComma: true,
	disallowSpaceBeforeComma: true,
	requireSpaceBeforeDestructuredValues: true,
	disallowSpaceAfterPrefixUnaryOperators: [ '++', '--', '+', '-', '~', '!' ],
	disallowSpaceBeforePostfixUnaryOperators: [ '++', '--' ],
	disallowKeywords: [ 'with' ],
	disallowMultipleLineStrings: true,
	requireDotNotation: true,
	requireParenthesesAroundIIFE: true
};
