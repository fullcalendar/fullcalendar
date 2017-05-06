
var RecurringEventDefinition = EventDefinition.extend({

	startTime: null,
	endTime: null,
	dowHash: null,

	constructor: function(rawProps, source, calendar) {
		EventDefinition.apply(this, arguments);

		this.startTime = moment.duration(rawProps.start);
		this.endTime = rawProps.end ? moment.duration(rawProps.end) : null;

		if (rawProps.dow) {
			this.dowHash = this.buildDowHash(rawProps.dow);
		}
	},

	isStandardProp: function(name) {
		return EventDefinition.prototype.isStandardProp(name) ||
			name === 'start' || name === 'end' || name === 'dow';
	},

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

	buildDowHash: function(dowArray) {
		var dowHash = {};
		var i;

		// make a boolean hash as to whether the event occurs on each day-of-week
		for (i = 0; i < dowArray.length; i++) {
			dowHash[dowArray[i]] = true;
		}

		return dowHash;
	}

});
