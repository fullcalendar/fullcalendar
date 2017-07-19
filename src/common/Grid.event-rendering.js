
Grid.mixin({

	segs: null, // the *event* segments currently rendered in the grid. TODO: rename to `eventSegs`

	// derived from options
	// TODO: move initialization from Grid.js
	eventTimeFormat: null,
	displayEventTime: null,
	displayEventEnd: null,


	// Generates the format string used for event time text, if not explicitly defined by 'timeFormat'
	computeEventTimeFormat: function() {
		return this.opt('smallTimeFormat');
	},


	// Determines whether events should have their end times displayed, if not explicitly defined by 'displayEventTime'.
	// Only applies to non-all-day events.
	computeDisplayEventTime: function() {
		return true;
	},


	// Determines whether events should have their end times displayed, if not explicitly defined by 'displayEventEnd'
	computeDisplayEventEnd: function() {
		return true;
	},


	// Updates values that rely on options and also relate to range
	processEventRenderingOptions: function() {
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


	renderEventsPayload: function(eventsPayload) {
		var id, eventInstanceGroup;
		var eventRenderRanges;
		var eventFootprints;
		var eventSegs;
		var bgSegs = [];
		var fgSegs = [];

		for (id in eventsPayload) {
			eventInstanceGroup = eventsPayload[id];

			eventRenderRanges = eventInstanceGroup.sliceRenderRanges(this.view.activeUnzonedRange);
			eventFootprints = this.eventRangesToEventFootprints(eventRenderRanges);
			eventSegs = this.eventFootprintsToSegs(eventFootprints);

			if (eventInstanceGroup.getEventDef().hasBgRendering()) {
				bgSegs.push.apply(bgSegs, // append
					eventSegs
				);
			}
			else {
				fgSegs.push.apply(fgSegs, // append
					eventSegs
				);
			}
		}

		this.segs = [].concat( // record all segs
			this.renderBgSegs(bgSegs) || bgSegs,
			this.renderFgSegs(fgSegs) || fgSegs
		);
	},


	// Unrenders all events currently rendered on the grid
	unrenderEvents: function() {
		this.handleSegMouseout(); // trigger an eventMouseout if user's mouse is over an event
		this.clearDragListeners();

		this.unrenderFgSegs();
		this.unrenderBgSegs();

		this.segs = null;
	},


	// Retrieves all rendered segment objects currently rendered on the grid
	getEventSegs: function() {
		return this.segs || [];
	},


	// Background Segment Rendering
	// ---------------------------------------------------------------------------------------------------------------
	// TODO: move this to ChronoComponent, but without fill


	// Renders the given background event segments onto the grid.
	// Returns a subset of the segs that were actually rendered.
	renderBgSegs: function(segs) {
		return this.renderFill('bgEvent', segs);
	},


	// Unrenders all the currently rendered background event segments
	unrenderBgSegs: function() {
		this.unrenderFill('bgEvent');
	},


	// Renders a background event element, given the default rendering. Called by the fill system.
	bgEventSegEl: function(seg, el) {
		return this.filterEventRenderEl(seg.footprint, el);
	},


	// Generates an array of classNames to be used for the default rendering of a background event.
	// NEEDED BY FILL SYSTEM, fillSegHtml :(
	bgEventSegClasses: function(seg) {
		return this.getBgEventFootprintClasses(seg.footprint);
	},


	// Generates a semicolon-separated CSS string to be used for the default rendering of a background event.
	// NEEDED BY FILL SYSTEM,  fillSegHtml :(
	bgEventSegCss: function(seg) {
		return {
			'background-color': this.getEventFootprintSkinCss(seg.footprint)['background-color']
		};
	},


	/* Rendering Utils
	------------------------------------------------------------------------------------------------------------------*/


	// Compute the text that should be displayed on an event's element.
	// `range` can be the Event object itself, or something range-like, with at least a `start`.
	// If event times are disabled, or the event has no time, will return a blank string.
	// If not specified, formatStr will default to the eventTimeFormat setting,
	// and displayEnd will default to the displayEventEnd setting.
	getEventTimeText: function(eventFootprint, formatStr, displayEnd) {
		return this._getEventTimeText(
			eventFootprint.eventInstance.dateProfile.start,
			eventFootprint.eventInstance.dateProfile.end,
			eventFootprint.componentFootprint.isAllDay,
			formatStr,
			displayEnd
		);
	},


	_getEventTimeText: function(start, end, isAllDay, formatStr, displayEnd) {

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


	// Generic utility for generating the HTML classNames for an event segment's element
	getSegClasses: function(seg, isDraggable, isResizable) {
		var view = this.view;
		var classes = [
			'fc-event',
			seg.isStart ? 'fc-start' : 'fc-not-start',
			seg.isEnd ? 'fc-end' : 'fc-not-end'
		].concat(this.getEventFootprintClasses(seg.footprint));

		if (isDraggable) {
			classes.push('fc-draggable');
		}
		if (isResizable) {
			classes.push('fc-resizable');
		}

		// event is currently selected? attach a className.
		if (view.isEventDefSelected(seg.footprint.eventDef)) {
			classes.push('fc-selected');
		}

		return classes;
	},






	getBgEventFootprintClasses: function(eventFootprint) {
		var classNames = this.getEventFootprintClasses(eventFootprint);

		classNames.push('fc-bgevent');

		return classNames;
	},


	getEventFootprintClasses: function(eventFootprint) {
		var eventDef = eventFootprint.eventDef;

		return [].concat(
			eventDef.className, // guaranteed to be an array
			eventDef.source.className
		);
	},


	// Utility for generating event skin-related CSS properties
	getEventFootprintSkinCss: function(eventFootprint) {
		return {
			'background-color': this.getEventFootprintBackgroundColor(eventFootprint),
			'border-color': this.getEventFootprintBorderColor(eventFootprint),
			color: this.getEventFootprintTextColor(eventFootprint)
		};
	},


	// Queries for caller-specified color, then falls back to default
	getEventFootprintBackgroundColor: function(eventFootprint) {
		return eventFootprint.eventDef.backgroundColor ||
			eventFootprint.eventDef.color ||
			this.getEventFootprintDefaultBackgroundColor(eventFootprint);
	},


	getEventFootprintDefaultBackgroundColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.backgroundColor ||
			source.color ||
			this.opt('eventBackgroundColor') ||
			this.opt('eventColor');
	},


	// Queries for caller-specified color, then falls back to default
	getEventFootprintBorderColor: function(eventFootprint) {
		return eventFootprint.eventDef.borderColor ||
			eventFootprint.eventDef.color ||
			this.getEventFootprintDefaultBorderColor(eventFootprint);
	},


	getEventFootprintDefaultBorderColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.borderColor ||
			source.color ||
			this.opt('eventBorderColor') ||
			this.opt('eventColor');
	},


	// Queries for caller-specified color, then falls back to default
	getEventFootprintTextColor: function(eventFootprint) {
		return eventFootprint.eventDef.textColor ||
			this.getEventFootprintDefaultTextColor(eventFootprint);
	},


	getEventFootprintDefaultTextColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.textColor ||
			this.opt('eventTextColor');
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
