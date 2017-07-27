
/*
Caller must:
- call initSegChronoComponent
- implement componentFootprintToSegs

This mixin can depend on ChronoComponent:
- opt
- _getView
- eventRangesToEventFootprints
- eventFootprintsToSegs
*/
var SegChronoComponentMixin = {

	eventRendererClass: EventRenderer,
	businessHourRendererClass: null,
	fillRendererClass: null, // subclasses MUST provide this

	eventRenderer: null,
	businessHourRenderer: null,
	fillRenderer: null,

	bgSegs: null,
	fgSegs: null,


	initSegChronoComponent: function() {
		this.eventRenderer = new this.eventRendererClass(this);

		if (this.businessHourRendererClass) {
			this.businessHourRenderer = new this.businessHourRendererClass(this);
		}

		if (this.fillRendererClass) {
			this.fillRenderer = new this.fillRendererClass(this);
		}
	},


	// Event Rendering
	// ---------------------------------------------------------------------------------------------------------------


	renderFgEventFootprints: function(eventFootprints) {
		var segs = this.eventFootprintsToSegs(eventFootprints);

		this.fgSegs = this.renderFgEventSegs(segs) || segs;
	},


	renderBgEventFootprints: function(eventFootprints) {
		var segs = this.eventFootprintsToSegs(eventFootprints);

		this.bgSegs = this.renderBgEventSegs(segs) || segs;
	},


	unrenderFgEventFootprints: function() {
		this.unrenderFgEventSegs();
		this.fgSegs = null;
	},


	unrenderBgEventFootprints: function() {
		this.unrenderBgEventSegs();
		this.bgSegs = null;
	},


	// Renders foreground event segments onto the grid. May return a subset of segs that were rendered.
	renderFgEventSegs: function(segs) {
		return this.eventRenderer.renderFgSegs(segs);
	},


	// Unrenders all currently rendered foreground segments
	unrenderFgEventSegs: function() {
		this.endInteractions(); // TODO: called too frequently

		this.eventRenderer.unrenderFgSegs();
	},


	// Renders the given background event segments onto the grid.
	// Returns a subset of the segs that were actually rendered.
	renderBgEventSegs: function(segs) {
		this.endInteractions(); // TODO: called too frequently

		if (this.fillRenderer) {
			return this.fillRenderer.render('bgEvent', segs);
		}

		return [];
	},


	// Unrenders all the currently rendered background event segments
	unrenderBgEventSegs: function() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('bgEvent');
		}
	},


	getEventSegs: function() {
		return (this.bgSegs || []).concat(this.fgSegs || []);
	},


	/* Business Hours
	------------------------------------------------------------------------------------------------------------------*/


	renderBusinessHours: function() {
		if (this.businessHourRenderer) {
			this.businessHourRenderer.render(); // TODO: eventually pass-in eventFootprints
		}
	},


	unrenderBusinessHours: function() {
		if (this.businessHourRenderer) {
			this.businessHourRenderer.unrender();
		}
	},


	/* Implement Highlight
	------------------------------------------------------------------------------------------------------------------*/


	// Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
	renderHighlight: function(componentFootprint) {
		if (this.fillRenderer) {
			this.fillRenderer.render('highlight', this.componentFootprintToSegs(componentFootprint));
		}
	},


	// Unrenders the emphasis on a date range
	unrenderHighlight: function() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('highlight');
		}
	},


	/* Converting componentFootprint/eventFootprint -> segs
	------------------------------------------------------------------------------------------------------------------*/


	eventFootprintsToSegs: function(eventFootprints) {
		var segs = [];
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			segs.push.apply(segs,
				this.eventFootprintToSegs(eventFootprints[i])
			);
		}

		return segs;
	},


	// Given an event's span (unzoned start/end and other misc data), and the event itself,
	// slices into segments and attaches event-derived properties to them.
	// eventSpan - { start, end, isStart, isEnd, otherthings... }
	// constraintRange allow additional clipping. optional. eventually remove this.
	eventFootprintToSegs: function(eventFootprint, constraintRange) {
		var unzonedRange = eventFootprint.componentFootprint.unzonedRange;
		var segs;
		var i, seg;

		if (constraintRange) {
			unzonedRange = unzonedRange.intersect(constraintRange);
		}

		segs = this.componentFootprintToSegs(eventFootprint.componentFootprint);

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];

			if (!unzonedRange.isStart) {
				seg.isStart = false;
			}
			if (!unzonedRange.isEnd) {
				seg.isEnd = false;
			}

			seg.footprint = eventFootprint;
			// TODO: rename to seg.eventFootprint
		}

		return segs;
	},


	componentFootprintToSegs: function(componentFootprint) {
		// subclasses must implement
	}

};
