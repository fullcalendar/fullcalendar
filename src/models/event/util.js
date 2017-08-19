
function eventDefsToEventInstances(eventDefs, unzonedRange) {
	var eventInstances = [];
	var i;

	for (i = 0; i < eventDefs.length; i++) {
		eventInstances.push.apply(eventInstances, // append
			eventDefs[i].buildInstances(unzonedRange)
		);
	}

	return eventInstances;
}


function eventInstanceToEventRange(eventInstance) {
	return new EventRange(
		eventInstance.dateProfile.unzonedRange,
		eventInstance.def,
		eventInstance
	);
}


function eventRangeToEventFootprint(eventRange) {
	return new EventFootprint(
		new ComponentFootprint(
			eventRange.unzonedRange,
			eventRange.eventDef.isAllDay()
		),
		eventRange.eventDef,
		eventRange.eventInstance // might not exist
	);
}


function eventInstanceToUnzonedRange(eventInstance) {
	return eventInstance.dateProfile.unzonedRange;
}


function eventFootprintToComponentFootprint(eventFootprint) {
	return eventFootprint.componentFootprint;
}
