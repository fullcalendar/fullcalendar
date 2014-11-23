
describe('header rendering', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	describe('when using default header options', function() {
		it('should have title as default on left', function() {
			$('#calendar').fullCalendar();
			expect($('#calendar > .fc-toolbar > .fc-left > *')).toBeMatchedBy('h2');
		});
		it('should have empty center', function() {
			$('#calendar').fullCalendar();
			var center = $('#calendar > .fc-toolbar > .fc-center');
			expect(center).toBeEmpty();
		});
		it('should have right with today|space|left|right', function() {
			$('#calendar').fullCalendar();
			var rightChildren = $('#calendar > .fc-toolbar > .fc-right > *');
			var todayButton = rightChildren.eq(0);
			var buttonGroup = rightChildren.eq(1);
			var prevNextButtons = buttonGroup.children();
			expect(todayButton).toHaveClass('fc-today-button');
			expect(buttonGroup).toHaveClass('fc-button-group');
			expect(prevNextButtons.eq(0)).toHaveClass('fc-prev-button');
			expect(prevNextButtons.eq(1)).toHaveClass('fc-next-button');
		});
	});

	describe('when supplying header options', function() {
		beforeEach(function() {
			var options = {
				header: {
					left: 'next,prev',
					center: 'prevYear today nextYear agendaView,dayView',
					right: 'title'
				}
			};
			$('#calendar').fullCalendar(options);
		});
		it('should have title on the right', function() {
			expect($('#calendar > .fc-toolbar > .fc-right > *')).toBeMatchedBy('h2');
		});
		it('should have next|prev on left', function() {
			var buttonGroup = $('#calendar > .fc-toolbar > .fc-left > *');
			var prevNextButtons = buttonGroup.children();
			expect(prevNextButtons.eq(0)).toHaveClass('fc-next-button');
			expect(prevNextButtons.eq(1)).toHaveClass('fc-prev-button');
		});
		it('should have prevYear|space|today|space|nextYear in center', function() {
			var items = $('#calendar > .fc-toolbar > .fc-center > *');
			expect(items.eq(0)).toHaveClass('fc-prevYear-button');
			expect(items.eq(1)).toHaveClass('fc-today-button');
			expect(items.eq(2)).toHaveClass('fc-nextYear-button');
		});
	});

	describe('when setting header to false', function() {
		beforeEach(function() {
			var options = {
				header: false
			};
			$('#calendar').fullCalendar(options);
		});
		it('should not have header table', function() {
			expect($('.fc-toolbar')).not.toBeInDOM();
		});
	});

	describe('renders left and right literally', function() {
		[ true, false ].forEach(function(isRTL) {
			describe('when isRTL is ' + isRTL, function() {
				beforeEach(function() {
					var options = {};
					$('#calendar').fullCalendar({
						header: {
							left: 'prev',
							center: 'today',
							right: 'next'
						},
						isRTL: isRTL
					});
				});
				it('should have prev in left', function() {
					var fcHeaderLeft = $('#calendar .fc-toolbar > .fc-left');
					expect(fcHeaderLeft).toContainElement('.fc-prev-button');
				});
				it('should have today in center', function() {
					var fcHeaderCenter = $('#calendar .fc-toolbar > .fc-center');
					expect(fcHeaderCenter).toContainElement('.fc-today-button');
				});
				it('should have next in right', function() {
					var fcHeaderRight = $('#calendar .fc-toolbar > .fc-right');
					expect(fcHeaderRight).toContainElement('.fc-next-button');
				});
			});
		});
	});

	describe('when calendar is within a form', function() {
		beforeEach(function() {
			$('#calendar').wrap('<form action="http://google.com/"></form>');
		});
		it('should not submit the form when clicking the button', function(done) {
			var options = {
				header: {
					left: 'prev,next',
					right: 'title'
				}
			};
			var unloadCalled = false;

			function beforeUnloadHandler() {
				console.log('when calendar is within a form, it submits!!!');
				unloadCalled = true;
				cleanup();
				return 'click stay on this page';
			}
			$(window).on('beforeunload', beforeUnloadHandler);

			function cleanup() {
				$(window).off('beforeunload', beforeUnloadHandler);
			}

			$('#calendar').fullCalendar(options);
			$('.fc-next-button').simulate('click');

			setTimeout(function() { // wait to see if handler was called
				expect(unloadCalled).toBe(false);
				cleanup();
				done();
			}, 100);
		});
	});
});