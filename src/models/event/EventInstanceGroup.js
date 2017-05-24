
function eventInstancesToEventRanges(eventInstances) {
	return eventInstances.map(function(instance) {
		return instance.buildEventRange();
	});
}
