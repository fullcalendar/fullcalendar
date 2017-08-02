
var BusinessHourRenderer = Class.extend({

	isWholeDay: false, // subclasses can config

	component: null,
	fillRenderer: null,

	segs: null,


	/*
	component implements:
		- eventRangesToEventFootprints
		- eventFootprintsToSegs
	*/
	constructor: function(component, fillRenderer) {
		this.component = component;
		this.fillRenderer = fillRenderer;
	},


	// TODO: eventually pass-in eventFootprints
	render: function() {
		this.renderFootprints(this.buildEventFootprints());
	},


	renderFootprints: function(eventFootprints) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);

		this.renderSegs(segs);
		this.segs = segs;
	},


	renderSegs: function(segs) {
		if (this.fillRenderer) {
			this.fillRenderer.render('businessHours', segs, {
				getClasses: function(seg) {
					return [ 'fc-nonbusiness', 'fc-bgevent' ];
				}
			});
		}
	},


	unrender: function() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('businessHours');
		}

		this.segs = null;
	},


	getSegs: function() {
		return this.segs || [];
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
