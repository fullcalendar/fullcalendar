
var DayGridEventDragUtils = {

	drag: function(startDate, endDate, debug) {
		var el0 = DayGridRenderUtils.getSingleDayEl(startDate);
		var el1 = DayGridRenderUtils.getSingleDayEl(endDate);

		return EventDragUtils.drag(
			el0[0].getBoundingClientRect(),
			el1[0].getBoundingClientRect(),
			debug
		);
	}

};
