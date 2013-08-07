
function BasicEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.clearEvents = clearEvents;
	

	// imports
	DayEventRenderer.call(t);

	
	function renderEvents(events, modifiedEventId) {
		t.reportEvents(events);
		t.renderDayEvents(events, modifiedEventId);
		t.trigger('eventAfterAllRender');
	}
	
	
	function clearEvents() {
		t.reportEventClear();
		t.getDaySegmentContainer().empty();
	}


	// TODO: have this class (and AgendaEventRenderer) be responsible for creating the event container div

}
