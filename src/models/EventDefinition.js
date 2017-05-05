
var EventDefinition = Class.extend({

	source: null,
	id: null,
	title: null,
	rendering: null,
	miscProps: null,

	constructor: function(rawProps, source, calendar) {
		this.source = source;
		this.id = rawProps.id || ('_fc' + (++EventDefinition.uuid));
		this.title = rawProps.title || '';
		this.rendering = rawProps.rendering || null;

		this.assignMiscProps(rawProps);
	},

	assignMiscProps: function(rawProps) {
		var miscProps = {};
		var name;

		for (name in rawProps) {
			if (!this.isStandardProp(name)) {
				miscProps[name] = rawProps[name];
			}
		}

		this.miscProps = miscProps;
	},

	isStandardProp: function(name) {
		return name === 'id' || name === 'title' || name === 'rendering';
	},

	buildPeriod: function(start, end) {
	}
});

EventDefinition.uuid = 0;



function isEventInputRecurring(eventInput) {
	var start = eventInput.start || eventInput.date;
	var end = eventInput.end;

	return eventInput.dow ||
		(isTimeString(start) || moment.isDuration(start)) ||
		(end && (isTimeString(start) || moment.isDuration(start)));
}



var RecurringEventDefinition = EventDefinition.extend({

	startTime: null,
	endTime: null,
	dow: null,

	constructor: function(rawProps, source, calendar) {
		EventDefinition.apply(this, arguments);

		this.startTime = moment.duration(rawProps.start);
		this.endTime = rawProps.end ? moment.duration(rawProps.end) : null;
		this.dow = rawProps.dow;
	},

	isStandardProp: function(name) {
		return EventDefinition.prototype.isStandardProp(name) ||
			name === 'start' || name === 'end' || name === 'dow';
	},

	buildPeriod: function(start, end) {
	}
});



var SingleEventDefinition = EventDefinition.extend({

	start: null,
	end: null,

	constructor: function(rawProps, source, calendar) {
		EventDefinition.apply(this, arguments);

		this.start = calendar.moment(rawProps.start || rawProps.date); // 'date' is an alias
		this.end = rawProps.end ? calendar.moment(rawProps.end) : null;
	},

	isStandardProp: function(name) {
		return EventDefinition.prototype.isStandardProp(name) ||
			name === 'start' || name === 'end' || name === 'date'; // 'date' is an alias
	},

	buildPeriod: function() {
	}
});
