
var RenderQueue = TaskQueue.extend({

	waitsByNamespace: null,
	waitNamespace: null,
	waitId: null,


	constructor: function(waitsByNamespace) {
		TaskQueue.call(this); // super-constructor

		this.waitsByNamespace = waitsByNamespace || {}
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

		if (namespace && namespace === this.waitNamespace) {
			this.delayWait(waitMs || 0);
		}
		else {
			if (this.waitNamespace) {
				this.clearWait();
				this.tryStart();
			}

			if (waitMs) {
				this.startWait(namespace, waitMs);
			}
		}

		if (this.canStart()) {
			this.q.push(task);
			this.start();
		}
		else {
			this.compoundTask(task);
			this.tryStart();
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
		return !this.waitNamespace &&
			TaskQueue.prototype.canRunNext.apply(this, arguments);
	},


	runTask: function(task) {
		this.runTaskFunc(task.func);
	},


	compoundTask: function(newTask) {
		var q = this.q;
		var shouldAppend = true;
		var i, lastTask;

		if (newTask.type === 'destroy') {

			while (q.length) {
				lastTask = q[q.length - 1];

				if (newTask.namespace && newTask.namespace === lastTask.namespace) {

					if (lastTask.type === 'add' || lastTask.type === 'remove') {
						q.pop();
						continue;
					}
					else if (lastTask.type === 'init') {
						q.pop();
						shouldAppend = false;
					}
				}

				break;
			}
		}

		if (shouldAppend) {
			q.push(newTask);
		}
	}

});

FC.RenderQueue = RenderQueue;
