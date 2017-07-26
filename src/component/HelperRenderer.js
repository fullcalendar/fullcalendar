
var HelperRenderer = Class.extend({

	view: null,
	component: null,
	eventRenderer: null,


	constructor: function(component) {
		this.view = component._getView();
		this.component = component;
		this.eventRenderer = component.eventRenderer;
	},


	renderFootprints: function(eventFootprints, sourceSeg) {
		return this.renderFootprintEls(eventFootprints, sourceSeg)
			.addClass('fc-helper');
	},


	renderFootprintEls: function(eventFootprints, sourceSeg) {
		// Subclasses must implement.
		// Must return all mock event elements.
	},


	// Unrenders a mock event
	unrender: function() {
		// subclasses must implement
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
