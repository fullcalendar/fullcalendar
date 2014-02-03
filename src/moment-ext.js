
var ambigDateOfMonthRegex = /^\s*\d{4}-\d\d$/;
var ambigTimeOrZoneRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;


// Creating
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

// when parseZone==true, if can't figure it out, fall back to parseUTC
function makeMoment(args, parseUTC, parseZone) {
	var input = args[0];
	var isSingleString = args.length == 1 && typeof input === 'string';
	var isAmbigTime = false;
	var isAmbigZone = false;
	var ambigMatch;
	var mom;

	if (isSingleString) {
		if (ambigDateOfMonthRegex.test(input)) {
			// accept strings like '2014-05', but convert to the first of the month
			input += '-01';
			isAmbigTime = true;
			isAmbigZone = true;
		}
		else if ((ambigMatch = ambigTimeOrZoneRegex.exec(input))) {
			isAmbigTime = !ambigMatch[5]; // no time part?
			isAmbigZone = true;
		}
	}
	else if ($.isArray(input)) {
		// arrays have no timezone information, so assume ambiguous zone
		isAmbigZone = true;
	}

	// instantiate a vanilla moment
	if (parseUTC || parseZone || isAmbigTime) {
		mom = moment.utc.apply(moment, args);
	}
	else {
		mom = moment.apply(null, args);
	}

	if (moment.isMoment(input)) {
		transferAmbigs(input, mom);
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
			mom.zone(input); // if fails, will set it to 0, which it already was
		}
		else if (isNativeDate(input) || input === undefined) {
			// native Date object?
			// specified with no arguments?
			// then consider the moment to be local
			mom.local();
		}
	}

	return new FCMoment(mom);
}

// our subclass of Moment.
// accepts an object with the internal Moment properties that should be copied over to
// this object (most likely another Moment object).
function FCMoment(config) {
	extend(this, config);
}

// chain the prototype to Moment's
FCMoment.prototype = createObject(moment.fn);

// we need this because Moment's implementation will not copy of the ambig flags
FCMoment.prototype.clone = function() {
	return makeMoment([ this ]);
};


// Time-of-day
// -------------------------------------------------------------------------------------------------

// GETTER
// Returns a Duration with the hours/minutes/seconds/ms values of the moment.
// If the moment has an ambiguous time, a duration of 00:00 will be returned.
//
// SETTER
// You can supply a Duration, a Moment, or a Duration-like argument.
// When setting the time, and the moment has an ambiguous time, it then becomes unambiguous.
FCMoment.prototype.time = function(time) {
	if (time == null) { // getter
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

	// set the internal UTC flag
	moment.fn.utc.call(this); // call the original method, because we don't want to affect _ambigZone

	this._ambigTime = true;
	this._ambigZone = true; // if ambiguous time, also ambiguous timezone offset

	this.year(a[0])
		.month(a[1])
		.date(a[2])
		.hours(0)
		.minutes(0)
		.seconds(0)
		.milliseconds(0);

	return this; // for chaining
};

// Returns if the moment has a non-ambiguous time (boolean)
FCMoment.prototype.hasTime = function() {
	return !this._ambigTime;
};


// Timezone
// -------------------------------------------------------------------------------------------------

// Converts the moment to UTC, stripping out its timezone offset, but preserving its
// YMD and time-of-day. A moment with a stripped timezone offset will display no
// timezone offset when .format() is called.
FCMoment.prototype.stripZone = function() {
	var a = this.toArray(); // year,month,date,hours,minutes,seconds as an array

	// set the internal UTC flag
	moment.fn.utc.call(this); // call the original method, because we don't want to affect _ambigZone

	this._ambigZone = true;

	this.year(a[0])
		.month(a[1])
		.date(a[2])
		.hours(a[3])
		.minutes(a[4])
		.seconds(a[5])
		.milliseconds(a[6]);

	return this; // for chaining
};

// Returns of the moment has a non-ambiguous timezone offset (boolean)
FCMoment.prototype.hasZone = function() {
	return !this._ambigZone;
};

// this method implicitly marks a zone
FCMoment.prototype.zone = function(tzo) {
	if (tzo != null) {
		delete this._ambigZone;
	}
	return moment.fn.zone.apply(this, arguments);
};

// this method implicitly marks a zone.
// we don't need this, because .local internally calls .zone, but we don't want to depend on that.
FCMoment.prototype.local = function() {
	delete this._ambigZone;
	return moment.fn.local.apply(this, arguments);
};

// this method implicitly marks a zone.
// we don't need this, because .utc internally calls .zone, but we don't want to depend on that.
FCMoment.prototype.utc = function() {
	delete this._ambigZone;
	return moment.fn.utc.apply(this, arguments);
};


// Formatting
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


// Querying
// -------------------------------------------------------------------------------------------------

// Is the moment within the specified range? `end` is exclusive.
FCMoment.prototype.isWithin = function(start, end) {
	var a = commonlyAmbiguate([ this, start, end ]);
	return a[0] >= a[1] && a[0] < a[2];
};

// Make these query methods work with ambiguous moments
$.each([
	'isBefore',
	'isAfter',
	'isSame'
], function(i, methodName) {
	FCMoment.prototype[methodName] = function(input, units) {
		var a = commonlyAmbiguate([ this, input ]);
		return moment.fn[methodName].call(a[0], a[1], units);
	};
});


// Misc Internals
// -------------------------------------------------------------------------------------------------

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

// given an array of moment-like inputs, return a parallel array w/ moments similarly ambiguated.
// for example, of one moment has ambig time, but not others, all moments will have their time stripped.
function commonlyAmbiguate(inputs) {
	var outputs = [];
	var anyAmbigTime = false;
	var anyAmbigZone = false;
	var i;

	for (i=0; i<inputs.length; i++) {
		outputs.push(fc.moment(inputs[i]));
		anyAmbigTime = anyAmbigTime || outputs[i]._ambigTime;
		anyAmbigZone = anyAmbigZone || outputs[i]._ambigZone;
	}

	for (i=0; i<outputs.length; i++) {
		if (anyAmbigTime) {
			outputs[i].stripTime();
		}
		else if (anyAmbigZone) {
			outputs[i].stripZone();
		}
	}

	return outputs;
}
