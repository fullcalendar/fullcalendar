
var ViewUtils = {

	expectRange: function(start, end) {
		var currentView = currentCalendar.getView();
		expect(currentView.start).toEqualMoment(start);
		expect(currentView.end).toEqualMoment(end);
	}

};
