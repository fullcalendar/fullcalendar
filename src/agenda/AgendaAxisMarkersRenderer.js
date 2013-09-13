
function AgendaAxisMarkersRenderer(element, calendar) {
	var t = this;
	
	// exports
	t.renderAxisMarkers = renderAxisMarkers;
	
	function dateToSlotNumber(date) {
		return 2 * (date.getHours() + (date.getMinutes() / 60))
	}

	function renderAxisMarkers(markers) {
		$.each(markers, function(index, marker) {
			/* convert hours into slot numbers */
			var startSlot = Math.floor(dateToSlotNumber(marker.start));
			var endSlot = Math.ceil(dateToSlotNumber(marker.end));

			for(var i = startSlot; i <= endSlot; i++) {
				element
					.find('.fc-agenda-slots .fc-slot' + i + ' .fc-agenda-axis')
					.addClass(marker.className);
			}
		});
	}
}
