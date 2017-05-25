
function eventDefsToEventInstances(eventDefs, start, end) {
	var eventInstances = [];
	var i;

	for (i = 0; i < eventDefs.length; i++) {
		eventInstances.push.apply(eventInstances, // append
			eventDefs[i].buildInstances(start, end)
		);
	}

	return eventInstances;
}


function eventInstancesToEventRanges(eventInstances) {
	return eventInstances.map(function(instance) {
		return instance.buildEventRange();
	});
}


function collectDateRangesFromEventRanges(eventRanges) {
	return eventRanges.map(function(eventRange) {
		return eventRange.dateRange;
	});
}


function eventFootprintsToComponentFootprints(eventFootprints) {
	return eventFootprints.map(function(eventFootprint) {
		return eventFootprint.componentFootprint;
	});
}
