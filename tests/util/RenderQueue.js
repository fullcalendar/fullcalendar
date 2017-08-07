
describe('RenderQueue', function() {
	var RenderQueue = $.fullCalendar.RenderQueue;

	it('executes atomic events in sequence', function() {
		var ops = [];
		var q = new RenderQueue();

		q.queue('ent0', 'foo', 'init', function() {
			ops.push('fooinit');
		});

		q.queue('ent0', 'foo', 'add', function() {
			ops.push('fooremove');
		});

		q.queue('ent0', 'foo', 'remove', function() {
			ops.push('fooadd');
		});

		q.queue('ent0', 'foo', 'destroy', function() {
			ops.push('foodestroy');
		});

		expect(ops).toEqual([ 'fooinit', 'fooremove', 'fooadd', 'foodestroy' ]);
	});

	describe('when accumulating', function() {

		describe('using clear action', function() {

			it('destroys add/remove operations in same entity+namespace', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue('ent0', 'foo', 'add', function() {
					ops.push('fooadd');
				});

				q.queue('ent0', 'foo', 'remove', function() {
					ops.push('fooremove');
				});

				q.queue('ent0', 'foo', 'destroy', function() {
					ops.push('foodestroy');
				});

				expect(ops).toEqual([]);
				q.resume();
				expect(ops).toEqual([ 'foodestroy' ]);
			});

			fit('destroys add/remove operations in same entity+namespace, keeping other entities', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue('ent0', 'foo', 'add', function() {
					ops.push('foo0add');
				});

				q.queue('ent1', 'foo', 'add', function() {
					ops.push('foo1add');
				});

				q.queue('ent0', 'foo', 'remove', function() {
					ops.push('foo0remove');
				});

				q.queue('ent1', 'foo', 'remove', function() {
					ops.push('foo1remove');
				});

				q.queue('ent0', 'foo', 'destroy', function() {
					ops.push('foo0destroy');
				});

				expect(ops).toEqual([]);
				q.resume();
				expect(ops).toEqual([ 'foo1add', 'foo1remove', 'foo0destroy' ]);
			});

			it('is cancelled out by an init in same entity+namespace', function() {
				var ops = [];
				var q = new RenderQueue();
				q.pause();

				q.queue('ent0', 'bar', 'init', function() {
					ops.push('barinit');
				});

				q.queue('ent0', 'foo', 'init', function() {
					ops.push('fooinit');
				});

				q.queue('ent0', 'foo', 'add', function() {
					ops.push('fooadd');
				});

				q.queue('ent0', 'foo', 'remove', function() {
					ops.push('fooadd');
				});

				q.queue('ent0', 'foo', 'destroy', function() {
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

			q.queue('ent0', 'foo', 'init', function() {
				ops.push('fooinit');
			});

			q.queue('ent0', 'foo', 'add', function() {
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

			q.queue('ent0', 'foo', 'init', function() {
				ops.push('fooinit');
			});

 			setTimeout(function() {
				q.queue('ent0', 'foo', 'add', function() {
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

		it('causes waiting tasks to delay subsequent non-waiting tasks', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.queue('ent0', 'foo', 'init', function() {
				ops.push('fooinit');
			});

			q.queue('ent0', 'foo', 'add', function() {
				ops.push('fooadd');
			});

			expect(ops).toEqual([]);

			q.queue('ent0', 'bar', 'init', function() {
				ops.push('barinit');
			});

			expect(ops).toEqual([]);

			setTimeout(function() {
				expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ]);
				done();
			}, 125);
		});

		it('causes waiting tasks to ignore subsequent waiting tasks\' timeouts', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100,
				bar: 1000
			});

			q.queue('ent0', 'foo', 'init', function() {
				ops.push('fooinit');
			});

			q.queue('ent0', 'foo', 'add', function() {
				ops.push('fooadd');
			});

			expect(ops).toEqual([]);

			q.queue('ent0', 'bar', 'init', function() {
				ops.push('barinit');
			});

			expect(ops).toEqual([]);

			setTimeout(function() {
				expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ]);
				done();
			}, 125);
		});

		it('resumes non-waiting tasks when unpaused', function(done) {
			var ops = [];
			var q = new RenderQueue({
				foo: 100
			});

			q.pause();

			q.queue('ent0', 'bar', 'init', function() {
				ops.push('barinit');
			});

			q.queue('ent0', 'foo', 'init', function() {
				ops.push('fooinit');
			});

			q.resume();
			expect(ops).toEqual([ 'barinit' ]);

			setTimeout(function() {
				expect(ops).toEqual([ 'barinit', 'fooinit' ]);
				done();
			}, 200);
		});
	});
});
