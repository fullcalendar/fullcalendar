
var ComponentFootprint = Class.extend({

	dateRange: null,
	isAllDay: false,


	constructor: function(dateRange, isAllDay) {
		this.dateRange = dateRange;
		this.isAllDay = isAllDay;
	},


	toLegacy: function() {
		return this.dateRange.getRange();
	}

});


function convertFootprintToLegacySelection(footprint, calendar) {
	var start = calendar.moment(footprint.dateRange.startMs);
	var end = calendar.moment(footprint.dateRange.endMs);

	if (footprint.isAllDay) {
		start.stripTime();
		end.stripTime();
	}

	return { start: start, end: end };
}
