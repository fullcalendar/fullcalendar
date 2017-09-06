
var EventDef = FC.EventDef = Class.extend(ParsableModelMixin, {

	source: null, // required

	id: null, // normalized supplied ID
	rawId: null, // unnormalized supplied ID
	uid: null, // internal ID. new ID for every definition

	// NOTE: eventOrder sorting relies on these
	title: null,
	url: null,
	rendering: null,
	constraint: null,
	overlap: null,
	editable: null,
	startEditable: null,
	durationEditable: null,
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


	buildInstances: function(unzonedRange) {
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

		return this.source.calendar.opt('eventConstraint'); // what about View option?
	},


	getOverlap: function() {
		if (this.overlap != null) {
			return this.overlap;
		}

		if (this.source.overlap != null) {
			return this.source.overlap;
		}

		return this.source.calendar.opt('eventOverlap'); // what about View option?
	},


	isStartExplicitlyEditable: function() {
		if (this.startEditable !== null) {
			return this.startEditable;
		}

		return this.source.startEditable;
	},


	isDurationExplicitlyEditable: function() {
		if (this.durationEditable !== null) {
			return this.durationEditable;
		}

		return this.source.durationEditable;
	},


	isExplicitlyEditable: function() {
		if (this.editable !== null) {
			return this.editable;
		}

		return this.source.editable;
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


	applyManualRawProps: function(rawProps) {

		if (rawProps.id != null) {
			this.id = EventDef.normalizeId((this.rawId = rawProps.id));
		}
		else {
			this.id = EventDef.generateId();
		}

		if (rawProps._id != null) { // accept this prop, even tho somewhat internal
			this.uid = String(rawProps._id);
		}
		else {
			this.uid = EventDef.generateId();
		}

		// TODO: converge with EventSource
		if ($.isArray(rawProps.className)) {
			this.className = rawProps.className;
		}
		if (typeof rawProps.className === 'string') {
			this.className = rawProps.className.split(/\s+/);
		}

		return true;
	},


	applyOtherRawProps: function(rawProps) {
		this.miscProps = rawProps;
	}

});

// finish initializing the mixin
EventDef.allowRawProps = ParsableModelMixin_allowRawProps;
EventDef.copyVerbatimStandardProps = ParsableModelMixin_copyVerbatimStandardProps;


// IDs
// ---------------------------------------------------------------------------------------------------------------------
// TODO: converge with EventSource


EventDef.uuid = 0;


EventDef.normalizeId = function(id) {
	return String(id);
};


EventDef.generateId = function() {
	return '_fc' + (EventDef.uuid++);
};


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventDef.allowRawProps({
	// not automatically assigned (`false`)
	_id: false,
	id: false,
	className: false,
	source: false, // will ignored

	// automatically assigned (`true`)
	title: true,
	url: true,
	rendering: true,
	constraint: true,
	overlap: true,
	editable: true,
	startEditable: true,
	durationEditable: true,
	color: true,
	backgroundColor: true,
	borderColor: true,
	textColor: true
});


EventDef.parse = function(rawInput, source) {
	var def = new this(source);
	var calendarTransform = source.calendar.opt('eventDataTransform');
	var sourceTransform = source.eventDataTransform;

	if (calendarTransform) {
		rawInput = calendarTransform(rawInput);
	}
	if (sourceTransform) {
		rawInput = sourceTransform(rawInput);
	}

	if (def.applyRawProps(rawInput)) {
		return def;
	}

	return false;
};
