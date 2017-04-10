
describe('Model', function() {
	var Model = $.fullCalendar.Model;

	describe('set/get', function() {

		it('retrieves a previously set value', function() {
			var funcs = {
				change: function(val) {
					expect(val).toBe(5);
				}
			};
			var spy = spyOn(funcs, 'change').and.callThrough();

			var m = new Model();
			m.on('change:myvar', funcs.change);
			m.set('myvar', 5);

			expect(m.get('myvar')).toBe(5);
			expect(spy).toHaveBeenCalled();
		});

		it('retrieves values previously set in bulk', function() {
			var m = new Model();
			m.set({
				myvar: 5,
				myothervar: 6
			});
			expect(m.get('myvar')).toBe(5);
			expect(m.get('myothervar')).toBe(6);
		});

		it('retrieves undefined when not previously set', function() {
			var m = new Model();
			expect(m.get('myvar')).toBeUndefined();
		});
	});

	describe('has', function() {

		it('reports false when not previously set', function() {
			var m = new Model();
			expect(m.has('myvar')).toBe(false);
		});

		it('reports true when previously set', function() {
			var m = new Model();
			m.set('myvar', 5);
			expect(m.has('myvar')).toBe(true);
		});
	});

	describe('watch', function() {

		describe('when called as a task', function() {

			describe('when no deps', function() {
				it('resolves immediately', function() {
					var funcs = {
						start: function() { }
					};
					var spy = spyOn(funcs, 'start');
					var m = new Model();
					m.watch('myid', [], funcs.start);
					expect(spy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);
				});
			});

			describe('when all deps already satisfied', function() {
				it('resolves immediately', function() {
					var funcs = {
						start: function() { }
					};
					var spy = spyOn(funcs, 'start');

					var m = new Model();
					m.set({
						myvar: 5,
						myothervar: 6
					});

					m.watch('myid', [ 'myvar', 'myothervar' ], funcs.start);
					expect(spy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);
				});
			});

			describe('when not all deps satisfied', function() {
				it('resolves only after all deps are set', function() {
					var funcs = {
						start: function() { }
					};
					var spy = spyOn(funcs, 'start');

					var m = new Model();
					m.set('myvar', 5);

					m.watch('myid', [ 'myvar', 'myothervar' ], funcs.start);
					expect(spy).not.toHaveBeenCalled();
					expect(m.has('myid')).toBe(false);

					m.set('myothervar', 6);
					expect(spy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);
				});
			});

			describe('when previously resolved dep is unset', function() {
				it('calls the stop function', function() {
					var funcs = {
						start: function() { },
						stop: function() { }
					};
					var startSpy = spyOn(funcs, 'start');
					var stopSpy = spyOn(funcs, 'stop');

					var m = new Model();
					m.set('myvar', 5);

					m.watch('myid', [ 'myvar', 'myothervar' ], funcs.start, funcs.stop);

					m.set('myothervar', 6);
					expect(startSpy).toHaveBeenCalled();
					expect(stopSpy).not.toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);

					m.unset('myothervar');
					expect(stopSpy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(false);
				});
			});

			describe('with an optional value', function() {

				it('resolves immediately', function() {
					var funcs = {
						start: function() { },
						stop: function() { }
					};
					var startSpy = spyOn(funcs, 'start');
					var stopSpy = spyOn(funcs, 'stop');

					var m = new Model();

					m.watch('myid', [ '?optvar' ], funcs.start, funcs.stop);
					expect(startSpy).toHaveBeenCalled();
					expect(stopSpy).not.toHaveBeenCalled();
				});

				it('calls stop/start when value changed', function() {
					var funcs = {
						start: function() { },
						stop: function() { }
					};
					var startSpy = spyOn(funcs, 'start');
					var stopSpy = spyOn(funcs, 'stop');

					var m = new Model();
					m.set('optvar', 5);

					m.watch('myid', [ '?optvar' ], funcs.start, funcs.stop);
					expect(startSpy).toHaveBeenCalledTimes(1);
					expect(stopSpy).not.toHaveBeenCalledTimes(1);

					m.set('optvar', 6);
					expect(startSpy).toHaveBeenCalledTimes(2);
					expect(stopSpy).not.toHaveBeenCalledTimes(2);
				});

				it('calls stop/start when value unset', function() {
					var funcs = {
						start: function() { },
						stop: function() { }
					};
					var startSpy = spyOn(funcs, 'start');
					var stopSpy = spyOn(funcs, 'stop');

					var m = new Model();
					m.set('optvar', 5);

					m.watch('myid', [ '?optvar' ], funcs.start, funcs.stop);
					expect(startSpy).toHaveBeenCalledTimes(1);
					expect(stopSpy).not.toHaveBeenCalledTimes(1);

					m.unset('optvar');
					expect(startSpy).toHaveBeenCalledTimes(2);
					expect(stopSpy).not.toHaveBeenCalledTimes(2);
				});
			});
		});

		describe('when called as a computed value', function() {

			describe('when it has no deps', function() {
				it('resolves immediately', function() {
					var funcs = {
						generator: function() {
							return 9;
						},
						change: function(val) {
							expect(val).toBe(9);
						}
					};
					var generatorSpy = spyOn(funcs, 'generator').and.callThrough();
					var changeSpy = spyOn(funcs, 'change').and.callThrough();

					var m = new Model();
					m.on('change:myid', funcs.change);
					m.watch('myid', [], funcs.generator);

					expect(generatorSpy).toHaveBeenCalled();
					expect(changeSpy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);
					expect(m.get('myid')).toBe(9);
				});
			});

			describe('when all deps already satisfied', function() {
				it('resolves immediately', function() {
					var funcs = {
						generator: function(deps) {
							return deps.myvar + deps.myothervar;
						}
					};
					var spy = spyOn(funcs, 'generator').and.callThrough();

					var m = new Model();
					m.set({
						myvar: 5,
						myothervar: 6
					});

					m.watch('myid', [ 'myvar', 'myothervar' ], funcs.generator);
					expect(spy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);
					expect(m.get('myid')).toBe(11);
				});
			});

			describe('when not all deps satisfied', function() {
				it('resolves only after all deps are set', function() {
					var funcs = {
						generator: function(deps) {
							return deps.myvar + deps.myothervar;
						}
					};
					var spy = spyOn(funcs, 'generator').and.callThrough();

					var m = new Model();
					m.set('myvar', 5);

					m.watch('myid', [ 'myvar', 'myothervar' ], funcs.generator);
					expect(spy).not.toHaveBeenCalled();
					expect(m.has('myid')).toBe(false);

					m.set('myothervar', 6);
					expect(spy).toHaveBeenCalled();
					expect(m.has('myid')).toBe(true);
					expect(m.get('myid')).toBe(11);
				});

				describe('when watching an instance', function() {

					it('resolves only after final async dep resolves', function(done) {
						var funcs = {
							generator: function(deps) {
								return deps.myvar + deps.myothervar;
							}
						};
						var spy = spyOn(funcs, 'generator').and.callThrough();

						var m = new Model();
						m.set('myvar', 5);
						m.watch('myothervar', [ 'myvar' ], function(deps) {
							var deferred = $.Deferred();
							setTimeout(function() {
								deferred.resolve(deps.myvar * 2);
							}, 100);
							return deferred.promise();
						});

						m.watch('myid', [ 'myvar', 'myothervar' ], funcs.generator);
						expect(spy).not.toHaveBeenCalled();
						expect(m.has('myid')).toBe(false);

						setTimeout(function() {
							expect(spy).toHaveBeenCalled();
							expect(m.has('myid')).toBe(true);
							expect(m.get('myid')).toBe(15);
							done();
						}, 200);
					});
				});

				describe('when using class-methods', function() {

					it('resolves only after final async dep resolves', function(done) {
						var funcs = {
							generator: function(deps) {
								return deps.myvar + deps.myothervar;
							}
						};
						var spy = spyOn(funcs, 'generator').and.callThrough();

						var MyClass = Model.extend();
						MyClass.watch('myothervar', [ 'myvar' ], function(deps) {
							var deferred = $.Deferred();
							setTimeout(function() {
								deferred.resolve(deps.myvar * 2);
							}, 100);
							return deferred.promise();
						});
						MyClass.watch('myid', [ 'myvar', 'myothervar' ], funcs.generator);

						var m = new MyClass();
						m.set({
							myvar: 5
						});

						expect(spy).not.toHaveBeenCalled();
						expect(m.has('myid')).toBe(false);

						setTimeout(function() {
							expect(spy).toHaveBeenCalled();
							expect(m.has('myid')).toBe(true);
							expect(m.get('myid')).toBe(15);
							done();
						}, 200);
					});
				});
			});
		});
	});

	describe('unwatch', function() {
		it('calls the stop function and won\'t call the start function again', function() {
			var funcs = {
				start: function() { },
				stop: function() { }
			};
			var startSpy = spyOn(funcs, 'start');
			var stopSpy = spyOn(funcs, 'stop');

			var m = new Model();
			m.set('myvar', 5);

			m.watch('myid', [ 'myvar', 'myothervar' ], funcs.start, funcs.stop);
			expect(startSpy).not.toHaveBeenCalled();

			m.set('myothervar', 6);
			expect(startSpy).toHaveBeenCalledTimes(1);

			m.unwatch('myid');
			expect(stopSpy).toHaveBeenCalledTimes(1);

			// doesn't call it again
			m.set('myvar', 5);
			expect(startSpy).toHaveBeenCalledTimes(1);
		});
	});
});
