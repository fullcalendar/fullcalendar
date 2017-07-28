
/*
subclasses MUST implement attachSegEls
*/
var StandardFillRenderer = FillRenderer.extend({

	eventRenderer: null,


	constructor: function(component) {
		FillRenderer.call(this);

		this.eventRenderer = component.eventRenderer;
	},


	// Renders a background event element, given the default rendering. Called by the fill system.
	bgEventSegEl: function(seg, el) {
		return this.eventRenderer.filterEventRenderEl(seg.footprint, el);
	},


	// Generates an array of classNames to be used for the default rendering of a background event.
	bgEventSegClasses: function(seg) {
		return this.eventRenderer.getBgClasses(seg.footprint);
	},


	// Generates a semicolon-separated CSS string to be used for the default rendering of a background event.
	bgEventSegCss: function(seg) {
		return {
			'background-color': this.eventRenderer.getSkinCss(seg.footprint)['background-color']
		};
	},


	// Generates an array of classNames to be used for the rendering business hours overlay.
	businessHoursSegClasses: function(seg) {
		return [ 'fc-nonbusiness', 'fc-bgevent' ];
	},


	// Generates an array of classNames for rendering the highlight.
	// USED BY THE FILL SYSTEM, FillRenderer::buildSegHtml
	highlightSegClasses: function() {
		return [ 'fc-highlight' ];
	}

});
