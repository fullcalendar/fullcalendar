
var RenderQueue = TaskQueue.extend({

	waitsByNamespace: null,
	waitNamespace: null,
	waitId: null,
	isKilled: false, // prevents any new tasks from being added


	constructor: function(waitsByNamespace) {
		TaskQueue.call(this); // super-constructor

		this.waitsByNamespace = waitsByNamespace || {};
	},


	/*
	all args are required
	*/
	queue: function(entityId, namespace, type, taskFunc) {

		if (this.isKilled) {
			return;
		}

		var task = {
			entityId: entityId,
			namespace: namespace,
			type: type,
			func: taskFunc
		};
		var waitMs;

		if (namespace) {
			waitMs = this.waitsByNamespace[namespace];
		}

		if (this.waitNamespace) {
			if (namespace === this.waitNamespace && waitMs != null) {
				this.delayWait(waitMs);
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


	/*
	Prevents any new tasks from being added AND clears all tasks related to rendering *new* things,
	however, keeps destroy-related tasks to allow proper cleanup.
	*/
	kill: function() {
		this.isKilled = true;
		this.q = this.q.filter(function(task) {
			return task.type === 'destroy-trigger' || task.type === 'destroy';
		});
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


	canRunNext: function() {
		return TaskQueue.prototype.canRunNext.apply(this, arguments) &&
			!this.isKilled &&
			(!this.waitNamespace || this.q[0].namespace !== this.waitNamespace);
	},


	runTask: function(task) {
		this.runTaskFunc(task.func);
	},


	compoundTask: function(newTask) {
		var q = this.q;
		var shouldAppend = true;
		var i, task;

		if (newTask.type === 'destroy') {

			// remove ops with same entityId and namespace
			for (i = q.length - 1; i >= 0; i--) {
				task = q[i];

				if (
					task.entityId === newTask.entityId &&
					task.namespace === newTask.namespace
				) {
					if (task.type === 'init') { // cancels out the destroy
						shouldAppend = false;
					}

					if (task.type === 'destroy-trigger' && shouldAppend) {
						; // a destroy will still happen, so keep this task
					}
					else {
						q.splice(i, 1); // remove task
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
