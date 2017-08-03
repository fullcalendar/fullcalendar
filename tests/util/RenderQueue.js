
describe('RenderQueue', function() {
	var RenderQueue = $.fullCalendar.RenderQueue;

	it('executes atomic events in sequence', function() {
		var ops = [];
		var q = new RenderQueue();

		q.queue('foo', 'init', function() {
			ops.push('fooinit');
		});

		q.queue('foo', 'add', function() {
			ops.push('fooremove');
		});

		q.queue('foo', 'remove', function() {
			ops.push('fooadd');
		});

		q.queue('foo', 'destroy', function() {
			ops.push('foodestroy');
		});

		expect(ops).toEqual([ 'fooinit', 'fooremove', 'fooadd', 'foodestroy' ]);
	});

	describe('when accumulating', function() {

		describe('using clear action', function() {

			it('destroys add/remove operations in same namespace', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue('foo', 'add', function() {
					ops.push('fooadd');
				});

				q.queue('foo', 'remove', function() {
					ops.push('fooremove');
				});

				q.queue('foo', 'destroy', function() {
					ops.push('foodestroy');
				});

				expect(ops).toEqual([]);
				q.resume();
				expect(ops).toEqual([ 'foodestroy' ]);
			});

			it('is cancelled out by an init in same namespace', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue('bar', 'init', function() {
					ops.push('barinit');
				});

				q.queue('foo', 'init', function() {
					ops.push('fooinit');
				});

				q.queue('foo', 'add', function() {
					ops.push('fooadd');
				});

				q.queue('foo', 'remove', function() {
					ops.push('fooadd');
				});

				q.queue('foo', 'destroy', function() {
					ops.push('fooadd');
				});

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

			q.queue('foo', 'init', function() {
				ops.push('fooinit');
			});

			q.queue('foo', 'add', function() {
				ops.push('fooadd');
			});

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

			q.queue('foo', 'init', function() {
				ops.push('fooinit');
			});

 			setTimeout(function() {
				q.queue('foo', 'add', function() {
					ops.push('fooadd');
				});
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

			q.queue('foo', 'init', function() {
				ops.push('fooinit');
			});

			q.queue('foo', 'add', function() {
				ops.push('fooadd');
			});

			expect(ops).toEqual([]);

			q.queue('bar', 'init', function() {
				ops.push('barinit');
			});

			expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ]);
		});

		it('synchronously executes queue when async non-namespace operation happens', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100,
				bar: 100
			});

			q.queue('foo', 'init', function() {
				ops.push('fooinit');
			});

			q.queue('foo', 'add', function() {
				ops.push('fooadd');
			});

			expect(ops).toEqual([]);

			q.queue('bar', 'init', function() {
				ops.push('barinit');
			});

			expect(ops).toEqual([ 'fooinit', 'fooadd' ]);

			setTimeout(function() {
				expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ]);
				done();
			}, 200);
		});

		it('resumes non-waiting tasks when unpaused', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.pause();

			q.queue('bar', 'init', function() {
				ops.push('barinit');
			});

			q.queue('foo', 'init', function() {
				ops.push('fooinit');
			});

			q.resume();
			expect(ops).toEqual([ 'barinit' ]);

			setTimeout(function() {
				expect(ops).toEqual([ 'barinit', 'fooinit' ]);
				done();
			}, 200);
		});

		it('paused+queued tasks from a previous namespace wait resume immediately', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.pause();

			q.queue('foo', 'destroy', function() {
				ops.push('foodestroy');
			});

			q.queue('bar', 'destroy', function() {
				ops.push('bardestroy');
			});

			expect(ops).toEqual([]);

			q.queue('bar', 'init', function() {
				ops.push('barinit');
			});

			q.queue('foo', 'init', function() {
				ops.push('fooinit');
			});

			expect(ops).toEqual([]);

			q.resume();
			expect(ops).toEqual([ 'foodestroy', 'bardestroy', 'barinit' ]);

			setTimeout(function() {
				expect(ops).toEqual([ 'foodestroy', 'bardestroy', 'barinit', 'fooinit' ]);
				done();
			}, 200);
		});
	});
});
