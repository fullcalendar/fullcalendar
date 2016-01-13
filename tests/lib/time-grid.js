
// TODO: consolidate with scheduler


function getTimeGridPoint(date) {
	var date = $.fullCalendar.moment.parseZone(date);
	var top = getTimeGridTop(date.time());
	var dayEls = getTimeGridDayEls(date);
	var dayRect;

	expect(dayEls.length).toBe(1);
	dayRect = getBoundingRect(dayEls.eq(0));

	return {
		left: (dayRect.left + dayRect.right) / 2,
		top: top
	};
}


function getTimeGridLine(date) { // not in Scheduler
	var date = $.fullCalendar.moment.parseZone(date);
	var top = getTimeGridTop(date.time());
	var dayEls = getTimeGridDayEls(date);
	var dayRect;

	expect(dayEls.length).toBe(1);
	dayRect = getBoundingRect(dayEls.eq(0));

	return {
		left: dayRect.left,
		right: dayRect.right,
		top: top,
		bottom: top
	};
}


function getTimeGridTop(time) {
	var time = moment.duration(time);
	var slotEls = getTimeGridSlotEls(time);

	expect(slotEls.length).toBe(1);
	
	return slotEls.offset().top + 1; // +1 make sure after border
}


function getTimeGridDayEls(date) {
	var date = $.fullCalendar.moment.parseZone(date);

	return $('.fc-time-grid .fc-day[data-date="' + date.format('YYYY-MM-DD') + '"]');
}


function getTimeGridSlotEls(timeDuration) {
	var timeDuration = moment.duration(timeDuration);
	var date = $.fullCalendar.moment.utc('2016-01-01').time(timeDuration);

	return $('.fc-time-grid .fc-slats tr[data-time="' + date.format('HH:mm:ss') + '"]');
}


function isElWithinRtl(el) {
	return el.closest('.fc').hasClass('fc-rtl');
}


function getBoundingRect(el) {
	var el = $(el);
	expect(el.length).toBe(1);
	var rect = el.offset();
	rect.right = rect.left + el.outerWidth();
	rect.bottom = rect.top + el.outerHeight();
	rect.node = el[0]; // very useful for debugging
	return rect;
}
