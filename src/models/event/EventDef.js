
var EventDef = Class.extend({

	source: null, // required

	id: null, // normalized supplied ID
	rawId: null, // unnormalized supplied ID
	uid: null, // internal ID. new ID for every definition

	title: null,
	url: null,
	rendering: null,
	constraint: null,
	overlap: null,
	editable: null,
	startEditable: null,
	durationEditable: null,
	resourceEditable: null,
	color: null,
	backgroundColor: null,
	borderColor: null,
	textColor: null,

	className: null, // an array. TODO: rename to className*s* (API breakage)
	miscProps: null,


	constructor: function(source) {
		this.uid = String(EventDef.uuid++);
		this.source = source;
		this.className = [];
		this.miscProps = {};
	},


	isAllDay: function() {
		// subclasses must implement
	},


	buildInstances: function(start, end) {
		// subclasses must implement
	},


	clone: function() {
		var copy = new this.constructor(this.source);

		copy.id = this.id;
		copy.rawId = this.rawId;
		copy.uid = this.uid; // not really unique anymore :(

		EventDef.copyVerbatimStandardProps(this, copy);

		copy.className = this.className; // should clone?
		copy.miscProps = $.extend({}, this.miscProps);

		return copy;
	},


	hasInverseRendering: function() {
		return this.getRendering() === 'inverse-background';
	},


	hasBgRendering: function() {
		var rendering = this.getRendering();

		return rendering === 'inverse-background' || rendering === 'background';
	},


	getRendering: function() {
		if (this.rendering != null) {
			return this.rendering;
		}

		return this.source.rendering;
	},


	getConstraint: function() {
		if (this.constraint != null) {
			return this.constraint;
		}

		if (this.source.constraint != null) {
			return this.source.constraint;
		}

		return this.source.calendar.opt('eventConstraint');
	},


	getOverlap: function() {
		if (this.overlap != null) {
			return this.overlap;
		}

		if (this.source.overlap != null) {
			return this.source.overlap;
		}

		return this.source.calendar.opt('eventOverlap');
	},


	toLegacy: function() {
		var obj = $.extend({}, this.miscProps);

		obj._id = this.uid;
		obj.source = this.source;
		obj.className = this.className; // should clone?
		obj.allDay = this.isAllDay();

		if (this.rawId != null) {
			obj.id = this.rawId;
		}

		EventDef.copyVerbatimStandardProps(this, obj);

		return obj;
	},


	// Standard Prop Parsing System, for the INSTANCE
	// -----------------------------------------------------------------------------------------------------------------


	handledStandardPropMap: {},
	verbatimStandardPropMap: {},
	standardPropHandlers: [],


	isStandardProp: function(propName) {
		return this.verbatimStandardPropMap[propName] ||
			this.handledStandardPropMap[propName];
	},


	applyStandardProps: function(rawProps) {
		var handlers = this.standardPropHandlers;
		var rawHandled = {}; // to be handled
		var propName;
		var i;

		for (propName in this.handledStandardPropMap) {
			if (rawProps[propName] != null) {
				rawHandled[propName] = rawProps[propName];
			}
		}

		for (i = 0; i < handlers.length; i++) {
			if (handlers[i].call(this, rawProps) === false) {
				return false;
			}
		}

		for (propName in this.verbatimStandardPropMap) {
			if (rawProps[propName] != null) {
				this[propName] = rawProps[propName];
			}
		}
	}

});


// ID
// ---------------------------------------------------------------------------------------------------------------------


EventDef.uuid = 0;


EventDef.normalizeId = function(id) {
	return String(id);
};


EventDef.generateId = function() {
	return '_fc' + (EventDef.uuid++);
};


// Standard Prop Parsing System, for class self-definition
// ---------------------------------------------------------------------------------------------------------------------


EventDef.defineStandardPropHandler = function(propNames, handler) {
	var proto = this.prototype;
	var map = proto.handledStandardPropMap = $.extend({}, proto.handledStandardPropMap);
	var i;

	for (i = 0; i < propNames.length; i++) {
		map[propNames[i]] = true;
	}

	proto.standardPropHandlers = proto.standardPropHandlers.concat(handler);
};


EventDef.defineVerbatimStandardProps = function(propNames) {
	var proto = this.prototype;
	var map = proto.verbatimStandardPropMap = $.extend({}, proto.verbatimStandardPropMap);
	var i;

	for (i = 0; i < propNames.length; i++) {
		map[propNames[i]] = true;
	}
};


EventDef.copyVerbatimStandardProps = function(src, dest) {
	var map = this.prototype.verbatimStandardPropMap;
	var propName;

	for (propName in map) {
		if (src[propName] != null) {
			dest[propName] = src[propName];
		}
	}
};


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventDef.parse = function(rawInput, source) {
	var def = new this(source);
	var calendarTransform = source.calendar.opt('eventDataTransform');
	var sourceTransform = source.eventDataTransform;
	var rawStandardProps = {};
	var miscProps = {};
	var propName;

	if (calendarTransform) {
		rawInput = calendarTransform(rawInput);
	}
	if (sourceTransform) {
		rawInput = sourceTransform(rawInput);
	}

	for (propName in rawInput) {
		if (def.isStandardProp(propName)) {
			rawStandardProps[propName] = rawInput[propName];
		}
		else {
			miscProps[propName] = rawInput[propName];
		}
	}

	if (def.applyStandardProps(rawStandardProps) === false) {
		return false;
	}

	def.miscProps = miscProps;

	return def;
};


// Definitions for this abstract EventDef class
// ---------------------------------------------------------------------------------------------------------------------


EventDef.defineStandardPropHandler([
	'id',
	'className',
	'source' // will ignored
], function(rawProps) {

	if (rawProps.id == null) {
		this.id = EventDef.generateId();
	}
	else {
		this.id = EventDef.normalizeId((this.rawId = rawProps.id));
	}

	// can make DRY with EventSource
	if ($.isArray(rawProps.className)) {
		this.className = rawProps.className;
	}
	else if (typeof rawProps.className === 'string') {
		this.className = rawProps.className.split(/\s+/);
	}
});


EventDef.defineVerbatimStandardProps([
	'title',
	'url',
	'rendering',
	'constraint',
	'overlap',
	'editable',
	'startEditable',
	'durationEditable',
	'resourceEditable',
	'color',
	'backgroundColor',
	'borderColor',
	'textColor'
]);
