
var EventDefinition = Class.extend({

	source: null,
	id: null,
	title: null,
	rendering: null,
	constraint: null,
	overlap: null,
	miscProps: null,
	className: null, // an array. TODO: rename to className*s*


	constructor: function(source) {
		this.source = source;
		this.miscProps = {};
	},


	buildInstances: function(start, end) {
		// subclasses must implement
	},


	clone: function() {
		var copy = new this.constructor();

		copy.source = this.source;
		copy.id = this.id;
		copy.title = this.title;
		copy.rendering = this.rendering;
		copy.constraint = this.constraint;
		copy.overlap = this.overlap;
		copy.miscProps = $.extend({}, this.miscProps);

		return copy;
	},


	getRendering: function() {
		if (this.rendering != null) {
			return this.rendering;
		}
		if (this.source) {
			return this.source.rendering;
		}
	},


	isInverseBgEvent: function() {
		return this.getRendering() === 'inverse-background';
	},


	isBgEvent: function() {
		var rendering = this.getRendering();

		return rendering === 'inverse-background' || rendering === 'background';
	},


	getConstraint: function(calendar) {
		if (this.constraint != null) {
			return this.constraint;
		}

		if (this.source && this.source.constraint != null) {
			return this.source.constraint;
		}

		return calendar.opt('eventConstraint');
	},


	getOverlap: function(calendar) {
		if (this.overlap != null) {
			return this.overlap;
		}

		if (this.source && this.source.overlap != null) {
			return this.source.overlap;
		}

		if (calendar) {
			return calendar.opt('eventOverlap');
		}
	}


});


EventDefinition.uuid = 0;
EventDefinition.reservedPropMap = {};


EventDefinition.addReservedProps = function(propArray) {
	var map = {};
	var i;

	for (i = 0; i < propArray.length; i++) {
		map[propArray[i]] = true;
	}

	// won't modify original object. don't want sideeffects on superclasses
	this.reservedPropMap = $.extend({}, this.reservedPropMap, map);
};


EventDefinition.isReservedProp = function(propName) {
	return this.reservedPropMap[propName] || false;
};


EventDefinition.parse = function(rawProps, source, calendar) {
	var def = new this(source);
	var propName;
	var miscProps = {};
	var className;

	var calendarTransform = calendar.opt('eventDataTransform');
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

	def.id = rawProps.id || ('_fc' + (++EventDefinition.uuid));
	def.title = rawProps.title || '';
	def.rendering = rawProps.rendering || null;
	def.constraint = rawProps.constraint;
	def.overlap = rawProps.overlap;
	def.className = className;

	for (propName in rawProps) {
		if (!this.isReservedProp(propName)) {
			miscProps[propName] = rawProps[propName];
		}
	}

	def.miscProps = miscProps;

	return def;
};


EventDefinition.addReservedProps([ 'id', 'title', 'rendering', 'constraint', 'overlap' ]);
