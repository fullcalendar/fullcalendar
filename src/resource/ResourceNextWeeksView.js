/*
 	Shows this week and next N weeks
*/
fcViews.resourceNextWeeks = ResourceNextWeeksView;

function ResourceNextWeeksView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	ResourceView.call(t, element, calendar, 'resourceNextWeeks');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDates = calendar.formatDates;
	var getResources = t.getResources;
	
	
	function render(date, delta) {
		var weekends = opt('weekends');
		var weekDays = weekends ? 7 : 5;
		var rows = getResources.length;
		var cols = (weekends ?  7 :  5) * opt('numberOfWeeks');
		
		if (delta === 100 || delta === -100) {
			// 100 means we want to skip full view (largePrev/largeNext pressed)
			var start = addDays(date, opt('numberOfWeeks') * (delta > 0 ? 7 : -7), false);
			var end = addDays(cloneDate(start), opt('numberOfWeeks') * 7);
		}
		else if (delta) {
			var start = addDays(t.visStart, delta * opt('paginateResourceNextWeeks'), false);
			var end = addDays(cloneDate(start), opt('numberOfWeeks') * 7);
		}
		else {
			date = new Date();
			var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + weekDays) % weekDays), false);
			var end = addDays(cloneDate(start), opt('numberOfWeeks')*7);
		}

		var visStart = cloneDate(start);
		var visEnd = cloneDate(end);

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
		renderBasic(rows, cols, false);
	}
	
	
}
