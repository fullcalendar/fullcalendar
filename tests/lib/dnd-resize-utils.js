
// this function has been mangled to work with external jqui draggables as well
function testEventDrag(options, dropDate, expectSuccess, callback, eventClassName) {
	var eventsRendered = false;

	options.editable = true;
	options.eventAfterAllRender = function() {
		var calendar = $('#cal').fullCalendar('getCalendar');
		var isDraggingExternal = false;
		var dayEl;
		var eventEl;
		var dragEl;
		var slatIndex;
		var slatEl;
		var dx, dy;

		if (eventsRendered) { return; }
		eventsRendered = true;

		dropDate = calendar.moment(dropDate);
		eventEl = $('.' + (eventClassName || 'fc-event') + ':first');
		expect(eventEl.length).toBe(1);
		
		if (dropDate.hasTime()) {
			dragEl = eventEl.find('.fc-time');
			dayEl = $('.fc-time-grid .fc-day[data-date="' + dropDate.format('YYYY-MM-DD') + '"]');
			slatIndex = dropDate.hours() * 2 + (dropDate.minutes() / 30); // assumes slotDuration:'30:00'
			slatEl = $('.fc-slats tr:eq(' + slatIndex + ')');
			expect(slatEl.length).toBe(1);
			dy = slatEl.offset().top - eventEl.offset().top;
		}
		else {
			dragEl = eventEl.find('.fc-title');
			dayEl = $('.fc-day-grid .fc-day[data-date="' + dropDate.format('YYYY-MM-DD') + '"]');
			dy = dayEl.offset().top - eventEl.offset().top;
		}

		if (!dragEl.length) {
			isDraggingExternal = true;
			dragEl = eventEl; // well, not really an "event" element anymore
		}

		expect(dragEl.length).toBe(1);
		expect(dayEl.length).toBe(1);
		dx = dayEl.offset().left - eventEl.offset().left;

		dragEl.simulate('drag', {
			dx: dx || 1,
			dy: dy || 1,
			callback: function() {
				var allowed = !$('body').hasClass('fc-not-allowed');
				expect(allowed).toBe(expectSuccess);

				dragEl.simulate('drop', {
					callback: function() {
						var eventObj;
						var successfulDrop;

						if (!isDraggingExternal) { // if dragging an event within the calendar, check dates

							if (eventClassName) {
								eventObj = calendar.clientEvents(function(o) {
									return o.className.join(' ') === eventClassName;
								})[0];
							}
							else {
								eventObj = calendar.clientEvents()[0];
							}

							if (dropDate.hasTime()) { // dropped on a slot
								successfulDrop = eventObj.start.format() == dropDate.format(); // compare exact times
							}
							else { // dropped on a whole day
								// only compare days
								successfulDrop = eventObj.start.format('YYYY-MM-DD') == dropDate.format('YYYY-MM-DD');
							}

							expect(successfulDrop).toBe(allowed);
							expect(successfulDrop).toBe(expectSuccess);
						}

						callback();
					}
				});
			}
		});
	};
	$('#cal').fullCalendar(options);
}


