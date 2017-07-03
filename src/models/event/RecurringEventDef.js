
var RecurringEventDef = EventDef.extend({

	startTime: null, // duration
	endTime: null, // duration, or null
	dowHash: null, // object hash, or null


	isAllDay: function() {
		return !this.startTime && !this.endTime;
	},


	buildInstances: function(unzonedRange) {
		var calendar = this.source.calendar;
		var unzonedDate = unzonedRange.getStart();
		var unzonedEnd = unzonedRange.getEnd();
		var zonedDayStart;
		var instanceStart, instanceEnd;
		var instances = [];

		while (unzonedDate.isBefore(unzonedEnd)) {

			// if everyday, or this particular day-of-week
			if (!this.dowHash || this.dowHash[unzonedDate.day()]) {

				zonedDayStart = calendar.applyTimezone(unzonedDate);
				instanceStart = zonedDayStart.clone();
				instanceEnd = null;

				if (this.startTime) {
					instanceStart.time(this.startTime);
				}
				else {
					instanceStart.stripTime();
				}

				if (this.endTime) {
					instanceEnd = zonedDayStart.clone().time(this.endTime);
				}

				instances.push(
					new EventInstance(
						this, // definition
						new EventDateProfile(instanceStart, instanceEnd, calendar)
					)
				);
			}

			unzonedDate.add(1, 'days');
		}

		return instances;
	},


	setDow: function(dowNumbers) {

		if (!this.dowHash) {
			this.dowHash = {};
		}

		for (var i = 0; i < dowNumbers.length; i++) {
			this.dowHash[dowNumbers[i]] = true;
		}
	},


	clone: function() {
		var def = EventDef.prototype.clone.call(this);

		if (def.startTime) {
			def.startTime = moment.duration(this.startTime);
		}

		if (def.endTime) {
			def.endTime = moment.duration(this.endTime);
		}

		if (this.dowHash) {
			def.dowHash = $.extend({}, this.dowHash);
		}

		return def;
	},


	/*
	NOTE: if super-method fails, should still attempt to apply
	*/
	applyRawProps: function(rawProps) {
		var superSuccess = EventDef.prototype.applyRawProps.apply(this, arguments);

		if (rawProps.start) {
			this.startTime = moment.duration(rawProps.start);
		}

		if (rawProps.end) {
			this.endTime = moment.duration(rawProps.end);
		}

		if (rawProps.dow) {
			this.setDow(rawProps.dow);
		}

		return superSuccess;
	}

});


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


RecurringEventDef.allowRawProps({ // false = manually process
	start: false,
	end: false,
	dow: false
});
