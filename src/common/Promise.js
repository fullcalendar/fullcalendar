
/*
Wrap jQuery's Deferred Promise object to be slightly more Promise/A+ compliant.
With the added non-standard feature of synchronously executing handlers on resolved promises,
which doesn't always happen otherwise (esp with nested .then handlers!?),
so, this makes things a lot easier, esp because jQuery 3 changed the synchronicity for Deferred objects.

TODO: write tests and more comments
*/

function Promise(executor) {
	var deferred = $.Deferred();
	var promise = deferred.promise();

	if (typeof executor === 'function') {
		executor(
			function(value) { // resolve
				if (Promise.immediate) {
					promise._value = value;
				}
				deferred.resolve(value);
			},
			function() { // reject
				deferred.reject();
			}
		);
	}
	
	if (Promise.immediate) {
		var origThen = promise.then;

		promise.then = function(onFulfilled, onRejected) {
			var state = promise.state();
			
			if (state === 'resolved') {
				if (typeof onFulfilled === 'function') {
					return Promise.resolve(onFulfilled(promise._value));
				}
			}
			else if (state === 'rejected') {
				if (typeof onRejected === 'function') {
					onRejected();
					return promise; // already rejected
				}
			}

			return origThen.call(promise, onFulfilled, onRejected);
		};
	}

	return promise; // instanceof Promise will break :( TODO: make Promise a real class
}

FC.Promise = Promise;

Promise.immediate = true;


Promise.resolve = function(value) {
	if (value && typeof value.resolve === 'function') {
		return value.promise();
	}
	if (value && typeof value.then === 'function') {
		return value;
	}
	else {
		var deferred = $.Deferred().resolve(value);
		var promise = deferred.promise();

		if (Promise.immediate) {
			var origThen = promise.then;

			promise._value = value;

			promise.then = function(onFulfilled, onRejected) {
				if (typeof onFulfilled === 'function') {
					return Promise.resolve(onFulfilled(value));
				}
				return origThen.call(promise, onFulfilled, onRejected);
			};
		}

		return promise;
	}
};


Promise.reject = function() {
	return $.Deferred().reject().promise();
};


Promise.all = function(inputs) {
	var hasAllValues = false;
	var values;
	var i, input;

	if (Promise.immediate) {
		hasAllValues = true;
		values = [];

		for (i = 0; i < inputs.length; i++) {
			input = inputs[i];

			if (input && typeof input.state === 'function' && input.state() === 'resolved' && ('_value' in input)) {
				values.push(input._value);
			}
			else if (input && typeof input.then === 'function') {
				hasAllValues = false;
				break;
			}
			else {
				values.push(input);
			}
		}
	}

	if (hasAllValues) {
		return Promise.resolve(values);
	}
	else {
		return $.when.apply($.when, inputs).then(function() {
			return $.when($.makeArray(arguments));
		});
	}
};
