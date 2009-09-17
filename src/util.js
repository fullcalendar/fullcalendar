
/* Date Math
-----------------------------------------------------------------------------*/

var DAY_MS = 86400000;

function addYears(d, n, keepTime) {
	d.setFullYear(d.getFullYear() + n);
	if (keepTime) return d;
	return clearTime(d);
}

function addMonths(d, n, keepTime) {
	d.setMonth(d.getMonth() + n);
	if (keepTime) return d;
	return clearTime(d);
}

function addDays(d, n, keepTime) {
	d.setDate(d.getDate() + n);
	if (keepTime) return d;
	return clearTime(d);
}

function addMinutes(d, n) {
	d.setMinutes(d.getMinutes() + n);
	return d;
}

function clearTime(d) {
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0); 
	d.setMilliseconds(0);
	return d;
}

function cloneDate(d, dontKeepTime) {
	if (dontKeepTime) {
		return clearTime(new Date(+d));
	}else{
		return new Date(+d);
	}
}



/* Date Parsing
-----------------------------------------------------------------------------*/

var parseDate = fc.parseDate = function(s) {
	if (typeof s == 'object')
		return s; // already a Date object
	if (typeof s == 'undefined')
		return null;
	if (typeof s == 'number')
		return new Date(s * 1000);
	return parseISO8601(s, true) ||
		   Date.parse(s) ||
		   new Date(parseInt(s) * 1000);
}

var parseISO8601 = fc.parseISO8601 = function(s, ignoreTimezone) {
	// derived from http://delete.me.uk/2005/03/iso8601.html
	var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
		"(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
		"(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
	var d = s.match(new RegExp(regexp));
	if (!d) return null;
	var offset = 0;
	var date = new Date(d[1], 0, 1);
	if (d[3]) { date.setMonth(d[3] - 1); }
	if (d[5]) { date.setDate(d[5]); }
	if (d[7]) { date.setHours(d[7]); }
	if (d[8]) { date.setMinutes(d[8]); }
	if (d[10]) { date.setSeconds(d[10]); }
	if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
	if (!ignoreTimezone) {
		if (d[14]) {
			offset = (Number(d[16]) * 60) + Number(d[17]);
			offset *= ((d[15] == '-') ? 1 : -1);
		}
		offset -= date.getTimezoneOffset();
	}
	return new Date(Number(date) + (offset * 60 * 1000));
}



/* Date Formatting
-----------------------------------------------------------------------------*/

var formatDate = fc.formatDate = function(date, format, options) {
	return formatDates(date, null, format, options);
}

var formatDates = fc.formatDates = function(date1, date2, format, options) {
	options = options || defaults;
	var date = date1,
		otherDate = date2,
		i, len = format.length, c,
		i2, formatter,
		res = '';
	for (i=0; i<len; i++) {
		c = format.charAt(i);
		if (c == "'") {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == "'") {
					if (date) {
						if (i2 == i+1) {
							res += "'";
						}else{
							res += format.substring(i+1, i2);
						}
						i = i2;
					}
					break;
				}
			}
		}
		else if (c == '(') {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == ')') {
					var subres = formatDate(date, format.substring(i+1, i2), options);
					if (parseInt(subres.replace(/\D/, ''))) {
						res += subres;
					}
					i = i2;
					break;
				}
			}
		}
		else if (c == '[') {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == ']') {
					var subformat = format.substring(i+1, i2);
					var subres = formatDate(date, subformat, options);
					if (subres != formatDate(otherDate, subformat, options)) {
						res += subres;
					}
					i = i2;
					break;
				}
			}
		}
		else if (c == '{') {
			date = date2;
			otherDate = date1;
		}
		else if (c == '}') {
			date = date1;
			otherDate = date2;
		}
		else {
			for (i2=len; i2>i; i2--) {
				if (formatter = dateFormatters[format.substring(i, i2)]) {
					if (date) {
						res += formatter(date, options);
					}
					i = i2 - 1;
					break;
				}
			}
			if (i2 == i) {
				if (date) {
					res += c;
				}
			}
		}
	}
	return res;
}

