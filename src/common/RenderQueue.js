
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
	entityId, namespace, actionType are optional
	*/
	queue: function(taskFunc, entityId, namespace, actionType) {

		if (this.isKilled) {
			return;
		}

		var task = {
			func: taskFunc,
			entityId: entityId,
			namespace: namespace,
			actionType: actionType
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
			return task.actionType === 'destroy';
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
			(!this.waitNamespace || this.waitNamespace !== this.q[0].namespace);
	},


	runTask: function(task) {
		return task.func();
	},


	compoundTask: function(newTask) {
		var q = this.q;
		var shouldAppend = true;
		var i, task;

		if (newTask.entityId && newTask.namespace && newTask.actionType === 'destroy') {

			// remove ops with same entityId and namespace
			for (i = q.length - 1; i >= 0; i--) {
				task = q[i];

				if (
					task.entityId === newTask.entityId &&
					task.namespace === newTask.namespace
				) {
					if (task.actionType === 'init') { // cancels out the destroy
						shouldAppend = false;
					}

					q.splice(i, 1); // remove task
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
