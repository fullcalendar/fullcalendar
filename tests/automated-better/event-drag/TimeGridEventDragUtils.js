
var TimeGridEventDragUtils = {

	drag: function(startDate, endDate, debug) {

		startDate = $.fullCalendar.moment.parseZone(startDate);
		endDate = $.fullCalendar.moment.parseZone(endDate);

		var startRect = TimeGridEventRenderUtils.computeSpanRects(
			startDate,
			startDate.clone().add({ minutes: 30 }) // hardcoded 30 minute slot :(
		)[0];
		var endRect = TimeGridEventRenderUtils.computeSpanRects(
			endDate,
			endDate.clone().add({ minutes: 30 }) // hardcoded 30 minute slot :(
		)[0];

		return EventDragUtils.drag(
			startRect,
			endRect,
			debug
		);
	}

};
