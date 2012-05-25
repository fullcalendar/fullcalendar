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
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta * opt('numberOfWeeks') * 7);
		}
		var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
		var end = addWeeks(cloneDate(start), opt('numberOfWeeks'));
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
		renderBasic(opt('resources').length, opt('resources').length, weekends ? opt('numberOfWeeks') * 7 : opt('numberOfWeeks') * 5, false);
	}
	
	
}
