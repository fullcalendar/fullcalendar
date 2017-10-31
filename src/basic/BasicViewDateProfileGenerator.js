
var BasicViewDateProfileGenerator = DateProfileGenerator.extend({

	// Computes the date range that will be rendered.
	buildRenderRange: function(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
		var renderUnzonedRange = DateProfileGenerator.prototype.buildRenderRange.apply(this, arguments); // an UnzonedRange
		var start = this.msToUtcMoment(renderUnzonedRange.startMs, isRangeAllDay);
		var end = this.msToUtcMoment(renderUnzonedRange.endMs, isRangeAllDay);

		// year and month views should be aligned with weeks. this is already done for week
		if (/^(year|month)$/.test(currentRangeUnit)) {
			start.startOf('week');

			// make end-of-week if not already
			if (end.weekday()) {
				end.add(1, 'week').startOf('week'); // exclusively move backwards
			}
		}

		return new UnzonedRange(start, end);
	}

});
