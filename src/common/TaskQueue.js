
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
			this.runNext();
		}
	},


	canRunNext: function() {
		return !this.isPaused && this.q.length;
	},


	runNext: function() { // does not check canRunNext
		this.runTask(this.q.shift());
	},


	runTask: function(task) {
		this.runTaskFunc(task);
	},


	runTaskFunc: function(taskFunc) {
		var _this = this;
		var res = taskFunc();

		if (res && res.then) {
			res.then(done);
		}
		else {
			done();
		}

		function done() {
			if (_this.canRunNext()) {
				_this.runNext();
			}
			else {
				_this.isRunning = false;
				_this.trigger('stop');
			}
		}
	}

});

FC.TaskQueue = TaskQueue;
