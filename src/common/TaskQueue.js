
function TaskQueue() {
	var _this = this;
	var isPaused = false;
	var isRunning = 0;
	var q = [];

	$.extend(this, EmitterMixin);

	this.queue = function(/* taskFunc, taskFunc... */) {
		q.push.apply(q, arguments); // append
		tryStart();
	};

	this.pause = function() {
		isPaused = true;
	};

	this.resume = function() {
		isPaused = false;
		tryStart();
	};

	function tryStart() {
		if (!isRunning && !isPaused && q.length) {
			isRunning = true;
			_this.trigger('start');
			runNext();
		}
	}

	function runNext() { // does not check for empty q
		var taskFunc = q.shift();
		var res = taskFunc();

		if (res && res.then) {
			res.then(done);
		}
		else {
			done();
		}

		function done() {
			if (!isPaused && q.length) {
				runNext();
			}
			else {
				isRunning = false;
				_this.trigger('stop');
			}
		}
	}
}

FC.TaskQueue = TaskQueue;
