
function TaskQueue() {
	var _this = this;
	var isRunning = 0;
	var q = [];

	$.extend(this, EmitterMixin);

	this.queue = function(/* taskFunc, taskFunc... */) {
		q.push.apply(q, arguments); // append

		if (!isRunning) {
			isRunning = true;
			_this.trigger('start');

			if (q.length) { // at least one new task added?
				runNext();
			}
		}
	};

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
			if (q.length) {
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
