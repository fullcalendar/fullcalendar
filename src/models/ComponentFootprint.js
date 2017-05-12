
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
