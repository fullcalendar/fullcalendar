
function TaskQueue() {
	var _this = this;
	var isRunning = 0;
	var q = [];

	$.extend(this, EmitterMixin);

	this.queue = function(taskFunc) {
		if (!isRunning) {
			_this.trigger('start');
			executeTaskFunc(taskFunc);
		}
		else {
			q.push(taskFunc);
		}
	};

	function executeTaskFunc(taskFunc) {
		var res;

		isRunning = true;
		res = taskFunc();

		if (res && res.then) {
			res.then(done);
		}
		else {
			done();
		}

		function done() {
			isRunning = false;

			if (q.length) {
				executeTaskFunc(q.shift());
			}
			else {
				_this.trigger('stop');
			}
		}
	}
}

FC.TaskQueue = TaskQueue;
