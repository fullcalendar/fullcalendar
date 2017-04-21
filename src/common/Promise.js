
var Promise = {

	construct: function(executor) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		if (typeof executor === 'function') {
			executor(
				function(val) { // resolve
					deferred.resolve(val);
					attachImmediatelyResolvingThen(promise, val);
				},
				function() { // reject
					deferred.reject();
					attachImmediatelyRejectingThen(promise);
				}
			);
		}

		return promise;
	},

	resolve: function(val) {
		var deferred = $.Deferred().resolve(val);
		var promise = deferred.promise();

		attachImmediatelyResolvingThen(promise, val);

		return promise;
	},

	reject: function() {
		var deferred = $.Deferred().reject();
		var promise = deferred.promise();

		attachImmediatelyRejectingThen(promise);

		return promise;
	}

};


function attachImmediatelyResolvingThen(promise, val) {
	promise.then = function(onResolve) {
		if (typeof onResolve === 'function') {
			onResolve(val);
		}
		return promise; // for chaining
	};
}


function attachImmediatelyRejectingThen(promise) {
	promise.then = function(onResolve, onReject) {
		if (typeof onReject === 'function') {
			onReject();
		}
		return promise; // for chaining
	};
}


FC.Promise = Promise;
