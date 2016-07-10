/*
Options binding/triggering system.
*/
Calendar.mixin({

	// A map of option names to arrays of handler objects. Initialized to {} in Calendar.
	// Format for a handler object:
	// {
	//   func // callback function to be called upon change
	//   names // option names whose values should be given to func
	// }
	optionHandlers: null, 

	// Calls handlerFunc immediately, and when the given option has changed.
	// handlerFunc will be given the option value.
	bindOption: function(optionName, handlerFunc) {
		this.bindOptions([ optionName ], handlerFunc);
	},

	// Calls handlerFunc immediately, and when any of the given options change.
	// handlerFunc will be given each option value as ordered function arguments.
	bindOptions: function(optionNames, handlerFunc) {
		var handlerObj = { func: handlerFunc, names: optionNames };
		var i;

		for (i = 0; i < optionNames.length; i++) {
			this.registerOptionHandlerObj(optionNames[i], handlerObj);
		}

		this.triggerOptionHandlerObj(handlerObj);
	},

	// Puts the given handler object into the internal hash
	registerOptionHandlerObj: function(optionName, handlerObj) {
		(this.optionHandlers[optionName] || (this.optionHandlers[optionName] = []))
			.push(handlerObj);
	},

	// Reports that the given option has changed, and calls all appropriate handlers.
	triggerOptionHandlers: function(optionName) {
		var handlerObjs = this.optionHandlers[optionName] || [];
		var i;

		for (i = 0; i < handlerObjs.length; i++) {
			this.triggerOptionHandlerObj(handlerObjs[i]);
		}
	},

	// Calls the callback for a specific handler object, passing in the appropriate arguments.
	triggerOptionHandlerObj: function(handlerObj) {
		var optionNames = handlerObj.names;
		var optionValues = [];
		var i;

		for (i = 0; i < optionNames.length; i++) {
			optionValues.push(this.options[optionNames[i]]);
		}

		handlerObj.func.apply(this, optionValues); // maintain the Calendar's `this` context
	}

});
