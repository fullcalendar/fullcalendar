
fcViews.agendaDay = AgendaDayView;

function AgendaDayView(element, calendar) { // TODO: make a DayView mixin
	var t = this;
	
	
	// exports
	t.incrementDate = incrementDate;
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaDay');


	function incrementDate(date, delta) {
		var out = date.clone().stripTime().add('days', delta);
		out = t.skipHiddenDays(out, delta < 0 ? -1 : 1);
		return out;
	}


	function render(date) {

		t.start = t.intervalStart = date.clone().stripTime();
		t.end = t.intervalEnd = t.start.clone().add('days', 1);

		t.title = calendar.formatDate(t.start, t.opt('titleFormat'));

		t.renderAgenda(1);
	}
	

}
