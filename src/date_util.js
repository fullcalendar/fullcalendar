
var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
var ambigTimeRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))$/;
var ambigZoneRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;
var momentCloneMethod = moment.fn.clone;
var momentFormatMethod = moment.fn.format;
var momentToISOStringMethod = moment.fn.toISOString;


// diffs the two moments into a Duration where full-days are recorded first,
// then the remaining time.
function dayishDiff(d1, d0) {
	return moment.duration({
		days: d1.clone().stripTime().diff(d0.clone().stripTime(), 'days'),
		ms: d1.time() - d0.time()
	});
}

function isNativeDate(input) {
	return  Object.prototype.toString.call(input) === '[object Date]' ||
		input instanceof Date;
}


// MOMENT: creating
// -------------------------------------------------------------------------------------------------

// Creates a moment in the local timezone, similar to the vanilla moment(...) constructor,
// but with extra features:
// - ambiguous times
// - enhanced formatting (TODO)
fc.moment = function() {
	return buildMoment(arguments);
};

// Sames as fc.moment, but creates a moment in the UTC timezone.
fc.moment.utc = function() {
	return buildMoment(arguments, true);
};

// Creates a moment and preserves the timezone offset of the ISO8601 string,
// allowing for ambigous timezones. If the string is not an ISO8601 string,
// the moment is processed in UTC-mode (a departure from moment's method).
fc.moment.parseZone = function() {
	return buildMoment(arguments, true, true);
};

// when parseZone==true, if can't figure it out, fall back to parseUTC
function buildMoment(args, parseUTC, parseZone) {
	var isSingleArg = args.length == 1;
	var isSingleMoment = isSingleArg && moment.isMoment(args[0]);
	var isSingleString = isSingleArg && typeof args[0] === 'string';
	var isSingleArray = isSingleArg && $.isArray(args[0]);
	var isSingleNativeDate = isSingleArg && isNativeDate(args[0]);
	var isAmbigTime = isSingleString && ambigTimeRegex.test(args[0]);
	var isAmbigZone = isAmbigTime || isSingleArray || isSingleString && ambigZoneRegex.test(args[0]);
	var mom;

	if (parseUTC || parseZone || isAmbigTime) {
		mom = moment.utc.apply(moment, args);
	}
	else {
		mom = moment.apply(null, args);
	}

	// if we are essentially cloning a moment, transfer over existing _ambig properties
	if (isSingleMoment) {
		transferAmbigs(args[0], mom);
	}

	if (isAmbigTime) {
		mom._ambigTime = true;
		mom._ambigZone = true; // if ambiguous time, also ambiguous timezone offset
	}

	if (parseZone) {
		if (isAmbigZone) {
			mom._ambigZone = true;
		}
		else if (isSingleString) {
			mom.zone(args[0]); // if fails, will set it to 0, which it already was
		}
		else if (isSingleNativeDate || args[0] === undefined) {
			// native Date object?
			// specified with no arguments?
			// then consider the moment to be local
			mom.local();
		}
	}

	mom._fc = true; // flag for use other extended functionality (only formatting at this point)

	return mom;
}

// we need to patch moment's clone method because it will not copy our _ambig properties
moment.fn.clone = function() {
	var res = momentCloneMethod.apply(this, arguments);
	transferAmbigs(this, res);
	return res;
};

// transfers our internal _ambig properties from one moment to another, but only if true
function transferAmbigs(srcMoment, destMoment) {
	if (srcMoment._ambigTime) {
		destMoment._ambigTime = true;
	}
	if (srcMoment._ambigZone) {
		destMoment._ambigZone = true;
	}
}


// MOMENT: time-of-day
// -------------------------------------------------------------------------------------------------


// GETTER
// Returns a Duration with the hours/minutes/seconds/ms values of the moment.
// If the moment has an ambiguous time, a duration of 00:00 will be returned.
//
// SETTER
// You can supply a Duration, a Moment, or a Duration-like argument.
// When setting the time, and the moment has an ambiguous time, it then becomes unambiguous.
moment.fn.time = function(time) {
	if (time === undefined) { // getter
		return moment.duration({
			hours: this.hours(),
			minutes: this.minutes(),
			seconds: this.seconds(),
			milliseconds: this.milliseconds()
		});
	}
	else { // setter

		delete this._ambigTime; // mark that the moment now has a time

		if (!moment.isDuration(time) && !moment.isMoment(time)) {
			time = moment.duration(time);
		}

		return this.hours(time.hours() + time.days() * 24) // day value will cause overflow (so 24 hours becomes 00:00:00 of next day)
			.minutes(time.minutes())
			.seconds(time.seconds())
			.milliseconds(time.milliseconds());
	}
};

