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
		
		if (delta) {
			addDays(date, delta * (opt('numberOfWeeks') * weekends ? 7 : 5));
		}
		
		var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + weekends ? 7 : 5) % weekends ? 7 : 5));
		var end = addWeeks(cloneDate(start), opt('numberOfWeeks'));
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
		renderBasic(getResources.length, getResources.length, weekends ? opt('numberOfWeeks') * 7 : opt('numberOfWeeks') * 5, false);
	}
	
	
}
