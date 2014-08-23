
describe('external drag and drop', function() {

	// TODO: fill out tests for droppable/drop/dropAccept, with RTL

	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2014-08-23',
			droppable: true
		};

		$('body').append(
			'<div id="sidebar" style="width:200px">' +
				'<a class="fc-event event1">event 1</a>' +
				'<a class="fc-event event2">event 2</a>' +
			'</div>' +
			'<div id="cal" style="width:600px;position:absolute;top:10px;left:220px">' +
			'</div>'
		);
		$('#sidebar a').draggable();
	});

	afterEach(function() {
		$('#cal').remove();
		$('#sidebar').remove();
	});

	function getMonthCell(row, col) {
		return $('.fc-day-grid .fc-row:eq(' + row + ') .fc-bg td:not(.fc-axis):eq(' + col + ')');
	}

	describe('in month view', function() {

		beforeEach(function() {
			options.defaultView = 'month';
		});

		it('works after the view is changed', function(done) { // issue 2240
			var callCnt = 0;

			options.drop = function(date, jsEvent, ui) {
				if (callCnt === 0) {
					expect(date).toEqualMoment('2014-08-06');
					$('#sidebar .event1').remove();
					$('#cal').fullCalendar('next');
					$('#cal').fullCalendar('prev');
					$('#sidebar .event2').simulate('drag-n-drop', {
						dropTarget: getMonthCell(1, 3)
					});
				}
				else if (callCnt === 1) {
					expect(date).toEqualMoment('2014-08-06');
					done();
				}
				callCnt++;
			};

			$('#cal').fullCalendar(options);
			$('#sidebar .event1').simulate('drag-n-drop', {
				dropTarget: getMonthCell(1, 3)
			});
		});
	});

	describe('in agenda view', function() {

		beforeEach(function() {
			options.defaultView = 'agendaWeek';
			options.dragScroll = false;
			options.scrollTime = '00:00:00';
		});

		it('works after the view is changed', function(done) {
			var callCnt = 0;

			options.drop = function(date, jsEvent, ui) {
				if (callCnt === 0) {
					expect(date).toEqualMoment('2014-08-20T01:00:00');
					$('#sidebar .event1').remove();
					$('#cal').fullCalendar('next');
					$('#cal').fullCalendar('prev');
					$('#sidebar .event2').simulate('drag-n-drop', {
						dropTarget: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20
					});
				}
				else if (callCnt === 1) {
					expect(date).toEqualMoment('2014-08-20T01:00:00');
					done();
				}
				callCnt++;
			};

			$('#cal').fullCalendar(options);
			$('#sidebar .event1').simulate('drag-n-drop', {
				dropTarget: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20
			});
		});
	});

});