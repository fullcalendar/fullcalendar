
function BasicEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.clearEvents = clearEvents;

  //xxx yearview. still need?
	//t.bindDaySeg = bindDaySeg;
  //t.calculateDayDelta = calculateDayDelta;

	// imports
	DayEventRenderer.call(t);

	
	function renderEvents(events, modifiedEventId) {
		t.renderDayEvents(events, modifiedEventId);
	}
	
	
	function clearEvents() {
		t.getDaySegmentContainer().empty();
	}


	// TODO: have this class (and AgendaEventRenderer) be responsible for creating the event container div

}
