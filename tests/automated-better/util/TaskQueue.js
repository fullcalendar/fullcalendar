
describe('TaskQueue', function() {
	var TaskQueue = $.fullCalendar.TaskQueue;

	it('executes first task immediately', function() {
		var q = new TaskQueue();
		var ops = [];

		q.queue(function() {
			ops.push('run1');
		});

		expect(ops).toEqual([ 'run1' ]);
	});

	it('executes second task after first has fully completed', function() {
		var q = new TaskQueue();
		var ops = [];

		q.queue(function() {
			ops.push('start1');

			q.queue(function() {
				ops.push('run2');
			});

			ops.push('end1');
		});

		expect(ops).toEqual([ 'start1', 'end1', 'run2' ]);
	});

	it('executes second task after first promise resolves', function(done) {
		var q = new TaskQueue();
		var ops = [];

		q.queue(function() {
			var deferred = $.Deferred();

			ops.push('start1');

			q.queue(function() {
				ops.push('run2');
			});

			setTimeout(function() {
				ops.push('end1');
				deferred.resolve();
			}, 100);

			return deferred.promise();
		});

		setTimeout(function() {
			expect(ops).toEqual([ 'start1', 'end1', 'run2' ]);
			done();
		}, 200);
	});
});
