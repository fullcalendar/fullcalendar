
var RecurringEventDefinition = EventDefinition.extend({

	startTime: null,
	endTime: null,
	dowHash: null,


	buildInstances: function(start, end) {
		var date = start.clone();
		var instanceStart, instanceEnd;
		var eventInstances = [];

		while (date.isBefore(end)) {

			// if everyday, or this particular day-of-week
			if (!this.dowHash || this.dowHash[date.day()]) {

				instanceStart = date.clone();
				instanceEnd = null;

				if (this.startTime) {
					instanceStart.time(this.startTime);
				}
				else {
					instanceStart.stripTime();
				}

				if (this.endTime) {
					instanceEnd = date.clone().time(this.endTime);
				}

				eventInstances.push(
					new EventInstance(
						this, // definition
						new EventDateProfile(instanceStart, instanceEnd)
					)
				);
			}

			date.add(1, 'days');
		}

		return eventInstances;
	},


	setDow: function(dowArray) {
		if (!this.dowHash) {
			this.dowHash = {};
		}

		for (var i = 0; i < dowArray.length; i++) {
			this.dowHash[dowArray[i]] = true;
		}
	},


	clone: function() {
		var def = EventDefinition.prototype.clone.call(this);

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
	}

});


RecurringEventDefinition.addReservedProps([ 'start', 'end', 'dow' ]);


RecurringEventDefinition.parse = function(rawProps) {
	var def = EventDefinition.parse.apply(this, arguments); // a RecurringEventDefinition

	if (rawProps.start) {
		def.startTime = moment.duration(rawProps.start);
	}

	if (rawProps.end) {
		def.endTime = moment.duration(rawProps.end);
	}

	if (rawProps.dow) {
		def.setDow(rawProps.dow);
	}

	return def;
};