var dateFormatters = {
	s	: function(d)	{ return d.getSeconds() },
	ss	: function(d)	{ return zeroPad(d.getSeconds()) },
	m	: function(d)	{ return d.getMinutes() },
	mm	: function(d)	{ return zeroPad(d.getMinutes()) },
	h	: function(d)	{ return d.getHours() % 12 || 12 },
	hh	: function(d)	{ return zeroPad(d.getHours() % 12 || 12) },
	H	: function(d)	{ return d.getHours() },
	HH	: function(d)	{ return zeroPad(d.getHours()) },
	d	: function(d)	{ return d.getDate() },
	dd	: function(d)	{ return zeroPad(d.getDate()) },
	ddd	: function(d,o)	{ return o.dayNamesShort[d.getDay()] },
	dddd: function(d,o)	{ return o.dayNames[d.getDay()] },
	M	: function(d)	{ return d.getMonth() + 1 },
	MM	: function(d)	{ return zeroPad(d.getMonth() + 1) },
	MMM	: function(d,o)	{ return o.monthNamesShort[d.getMonth()] },
	MMMM: function(d,o)	{ return o.monthNames[d.getMonth()] },
	yy	: function(d)	{ return (d.getFullYear()+'').substring(2) },
	yyyy: function(d)	{ return d.getFullYear() },
	t	: function(d)	{ return d.getHours() < 12 ? 'a' : 'p' },
	tt	: function(d)	{ return d.getHours() < 12 ? 'am' : 'pm' },
	T	: function(d)	{ return d.getHours() < 12 ? 'A' : 'P' },
	TT	: function(d)	{ return d.getHours() < 12 ? 'AM' : 'PM' },
	u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
	S	: function(d)	{
		var date = d.getDate();
		if (date > 10 && date < 20) return 'th';
		return ['st', 'nd', 'rd'][date%10-1] || 'th';
	}
};



/* Element Dimensions
-----------------------------------------------------------------------------*/

function setOuterWidth(element, width, includeMargins) {
	element.each(function() {
		var e = $(this);
		var w = width - (
			(parseInt(e.css('border-left-width')) || 0) +
			(parseInt(e.css('padding-left')) || 0) +
			(parseInt(e.css('padding-right')) || 0) +
			(parseInt(e.css('border-right-width')) || 0));
		if (includeMargins) {
			w -=
				(parseInt(e.css('margin-left')) || 0) +
				(parseInt(e.css('margin-right')) || 0);
		}
		e.width(w);
	});
}

function setOuterHeight(element, height, includeMargins) {
	element.each(function() {
		var e = $(this);
		var h = height - (
			(parseInt(e.css('border-top-width')) || 0) +
			(parseInt(e.css('padding-top')) || 0) +
			(parseInt(e.css('padding-bottom')) || 0) +
			(parseInt(e.css('border-bottom-width')) || 0));
		if (includeMargins) {
			h -=
				(parseInt(e.css('margin-top')) || 0) +
				(parseInt(e.css('margin-bottom')) || 0);
		}
		e.height(h);
	});
}



/* Hover Matrix
-----------------------------------------------------------------------------*/

function HoverMatrix(changeCallback) {

	var tops=[], lefts=[],
		prevRowE, prevColE,
		origRow, origCol,
		currRow, currCol;
		
	// this.cell = null;
	
	this.row = function(e) {
		prevRowE = $(e);
		tops.push(prevRowE.offset().top);
	};
	
	this.col = function(e) {
		prevColE = $(e);
		lefts.push(prevColE.offset().left);
	};
	
	this.start = function() {
		tops.push(tops[tops.length-1] + prevRowE.outerHeight());
		lefts.push(lefts[lefts.length-1] + prevColE.outerWidth());
		origRow = currRow = currCol = -1;
	};

	this.mouse = function(x, y) {
		var r, c;
		for (r=0; r<tops.length && y>=tops[r]; r++) ;
		for (c=0; c<lefts.length && x>=lefts[c]; c++) ;
		r = r >= tops.length ? -1 : r - 1;
		c = c >= lefts.length ? -1 : c - 1;
		if (r != currRow || c != currCol) {
			currRow = r;
			currCol = c;
			if (r == -1 || c == -1) {
				this.cell = null;
			}else{
				if (origRow == -1) {
					origRow = r;
					origCol = c;
				}
				this.cell = {
					row: r,
					col: c,
					top: tops[r],
					left: lefts[c],
					width: lefts[c+1] - lefts[c],
					height: tops[r+1] - tops[r],
					isOrig: r==origRow && c==origCol,
					rowDelta: r-origRow,
					colDelta: c-origCol
				};
			}
			changeCallback(this.cell);
		}
	};

}



/* Misc Utils
-----------------------------------------------------------------------------*/

var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function zeroPad(n) {
	return (n < 10 ? '0' : '') + n;
}

function strProp(s, prop) {
	return typeof s == 'string' ? s : s[prop];
}
