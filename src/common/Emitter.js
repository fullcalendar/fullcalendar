
var Emitter = FC.Emitter = Class.extend({

	callbackHash: null,


	on: function(name, callback) {
		this.getCallbacks(name).add(callback);
		return this; // for chaining
	},


	off: function(name, callback) {
		this.getCallbacks(name).remove(callback);
		return this; // for chaining
	},


	trigger: function(name) { // args...
		var args = Array.prototype.slice.call(arguments, 1);

		this.triggerWith(name, this, args);

		return this; // for chaining
	},


	triggerWith: function(name, context, args) {
		var callbacks = this.getCallbacks(name);

		callbacks.fireWith(context, args);

		return this; // for chaining
	},


	getCallbacks: function(name) {
		var callbacks;

		if (!this.callbackHash) {
			this.callbackHash = {};
		}

		callbacks = this.callbackHash[name];
		if (!callbacks) {
			callbacks = this.callbackHash[name] = $.Callbacks();
		}

		return callbacks;
	}

});