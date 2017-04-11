
var Model = Class.extend(EmitterMixin, ListenerMixin, {

	_props: null,
	_watchTeardowns: null,
	_globalWatchArgs: null,

	constructor: function() {
		this._watchTeardowns = {};
		this._props = {};
		this.applyGlobalWatchers();
	},

	applyGlobalWatchers: function() {
		var argSets = this._globalWatchArgs || [];
		var i;

		for (i = 0; i < argSets.length; i++) {
			this.watch.apply(this, argSets[i]);
		}
	},

	has: function(name) {
		return name in this._props;
	},

	set: function(props, val) {
		var name;

		if (typeof props === 'object') {
			for (name in props) {
				this._setProp(name, props[name]);
			}
		}
		else {
			this._setProp(props, val);
		}
	},

	_setProp: function(name, val) {
		if (val === undefined) {
			val = null;
		}

		// a change in value?
		// if an object, don't check equality, because might have been mutated internally.
		// TODO: eventually enforce immutability.
		if (
			typeof val === 'object' ||
			val !== this._props[name]
		) {
			this.trigger('before:change:' + name, val);
			this._props[name] = val;
			this.trigger('change:' + name, val);
		}
	},

	unset: function(name) {
		if (this.has(name)) {
			this.trigger('before:change:' + name, undefined);
			delete this._props[name];
			this.trigger('change:' + name, undefined);
		}
	},

	get: function(name) {
		return this._props[name];
	},

	watch: function(name, depList, startFunc, stopFunc) {
		var _this = this;

		this.unwatch(name);

		this._watchTeardowns[name] = this._watchDeps(depList, function(deps) {
			var res = startFunc.call(_this, deps);

			if (res && res.then) {
				res.then(function(val) {
					_this.set(name, val);
				});
			}
			else {
				_this.set(name, res);
			}
		}, function() {
			_this.unset(name);

			if (stopFunc) {
				stopFunc.call(_this);
			}
		});
	},

	unwatch: function(name) {
		var teardown = this._watchTeardowns[name];

		if (teardown) {
			teardown();
		}
	},

	_watchDeps: function(depList, startFunc, stopFunc) {
		var _this = this;
		var depCnt = depList.length;
		var satisfyCnt = 0;
		var values = {}; // what's passed as the `deps` arguments
		var bindTuples = []; // array of [ eventName, handlerFunc ] arrays
		var isCallingStop = false;

		function onBeforeDepChange(depName, val, isOptional) {
			if (satisfyCnt === depCnt) { // all deps previously satisfied?
				isCallingStop = true;
				stopFunc();
				isCallingStop = false;
			}
		}

		function onDepChange(depName, val, isOptional) {

			if (val === undefined) { // unsetting a value?

				// required dependency that was previously set?
				if (!isOptional && values[depName] !== undefined) {
					satisfyCnt--;
				}

				delete values[depName];
			}
			else { // setting a value?

				// required dependency that was previously unset?
				if (!isOptional && values[depName] === undefined) {
					satisfyCnt++;
				}

				values[depName] = val;
			}

			// now finally satisfied or satisfied all along?
			if (satisfyCnt === depCnt) {

				// if the stopFunc initiated another value change, ignore it.
				// it will be processed by another change event anyway.
				if (!isCallingStop) {
					startFunc(values);
				}
			}
		}

		// intercept for .on() that remembers handlers
		function bind(eventName, handler) {
			_this.on(eventName, handler);
			bindTuples.push([ eventName, handler ]);
		}

		// listen to dependency changes
		depList.forEach(function(depName) {
			var isOptional = false;

			if (depName.charAt(0) === '?') { // TODO: more DRY
				depName = depName.substring(1);
				isOptional = true;
			}

			bind('before:change:' + depName, function(val) {
				onBeforeDepChange(depName, val, isOptional);
			});

			bind('change:' + depName, function(val) {
				onDepChange(depName, val, isOptional);
			});
		});

		// process current dependency values
		depList.forEach(function(depName) {
			var isOptional = false;

			if (depName.charAt(0) === '?') { // TODO: more DRY
				depName = depName.substring(1);
				isOptional = true;
			}

			if (_this.has(depName)) {
				values[depName] = _this.get(depName);
				satisfyCnt++;
			}
			else if (isOptional) {
				satisfyCnt++;
			}
		});

		// initially satisfied
		if (satisfyCnt === depCnt) {
			startFunc(values);
		}

		return function() { // teardown

			// remove all handlers
			for (var i = 0; i < bindTuples.length; i++) {
				_this.off(bindTuples[i][0], bindTuples[i][1]);
			}
			bindTuples = null;

			// was satisfied, so call stopFunc
			if (satisfyCnt === depCnt) {
				stopFunc();
			}
		};
	}

});


Model.watch = function(/* same arguments as this.watch() */) {
	var proto = this.prototype;

	if (!proto._globalWatchArgs) {
		proto._globalWatchArgs = [];
	}

	proto._globalWatchArgs.push(arguments);
};


FC.Model = Model;

