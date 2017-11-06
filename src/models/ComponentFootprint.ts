
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


	/*
	Only works for non-open-ended ranges.
	*/
	toLegacy: function(calendar) {
		return {
			start: calendar.msToMoment(this.unzonedRange.startMs, this.isAllDay),
			end: calendar.msToMoment(this.unzonedRange.endMs, this.isAllDay)
		};
	}

});
