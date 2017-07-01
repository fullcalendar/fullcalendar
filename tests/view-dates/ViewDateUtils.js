
var ViewDateUtils = {

	expectRenderRange: function(start, end) {
		var currentView = currentCalendar.getView();
		var renderRangeStart = currentCalendar.msToUtcMoment(currentView.renderUnzonedRange.startMs, currentView.isRangeAllDay);
		var renderRangeEnd = currentCalendar.msToUtcMoment(currentView.renderUnzonedRange.endMs, currentView.isRangeAllDay);

		expect(renderRangeStart).toEqualMoment(start);
		expect(renderRangeEnd).toEqualMoment(end);
	},

	expectActiveRange: function(start, end) {
		var currentView = currentCalendar.getView();
		var activeRangeStart = currentCalendar.msToUtcMoment(currentView.activeUnzonedRange.startMs, currentView.isRangeAllDay);
		var activeRangeEnd = currentCalendar.msToUtcMoment(currentView.activeUnzonedRange.endMs, currentView.isRangeAllDay);

		expect(activeRangeStart).toEqualMoment(start);
		expect(activeRangeEnd).toEqualMoment(end);
	}

};
