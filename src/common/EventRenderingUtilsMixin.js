
/*
Caller must call:
- initEventRenderingUtils

This mixin can depend on ChronoComponent:
- opt
- _getView
*/
var EventRenderingUtilsMixin = {

	// derived from options
	eventTimeFormat: null,
	displayEventTime: null,
	displayEventEnd: null,


	// Updates values that rely on options and also relate to range
	initEventRenderingUtils: function() {
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
		var view = this._getView();

		if (formatStr == null) {
			formatStr = this.eventTimeFormat;
		}

		if (displayEnd == null) {
			displayEnd = this.displayEventEnd;
		}

		if (this.displayEventTime && !isAllDay) {
			if (displayEnd && end) {
				return view.formatRange(
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
	}

};
