
describe('fullCalendar(Integration)', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	describe('When fullCalendar() is called on a div', function() {

		beforeEach(function() {
			$('#calendar').fullCalendar();
		});

		it('should contain a table fc-header', function() {
			var header = $('#calendar > table.fc-header');
			expect(header[0]).not.toBeUndefined();
		});

		it('should contain a div fc-content', function() {
			var content = ($('#calendar > div.fc-content'));
			expect(content[0]).not.toBeUndefined();
		});

		it('should only contain 2 elements', function() {
			var calenderNodeCount = $('#calendar >').length;
			expect(calenderNodeCount).toEqual(2);
		});

		describe('and then called again', function() {
			it('should still only have a single set of calendar [header,content]', function() {
				$('#calendar').fullCalendar();
				var count = $('#calendar >').length;
				expect(count).toEqual(2);
			});
		});

		// can't do event dragging yet.
		// need to work out how fullCalendar is intercepting events.
		xdescribe('when event is dragged from one cell to another', function() {
			it('should move to the new cell', function() {
				var eventName = 'xyzAllDayEvent';
				$('#calendar').fullCalendar({
					editable: true
				});
				$('#calendar').fullCalendar('addEventSource', {
					events: [{
						title: eventName,
						start: new Date()
					}]
				});
				var el = $('div .fc-event');
				var offsetBefore = el.offset();
				dump(offsetBefore);
				var options = {
					dx: 200,
					dy: 0,
					moves: 10,
					handle: 'corner'
				};
				el.simulate('drag', options);
				dump(el.offset());
			});
		});
	});
});