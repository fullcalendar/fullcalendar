
/*
TODO: Don't rely on legacy simulateDrag
*/
var EventDragUtils = {

	drag: function(rect0, rect1, debug) {
		var el = EventRenderUtils.getSingleEl();
		var elRect = el[0].getBoundingClientRect();
		var point0 = Geom.getRectCenter(
			Geom.intersectRects(elRect, rect0)
		);
		var point1 = Geom.getRectCenter(rect1);
		var deferred = $.Deferred();

		el.simulate('drag', {
			point: point0,
			end: point1,
			debug: debug
		});

		currentCalendar.on('eventDragStop', function() {
			setTimeout(function() {
				deferred.resolve({ isSuccess: false }); // won't do anything if already eventDrop
			}, 100); // must be greater that dragRevertDuration
		});
		currentCalendar.on('eventDrop', function(event) { // always called after eventDragStop, if success
			deferred.resolve({ isSuccess: false, event: event });
		});

		return deferred.promise();
	}

};

pushOptions({
	dragRevertDuration: 0
});
