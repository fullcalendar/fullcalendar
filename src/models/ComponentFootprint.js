
/*
Meant to be immutable
*/
var ComponentFootprint = FC.ComponentFootprint = Class.extend({

	unzonedRange: null,
	isAllDay: false, // component can choose to ignore this


	constructor: function(unzonedRange, isAllDay) {
		this.unzonedRange = unzonedRange;
		this.isAllDay = isAllDay;
	},


	toLegacy: function(calendar) {
		var start = calendar.moment(this.unzonedRange.startMs);
		var end = calendar.moment(this.unzonedRange.endMs);

		if (this.isAllDay) {
			start.stripTime();
			end.stripTime();
		}

		return { start: start, end: end };
	}

});
