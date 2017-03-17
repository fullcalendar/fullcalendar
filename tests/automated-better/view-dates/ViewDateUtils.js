
var ViewDateUtils = {

	expectRenderRange: function(start, end) {
		var currentView = currentCalendar.getView();
		expect(currentView.renderRange.start).toEqualMoment(start);
		expect(currentView.renderRange.end).toEqualMoment(end);
	},

	expectActiveRange: function(start, end) {
		var currentView = currentCalendar.getView();
		expect(currentView.activeRange.start).toEqualMoment(start);
		expect(currentView.activeRange.end).toEqualMoment(end);
	}

};