// Converts the moment to UTC, stripping out its time-of-day and timezone offset,
// but preserving its YMD. A moment with a stripped time will display no time
// nor timezone offset when .format() is called.
moment.fn.stripTime = function() {
	var a = this.toArray(); // year,month,date,hours,minutes,seconds as an array

	this._ambigTime = true;
	this._ambigZone = true; // if ambiguous time, also ambiguous timezone offset

	return this.utc()
		.year(a[0])
		.month(a[1])
		.date(a[2])
		.hours(0)
		.minutes(0)
		.seconds(0)
		.milliseconds(0);
};

// Returns if the moment has a non-ambiguous time (boolean)
moment.fn.hasTime = function() {
	return !this._ambigTime;
};


// MOMENT: timezone offset
// -------------------------------------------------------------------------------------------------

// Converts the moment to UTC, stripping out its timezone offset, but preserving its
// YMD and time-of-day. A moment with a stripped timezone offset will display no
// timezone offset when .format() is called.
moment.fn.stripZone = function() {
	var a = this.toArray(); // year,month,date,hours,minutes,seconds as an array

	this._ambigZone = true;

	return this.utc()
		.year(a[0])
		.month(a[1])
		.date(a[2])
		.hours(a[3])
		.minutes(a[4])
		.seconds(a[5])
		.milliseconds(a[6]);
};

// Returns of the moment has a non-ambiguous timezone offset (boolean)
moment.fn.hasZone = function() {
	return !this._ambigZone;
};


// MOMENT: formatting mods
// -------------------------------------------------------------------------------------------------

moment.fn.format = function() {
	if (!arguments[0]) {
		if (this._ambigTime) {
			return momentFormat(this, 'YYYY-MM-DD');
		}
		if (this._ambigZone) {
			return momentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
		}
	}
	if (this._fc) {
		return formatDate(this, arguments[0]); // our extended formatting
	}
	else {
		return momentFormatMethod.apply(this, arguments); // pass along all arguments
	}
};

moment.fn.toISOString = function() {
	if (this._ambigTime) {
		return momentFormat(this, 'YYYY-MM-DD');
	}
	if (this._ambigZone) {
		return momentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
	}
	return momentToISOStringMethod.apply(this, arguments); // pass along all arguments
};

// call this if you want Moment's original format method to be used
function momentFormat(moment, formatStr) {
	return momentFormatMethod.call(moment, formatStr);
}


// MOMENT: misc utils
// -------------------------------------------------------------------------------------------------

// Is the moment within the specified range? `end` is exclusive.
// TODO: rename for collision reasons?
moment.fn.isWithin = function(start, end) {
	return this >= moment(start) && this < moment(end);
};

$.each([
	'isBefore',
	'isAfter',
	//'isSame', // nevermind. moment handles normalization to UTC
	'isWithin'
], function(i, methodName) {
	var origMethod = moment.fn[methodName];
	var momentCount = methodName == 'isWithin' ? 2 : 1;

	moment.fn[methodName] = function() {
		var newThis;
		var args = Array.prototype.slice.call(arguments);
		var i;

		if (this._ambigZone) {
			for (i=0; i<momentCount; i++) {
				if (typeof args[i] === 'string') {
					args[i] = fc.moment.parseZone(args[i]);
				}
			}
		}

		for (i=0; i<momentCount; i++) {
			if (moment.isMoment(args[i]) && args[i]._ambigZone !== this._ambigZone) {
				newThis = newThis || this.clone().stripZone();
				args[i] = args[i].clone().stripZone();
			}
		}

		return origMethod.apply(newThis || this, args);
	};
});


// Single Date Formatting
// -------------------------------------------------------------------------------------------------


// Formats `date` with a Moment formatting string, but allow our non-zero areas and
// additional token.
function formatDate(date, formatStr) {
	return formatDateWithChunks(date, getFormatStringChunks(formatStr));
}


function formatDateWithChunks(date, chunks) {
	var s = '';
	var i;

	for (i=0; i<chunks.length; i++) {
		s += formatDateWithChunk(date, chunks[i]);
	}

	return s;
}


// addition formatting tokens we want recognized
var tokenOverrides = {
	t: function(date) { // "a" or "p"
		return momentFormat(date, 'a').charAt(0);
	},
	T: function(date) { // "A" or "P"
		return momentFormat(date, 'A').charAt(0);
	}
};


function formatDateWithChunk(date, chunk) {
	var token;
	var maybeStr;

	if (typeof chunk === 'string') { // a literal string
		return chunk;
	}
	else if ((token = chunk.token)) { // a token, like "YYYY"
		if (tokenOverrides[token]) {
			return tokenOverrides[token](date); // use our custom token
		}
		return momentFormat(date, token);
	}
	else if (chunk.maybe) { // a grouping of other chunks that must be non-zero
		maybeStr = formatDateWithChunks(date, chunk.maybe);
		if (maybeStr.match(/[1-9]/)) {
			return maybeStr;
		}
	}

	return '';
}


