
var EventStartEndMixin = {

	start: null,
	end: null,


	isAllDay: function() {
		return !(this.start.hasTime() || (this.end && this.end.hasTime()));
	}

};
