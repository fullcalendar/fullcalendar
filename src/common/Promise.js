
var Promise = {

	construct: function(executor) {
		var deferred = $.Deferred();

		if (typeof executor === 'function') {
			executor(
				function(value) { // resolve
					deferred.resolve(value);
				},
				function() { // reject
					deferred.reject();
				}
			);
		}

		return deferred.promise();
	},

	resolve: function(val) {
		var deferred = $.Deferred().resolve(val);
		var promise = deferred.promise();

		// make .then callback execute immediately
		promise.then = function(onResolve) {
			if (typeof onResolve === 'function') {
				onResolve(val);
			}
		};

		return promise;
	},

	reject: function() {
		var deferred = $.Deferred().reject();
		var promise = deferred.promise();

		// make .then callback execute immediately
		promise.then = function(onResolve, onReject) {
			if (typeof onReject === 'function') {
				onReject();
			}
		};

		return promise;
	}

};

FC.Promise = Promise;