function testEventResize(options, resizeDate, expectSuccess, callback, eventClassName) {
	var eventsRendered = false;

	options.editable = true;
	options.eventAfterAllRender = function() {
		var calendar = $('#cal').fullCalendar('getCalendar');
		var lastDayEl;
		var lastSlatIndex;
		var lastSlatEl;
		var eventEl;
		var dragEl;
		var dx, dy;

		if (eventsRendered) { return; }
		eventsRendered = true;

		resizeDate = calendar.moment(resizeDate);
		eventEl = $('.' + (eventClassName || 'fc-event') + ':last');
		dragEl = eventEl.find('.fc-resizer');

		if (resizeDate.hasTime()) {
			lastDayEl = $('.fc-time-grid .fc-day[data-date="' + resizeDate.clone().format('YYYY-MM-DD') + '"]');
			lastSlatIndex = resizeDate.hours() * 2 + (resizeDate.minutes() / 30); // assumes slotDuration:'30:00'
			lastSlatEl = $('.fc-slats tr:eq(' + (lastSlatIndex - 1) + ')');
			expect(lastSlatEl.length).toBe(1);
			dy = lastSlatEl.offset().top + lastSlatEl.outerHeight() - (eventEl.offset().top + eventEl.outerHeight());
		}
		else {
			lastDayEl = $('.fc-day-grid .fc-day[data-date="' + resizeDate.clone().add(-1, 'day').format('YYYY-MM-DD') + '"]');
			dy = lastDayEl.offset().top - eventEl.offset().top;
		}

		expect(lastDayEl.length).toBe(1);
		expect(eventEl.length).toBe(1);
		expect(dragEl.length).toBe(1);
		dx = lastDayEl.offset().left + lastDayEl.outerWidth() - 2 - (eventEl.offset().left + eventEl.outerWidth());

		dragEl.simulate('drag', {
			dx: dx || 1,
			dy: dy || 1,
			callback: function() {
				var allowed = !$('body').hasClass('fc-not-allowed');

				dragEl.simulate('drop', {
					callback: function() {
						var eventObj = calendar.clientEvents()[0];
						var successfulDrop = eventObj.end && eventObj.end.format() === resizeDate.format();

						expect(allowed).toBe(successfulDrop);
						expect(allowed).toBe(expectSuccess);
						expect(successfulDrop).toBe(expectSuccess);
						callback();
					}
				});
			}
		});
	};
	$('#cal').fullCalendar(options);
}


// always starts at 2014-11-12
function testSelection(options, startTime, end, expectSuccess, callback) {
	var successfulSelection = false;
	var calendar;
	var firstDayEl, lastDayEl;
	var firstSlatIndex, lastSlatIndex;
	var firstSlatEl, lastSlatEl;
	var dx, dy;
	var dragEl;

	options.selectable = true;
	options.select = function(selectionStart, selectionEnd) {
		successfulSelection =
			selectionStart.format() === start.format() &&
				selectionEnd.format() === end.format();
	};
	spyOn(options, 'select').and.callThrough();
	$('#cal').fullCalendar(options);

	calendar = $('#cal').fullCalendar('getCalendar');
	start = calendar.moment('2014-11-12');
	end = calendar.moment(end);

	if (startTime) {
		start.time(startTime);
		firstDayEl = $('.fc-time-grid .fc-day[data-date="' + start.format('YYYY-MM-DD') + '"]');
		lastDayEl = $('.fc-time-grid .fc-day[data-date="' + end.format('YYYY-MM-DD') + '"]');
		firstSlatIndex = start.hours() * 2 + (start.minutes() / 30); // assumes slotDuration:'30:00'
		lastSlatIndex = end.hours() * 2 + (end.minutes() / 30) - 1; // assumes slotDuration:'30:00'
		firstSlatEl = $('.fc-slats tr:eq(' + firstSlatIndex + ')');
		lastSlatEl = $('.fc-slats tr:eq(' + lastSlatIndex + ')');
		expect(firstSlatEl.length).toBe(1);
		expect(lastSlatEl.length).toBe(1);
		dy = lastSlatEl.offset().top - firstSlatEl.offset().top;
		dragEl = firstSlatEl;
	}
	else {
		end.stripTime();
		firstDayEl = $('.fc-day-grid .fc-day[data-date="' + start.format('YYYY-MM-DD') + '"]');
		lastDayEl = $('.fc-day-grid .fc-day[data-date="' + end.clone().add(-1, 'day').format('YYYY-MM-DD') + '"]');
		dy = lastDayEl.offset().top - firstDayEl.offset().top;
		dragEl = firstDayEl;
	}

	expect(firstDayEl.length).toBe(1);
	expect(lastDayEl.length).toBe(1);
	dx = lastDayEl.offset().left - firstDayEl.offset().left;

	dragEl.simulate('drag', {
		dx: dx || 1,
		dy: dy || 1,
		callback: function() {
			var allowed = !$('body').hasClass('fc-not-allowed');

			dragEl.simulate('drop', {
				callback: function() {
					if (expectSuccess) {
						expect(options.select).toHaveBeenCalled();
					}
					expect(expectSuccess).toBe(allowed);
					expect(expectSuccess).toBe(successfulSelection);
					expect(allowed).toBe(successfulSelection);
					callback();
				}
			});
		}
	});
}
