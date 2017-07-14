
var ParsableModelMixin = {

	standardPropMap: {}, // will be cloned by allowRawProps


	/*
	Returns true/false for success
	*/
	applyRawProps: function(rawProps) {
		var standardPropMap = this.standardPropMap;
		var manualProps = {};
		var otherProps = {};
		var propName;

		for (propName in rawProps) {
			if (standardPropMap[propName] === true) { // copy automatically
				this[propName] = rawProps[propName];
			}
			else if (standardPropMap[propName] === false) {
				manualProps[propName] = rawProps[propName];
			}
			else {
				otherProps[propName] = rawProps[propName];
			}
		}

		this.applyOtherRawProps(otherProps);

		return this.applyManualRawProps(manualProps);
	},


	/*
	If subclasses override, they must call this supermethod and return the boolean response.
	*/
	applyManualRawProps: function(rawProps) {
		return true;
	},


	applyOtherRawProps: function(rawProps) {
		// subclasses can implement
	}

};


/*
TODO: devise a better system
*/
var ParsableModelMixin_allowRawProps = function(propDefs) {
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
