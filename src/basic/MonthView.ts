
/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/


var MonthViewDateProfileGenerator = BasicViewDateProfileGenerator.extend({

	// Computes the date range that will be rendered.
	buildRenderRange: function(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
		var renderUnzonedRange = BasicViewDateProfileGenerator.prototype.buildRenderRange.apply(this, arguments);
		var start = this.msToUtcMoment(renderUnzonedRange.startMs, isRangeAllDay);
		var end = this.msToUtcMoment(renderUnzonedRange.endMs, isRangeAllDay);
		var rowCnt;

		// ensure 6 weeks
		if (this.opt('fixedWeekCount')) {
			rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
				end.diff(start, 'weeks', true) // dontRound=true
			);
			end.add(6 - rowCnt, 'weeks');
		}

		return new UnzonedRange(start, end);
	}

});


var MonthView = FC.MonthView = BasicView.extend({

	dateProfileGeneratorClass: MonthViewDateProfileGenerator,


	// Overrides the default BasicView behavior to have special multi-week auto-height logic
	setGridHeight: function(height, isAuto) {

		// if auto, make the height of each row the height that it would be if there were 6 weeks
		if (isAuto) {
			height *= this.rowCnt / 6;
		}

		distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
	},


	isDateInOtherMonth: function(date, dateProfile) {
		return date.month() !== moment.utc(dateProfile.currentUnzonedRange.startMs).month(); // TODO: optimize
	}

});
