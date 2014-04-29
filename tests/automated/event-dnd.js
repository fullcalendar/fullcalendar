
// can't do event dragging yet.
// need to work out how fullCalendar is intercepting events.
xdescribe('when event is dragged from one cell to another', function() {
	it('should move to the new cell', function() {
		var eventName = 'xyzAllDayEvent';
		$('#calendar').fullCalendar({
			editable: true
		});
		$('#calendar').fullCalendar('addEventSource', {
			events: [
				{
					title: eventName,
					start: new Date()
				}
			]
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