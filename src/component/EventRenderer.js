
var EventRenderer = Class.extend({

	view: null,
	component: null,
	fillRenderer: null,

	fgSegs: null,
	bgSegs: null,

	// derived from options
	eventTimeFormat: null,
	displayEventTime: null,
	displayEventEnd: null,


	constructor: function(component) {
		this.view = component._getView();
		this.component = component;
		this.fillRenderer = component.fillRenderer;
	},


	opt: function(name) {
		return this.view.opt(name);
	},


	// Updates values that rely on options and also relate to range
	rangeUpdated: function() {
		var displayEventTime;
		var displayEventEnd;

		this.eventTimeFormat =
			this.opt('eventTimeFormat') ||
			this.opt('timeFormat') || // deprecated
			this.computeEventTimeFormat();

		displayEventTime = this.opt('displayEventTime');
		if (displayEventTime == null) {
			displayEventTime = this.computeDisplayEventTime(); // might be based off of range
		}

		displayEventEnd = this.opt('displayEventEnd');
		if (displayEventEnd == null) {
			displayEventEnd = this.computeDisplayEventEnd(); // might be based off of range
		}

		this.displayEventTime = displayEventTime;
		this.displayEventEnd = displayEventEnd;
	},


	renderFgFootprints: function(eventFootprints) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);

		// render an `.el` on each seg
		// returns a subset of the segs. segs that were actually rendered
		segs = this.renderFgSegEls(segs);

		if (this.renderFgSegs(segs) !== false) { // no failure?
			this.fgSegs = segs;
		}
	},


	unrenderFgFootprints: function() {
		this.unrenderFgSegs();
		this.fgSegs = null;
	},


	renderBgFootprints: function(eventFootprints) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);

		if (this.renderBgSegs(segs) !== false) { // no failure?
			this.bgSegs = segs;
		}
	},


	unrenderBgFootprints: function() {
		this.unrenderBgSegs();
		this.bgSegs = null;
	},


	getSegs: function() {
		return (this.bgSegs || []).concat(this.fgSegs || []);
	},


	// Renders foreground event segments onto the grid
	renderFgSegs: function(segs) {
		// subclasses must implement
		// segs already has rendered els, and has been filtered.

		return false; // signal failure if not implemented
	},


	// Unrenders all currently rendered foreground segments
	unrenderFgSegs: function() {
		// subclasses must implement
	},


	renderBgSegs: function(segs) {
		var _this = this;

		if (this.fillRenderer) {
			this.fillRenderer.render('bgEvent', segs, {
				getClasses: function(seg) {
					return _this.getBgClasses(seg.footprint);
				},
				getCss: function(seg) {
					return {
						'background-color': _this.getBgColor(seg.footprint)
					};
				},
				filterEl: function(seg, el) {
					return _this.filterEventRenderEl(seg.footprint, el);
				}
			});
		}
		else {
			return false; // signal failure if no fillRenderer
		}
	},


	unrenderBgSegs: function() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('bgEvent');
		}
	},


	// Renders and assigns an `el` property for each foreground event segment.
	// Only returns segments that successfully rendered.
	renderFgSegEls: function(segs, disableResizing) {
		var _this = this;
		var hasEventRenderHandlers = this.view.hasPublicHandlers('eventRender');
		var html = '';
		var renderedSegs = [];
		var i;

		if (segs.length) { // don't build an empty html string

			// build a large concatenation of event segment HTML
			for (i = 0; i < segs.length; i++) {
				html += this.fgSegHtml(segs[i], disableResizing);
			}

			// Grab individual elements from the combined HTML string. Use each as the default rendering.
			// Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
			$(html).each(function(i, node) {
				var seg = segs[i];
				var el = $(node);

				if (hasEventRenderHandlers) { // optimization
					el = _this.filterEventRenderEl(seg.footprint, el);
				}

				if (el) {
					el.data('fc-seg', seg); // used by handlers
					seg.el = el;
					renderedSegs.push(seg);
				}
			});
		}

		return renderedSegs;
	},


	// Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
	fgSegHtml: function(seg, disableResizing) {
		// subclasses should implement
	},


	// Generic utility for generating the HTML classNames for an event segment's element
	getSegClasses: function(seg, isDraggable, isResizable) {
		var classes = [
			'fc-event',
			seg.isStart ? 'fc-start' : 'fc-not-start',
			seg.isEnd ? 'fc-end' : 'fc-not-end'
		].concat(this.getClasses(seg.footprint));

		if (isDraggable) {
			classes.push('fc-draggable');
		}
		if (isResizable) {
			classes.push('fc-resizable');
		}

		// event is currently selected? attach a className.
		if (this.view.isEventDefSelected(seg.footprint.eventDef)) {
			classes.push('fc-selected');
		}

		return classes;
	},


	// Given an event and the default element used for rendering, returns the element that should actually be used.
	// Basically runs events and elements through the eventRender hook.
	filterEventRenderEl: function(eventFootprint, el) {
		var legacy = eventFootprint.getEventLegacy();

		var custom = this.view.publiclyTrigger('eventRender', {
			context: legacy,
			args: [ legacy, el, this.view ]
		});

		if (custom === false) { // means don't render at all
			el = null;
		}
		else if (custom && custom !== true) {
			el = $(custom);
		}

		return el;
	},


	// Compute the text that should be displayed on an event's element.
	// `range` can be the Event object itself, or something range-like, with at least a `start`.
	// If event times are disabled, or the event has no time, will return a blank string.
	// If not specified, formatStr will default to the eventTimeFormat setting,
	// and displayEnd will default to the displayEventEnd setting.
	getTimeText: function(eventFootprint, formatStr, displayEnd) {
		return this._getTimeText(
			eventFootprint.eventInstance.dateProfile.start,
			eventFootprint.eventInstance.dateProfile.end,
			eventFootprint.componentFootprint.isAllDay,
			formatStr,
			displayEnd
		);
	},


	_getTimeText: function(start, end, isAllDay, formatStr, displayEnd) {
		if (formatStr == null) {
			formatStr = this.eventTimeFormat;
		}

		if (displayEnd == null) {
			displayEnd = this.displayEventEnd;
		}

		if (this.displayEventTime && !isAllDay) {
			if (displayEnd && end) {
				return this.view.formatRange(
					{ start: start, end: end },
					false, // allDay
					formatStr
				);
			}
			else {
				return start.format(formatStr);
			}
		}

		return '';
	},


	computeEventTimeFormat: function() {
		return this.opt('smallTimeFormat');
	},


	computeDisplayEventTime: function() {
		return true;
	},


	computeDisplayEventEnd: function() {
		return true;
	},


	getBgClasses: function(eventFootprint) {
		var classNames = this.getClasses(eventFootprint);

		classNames.push('fc-bgevent');

		return classNames;
	},


	getClasses: function(eventFootprint) {
		var eventDef = eventFootprint.eventDef;

		return [].concat(
			eventDef.className, // guaranteed to be an array
			eventDef.source.className
		);
	},


	// Utility for generating event skin-related CSS properties
	getSkinCss: function(eventFootprint) {
		return {
			'background-color': this.getBgColor(eventFootprint),
			'border-color': this.getBorderColor(eventFootprint),
			color: this.getTextColor(eventFootprint)
		};
	},


	// Queries for caller-specified color, then falls back to default
	getBgColor: function(eventFootprint) {
		return eventFootprint.eventDef.backgroundColor ||
			eventFootprint.eventDef.color ||
			this.getDefaultBgColor(eventFootprint);
	},


	getDefaultBgColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.backgroundColor ||
			source.color ||
			this.opt('eventBackgroundColor') ||
			this.opt('eventColor');
	},


	// Queries for caller-specified color, then falls back to default
	getBorderColor: function(eventFootprint) {
		return eventFootprint.eventDef.borderColor ||
			eventFootprint.eventDef.color ||
			this.getDefaultBorderColor(eventFootprint);
	},


	getDefaultBorderColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.borderColor ||
			source.color ||
			this.opt('eventBorderColor') ||
			this.opt('eventColor');
	},


	// Queries for caller-specified color, then falls back to default
	getTextColor: function(eventFootprint) {
		return eventFootprint.eventDef.textColor ||
			this.getDefaultTextColor(eventFootprint);
	},


	getDefaultTextColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.textColor || this.opt('eventTextColor');
	},


	sortEventSegs: function(segs) {
		segs.sort(proxy(this, 'compareEventSegs'));
	},


	// A cmp function for determining which segments should take visual priority
	compareEventSegs: function(seg1, seg2) {
		var f1 = seg1.footprint.componentFootprint;
		var r1 = f1.unzonedRange;
		var f2 = seg2.footprint.componentFootprint;
		var r2 = f2.unzonedRange;

		return r1.startMs - r2.startMs || // earlier events go first
			(r2.endMs - r2.startMs) - (r1.endMs - r1.startMs) || // tie? longer events go first
			f2.isAllDay - f1.isAllDay || // tie? put all-day events first (booleans cast to 0/1)
			compareByFieldSpecs(
				seg1.footprint.eventDef,
				seg2.footprint.eventDef,
				this.view.eventOrderSpecs
			);
	}

});
