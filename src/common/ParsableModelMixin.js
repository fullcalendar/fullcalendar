
var ParsableModelMixin = {

	standardPropMap: {}, // will be cloned by defineStandardProps


	/*
	Returns true/false for success.
	Meant to be only called ONCE, at object creation.
	*/
	applyProps: function(rawProps) {
		var standardPropMap = this.standardPropMap;
		var manualProps = {};
		var miscProps = {};
		var propName;

		for (propName in rawProps) {
			if (standardPropMap[propName] === true) { // copy verbatim
				this[propName] = rawProps[propName];
			}
			else if (standardPropMap[propName] === false) {
				manualProps[propName] = rawProps[propName];
			}
			else {
				miscProps[propName] = rawProps[propName];
			}
		}

		this.applyMiscProps(miscProps);

		return this.applyManualStandardProps(manualProps);
	},


	/*
	If subclasses override, they must call this supermethod and return the boolean response.
	Meant to be only called ONCE, at object creation.
	*/
	applyManualStandardProps: function(rawProps) {
		return true;
	},


	/*
	Can be called even after initial object creation.
	*/
	applyMiscProps: function(rawProps) {
		// subclasses can implement
	},


	/*
	TODO: why is this a method when defineStandardProps is static
	*/
	isStandardProp: function(propName) {
		return propName in this.standardPropMap;
	}

};


/*
TODO: devise a better system
*/
var ParsableModelMixin_defineStandardProps = function(propDefs) {
	var proto = this.prototype;

	if (!proto.hasOwnProperty('standardPropMap')) {
		proto.standardPropMap = Object.create(proto.standardPropMap);
	}

	copyOwnProps(propDefs, proto.standardPropMap);
};


/*
TODO: devise a better system
*/
var ParsableModelMixin_copyVerbatimStandardProps = function(src, dest) {
	var map = this.prototype.standardPropMap;
	var propName;

	for (propName in map) {
		if (
			src[propName] != null && // in the src object?
			map[propName] === true // false means "copy verbatim"
		) {
			dest[propName] = src[propName];
		}
	}
};
