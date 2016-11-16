
// TODO: write tests and clean up code

function RunQueue() {
	var _this = this;
	var q = []; // array of runFuncs
	var completedCnt = 0;

	$.extend(this, EmitterMixin);

	this.add = function(taskFunc) {
		return new Promise(function(resolve) {

			// should run this function when it's taskFunc's turn to run.
			// responsible for popping itself off the queue.
			var runFunc = function() {
				Promise.resolve(taskFunc()) // result might be async, coerce to promise
					.then(resolve) // resolve RunQueue::push's promise, for the caller. will receive result of taskFunc.
					.then(function() {
						q.shift(); // pop itself off

						completedCnt++;
						_this.trigger('add');

						// run the next task, if any
						if (q.length) {
							q[0]();
						}
					});
			};

			// always put the task at the end of the queue, BEFORE running the task
			q.push(runFunc);

			// if it's the only task in the queue, run immediately
			if (q.length === 1) {
				runFunc();
			}
		});
	};

	this.completed = function() {
		return completedCnt;
	};

	this.forgetCompleted = function() {
		completedCnt = 0;
	};

	this.promise = function() {
		if (this.completedCnt) {
			return Promise.resolve();
		}
		return new Promise(function(resolve) {
			_this.one('add', resolve);
		});
	};
}

FC.RunQueue = RunQueue;

/*
q = new RunQueue();

function work(i) {
	return q.push(function() {
		trigger();
		console.log('work' + i);
	});
}

var cnt = 0;

function trigger() {
	if (cnt < 5) {
		cnt++;
		work(cnt);
	}
}

work(9);
*/
