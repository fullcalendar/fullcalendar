
View.mixin({

	// range the view is formally responsible for.
	// for example, a month view might have 1st-31st, excluding padded dates
	currentUnzonedRange: null,
	currentRangeUnit: null, // name of largest unit being displayed, like "month" or "week"

	isRangeAllDay: false,

	// date range with a rendered skeleton
	// includes not-active days that need some sort of DOM
	renderUnzonedRange: null,

	// dates that display events and accept drag-n-drop
	activeUnzonedRange: null,

	// constraint for where prev/next operations can go and where events can be dragged/resized to.
	// an object with optional start and end properties.
	validUnzonedRange: null,

	// how far the current date will move for a prev/next operation
	dateIncrement: null,

	minTime: null, // Duration object that denotes the first visible time of any given day
	maxTime: null, // Duration object that denotes the exclusive visible end time of any given day
	usesMinMaxTime: false, // whether minTime/maxTime will affect the activeUnzonedRange. Views must opt-in.

	// DEPRECATED
	start: null, // use activeUnzonedRange
	end: null, // use activeUnzonedRange
	intervalStart: null, // use currentUnzonedRange
	intervalEnd: null, // use currentUnzonedRange


	/* Date Range Computation
	------------------------------------------------------------------------------------------------------------------*/


	setDateProfileForRendering: function(dateProfile) {
		var calendar = this.calendar;

		this.currentUnzonedRange = dateProfile.currentUnzonedRange;
		this.currentRangeUnit = dateProfile.currentRangeUnit;
		this.isRangeAllDay = dateProfile.isRangeAllDay;
		this.renderUnzonedRange = dateProfile.renderUnzonedRange;
		this.activeUnzonedRange = dateProfile.activeUnzonedRange;
		this.validUnzonedRange = dateProfile.validUnzonedRange;
		this.dateIncrement = dateProfile.dateIncrement;
		this.minTime = dateProfile.minTime;
		this.maxTime = dateProfile.maxTime;

		// DEPRECATED, but we need to keep it updated...
		this.start = calendar.msToMoment(dateProfile.activeUnzonedRange.startMs, this.isRangeAllDay);
		this.end = calendar.msToMoment(dateProfile.activeUnzonedRange.endMs, this.isRangeAllDay);
		this.intervalStart = calendar.msToMoment(dateProfile.currentUnzonedRange.startMs, this.isRangeAllDay);
		this.intervalEnd = calendar.msToMoment(dateProfile.currentUnzonedRange.endMs, this.isRangeAllDay);

		this.title = this.computeTitle();
		this.calendar.reportViewDatesChanged(this, dateProfile);
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
		var isDateAllDay = !date.hasTime();
		var validUnzonedRange = this.buildValidRange();
		var minTime = null;
		var maxTime = null;
		var currentInfo;
		var renderUnzonedRange;
		var activeUnzonedRange;
		var isValid;

		if (forceToValid) {
			date = this.calendar.msToUtcMoment(
				validUnzonedRange.constrainDate(date), // returns MS
				isDateAllDay
			);
		}

		currentInfo = this.buildCurrentRangeInfo(date, direction);
		renderUnzonedRange = this.buildRenderRange(currentInfo.unzonedRange, currentInfo.unit);
		activeUnzonedRange = renderUnzonedRange.clone();

		if (!this.opt('showNonCurrentDates')) {
			activeUnzonedRange = activeUnzonedRange.intersect(currentInfo.unzonedRange);
		}

		minTime = moment.duration(this.opt('minTime'));
		maxTime = moment.duration(this.opt('maxTime'));
		activeUnzonedRange = this.adjustActiveRange(activeUnzonedRange, minTime, maxTime);

		activeUnzonedRange = activeUnzonedRange.intersect(validUnzonedRange);

		if (activeUnzonedRange) {
			date = this.calendar.msToUtcMoment(
				activeUnzonedRange.constrainDate(date), // returns MS
				isDateAllDay
			);
		}

		// it's invalid if the originally requested date is not contained,
		// or if the range is completely outside of the valid range.
		isValid = currentInfo.unzonedRange.intersectsWith(validUnzonedRange);

		return {
			validUnzonedRange: validUnzonedRange,
			currentUnzonedRange: currentInfo.unzonedRange,
			currentRangeUnit: currentInfo.unit,
			isRangeAllDay: /^(year|month|week|day)$/.test(currentInfo.unit),
			activeUnzonedRange: activeUnzonedRange,
			renderUnzonedRange: renderUnzonedRange,
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
		return this.getUnzonedRangeOption('validRange', this.calendar.getNow()) ||
			new UnzonedRange(); // completely open-ended
	},


	// Builds a structure with info about the "current" range, the range that is
	// highlighted as being the current month for example.
	// See buildDateProfile for a description of `direction`.
	// Guaranteed to have `range` and `unit` properties. `duration` is optional.
	// TODO: accept a MS-time instead of a moment `date`?
	buildCurrentRangeInfo: function(date, direction) {
		var duration = null;
		var unit = null;
		var unzonedRange = null;
		var dayCount;

		if (this.viewSpec.duration) {
			duration = this.viewSpec.duration;
			unit = this.viewSpec.durationUnit;
			unzonedRange = this.buildRangeFromDuration(date, direction, duration, unit);
		}
		else if ((dayCount = this.opt('dayCount'))) {
			unit = 'day';
			unzonedRange = this.buildRangeFromDayCount(date, direction, dayCount);
		}
		else if ((unzonedRange = this.buildCustomVisibleRange(date))) {
			unit = computeGreatestUnit(unzonedRange.getStart(), unzonedRange.getEnd());
		}
		else {
			duration = this.getFallbackDuration();
			unit = computeGreatestUnit(duration);
			unzonedRange = this.buildRangeFromDuration(date, direction, duration, unit);
		}

		return { duration: duration, unit: unit, unzonedRange: unzonedRange };
	},


	getFallbackDuration: function() {
		return moment.duration({ days: 1 });
	},


	// Returns a new activeUnzonedRange to have time values (un-ambiguate)
	// minTime or maxTime causes the range to expand.
	adjustActiveRange: function(unzonedRange, minTime, maxTime) {
		var start = unzonedRange.getStart();
		var end = unzonedRange.getEnd();

		if (this.usesMinMaxTime) {

			if (minTime < 0) {
				start.time(0).add(minTime);
			}

			if (maxTime > 24 * 60 * 60 * 1000) { // beyond 24 hours?
				end.time(maxTime - (24 * 60 * 60 * 1000));
			}
		}

		return new UnzonedRange(start, end);
	},


	// Builds the "current" range when it is specified as an explicit duration.
	// `unit` is the already-computed computeGreatestUnit value of duration.
	// TODO: accept a MS-time instead of a moment `date`?
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

		return new UnzonedRange(start, end);
	},


	// Builds the "current" range when a dayCount is specified.
	// TODO: accept a MS-time instead of a moment `date`?
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

		return new UnzonedRange(start, end);
	},


	// Builds a normalized range object for the "visible" range,
	// which is a way to define the currentUnzonedRange and activeUnzonedRange at the same time.
	// TODO: accept a MS-time instead of a moment `date`?
	buildCustomVisibleRange: function(date) {
		var visibleUnzonedRange = this.getUnzonedRangeOption(
			'visibleRange',
			this.calendar.applyTimezone(date) // correct zone. also generates new obj that avoids mutations
		);

		if (visibleUnzonedRange && (visibleUnzonedRange.startMs === null || visibleUnzonedRange.endMs === null)) {
			return null;
		}

		return visibleUnzonedRange;
	},


	// Computes the range that will represent the element/cells for *rendering*,
	// but which may have voided days/times.
	buildRenderRange: function(currentUnzonedRange, currentRangeUnit) {
		// cut off days in the currentUnzonedRange that are hidden
		return this.trimHiddenDays(currentUnzonedRange);
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
	trimHiddenDays: function(inputUnzonedRange) {
		var start = inputUnzonedRange.getStart();
		var end = inputUnzonedRange.getEnd();

		start = this.skipHiddenDays(start);
		end = this.skipHiddenDays(end, -1, true);

		return new UnzonedRange(start, end);
	},


	// Compute the number of the give units in the "current" range.
	// Will return a floating-point number. Won't round.
	currentRangeAs: function(unit) {
		var currentUnzonedRange = this.currentUnzonedRange;

		return moment.utc(currentUnzonedRange.endMs).diff(
			moment.utc(currentUnzonedRange.startMs),
			unit,
			true
		);
	},


	// For ChronoComponent::getDayClasses
	isDateInOtherMonth: function(date) {
		return false;
	},


	// Arguments after name will be forwarded to a hypothetical function value
	// WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
	// Always clone your objects if you fear mutation.
	getUnzonedRangeOption: function(name) {
		var val = this.opt(name);

		if (typeof val === 'function') {
			val = val.apply(
				null,
				Array.prototype.slice.call(arguments, 1)
			);
		}

		if (val) {
			return this.calendar.parseUnzonedRange(val);
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
	// DOES NOT CONSIDER validUnzonedRange!
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
