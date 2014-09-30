
/* A day view with an all-day cell area at the top, and a time grid below by resource
----------------------------------------------------------------------------------------------------------------------*/

fcViews.resourceDay = ResourceDayView;

function ResourceDayView(calendar) {
	ResourceView.call(this, calendar); // call the super-constructor

	var superRangeToSegments = this.rangeToSegments;
	this.rangeToSegments = function(start, end) {
		var colCnt = this.colCnt;
		var segments = [];

		$.each(superRangeToSegments(start, end), function(index, segment) {
			for (var col=0; col<colCnt; col++) {
				segments.push({
					row: segment.row,
					leftCol: col,
					rightCol: col,
					isStart: segment.isStart,
					isEnd: segment.isEnd
				});
			}
		});
		return segments;
	};
}

ResourceDayView.prototype = createObject(ResourceView.prototype); // define the super-class
$.extend(ResourceDayView.prototype, {

	name: 'resourceDay',

	incrementDate: function(date, delta) {
		return AgendaDayView.prototype.incrementDate.apply(this, arguments);
	},

	render: function(date) {
		this.start = this.intervalStart = date.clone().stripTime();
		this.end = this.intervalEnd = this.start.clone().add(1, 'days');

		this.title = this.calendar.formatDate(this.start, this.opt('titleFormat'));

		ResourceView.prototype.render.call(this, this.resources().length || 1); // call the super-method
	}

});
