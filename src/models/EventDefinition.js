
var EventDefinition = Class.extend({

	source: null,
	id: null,
	title: null,
	rendering: null,
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
		copy.miscProps = $.extend({}, this.miscProps);

		return copy;
	}

});


EventDefinition.uuid = 0;
EventDefinition.reservedPropMap = {};


EventDefinition.addReservedProps = function(props) {
	var map = {};
	var propName;

	for (propName in props) {
		map[propName] = true;
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

	for (propName in rawProps) {
		if (!this.isReservedProp(propName)) {
			miscProps[propName] = rawProps[propName];
		}
	}

	def.miscProps = miscProps;

	return def;
};


EventDefinition.addReservedProps([ 'id', 'title', 'rendering' ]);
