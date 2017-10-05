
var ParsableModelMixin = {

	standardPropMap: {}, // will be cloned by defineStandardProps


	/*
	Returns true/false for success
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
	*/
	applyManualStandardProps: function(rawProps) {
		return true;
	},


	applyMiscProps: function(rawProps) {
		// subclasses can implement
	}

};


/*
TODO: devise a better system
*/
var ParsableModelMixin_defineStandardProps = function(propDefs) {
	var proto = this.prototype;

	proto.standardPropMap = Object.create(proto.standardPropMap);

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
