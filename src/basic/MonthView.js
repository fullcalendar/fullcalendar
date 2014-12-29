
/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/

setDefaults({
	fixedWeekCount: true
});

fcViews.month = BasicView.extend({ // MonthView

	computeRange: function(date) {
		var rowCnt;
		var intervalStart, intervalEnd;
		var start, end;

		intervalStart = date.clone().stripTime().startOf('month');
		intervalEnd = intervalStart.clone().add(1, 'months');

		start = intervalStart.clone();
		start = this.skipHiddenDays(start); // move past the first week if no visible days
		start.startOf('week');
		start = this.skipHiddenDays(start); // move past the first invisible days of the week

		end = intervalEnd.clone();
		end = this.skipHiddenDays(end, -1, true); // move in from the last week if no visible days
		end.add((7 - end.weekday()) % 7, 'days'); // move to end of week if not already
		end = this.skipHiddenDays(end, -1, true); // move in from the last invisible days of the week

		rowCnt = Math.ceil( // need to ceil in case there are hidden days
			end.diff(start, 'weeks', true) // returnfloat=true
		);
		if (this.isFixedWeeks()) {
			end.add(6 - rowCnt, 'weeks');
			rowCnt = 6;
		}

		return {
			start: start,
			end: end,
			intervalStart: intervalStart,
			intervalEnd: intervalEnd
		};
	},


	// Overrides the default BasicView behavior to have special multi-week auto-height logic
	setGridHeight: function(height, isAuto) {

		isAuto = isAuto || this.opt('weekMode') === 'variable'; // LEGACY: weekMode is deprecated

		// if auto, make the height of each row the height that it would be if there were 6 weeks
		if (isAuto) {
			height *= this.rowCnt / 6;
		}

		distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
	},


	isFixedWeeks: function() {
		var weekMode = this.opt('weekMode'); // LEGACY: weekMode is deprecated
		if (weekMode) {
			return weekMode === 'fixed'; // if any other type of weekMode, assume NOT fixed
		}

		return this.opt('fixedWeekCount');
	}

});
