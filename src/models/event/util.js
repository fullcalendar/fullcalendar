
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
