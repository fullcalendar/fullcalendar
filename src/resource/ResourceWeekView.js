
fcViews.resourceWeek = ResourceWeekView;

function ResourceWeekView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	// imports
	ResourceView.call(t, element, calendar, 'resourceWeek');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDates = calendar.formatDates;
	var getResources = t.getResources;
	
	
	function render(date, delta) {
		if (delta === 100 || delta === -100) {
			// 100 means we want to skip full week (largePrev/largeNext pressed)
			var start = addDays(date, (delta > 0 ? 7 : -7), false);
			var end = addDays(cloneDate(start), 7);
		}
		else if (delta) {
			var start = addDays(t.visStart, delta * opt('paginateResourceWeek'), false);
			var end = addDays(cloneDate(start), 7);
		}
		else {
			date = new Date();
			var start = addDays(cloneDate(date, true), -((date.getDay() - opt('firstDay') + 7) % 7));
			var end = addDays(cloneDate(start), 7);
		}

		var visStart = cloneDate(start);
		var visEnd = cloneDate(end);
		var weekends = opt('weekends');
		if (!weekends) {
			skipWeekend(visStart);
			skipWeekend(visEnd, -1, true);
		}
		t.title = formatDates(
			visStart,
			addDays(cloneDate(visEnd), -1),
			opt('titleFormat')
		);
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderBasic(getResources.length, weekends ? 7 : 5, false);
	}
}
