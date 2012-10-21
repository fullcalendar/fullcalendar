
fcViews.resourceDay = ResourceDayView;

function ResourceDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	ResourceView.call(t, element, calendar, 'resourceDay');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDates = calendar.formatDates;
	var getResources = t.getResources;
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta * 1);
			if (!opt('weekends')) skipWeekend(date, delta < 0 ? -1 : 1);
		}

		var start = addMinutes(cloneDate(date, true),parseTime(opt('minTime')));
		var end = addMinutes(cloneDate(start), (parseTime(opt('maxTime'))-parseTime(opt('minTime'))));
		var visStart = cloneDate(start);
		var visEnd = cloneDate(end);

		t.title = formatDates(
			visStart,
			addDays(cloneDate(visEnd), -1),
			opt('titleFormat')
		);
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;

		var cols = Math.round((visEnd - visStart) / 1000 / 60 / opt('slotMinutes'));
		renderBasic(getResources.length, getResources.length, cols, false);
	}
	
	
}
