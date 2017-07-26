
var BusinessHourRenderer = Class.extend({

	isWholeDay: false, // subclasses can config
	component: null,


	/*
	component implements:
		- eventRangesToEventFootprints
		- eventFootprintsToSegs
	*/
	constructor: function(component) {
		this.component = component;
	},


	// TODO: eventually pass-in eventFootprints
	render: function() {
		this.renderFootprints(this.buildEventFootprints());
	},


	renderFootprints: function(eventFootprints) {
		this.renderSegs(
			this.component.eventFootprintsToSegs(eventFootprints)
		);
	},


	renderSegs: function(segs) {
		// subclasses must implement
	},


	unrender: function() {
		// subclasses must implement
	},


	buildEventFootprints: function() {
		var view = this.component.view;
		var calendar = view.calendar;
		var eventInstanceGroup;
		var eventRanges;

		eventInstanceGroup = calendar.buildBusinessInstanceGroup(
			this.isWholeDay,
			calendar.opt('businessHours'),
			view.renderUnzonedRange
		);

		if (eventInstanceGroup) {
			eventRanges = eventInstanceGroup.sliceRenderRanges(
				view.renderUnzonedRange,
				calendar
			);
		}
		else {
			eventRanges = [];
		}

		return this.component.eventRangesToEventFootprints(eventRanges);
	}

});
