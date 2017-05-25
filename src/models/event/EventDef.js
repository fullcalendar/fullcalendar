
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

		EventDef.copyVerbatimProps(this, copy);

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

		EventDef.copyVerbatimProps(this, obj);

		return obj;
	}

});


EventDef.uuid = 0;


// Verbatim Properties
// ---------------------------------------------------------------------------------------------------------------------


EventDef.VERBATIM_PROPS = [
	'title', 'url', 'rendering', 'constraint', 'overlap',
	'editable', 'startEditable', 'durationEditable', 'resourceEditable',
	'color', 'backgroundColor', 'borderColor', 'textColor'
];


EventDef.copyVerbatimProps = function(src, dest) {
	this.VERBATIM_PROPS.forEach(function(propName) {
		if (src[propName] != null) {
			dest[propName] = src[propName];
		}
	});
};


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventDef.parse = function(rawInput, source) {
	var calendarTransform = source.calendar.opt('eventDataTransform');
	var sourceTransform = source.eventDataTransform;

	if (calendarTransform) {
		rawInput = calendarTransform(rawInput);
	}
	if (sourceTransform) {
		rawInput = sourceTransform(rawInput);
	}

	return this.pluckAndParse($.extend({}, rawInput), source);
};


EventDef.pluckAndParse = function(rawProps, source) {
	// pluck
	var rawId = pluckProp(rawProps, 'id');
	var className = pluckProp(rawProps, 'className');

	// instantiate and parse...
	var def = new this(source);

	def.uid = String(EventDef.uuid++);

	if (rawId == null) {
		def.id = EventDef.generateId();
	}
	else {
		def.id = EventDef.normalizeId((def.rawId = rawId));
	}

	// can make DRY with EventSource
	if (typeof className === 'string') {
		def.className = className.split(/\s+/);
	}
	else if ($.isArray(className)) {
		def.className = className;
	}

	// raw input object might have specified
	// intercepted earlier
	delete rawProps.source;

	// transfer all other simple props
	$.extend(def, pluckProps(rawProps, EventDef.VERBATIM_PROPS));

	// leftovers are misc props
	def.miscProps = rawProps;

	return def;
};


EventDef.normalizeId = function(id) {
	return String(id);
};


EventDef.generateId = function() {
	return '_fc' + (EventDef.uuid++);
};
