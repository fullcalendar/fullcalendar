
var EventDefinition = Class.extend({

	source: null,
	id: null,
	title: null,
	rendering: null,
	miscProps: null,

	// calendar needed for zoned moment instantiation
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

	buildInstances: function(start, end) {
		// subclasses must implement
	}

});

EventDefinition.uuid = 0;

