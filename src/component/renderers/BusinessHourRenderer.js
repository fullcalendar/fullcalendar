
var BusinessHourRenderer = Class.extend({

	isAllDay: false, // subclasses can config
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


	render: function(businessHours) {
		var eventRanges = businessHours.sliceRenderRanges(this.isAllDay);
		var eventFootprints = this.component.eventRangesToEventFootprints(eventRanges);

		this.renderEventFootprints(eventFootprints);
	},


	renderEventFootprints: function(eventFootprints) {
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
	}

});
