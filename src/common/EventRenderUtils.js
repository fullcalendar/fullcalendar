
var EventRenderUtils = Class.extend({

	delegate: null,

	// derived from options
	eventTimeFormat: null,
	displayEventTime: null,
	displayEventEnd: null,


	/*
	delegate defines:
		- opt
		- _getView
		- computeEventTimeFormat (optional, defaults to smallTimeFormat)
		- computeDisplayEventTime (optional, defaults to true)
		- computeDisplayEventEnd (optional, defaults to false)

	OTHER REQUIREMENTS:
		- must call rangeUpdated() when delegate's range is updated
	*/
	constructor: function(delegate) {
		this.delegate = delegate;
	},


	// Updates values that rely on options and also relate to range
	rangeUpdated: function() {
		var delegate = this.delegate;
		var displayEventTime;
		var displayEventEnd;

		this.eventTimeFormat =
			delegate.opt('eventTimeFormat') ||
			delegate.opt('timeFormat') || // deprecated
			(delegate.computeEventTimeFormat ?
				delegate.computeEventTimeFormat() :
				'') ||
			delegate.opt('smallTimeFormat');

		displayEventTime = delegate.opt('displayEventTime');
		if (displayEventTime == null && delegate.computeDisplayEventTime) {
			displayEventTime = delegate.computeDisplayEventTime(); // might be based off of range
		}
		if (displayEventTime == null) {
			displayEventTime = true;
		}

		displayEventEnd = delegate.opt('displayEventEnd');
		if (displayEventEnd == null && delegate.computeDisplayEventEnd) {
			displayEventEnd = delegate.computeDisplayEventEnd(); // might be based off of range
		}
		if (displayEventEnd == null) {
			displayEventEnd = true;
		}

		this.displayEventTime = displayEventTime;
		this.displayEventEnd = displayEventEnd;
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
		var view = this.delegate._getView();

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
			this.delegate.opt('eventBackgroundColor') ||
			this.delegate.opt('eventColor');
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
			this.delegate.opt('eventBorderColor') ||
			this.delegate.opt('eventColor');
	},


	// Queries for caller-specified color, then falls back to default
	getTextColor: function(eventFootprint) {
		return eventFootprint.eventDef.textColor ||
			this.getDefaultTextColor(eventFootprint);
	},


	getDefaultTextColor: function(eventFootprint) {
		var source = eventFootprint.eventDef.source;

		return source.textColor || this.delegate.opt('eventTextColor');
	}

});
