
var EventDef = Class.extend({

	source: null, // required

	id: null, // normalized supplied ID
	rawId: null, // unnormalized supplied ID
	uid: null, // internal ID. new ID for every definition

	title: null,
	rendering: null,
	constraint: null,
	overlap: null,
	className: null, // an array. TODO: rename to className*s* (API breakage)
	miscProps: null,


	constructor: function(source) {
		this.source = source;
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

		copy.title = this.title;
		copy.rendering = this.rendering;
		copy.constraint = this.constraint;
		copy.overlap = this.overlap;
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
		var obj = {
			_id: this.uid,
			source: this.source,
			className: this.className // should clone?
		};

		if (this.rawId != null) {
			obj.id = this.rawId;
		}

		if (this.title != null) {
			obj.title = this.title;
		}

		if (this.rendering != null) {
			obj.rendering = this.rendering;
		}

		return obj;
	}

});


EventDef.uuid = 0;


// Reserved Properties
// ---------------------------------------------------------------------------------------------------------------------


EventDef.reservedPropMap = {};


EventDef.addReservedProps = function(propNames) {
	var map = {};
	var i;

	for (i = 0; i < propNames.length; i++) {
		map[propNames[i]] = true;
	}

	// won't modify original object. don't want side-effects on superclasses
	this.reservedPropMap = $.extend({}, this.reservedPropMap, map);
};


EventDef.isReservedProp = function(propName) {
	return this.reservedPropMap[propName] || false;
};


EventDef.addReservedProps([ 'id', 'title', 'rendering', 'constraint', 'overlap' ]);


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventDef.parse = function(rawProps, source) {
	var def = new this(source);
	var className; // an array
	var propName;
	var miscProps = {};

	var calendarTransform = source.calendar.opt('eventDataTransform');
	var sourceTransform = source.eventDataTransform;

	if (calendarTransform) {
		rawProps = calendarTransform(rawProps);
	}
	if (sourceTransform) {
		rawProps = sourceTransform(rawProps);
	}

	className = rawProps.className || [];
	if (typeof className === 'string') {
		className = className.split(/\s+/);
	}

	if (rawProps.id != null) {
		def.id = EventDef.normalizeId((def.rawId = rawProps.id));
	}
	else {
		def.id = EventDef.generateId();
	}

	def.uid = String(EventDef.uuid++);
	def.title = rawProps.title || '';
	def.rendering = rawProps.rendering || null;
	def.constraint = rawProps.constraint || null;
	def.overlap = rawProps.overlap || null;
	def.className = className;

	for (propName in rawProps) {
		if (!this.isReservedProp(propName)) {
			miscProps[propName] = rawProps[propName];
		}
	}

	def.miscProps = miscProps;

	return def;
};


EventDef.normalizeId = function(id) {
	return String(id);
};


EventDef.generateId = function() {
	return '_fc' + (EventDef.uuid++);
};
