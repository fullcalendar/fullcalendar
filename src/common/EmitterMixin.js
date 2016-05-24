
var EmitterMixin = FC.EmitterMixin = {

	callbackHash: null,


	on: function(name, callback) {
		this.loopCallbacks(name, 'add', [ callback ]);

		return this; // for chaining
	},


	off: function(name, callback) {
		this.loopCallbacks(name, 'remove', [ callback ]);

		return this; // for chaining
	},


	trigger: function(name) { // args...
		var args = Array.prototype.slice.call(arguments, 1);

		this.triggerWith(name, this, args);

		return this; // for chaining
	},


	triggerWith: function(name, context, args) {
		this.loopCallbacks(name, 'fireWith', [ context, args ]);

		return this; // for chaining
	},


	/*
	Given an event name string with possible namespaces,
	call the given methodName on all the internal Callback object with the given arguments.
	*/
	loopCallbacks: function(name, methodName, args) {
		var parts = name.split('.'); // "click.namespace" -> [ "click", "namespace" ]
		var i, part;
		var callbackObj;

		for (i = 0; i < parts.length; i++) {
			part = parts[i];
			if (part) { // in case no event name like "click"
				callbackObj = this.ensureCallbackObj((i ? '.' : '') + part); // put periods in front of namespaces
				callbackObj[methodName].apply(callbackObj, args);
			}
		}
	},


	ensureCallbackObj: function(name) {
		if (!this.callbackHash) {
			this.callbackHash = {};
		}
		if (!this.callbackHash[name]) {
			this.callbackHash[name] = $.Callbacks();
		}
		return this.callbackHash[name];
	}

};