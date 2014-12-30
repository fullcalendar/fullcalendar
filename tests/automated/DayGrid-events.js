describe('DayGrid event rendering', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01', // 2014-07-27 - 2014-10-07 (excl)
			defaultView: 'month'
		};
	});

	describe('when LTR', function() {
		initMonthTesting(false);
	});
	describe('when RTL', function() {
		initMonthTesting(true);
	});

	function initMonthTesting(isRTL) {

		it('correctly renders an event starting before view\'s start', function() {
			options.events = [
				{ start: '2014-07-26', end: '2014-07-30' }
			];
			testSeg({
				firstCol: 0,
				lastCol: 2,
				isStart: false,
				isEnd: true
			});
		});

		it('correctly renders an event starting at view\'s start', function() {
			options.events = [
				{ start: '2014-07-27', end: '2014-07-29' }
			];
			testSeg({
				firstCol: 0,
				lastCol: 1,
				isStart: true,
				isEnd: true
			});
		});

		it('correctly renders an event starting after view\'s start', function() {
			options.events = [
				{ start: '2014-08-01', end: '2014-08-02' }
			];
			testSeg({
				firstCol: 5,
				lastCol: 5,
				isStart: true,
				isEnd: true
			});
		});

		it('correctly renders an event starting on a hidden day at week start', function() {
			options.weekends = false;
			options.events = [
				{ start: '2014-07-27', end: '2014-07-30' }
			];
			testSeg({
				firstCol: 0,
				lastCol: 1,
				isStart: false,
				isEnd: true
			});
		});

		it('correctly renders an event starting on a hidden day in middle of week', function() {
			options.hiddenDays = [ 2 ]; // hide Tues
			options.events = [
				{ start: '2014-07-29', end: '2014-08-01' }
			];
			testSeg({
				firstCol: 2,
				lastCol: 3,
				isStart: false,
				isEnd: true
			});
		});

		it('correctly renders an event ending before view\'s end', function() {
			options.events = [
				{ start: '2014-09-02', end: '2014-09-05' }
			];
			testSeg({
				row: 5,
				firstCol: 2,
				lastCol: 4,
				isStart: true,
				isEnd: true
			});
		});

		it('correctly renders an event ending at view\'s end', function() {
			options.events = [
				{ start: '2014-09-04', end: '2014-09-07' }
			];
			testSeg({
				row: 5,
				firstCol: 4,
				lastCol: 6,
				isStart: true,
				isEnd: true
			});
		});

		it('correctly renders an event ending after view\'s end', function() {
			options.events = [
				{ start: '2014-09-04', end: '2014-09-08' }
			];
			testSeg({
				row: 5,
				firstCol: 4,
				lastCol: 6,
				isStart: true,
				isEnd: false
			});
		});

		it('correctly renders an event ending at a week\'s end', function() {
			options.events = [
				{ start: '2014-08-28', end: '2014-08-31' }
			];
			testSeg({
				row: 4,
				firstCol: 4,
				lastCol: 6,
				isStart: true,
				isEnd: true
			});
		});

		it('correctly renders an event ending on a hidden day at week end', function() {
			options.weekends = false;
			options.events = [
				{ start: '2014-07-30', end: '2014-08-03' }
			];
			testSeg({
				firstCol: 2,
				lastCol: 4,
				isStart: true,
				isEnd: false
			});
		});

		it('correctly renders an event ending on a hidden day in middle of week', function() {
			options.hiddenDays = [ 4 ]; // Thurs
			options.events = [
				{ start: '2014-07-28', end: '2014-08-01' }
			];
			testSeg({
				firstCol: 1,
				lastCol: 3,
				isStart: true,
				isEnd: false
			});
		});

		function testSeg(testSegOptions) {
			options.isRTL = isRTL;
			$('#cal').fullCalendar(options);
			directionallyTestSeg(testSegOptions, isRTL);
		}
	}

	it('rendering of events across weeks stays consistent', function() {
		options.events = [
			{
				title: 'event1',
				start: '2014-08-01',
				end: '2014-08-04',
				className: 'event1'
			},
			{
				title: 'event2',
				start: '2014-08-02',
				end: '2014-08-05',
				className: 'event2'
			}
		];
		$('#cal').fullCalendar(options);
		var row0 = $('.fc-day-grid .fc-row:eq(0)');
		var row0event1 = row0.find('.event1');
		var row0event2 = row0.find('.event2');
		var row1 = $('.fc-day-grid .fc-row:eq(1)');
		var row1event1 = row1.find('.event1');
		var row1event2 = row1.find('.event2');
		expect(row0event1.offset().top).toBeLessThan(row0event2.offset().top);
		expect(row1event1.offset().top).toBeLessThan(row1event2.offset().top);
	});

	it('renders an event with no url with no <a> href', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-01'
		} ];
		$('#cal').fullCalendar(options);
		var seg = $('.fc-event');
		expect(seg).not.toHaveAttr('href');
	});

	it('renders an event with a url with an <a> href', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-01',
			url: 'http://google.com/'
		} ];
		$('#cal').fullCalendar(options);
		var seg = $('.fc-event');
		expect(seg).toHaveAttr('href');
	});


	/*
	opts:
		- el (optional)
		- row (optional)
		- firstCol
		- lastCol
		- isStart
		- isEnd
	*/
	function directionallyTestSeg(opts, isRTL) {
		var el = $(opts.el || '.fc-event:first');

		var row = opts.row || 0;
		var rowTds = $('.fc-day-grid .fc-row:eq(' + row + ') .fc-day');
		expect(rowTds.length).toBeGreaterThan(1);

		var leftCol;
		var rightCol;
		if (isRTL) {
			leftCol = rowTds.length - opts.lastCol - 1;
			rightCol = rowTds.length - opts.firstCol - 1;
		}
		else {
			leftCol = opts.firstCol;
			rightCol = opts.lastCol;
		}

		var col, td;

		for (col = leftCol; col <= rightCol; col++) {
			td = rowTds.eq(col);
			expect(el).toIntersectWith(td);
		}

		for (col = 0; col < rowTds.length; col++) {
			if (col < leftCol || col > rightCol) {
				td = rowTds.eq(col);
				expect(el).not.toIntersectWith(td);
			}
		}

		if (opts.isStart) {
			expect(el).toHaveClass('fc-start');
		}
		else {
			expect(el).not.toHaveClass('fc-start');
		}

		if (opts.isEnd) {
			expect(el).toHaveClass('fc-end');
		}
		else {
			expect(el).not.toHaveClass('fc-end');
		}
	}

});