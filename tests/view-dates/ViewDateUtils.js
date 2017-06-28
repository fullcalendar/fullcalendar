
var ViewDateUtils = {

	expectRenderRange: function(start, end) {
		var currentView = currentCalendar.getView();
		var renderRange = currentView.renderUnzonedRange.getZonedRange(currentCalendar, currentView.isRangeAllDay);

		expect(renderRange.start).toEqualMoment(start);
		expect(renderRange.end).toEqualMoment(end);
	},

	expectActiveRange: function(start, end) {
		var currentView = currentCalendar.getView();
		var activeRange = currentView.activeUnzonedRange.getZonedRange(currentCalendar, currentView.isRangeAllDay);

		expect(activeRange.start).toEqualMoment(start);
		expect(activeRange.end).toEqualMoment(end);
	}

};
