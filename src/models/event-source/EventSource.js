
var EventSource = Class.extend({

	calendar: null,

	id: null,
	uid: null,
	color: null,
	backgroundColor: null,
	borderColor: null,
	textColor: null,
	className: null, // array
	editable: null,
	startEditable: null,
	durationEditable: null,
	resourceEditable: null,
	rendering: null,
	overlap: null,
	constraint: null,
	allDayDefault: null,
	eventDataTransform: null, // optional function


	constructor: function(calendar) {
		this.calendar = calendar;
		this.className = [];
		this.uid = String(EventSource.uuid++);
	},


	fetch: function(start, end, timezone) {
		// subclasses must implement. must return a promise.
	},


	removeEventDefsById: function(eventDefId) {
		// optional for subclasses to implement
	},


	/*
	For compairing/matching
	*/
	getPrimitive: function(otherSource) {
		// subclasses must implement
	},


	parseEventDefs: function(rawEventDefs) {
		var i;
		var eventDef;
		var eventDefs = [];

		for (i = 0; i < rawEventDefs.length; i++) {
			eventDef = EventDefParser.parse(
				rawEventDefs[i],
				this // source
			);

			if (eventDef) {
				eventDefs.push(eventDef);
			}
		}

		return eventDefs;
	},


	standardPropMap: {}, // will be cloned by allowRawProps


	/*
	Returns true/false for success
	*/
	applyRawProps: function(rawProps) {
		var standardPropMap = this.standardPropMap;
		var manualProps = {};
		var otherProps = {};
		var propName;

		for (propName in rawProps) {
			if (standardPropMap[propName] === true) { // copy automatically
				this[propName] = rawProps[propName];
			}
			else if (standardPropMap[propName] === false) {
				manualProps[propName] = rawProps[propName];
			}
			else {
				otherProps[propName] = rawProps[propName];
			}
		}

		this.applyOtherRawProps(otherProps);

		return this.applyManualRawProps(manualProps);
	},


	/*
	If subclasses override, they must call this supermethod and return the boolean response.
	*/
	applyManualRawProps: function(rawProps) {
		this.id = EventSource.normalizeId(rawProps.id);

		if ($.isArray(rawProps.className)) {
			this.className = rawProps.className;
		}
		if (typeof rawProps.className === 'string') {
			this.className = rawProps.className.split(/\s+/);
		}

		return true;
	},


	applyOtherRawProps: function(rawProps) {
		// subclasses can implement
	}

});


EventSource.uuid = 0;


EventSource.normalizeId = function(id) {
	if (id) {
		return String(id);
	}

	return null;
};


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventSource.allowRawProps = function(propDefs) {
	var proto = this.prototype;

	proto.standardPropMap = Object.create(proto.standardPropMap);

	copyOwnProps(propDefs, proto.standardPropMap);
};


EventSource.allowRawProps({
	// manually process...
	id: false,
	className: false,

	// automatically transfer...
	color: true,
	backgroundColor: true,
	borderColor: true,
	textColor: true,
	editable: true,
	startEditable: true,
	durationEditable: true,
	rendering: true,
	overlap: true,
	constraint: true,
	allDayDefault: true,
	eventDataTransform: true
});


/*
rawInput can be any data type!
*/
EventSource.parse = function(rawInput, calendar) {
	var source = new this(calendar);

	if (typeof rawInput === 'object') {
		if (source.applyRawProps(rawInput)) {
			return source;
		}
	}

	return false;
};


FC.EventSource = EventSource;
