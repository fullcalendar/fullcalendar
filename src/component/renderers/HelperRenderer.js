
var HelperRenderer = Class.extend({

	view: null,
	component: null,
	eventRenderer: null,
	helperEls: null,


	constructor: function(component, eventRenderer) {
		this.view = component._getView();
		this.component = component;
		this.eventRenderer = eventRenderer;
	},


	renderComponentFootprint: function(componentFootprint) {
		this.renderEventFootprints([
			this.fabricateEventFootprint(componentFootprint)
		]);
	},


	renderEventDraggingFootprints: function(eventFootprints, sourceSeg, isTouch) {
		this.renderEventFootprints(
			eventFootprints,
			sourceSeg,
			'fc-dragging',
			isTouch ? null : this.view.opt('dragOpacity')
		);
	},


	renderEventResizingFootprints: function(eventFootprints, sourceSeg, isTouch) {
		this.renderEventFootprints(
			eventFootprints,
			sourceSeg,
			'fc-resizing'
		);
	},


	renderEventFootprints: function(eventFootprints, sourceSeg, extraClassNames, opacity) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);
		var classNames = 'fc-helper ' + (extraClassNames || '');
		var i;

		// assigns each seg's el and returns a subset of segs that were rendered
		segs = this.eventRenderer.renderFgSegEls(segs);

		for (i = 0; i < segs.length; i++) {
			segs[i].el.addClass(classNames);
		}

		if (opacity != null) {
			for (i = 0; i < segs.length; i++) {
				segs[i].el.css('opacity', opacity);
			}
		}

		this.helperEls = this.renderSegs(segs, sourceSeg);
	},


	/*
	Must return all mock event elements
	*/
	renderSegs: function(segs, sourceSeg) {
		// Subclasses must implement
	},


	unrender: function() {
		if (this.helperEls) {
			this.helperEls.remove();
			this.helperEls = null;
		}
	},


	fabricateEventFootprint: function(componentFootprint) {
		var calendar = this.view.calendar;
		var eventDateProfile = calendar.footprintToDateProfile(componentFootprint);
		var dummyEvent = new SingleEventDef(new EventSource(calendar));
		var dummyInstance;

		dummyEvent.dateProfile = eventDateProfile;
		dummyInstance = dummyEvent.buildInstance();

		return new EventFootprint(componentFootprint, dummyEvent, dummyInstance);
	}

});