// Date Range Formatting
// -------------------------------------------------------------------------------------------------
// TODO: make it work with timezone offset

// Using a formatting string meant for a single date, generate a range string, like
// "Sep 2 - 9 2013", that intelligently inserts a separator where the dates differ.
// If the dates are the same as far as the format string is concerned, just return a single
// rendering of one date, without any separator.
function formatRange(date1, date2, formatStr, separator, isRTL) {

	// Expand localized format strings, like "LL" -> "MMMM D YYYY"
	formatStr = date1.lang().longDateFormat(formatStr) || formatStr;
	// BTW, this is not important for `formatDate` because it is impossible to put custom tokens
	// or non-zero areas in Moment's localized format strings.

	separator = separator || ' - ';

	return formatRangeWithChunks(
		date1,
		date2,
		getFormatStringChunks(formatStr),
		separator,
		isRTL
	);
}
fc.formatRange = formatRange; // expose


function formatRangeWithChunks(date1, date2, chunks, separator, isRTL) {
	var chunkStr; // the rendering of the chunk
	var leftI;
	var leftStr = '';
	var rightI;
	var rightStr = '';
	var middleI;
	var middleStr1 = '';
	var middleStr2 = '';
	var middleStr = '';

	// Start at the leftmost side of the formatting string and continue until you hit a token
	// that is not the same between dates.
	for (leftI=0; leftI<chunks.length; leftI++) {
		chunkStr = formatSimilarChunk(date1, date2, chunks[leftI]);
		if (chunkStr === false) {
			break;
		}
		leftStr += chunkStr;
	}

	// Similarly, start at the rightmost side of the formatting string and move left
	for (rightI=chunks.length-1; rightI>leftI; rightI--) {
		chunkStr = formatSimilarChunk(date1, date2, chunks[rightI]);
		if (chunkStr === false) {
			break;
		}
		rightStr = chunkStr + rightStr;
	}

	// The area in the middle is different for both of the dates.
	// Collect them distinctly so we can jam them together later.
	for (middleI=leftI; middleI<=rightI; middleI++) {
		middleStr1 += formatDateWithChunk(date1, chunks[middleI]);
		middleStr2 += formatDateWithChunk(date2, chunks[middleI]);
	}

	if (middleStr1 || middleStr2) {
		if (isRTL) {
			middleStr = middleStr2 + separator + middleStr1;
		}
		else {
			middleStr = middleStr1 + separator + middleStr2;
		}
	}

	return leftStr + middleStr + rightStr;
}


var similarUnitMap = {
	Y: 'year',
	M: 'month',
	D: 'day', // day of month
	d: 'day' // day of week
};
// don't go any further than day, because we don't want to break apart times like "12:30:00"
// TODO: week maybe?


// Given a formatting chunk, and given that both dates are similar in the regard the
// formatting chunk is concerned, format date1 against `chunk`. Otherwise, return `false`.
function formatSimilarChunk(date1, date2, chunk) {
	var token;
	var unit;

	if (typeof chunk === 'string') { // a literal string
		return chunk;
	}
	else if ((token = chunk.token)) {
		unit = similarUnitMap[token.charAt(0)];
		// are the dates the same for this unit of measurement?
		if (unit && date1.isSame(date2, unit)) {
			return momentFormat(date1, token); // would be the same if we used `date2`
			// BTW, don't support custom tokens
		}
	}

	return false; // the chunk is NOT the same for the two dates
	// BTW, don't support splitting on non-zero areas
}


// Chunking Utils
// -------------------------------------------------------------------------------------------------


var formatStringChunkCache = {};


function getFormatStringChunks(formatStr) {
	if (formatStr in formatStringChunkCache) {
		return formatStringChunkCache[formatStr];
	}
	return (formatStringChunkCache[formatStr] = chunkFormatString(formatStr));
}


// Break the formatting string into an array of chunks
function chunkFormatString(formatStr) {
	var chunks = [];
	var chunker = /\[([^\]]*)\]|\(([^\)]*)\)|((\w)\4*o?T?)|([^\w\[\(]+)/g; // TODO: more descrimination
	var match;

	while ((match = chunker.exec(formatStr))) {
		if (match[1]) { // a literal string instead [ ... ]
			chunks.push(match[1]);
		}
		else if (match[2]) { // non-zero formatting inside ( ... )
			chunks.push({ maybe: chunkFormatString(match[2]) });
		}
		else if (match[3]) { // a formatting token
			chunks.push({ token: match[3] });
		}
		else if (match[5]) { // an unenclosed literal string
			chunks.push(match[5]);
		}
	}

	return chunks;
}

