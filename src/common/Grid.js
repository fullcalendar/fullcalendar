
/* An abstract class comprised of a "grid" of areas that each represent a specific datetime
----------------------------------------------------------------------------------------------------------------------
Contains:
- hit system
- range->footprint->seg pipeline
- initializing day click
- initializing selection system
- initializing mouse/touch handlers for everything
- initializing event rendering-related options
*/

var Grid = FC.Grid = CoordChronoComponent.extend(SegChronoComponentMixin, {

	view: null, // a View object


	constructor: function(view) {
		this.view = view; // do this first, for opt()

		CoordChronoComponent.apply(this, arguments);

		this.initFillSystem(); // TODO: SegChronoComponentMixin should be responsible
	},


	opt: function(name) {
		return this.view.opt(name);
	},


	/* Dates
	------------------------------------------------------------------------------------------------------------------*/


	// Tells the grid about what period of time to display.
	// Any date-related internal data should be generated.
	setRange: function(unzonedRange) {
		this.rangeUpdated();

		// do after rangeUpdated because initEventRenderingUtils might depend on range-related values
		// TODO: SegChronoComponentMixin should be responsible
		this.initEventRenderingUtils();
	},


	// Called when internal variables that rely on the range should be updated
	rangeUpdated: function() {
	},


	/* Event Rendering
	------------------------------------------------------------------------------------------------------------------*/


	unrenderEvents: function() {
		CoordChronoComponent.prototype.unrenderEvents.apply(this, arguments);

		SegChronoComponentMixin.unrenderEvents.apply(this, arguments);
	}

});
