
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
			this._props[name] = val;
			this.trigger('change:' + name, val);
		}
	},

	unset: function(name) {
		if (this.has(name)) {
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
		var len = depList.length;
		var satisfyCnt = 0;
		var values = {}; // what's passed as the `deps` arguments
		var watchMap = {};

		function reportUpdate(depName, val) {

			if (val !== undefined) { // set

				if (!(depName in values)) { // not previously set
					values[depName] = val;
					satisfyCnt++;

					if (satisfyCnt === len) { // finally now satisfied
						startFunc(values);
					}
				}
				else { // was previously set
					if (satisfyCnt === len) { // was satisfied
						stopFunc();
						values[depName] = val;
						startFunc(values);
					}
					else {
						values[depName] = val;
					}
				}
			}
			else { // unset

				if (depName in values) { // previously set
					delete values[depName];
					satisfyCnt--;

					if (satisfyCnt === len - 1) { // was previously satisfied
						stopFunc();
					}
				}
				// else, not previously set. who cares.
			}
		}

		depList.forEach(function(depName) {
			var onChange = function(val) {
				reportUpdate(depName, val);
			};

			_this.on('change:' + depName, onChange);
			watchMap[depName] = onChange;
		});

		if (!len) { // no deps, so resolve immediately
			startFunc(values);
		}
		else {
			depList.forEach(function(depName) {
				if (_this.has(depName)) {
					reportUpdate(depName, _this.get(depName));
				}
			});
		}

		return function() { // teardown
			var depName;

			for (depName in watchMap) {
				_this.off('change:' + depName, watchMap[depName]);
			}

			if (satisfyCnt === len) { // was satisfied
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

