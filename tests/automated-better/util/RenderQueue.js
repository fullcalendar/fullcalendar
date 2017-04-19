
describe('RenderQueue', function() {
	var RenderQueue = $.fullCalendar.RenderQueue;

	it('executes atomic events in sequence', function() {
		var ops = [];
		var q = new RenderQueue();

		q.queue(function() {
			ops.push('fooinit');
		}, 'foo', 'init');

		q.queue(function() {
			ops.push('fooremove');
		}, 'foo', 'add');

		q.queue(function() {
			ops.push('fooadd');
		}, 'foo', 'remove');

		q.queue(function() {
			ops.push('foodestroy');
		}, 'foo', 'destroy');

		expect(ops).toEqual([ 'fooinit', 'fooremove', 'fooadd', 'foodestroy' ]);
	});

	describe('when accumulating', function() {

		describe('using clear action', function() {

			it('destroys add/remove operations in same namespace', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue(function() {
					ops.push('fooadd');
				}, 'foo', 'add');

				q.queue(function() {
					ops.push('fooremove');
				}, 'foo', 'remove');

				q.queue(function() {
					ops.push('foodestroy');
				}, 'foo', 'destroy');

				expect(ops).toEqual([]);
				q.resume();
				expect(ops).toEqual([ 'foodestroy' ]);
			});

			it('is cancelled out by an init in same namespace', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue(function() {
					ops.push('barinit');
				}, 'foo', 'init');

				q.queue(function() {
					ops.push('fooinit');
				}, 'foo', 'init');

				q.queue(function() {
					ops.push('fooadd');
				}, 'foo', 'add');

				q.queue(function() {
					ops.push('fooadd');
				}, 'foo', 'remove');

				q.queue(function() {
					ops.push('fooadd');
				}, 'foo', 'destroy');

				expect(ops).toEqual([]);
				q.resume();
				expect(ops).toEqual([ 'barinit' ]);
			});
		});
	});

	describe('when namespace has a wait value', function() {

		it('unpauses when done', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.queue(function() {
				ops.push('fooinit');
			}, 'foo', 'init');

			q.queue(function() {
				ops.push('fooadd');
			}, 'foo', 'add');

			expect(ops).toEqual([]);

			setTimeout(function() {
				expect(ops).toEqual([ 'fooinit', 'fooadd' ]);
				done();
			}, 200);
		});

		it('restarts timer when new operation happens', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.queue(function() {
				ops.push('fooinit');
			}, 'foo', 'init');

 			setTimeout(function() {
				q.queue(function() {
					ops.push('fooadd');
				}, 'foo', 'add');
			}, 50);

			setTimeout(function() {
				expect(ops).toEqual([]);
			}, 125);

			setTimeout(function() {
				expect(ops).toEqual([ 'fooinit', 'fooadd' ]);
				done();
			}, 175);
		});

		it('synchronously executes queue when sync non-namespace operation happens', function() {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.queue(function() {
				ops.push('fooinit');
			}, 'foo', 'init');

			q.queue(function() {
				ops.push('fooadd');
			}, 'foo', 'add');

			expect(ops).toEqual([]);

			q.queue(function() {
				ops.push('barinit');
			}, 'bar', 'init');

			expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ]);
		});

		it('synchronously executes queue when async non-namespace operation happens', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100,
				bar: 100
			});

			q.queue(function() {
				ops.push('fooinit');
			}, 'foo', 'init');

			q.queue(function() {
				ops.push('fooadd');
			}, 'foo', 'add');

			expect(ops).toEqual([]);

			q.queue(function() {
				ops.push('barinit');
			}, 'bar', 'init');

			expect(ops).toEqual([ 'fooinit', 'fooadd' ]);

			setTimeout(function() {
				expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ]);
				done();
			}, 200);
		});
	});
});
