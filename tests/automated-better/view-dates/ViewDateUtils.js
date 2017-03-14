
var ViewDateUtils = {

	expectRenderRange: function(start, end) {
		var currentView = currentCalendar.getView();
		expect(currentView.renderRange.start).toEqualMoment(start);
		expect(currentView.renderRange.end).toEqualMoment(end);
	},

	expectVisibleRange: function(start, end) {
		var currentView = currentCalendar.getView();
		expect(currentView.visibleRange.start).toEqualMoment(start);
		expect(currentView.visibleRange.end).toEqualMoment(end);
	}

};
