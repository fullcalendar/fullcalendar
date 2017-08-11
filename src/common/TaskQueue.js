
var TaskQueue = Class.extend(EmitterMixin, {

	q: null,
	isPaused: false,
	isRunning: false,


	constructor: function() {
		this.q = [];
	},


	queue: function(/* taskFunc, taskFunc... */) {
		this.q.push.apply(this.q, arguments); // append
		this.tryStart();
	},


	pause: function() {
		this.isPaused = true;
	},


	resume: function() {
		this.isPaused = false;
		this.tryStart();
	},


	tryStart: function() {
		if (!this.isRunning && this.canRunNext()) {
			this.isRunning = true;
			this.trigger('start');
			this.runRemaining();
		}
	},


	canRunNext: function() {
		return !this.isPaused && this.q.length;
	},


	runRemaining: function() { // assumes at least one task in queue. does not check canRunNext for first task.
		var _this = this;
		var task;
		var res;

		do {
			task = this.q.shift(); // always freshly reference q. might have been reassigned.
			res = this.runTask(task);

			if (res && res.then) {
				res.then(function() {
					if (_this.canRunNext()) {
						_this.runRemaining();
					}
				});
				return; // prevent marking as stopped
			}
		} while (this.canRunNext());

		this.isRunning = false;
		this.trigger('stop'); // not really a 'stop' ... more of a 'drained'
	},


	runTask: function(task) {
		return task(); // task *is* the function, but subclasses can change the format of a task
	}

});

FC.TaskQueue = TaskQueue;
