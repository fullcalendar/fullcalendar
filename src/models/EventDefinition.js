
var EventDefinition = Class.extend({

	source: null,
	id: null,
	title: null,
	rendering: null,
	constraint: null,
	overlap: null,
	miscProps: null,


	constructor: function() {
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


EventDefinition.parse = function(rawProps) {
	var def = new this();
	var propName;
	var miscProps = {};

	def.id = rawProps.id || ('_fc' + (++EventDefinition.uuid));
	def.title = rawProps.title || '';
	def.rendering = rawProps.rendering || null;
	def.constraint = rawProps.constraint;
	def.overlap = rawProps.overlap;

	for (propName in rawProps) {
		if (!this.isReservedProp(propName)) {
			miscProps[propName] = rawProps[propName];
		}
	}

	def.miscProps = miscProps;

	return def;
};


EventDefinition.addReservedProps([ 'id', 'title', 'rendering', 'constraint', 'overlap' ]);
