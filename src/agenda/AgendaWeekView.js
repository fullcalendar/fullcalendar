
fcViews.agendaWeek = AgendaWeekView;

function AgendaWeekView(element, calendar) { // TODO: do a WeekView mixin
	var t = this;
	
	
	// exports
	t.incrementDate = incrementDate;
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaWeek');


	function incrementDate(date, delta) {
		return date.clone().stripTime().add(delta, 'weeks').startOf('week');
	}


	function render(date) {

		t.intervalStart = date.clone().stripTime().startOf('week');
		t.intervalEnd = t.intervalStart.clone().add(1, 'weeks');

		t.start = t.skipHiddenDays(t.intervalStart);
		t.end = t.skipHiddenDays(t.intervalEnd, -1, true);

		t.title = calendar.formatRange(
			t.start,
			t.end.clone().subtract(1), // make inclusive by subtracting 1 ms
			t.opt('titleFormat'),
			' \u2014 ' // emphasized dash
		);

		t.renderAgenda(t.getCellsPerWeek());
	}


}
