function TimeslotsView(element, calendar, viewName) {
	var t = this;


	// exports
	t.renderTimeslots = renderTimeslots;

	// imports
	AgendaView.call(t, element, calendar, viewName);
	var opt = t.opt;
	var timePosition = t.timePosition;
	var setHeight = t.setHeight;

	// locals

	var timeslots;
	var timeslotsGrid;
	var slotContent;
	var slotSegmentContainer;

	function renderTimeslots(c) {
		updateOptions();
		buildSkeleton();
	}

	function updateOptions() {
		//debugger;
		var slots = opt('slots');
		var d = zeroDate();
		var startTime;
		var endTime;
		timeslots = [];
		for(var i=0, len=slots.length ; i<len ; i++ ) {
			startTime = parseTime(slots[i].start);
			endTime = parseTime(slots[i].end);
			timeslots.push({
				start: addMinutes(cloneDate(d), startTime),
				end: addMinutes(cloneDate(d), endTime),
				duration: Math.abs(endTime - startTime)
			});
		}
		//console.debug(timeslots);
	}

	function buildSkeleton() {
		var s;
		var slot;
		var top;
		var d0 = zeroDate();

		setHeight(); // no params means set to viewHeight

		slotContent = t.getBodyContent();
		slotSegmentContainer = t.getSlotSegmentContainer();

		timeslotsGrid =
			$('<div class="fc-timeslots-slots" />')
				.prependTo(slotContent);

		s = '';
		for(var i=0, len=timeslots.length ; i<len ; i++ ) {
			slot = timeslots[i];
			top = timePosition(d0, slot.start);
			s += '<div class="fc-timeslots-slot" style="top:' + top + 'px;" />';
			//debugger;
		}
		$(s).appendTo(timeslotsGrid);
		//debugger;
	}
}
