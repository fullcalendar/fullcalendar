
var ambigTimeRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))$/;
var ambigZoneRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;


// MOMENT: creating
// -------------------------------------------------------------------------------------------------

// Creates a moment in the local timezone, similar to the vanilla moment(...) constructor,
// but with extra features:
// - ambiguous times
// - enhanced formatting (TODO)
fc.moment = function() {
	return makeMoment(arguments);
};

// Sames as fc.moment, but creates a moment in the UTC timezone.
fc.moment.utc = function() {
	return makeMoment(arguments, true);
};

// Creates a moment and preserves the timezone offset of the ISO8601 string,
// allowing for ambigous timezones. If the string is not an ISO8601 string,
// the moment is processed in UTC-mode (a departure from moment's method).
fc.moment.parseZone = function() {
	return makeMoment(arguments, true, true);
};

function FCMoment(config) {
	extend(this, config);
}

FCMoment.prototype = createObject(moment.fn);

FCMoment.prototype.clone = function() {
	return makeMoment([ this ]);
};

// when parseZone==true, if can't figure it out, fall back to parseUTC
function makeMoment(args, parseUTC, parseZone) {
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

	return new FCMoment(mom);
}

// transfers our internal _ambig properties from one moment to another
function transferAmbigs(src, dest) {
	if (src._ambigTime) {
		dest._ambigTime = true;
	}
	else if (dest._ambigTime) {
		delete dest._ambigTime;
	}

	if (src._ambigZone) {
		dest._ambigZone = true;
	}
	else if (dest._ambigZone) {
		delete dest._ambigZone;
	}
}

function makeMomentAs(input, model) {
	var output = fc.moment(input);
	if (model._ambigTime) {
		output.stripTime();
	}
	else if (model._ambigZone) {
		output.stripZone();
	}
	return output;
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
FCMoment.prototype.time = function(time) {
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
FCMoment.prototype.stripTime = function() {
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
FCMoment.prototype.hasTime = function() {
	return !this._ambigTime;
};


// MOMENT: timezone offset
// -------------------------------------------------------------------------------------------------

// Converts the moment to UTC, stripping out its timezone offset, but preserving its
// YMD and time-of-day. A moment with a stripped timezone offset will display no
// timezone offset when .format() is called.
FCMoment.prototype.stripZone = function() {
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
FCMoment.prototype.hasZone = function() {
	return !this._ambigZone;
};

FCMoment.prototype.zone = function(tzo) {
	if (tzo != undefined) {
		this._ambigZone = false;
	}
	return moment.fn.zone.apply(this, arguments);
};

FCMoment.prototype.local = function() {
	this._ambigZone = false;
	return moment.fn.local.apply(this, arguments);
};

FCMoment.prototype.utc = function() {
	this._ambigZone = false;
	return moment.fn.utc.apply(this, arguments);
};


// MOMENT: formatting mods
// -------------------------------------------------------------------------------------------------

FCMoment.prototype.format = function() {
	if (arguments[0]) {
		return formatDate(this, arguments[0]); // our extended formatting
	}
	if (this._ambigTime) {
		return momentFormat(this, 'YYYY-MM-DD');
	}
	if (this._ambigZone) {
		return momentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
	}
	return momentFormat(this); // default moment original formatting
};

FCMoment.prototype.toISOString = function() {
	if (this._ambigTime) {
		return momentFormat(this, 'YYYY-MM-DD');
	}
	if (this._ambigZone) {
		return momentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
	}
	return moment.fn.toISOString.apply(this, arguments);
};


// MOMENT: misc utils
// -------------------------------------------------------------------------------------------------

// Is the moment within the specified range? `end` is exclusive.
FCMoment.prototype.isWithin = function(start, end) {
	return this >= makeMomentAs(start, this) && this < makeMomentAs(end, this);
};

$.each([
	'isBefore',
	'isAfter'
], function(i, methodName) {
	FCMoment.prototype[methodName] = function(input, units) {
		moment.fn[methodName].call(
			this,
			makeMomentAs(input, this),
			units
		);
	};
});
