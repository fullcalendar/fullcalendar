
function TaskQueue() {
	var isRunning = 0;
	var q = [];

	this.queue = function(taskFunc) {
		if (!isRunning) {
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
		}
	}
}

FC.TaskQueue = TaskQueue;
