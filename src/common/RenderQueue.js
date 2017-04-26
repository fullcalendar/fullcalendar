
var RenderQueue = TaskQueue.extend({

	waitsByNamespace: null,
	waitNamespace: null,
	waitId: null,


	constructor: function(waitsByNamespace) {
		TaskQueue.call(this); // super-constructor

		this.waitsByNamespace = waitsByNamespace || {};
	},


	queue: function(taskFunc, namespace, type) {
		var task = {
			func: taskFunc,
			namespace: namespace,
			type: type
		};
		var waitMs;

		if (namespace) {
			waitMs = this.waitsByNamespace[namespace];
		}

		if (this.waitNamespace) {
			if (namespace === this.waitNamespace && waitMs != null) {
				this.delayWait(waitMs);
			}
			else {
				this.clearWait();
				this.tryStart();
			}
		}

		if (this.compoundTask(task)) { // appended to queue?

			if (!this.waitNamespace && waitMs != null) {
				this.startWait(namespace, waitMs);
			}
			else {
				this.tryStart();
			}
		}
	},


	startWait: function(namespace, waitMs) {
		this.waitNamespace = namespace;
		this.spawnWait(waitMs);
	},


	delayWait: function(waitMs) {
		clearTimeout(this.waitId);
		this.spawnWait(waitMs);
	},


	spawnWait: function(waitMs) {
		var _this = this;

		this.waitId = setTimeout(function() {
			_this.waitNamespace = null;
			_this.tryStart();
		}, waitMs);
	},


	clearWait: function() {
		if (this.waitNamespace) {
			clearTimeout(this.waitId);
			this.waitId = null;
			this.waitNamespace = null;
		}
	},


	canRunNext: function() {
		if (!TaskQueue.prototype.canRunNext.apply(this, arguments)) {
			return false;
		}

		// waiting for a certain namespace to stop receiving tasks?
		if (this.waitNamespace) {

			// if there was a different namespace task in the meantime,
			// that forces all previously-waiting tasks to suddenly execute.
			// TODO: find a way to do this in constant time.
			for (var q = this.q, i = 0; i < q.length; i++) {
				if (q[i].namespace !== this.waitNamespace) {
					return true; // allow execution
				}
			}

			return false;
		}

		return true;
	},


	runTask: function(task) {
		this.runTaskFunc(task.func);
	},


	compoundTask: function(newTask) {
		var q = this.q;
		var shouldAppend = true;
		var i, task;

		if (newTask.namespace) {

			if (newTask.type === 'destroy' || newTask.type === 'init') {

				// remove all add/remove ops with same namespace, regardless of order
				for (i = q.length - 1; i >= 0; i--) {
					task = q[i];

					if (
						task.namespace === newTask.namespace &&
						(task.type === 'add' || task.type === 'remove')
					) {
						q.splice(i, 1); // remove task
					}
				}

				if (newTask.type === 'destroy') {
					// eat away final init/destroy operation
					if (q.length) {
						task = q[q.length - 1]; // last task

						if (task.namespace === newTask.namespace) {

							// the init and our destroy cancel each other out
							if (task.type === 'init') {
								shouldAppend = false;
								q.pop();
							}
							// prefer to use the destroy operation that's already present
							else if (task.type === 'destroy') {
								shouldAppend = false;
							}
						}
					}
				}
				else if (newTask.type === 'init') {
					// eat away final init operation
					if (q.length) {
						task = q[q.length - 1]; // last task

						if (
							task.namespace === newTask.namespace &&
							task.type === 'init'
						) {
							// our init operation takes precedence
							q.pop();
						}
					}
				}
			}
		}

		if (shouldAppend) {
			q.push(newTask);
		}

		return shouldAppend;
	}

});

FC.RenderQueue = RenderQueue;
