
describe('header rendering', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	describe('when using default header options', function() {
		it('should have title as default on left', function() {
			$('#calendar').fullCalendar();
			var headr = $('#calendar > table.fc-header .fc-header-left > span')[0];
			expect(headr).toHaveClass('fc-header-title');
		});
		it('should have empty center', function() {
			$('#calendar').fullCalendar();
			var cntr = $('#calendar > table.fc-header .fc-header-center')[0];
			expect(cntr).toBeEmpty();
		});
		it('should have right with today|space|left|right', function() {
			$('#calendar').fullCalendar();
			var td = $('#calendar > table.fc-header .fc-header-right > span')[0];
			var sp = $('#calendar > table.fc-header .fc-header-right > span')[1];
			var lft = $('#calendar > table.fc-header .fc-header-right > span')[2];
			var rt = $('#calendar > table.fc-header .fc-header-right > span')[3];
			expect(td).toHaveClass('fc-button-today');
			expect(sp).toHaveClass('fc-header-space');
			expect(lft).toHaveClass('fc-button-prev');
			expect(rt).toHaveClass('fc-button-next');
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
			var item = $('#calendar > table.fc-header .fc-header-right > span')[0];
			expect(item).toHaveClass('fc-header-title');
		});
		it('should have next|prev on left', function() {
			var nxt = $('#calendar > table.fc-header .fc-header-left > span')[0];
			var prv = $('#calendar > table.fc-header .fc-header-left > span')[1];
			expect(nxt).toHaveClass('fc-button-next');
			expect(prv).toHaveClass('fc-button-prev');
		});
		it('should have prevYear|space|today|space|nextYear in center', function() {
			var py = $('#calendar > table.fc-header .fc-header-center > span')[0];
			var sp1 = $('#calendar > table.fc-header .fc-header-center > span')[1];
			var td = $('#calendar > table.fc-header .fc-header-center > span')[2];
			var sp2 = $('#calendar > table.fc-header .fc-header-center > span')[3];
			var ny = $('#calendar > table.fc-header .fc-header-center > span')[4];
			expect(py).toHaveClass('fc-button-prevYear');
			expect(sp1).toHaveClass('fc-header-space');
			expect(td).toHaveClass('fc-button-today');
			expect(sp2).toHaveClass('fc-header-space');
			expect(ny).toHaveClass('fc-button-nextYear');
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
			var headerTableCount = $('table.fc-header').length;
			expect(headerTableCount).toEqual(0);
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
					var fcHeaderLeft = $('#calendar').find('.fc-header-left')[0];
					expect(fcHeaderLeft).toContainElement('.fc-button-prev');
				});
				it('should have today in center', function() {
					var fcHeaderCenter = $('#calendar').find('.fc-header-center')[0];
					expect(fcHeaderCenter).toContainElement('.fc-button-today');
				});
				it('should have next in right', function() {
					var fcHeaderRight = $('#calendar').find('.fc-header-right')[0];
					expect(fcHeaderRight).toContainElement('.fc-button-next');
				});
			});
		});
	});
});