
var EventRange = UnzonedRange.extend({

	eventInstance: null,
	isStart: true,
	isEnd: true,

	constructor: function(eventInstance, startMs, endMs) {
		UnzonedRange.call(this, startMs, endMs);

		this.eventInstance = eventInstance;
	},

	constrainTo: function(constraintRange) {
		var plainRange = UnzonedRange.prototype.constrainTo.apply(this, arguments);
		var eventRange;

		if (plainRange) {
			eventRange = new EventRange(
				this.eventInstance,
				plainRange.startMs,
				plainRange.endMs
			);

			eventRange.isStart = this.isStart && (this.startMs === plainRange.startMs);
			eventRange.isEnd = this.isEnd && (this.endMs === plainRange.endMs);

			return eventRange;
		}
	}

});
