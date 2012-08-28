
fcViews.teamDay = TeamDayView;

function TeamDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	TeamView.call(t, element, calendar, 'teamDay');
	var opt = t.opt;
	var renderTeam = t.renderTeam;
	var formatDate = calendar.formatDate;
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta);
			if (!opt('weekends')) {
				skipWeekend(date, delta < 0 ? -1 : 1);
			}
		}
		var start = cloneDate(date, true);
		var end = addDays(cloneDate(start), 1);
		t.title = formatDate(date, opt('titleFormat'));
		t.start = t.visStart = start;
		t.end = t.visEnd = end;
		renderTeam(1);
	}
	

}
