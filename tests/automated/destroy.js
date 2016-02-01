describe('destroy', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when calendar is LTR', function() {
		it('cleans up all classNames on the root element', function() {
			$('#cal').fullCalendar({
				isRTL: false
			});
			$('#cal').fullCalendar('destroy');
			expect($('#cal')[0].className).toBe('');
		});
	});

	describe('when calendar is RTL', function() {
		it('cleans up all classNames on the root element', function() {
			$('#cal').fullCalendar({
				isRTL: true
			});
			$('#cal').fullCalendar('destroy');
			expect($('#cal')[0].className).toBe('');
		});
	});

	[ 'month', 'basicWeek', 'agendaWeek' ].forEach(function(viewName) {

		describe('when in ' + viewName + ' view', function() {
			var options;

			beforeEach(function() {
				options = {
					defaultView: viewName,
					defaultDate: '2014-12-01',
					droppable: true, // likely to attach document handler
					events: [
						{ title: 'event1', start: '2014-12-01' }
					]
				};
			});

			it('leaves no handlers attached to DOM', function(done) {
				var origDocCnt = countHandlers(document);
				var origElCnt = countHandlers('#cal');

				$('#cal').fullCalendar(options);

				setTimeout(function() { // in case there are delayed attached handlers

					$('#cal').fullCalendar('destroy');

					expect(countHandlers(document)).toBe(origDocCnt);
					expect(countHandlers('#cal')).toBe(origElCnt);

					done();
				}, 0);
			});

			// Issue 2432
			it('preserves existing window handlers when handleWindowResize is off', function() {
				var resizeHandler = function() { };
				var handlerCnt0 = countHandlers(window);
				var handlerCnt1;
				var handlerCnt2;

				$(window).on('resize', resizeHandler);
				handlerCnt1 = countHandlers(window);
				expect(handlerCnt1).toBe(handlerCnt0 + 1);

				$('#cal').fullCalendar({
					handleWindowResize: false
				});

				$('#cal').fullCalendar('destroy');
				handlerCnt2 = countHandlers(window);
				expect(handlerCnt2).toBe(handlerCnt1);
			});
		});
	});

});