
/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/

var MonthView = FC.MonthView = BasicView.extend({


	// Computes the date range that will be rendered.
	buildRenderRange: function() {
		var renderUnzonedRange = BasicView.prototype.buildRenderRange.apply(this, arguments);
		var zonedRange = renderUnzonedRange.getZonedRange(this.calendar, this.isRangeAllDay);
		var rowCnt;

		// ensure 6 weeks
		if (this.isFixedWeeks()) {
			rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
				zonedRange.end.diff(zonedRange.start, 'weeks', true) // dontRound=true
			);
			zonedRange.end.add(6 - rowCnt, 'weeks');
		}

		return new UnzonedRange(zonedRange.start, zonedRange.end);
	},


	// Overrides the default BasicView behavior to have special multi-week auto-height logic
	setGridHeight: function(height, isAuto) {

		// if auto, make the height of each row the height that it would be if there were 6 weeks
		if (isAuto) {
			height *= this.rowCnt / 6;
		}

		distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
	},


	isFixedWeeks: function() {
		return this.opt('fixedWeekCount');
	},


	isDateInOtherMonth: function(date) {
		return date.month() !== moment.utc(this.currentUnzonedRange.startMs).month(); // TODO: optimize
	}

});
