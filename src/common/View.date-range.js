
View.mixin({

	// range the view is formally responsible for.
	// for example, a month view might have 1st-31st, excluding padded dates
	currentRange: null,
	currentRangeUnit: null, // name of largest unit being displayed, like "month" or "week"

	// date range with a rendered skeleton
	// includes not-active days that need some sort of DOM
	renderRange: null,

	// dates that display events and accept drag-n-drop
	activeRange: null,

	// constraint for where prev/next operations can go and where events can be dragged/resized to.
	// an object with optional start and end properties.
	validRange: null,

	// how far the current date will move for a prev/next operation
	dateIncrement: null,

	minTime: null, // Duration object that denotes the first visible time of any given day
	maxTime: null, // Duration object that denotes the exclusive visible end time of any given day
	usesMinMaxTime: false, // whether minTime/maxTime will affect the activeRange. Views must opt-in.

	// DEPRECATED
	start: null, // use activeRange.start
	end: null, // use activeRange.end
	intervalStart: null, // use currentRange.start
	intervalEnd: null, // use currentRange.end


	/* Date Range Computation
	------------------------------------------------------------------------------------------------------------------*/


	setDateProfileForRendering: function(dateProfile) {
		this.currentRange = dateProfile.currentRange;
		this.currentRangeUnit = dateProfile.currentRangeUnit;
		this.renderRange = dateProfile.renderRange;
		this.activeRange = dateProfile.activeRange;
		this.validRange = dateProfile.validRange;
		this.dateIncrement = dateProfile.dateIncrement;
		this.minTime = dateProfile.minTime;
		this.maxTime = dateProfile.maxTime;

		// DEPRECATED, but we need to keep it updated
		this.start = dateProfile.activeRange.start;
		this.end = dateProfile.activeRange.end;
		this.intervalStart = dateProfile.currentRange.start;
		this.intervalEnd = dateProfile.currentRange.end;
	},


	// Builds a structure with info about what the dates/ranges will be for the "prev" view.
	buildPrevDateProfile: function(date) {
		var prevDate = date.clone().startOf(this.currentRangeUnit).subtract(this.dateIncrement);

		return this.buildDateProfile(prevDate, -1);
	},


	// Builds a structure with info about what the dates/ranges will be for the "next" view.
	buildNextDateProfile: function(date) {
		var nextDate = date.clone().startOf(this.currentRangeUnit).add(this.dateIncrement);

		return this.buildDateProfile(nextDate, 1);
	},


	// Builds a structure holding dates/ranges for rendering around the given date.
	// Optional direction param indicates whether the date is being incremented/decremented
	// from its previous value. decremented = -1, incremented = 1 (default).
	buildDateProfile: function(date, direction, forceToValid) {
		var validRange = this.buildValidRange();
		var minTime = null;
		var maxTime = null;
		var currentInfo;
		var renderRange;
		var activeRange;
		var isValid;

		if (forceToValid) {
			date = constrainDate(date, validRange);
		}

		currentInfo = this.buildCurrentRangeInfo(date, direction);
		renderRange = this.buildRenderRange(currentInfo.range, currentInfo.unit);
		activeRange = cloneRange(renderRange);

		if (!this.opt('showNonCurrentDates')) {
			activeRange = constrainRange(activeRange, currentInfo.range);
		}

		minTime = moment.duration(this.opt('minTime'));
		maxTime = moment.duration(this.opt('maxTime'));
		this.adjustActiveRange(activeRange, minTime, maxTime);

		activeRange = constrainRange(activeRange, validRange);
		date = constrainDate(date, activeRange);

		// it's invalid if the originally requested date is not contained,
		// or if the range is completely outside of the valid range.
		isValid = doRangesIntersect(currentInfo.range, validRange);

		return {
			validRange: validRange,
			currentRange: currentInfo.range,
			currentRangeUnit: currentInfo.unit,
			activeRange: activeRange,
			renderRange: renderRange,
			minTime: minTime,
			maxTime: maxTime,
			isValid: isValid,
			date: date,
			dateIncrement: this.buildDateIncrement(currentInfo.duration)
				// pass a fallback (might be null) ^
		};
	},


	// Builds an object with optional start/end properties.
	// Indicates the minimum/maximum dates to display.
	buildValidRange: function() {
		return this.getRangeOption('validRange', this.calendar.getNow()) || {};
	},


	// Builds a structure with info about the "current" range, the range that is
	// highlighted as being the current month for example.
	// See buildDateProfile for a description of `direction`.
	// Guaranteed to have `range` and `unit` properties. `duration` is optional.
	buildCurrentRangeInfo: function(date, direction) {
		var duration = null;
		var unit = null;
		var range = null;
		var dayCount;

		if (this.viewSpec.duration) {
			duration = this.viewSpec.duration;
			unit = this.viewSpec.durationUnit;
			range = this.buildRangeFromDuration(date, direction, duration, unit);
		}
		else if ((dayCount = this.opt('dayCount'))) {
			unit = 'day';
			range = this.buildRangeFromDayCount(date, direction, dayCount);
		}
		else if ((range = this.buildCustomVisibleRange(date))) {
			unit = computeGreatestUnit(range.start, range.end);
		}
		else {
			duration = this.getFallbackDuration();
			unit = computeGreatestUnit(duration);
			range = this.buildRangeFromDuration(date, direction, duration, unit);
		}

		this.normalizeCurrentRange(range, unit); // modifies in-place

		return { duration: duration, unit: unit, range: range };
	},


	getFallbackDuration: function() {
		return moment.duration({ days: 1 });
	},


	// If the range has day units or larger, remove times. Otherwise, ensure times.
	normalizeCurrentRange: function(range, unit) {

		if (/^(year|month|week|day)$/.test(unit)) { // whole-days?
			range.start.stripTime();
			range.end.stripTime();
		}
		else { // needs to have a time?
			if (!range.start.hasTime()) {
				range.start.time(0); // give 00:00 time
			}
			if (!range.end.hasTime()) {
				range.end.time(0); // give 00:00 time
			}
		}
	},


	// Mutates the given activeRange to have time values (un-ambiguate)
	// if the minTime or maxTime causes the range to expand.
	// TODO: eventually activeRange should *always* have times.
	adjustActiveRange: function(range, minTime, maxTime) {
		var hasSpecialTimes = false;

		if (this.usesMinMaxTime) {

			if (minTime < 0) {
				range.start.time(0).add(minTime);
				hasSpecialTimes = true;
			}

			if (maxTime > 24 * 60 * 60 * 1000) { // beyond 24 hours?
				range.end.time(maxTime - (24 * 60 * 60 * 1000));
				hasSpecialTimes = true;
			}

			if (hasSpecialTimes) {
				if (!range.start.hasTime()) {
					range.start.time(0);
				}
				if (!range.end.hasTime()) {
					range.end.time(0);
				}
			}
		}
	},


	// Builds the "current" range when it is specified as an explicit duration.
	// `unit` is the already-computed computeGreatestUnit value of duration.
	buildRangeFromDuration: function(date, direction, duration, unit) {
		var alignment = this.opt('dateAlignment');
		var start = date.clone();
		var end;
		var dateIncrementInput;
		var dateIncrementDuration;

		// if the view displays a single day or smaller
		if (duration.as('days') <= 1) {
			if (this.isHiddenDay(start)) {
				start = this.skipHiddenDays(start, direction);
				start.startOf('day');
			}
		}

		// compute what the alignment should be
		if (!alignment) {
			dateIncrementInput = this.opt('dateIncrement');

			if (dateIncrementInput) {
				dateIncrementDuration = moment.duration(dateIncrementInput);

				// use the smaller of the two units
				if (dateIncrementDuration < duration) {
					alignment = computeDurationGreatestUnit(dateIncrementDuration, dateIncrementInput);
				}
				else {
					alignment = unit;
				}
			}
			else {
				alignment = unit;
			}
		}

		start.startOf(alignment);
		end = start.clone().add(duration);

		return { start: start, end: end };
	},


	// Builds the "current" range when a dayCount is specified.
	buildRangeFromDayCount: function(date, direction, dayCount) {
		var customAlignment = this.opt('dateAlignment');
		var runningCount = 0;
		var start = date.clone();
		var end;

		if (customAlignment) {
			start.startOf(customAlignment);
		}

		start.startOf('day');
		start = this.skipHiddenDays(start, direction);

		end = start.clone();
		do {
			end.add(1, 'day');
			if (!this.isHiddenDay(end)) {
				runningCount++;
			}
		} while (runningCount < dayCount);

		return { start: start, end: end };
	},


	// Builds a normalized range object for the "visible" range,
	// which is a way to define the currentRange and activeRange at the same time.
	buildCustomVisibleRange: function(date) {
		var visibleRange = this.getRangeOption(
			'visibleRange',
			this.calendar.moment(date) // correct zone. also generates new obj that avoids mutations
		);

		if (visibleRange && (!visibleRange.start || !visibleRange.end)) {
			return null;
		}

		return visibleRange;
	},


	// Computes the range that will represent the element/cells for *rendering*,
	// but which may have voided days/times.
	buildRenderRange: function(currentRange, currentRangeUnit) {
		// cut off days in the currentRange that are hidden
		return this.trimHiddenDays(currentRange);
	},


	// Compute the duration value that should be added/substracted to the current date
	// when a prev/next operation happens.
	buildDateIncrement: function(fallback) {
		var dateIncrementInput = this.opt('dateIncrement');
		var customAlignment;

		if (dateIncrementInput) {
			return moment.duration(dateIncrementInput);
		}
		else if ((customAlignment = this.opt('dateAlignment'))) {
			return moment.duration(1, customAlignment);
		}
		else if (fallback) {
			return fallback;
		}
		else {
			return moment.duration({ days: 1 });
		}
	},


	// Remove days from the beginning and end of the range that are computed as hidden.
	trimHiddenDays: function(inputRange) {
		return {
			start: this.skipHiddenDays(inputRange.start),
			end: this.skipHiddenDays(inputRange.end, -1, true) // exclusively move backwards
		};
	},


	// Compute the number of the give units in the "current" range.
	// Will return a floating-point number. Won't round.
	currentRangeAs: function(unit) {
		var currentRange = this.currentRange;
		return currentRange.end.diff(currentRange.start, unit, true);
	},


	// Arguments after name will be forwarded to a hypothetical function value
	// WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
	// Always clone your objects if you fear mutation.
	getRangeOption: function(name) {
		var val = this.opt(name);

		if (typeof val === 'function') {
			val = val.apply(
				null,
				Array.prototype.slice.call(arguments, 1)
			);
		}

		if (val) {
			return this.calendar.parseRange(val);
		}
	},


	/* Hidden Days
	------------------------------------------------------------------------------------------------------------------*/


	// Initializes internal variables related to calculating hidden days-of-week
	initHiddenDays: function() {
		var hiddenDays = this.opt('hiddenDays') || []; // array of day-of-week indices that are hidden
		var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
		var dayCnt = 0;
		var i;

		if (this.opt('weekends') === false) {
			hiddenDays.push(0, 6); // 0=sunday, 6=saturday
		}

		for (i = 0; i < 7; i++) {
			if (
				!(isHiddenDayHash[i] = $.inArray(i, hiddenDays) !== -1)
			) {
				dayCnt++;
			}
		}

		if (!dayCnt) {
			throw 'invalid hiddenDays'; // all days were hidden? bad.
		}

		this.isHiddenDayHash = isHiddenDayHash;
	},


	// Is the current day hidden?
	// `day` is a day-of-week index (0-6), or a Moment
	isHiddenDay: function(day) {
		if (moment.isMoment(day)) {
			day = day.day();
		}
		return this.isHiddenDayHash[day];
	},


	// Incrementing the current day until it is no longer a hidden day, returning a copy.
	// DOES NOT CONSIDER validRange!
	// If the initial value of `date` is not a hidden day, don't do anything.
	// Pass `isExclusive` as `true` if you are dealing with an end date.
	// `inc` defaults to `1` (increment one day forward each time)
	skipHiddenDays: function(date, inc, isExclusive) {
		var out = date.clone();
		inc = inc || 1;
		while (
			this.isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]
		) {
			out.add(inc, 'days');
		}
		return out;
	}

});
