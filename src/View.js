
/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/

var View = FC.View = InteractiveDateComponent.extend({

	type: null, // subclass' view name (string)
	name: null, // deprecated. use `type` instead
	title: null, // the text that will be displayed in the header's title

	calendar: null, // owner Calendar object
	viewSpec: null,
	options: null, // hash containing all options. already merged with view-specific-options

	renderQueue: null,
	batchRenderDepth: 0,
	queuedScroll: null,

	isSelected: false, // boolean whether a range of time is user-selected or not
	selectedEventInstance: null,

	eventOrderSpecs: null, // criteria for ordering events when they have same date/time

	// for date utils, computed from options
	isHiddenDayHash: null,

	// now indicator
	isNowIndicatorRendered: null,
	initialNowDate: null, // result first getNow call
	initialNowQueriedMs: null, // ms time the getNow was called
	nowIndicatorTimeoutID: null, // for refresh timing of now indicator
	nowIndicatorIntervalID: null, // "

	// DEPRECATED
	start: null, // use activeUnzonedRange
	end: null, // use activeUnzonedRange
	intervalStart: null, // use currentUnzonedRange
	intervalEnd: null, // use currentUnzonedRange


	constructor: function(calendar, viewSpec) {
		this.calendar = calendar;
		this.viewSpec = viewSpec;

		// shortcuts
		this.type = viewSpec.type;
		this.options = viewSpec.options;

		// .name is deprecated
		this.name = this.type;

		InteractiveDateComponent.call(this);

		this.initRenderQueue();
		this.initHiddenDays();
		this.bindBaseRenderHandlers();
		this.eventOrderSpecs = parseFieldSpecs(this.opt('eventOrder'));

		// legacy
		if (this.initialize) {
			this.initialize();
		}
	},


	_getView: function() {
		return this;
	},


	// Retrieves an option with the given name
	opt: function(name) {
		return this.options[name];
	},


	/* Render Queue
	------------------------------------------------------------------------------------------------------------------*/


	initRenderQueue: function() {
		this.renderQueue = new RenderQueue({
			event: this.opt('eventRenderWait')
		});

		this.renderQueue.on('start', this.onRenderQueueStart.bind(this));
		this.renderQueue.on('stop', this.onRenderQueueStop.bind(this));

		this.on('before:change', this.startBatchRender);
		this.on('change', this.stopBatchRender);
	},


	onRenderQueueStart: function() {
		this.calendar.freezeContentHeight();
		this.addScroll(this.queryScroll());
	},


	onRenderQueueStop: function() {
		if (this.calendar.updateViewSize()) { // success?
			this.popScroll();
		}
		this.calendar.thawContentHeight();
	},


	startBatchRender: function() {
		if (!(this.batchRenderDepth++)) {
			this.renderQueue.pause();
		}
	},


	stopBatchRender: function() {
		if (!(--this.batchRenderDepth)) {
			this.renderQueue.resume();
		}
	},


	requestRender: function(func, namespace, actionType) {
		this.renderQueue.queue(func, namespace, actionType);
	},


	// given func will auto-bind to `this`
	whenSizeUpdated: function(func) {
		if (this.renderQueue.isRunning) {
			this.renderQueue.one('stop', func.bind(this));
		}
		else {
			func.call(this);
		}
	},


	/* Title and Date Formatting
	------------------------------------------------------------------------------------------------------------------*/


	// Computes what the title at the top of the calendar should be for this view
	computeTitle: function(dateProfile) {
		var unzonedRange;

		// for views that span a large unit of time, show the proper interval, ignoring stray days before and after
		if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
			unzonedRange = dateProfile.currentUnzonedRange;
		}
		else { // for day units or smaller, use the actual day range
			unzonedRange = dateProfile.activeUnzonedRange;
		}

		return this.formatRange(
			{
				start: this.calendar.msToMoment(unzonedRange.startMs, dateProfile.isRangeAllDay),
				end: this.calendar.msToMoment(unzonedRange.endMs, dateProfile.isRangeAllDay)
			},
			dateProfile.isRangeAllDay,
			this.opt('titleFormat') || this.computeTitleFormat(dateProfile),
			this.opt('titleRangeSeparator')
		);
	},


	// Generates the format string that should be used to generate the title for the current date range.
	// Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
	computeTitleFormat: function(dateProfile) {
		var currentRangeUnit = dateProfile.currentRangeUnit;

		if (currentRangeUnit == 'year') {
			return 'YYYY';
		}
		else if (currentRangeUnit == 'month') {
			return this.opt('monthYearFormat'); // like "September 2014"
		}
		else if (dateProfile.currentUnzonedRange.as('days') > 1) {
			return 'll'; // multi-day range. shorter, like "Sep 9 - 10 2014"
		}
		else {
			return 'LL'; // one day. longer, like "September 9 2014"
		}
	},


	// Date Setting/Unsetting
	// -----------------------------------------------------------------------------------------------------------------


	setDate: function(date) {
		var currentDateProfile = this.get('dateProfile');
		var newDateProfile = this.buildDateProfile(date, null, true); // forceToValid=true

		if (
			!currentDateProfile ||
			!currentDateProfile.activeUnzonedRange.equals(newDateProfile.activeUnzonedRange)
		) {
			this.set('dateProfile', newDateProfile);
		}
	},


	unsetDate: function() {
		this.unset('dateProfile');
	},


	// Event Data
	// -----------------------------------------------------------------------------------------------------------------


	fetchInitialEvents: function(dateProfile) {
		var calendar = this.calendar;
		var forceAllDay = dateProfile.isRangeAllDay && !this.usesMinMaxTime;

		return calendar.requestEvents(
			calendar.msToMoment(dateProfile.activeUnzonedRange.startMs, forceAllDay),
			calendar.msToMoment(dateProfile.activeUnzonedRange.endMs, forceAllDay)
		);
	},


	bindEventChanges: function() {
		this.listenTo(this.calendar, 'eventsReset', this.resetEvents); // TODO: make this a real event
	},


	unbindEventChanges: function() {
		this.stopListeningTo(this.calendar, 'eventsReset');
	},


	setEvents: function(eventsPayload) {
		this.set('currentEvents', eventsPayload);
		this.set('hasEvents', true);
	},


	unsetEvents: function() {
		this.unset('currentEvents');
		this.unset('hasEvents');
	},


	resetEvents: function(eventsPayload) {
		this.startBatchRender();
		this.unsetEvents();
		this.setEvents(eventsPayload);
		this.stopBatchRender();
	},


	// Date High-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	requestDateRender: function(dateProfile) {
		var _this = this;

		this.requestRender(function() {
			_this.executeDateRender(dateProfile);
		}, 'date', 'init');
	},


	requestDateUnrender: function() {
		var _this = this;

		this.requestRender(function() {
			_this.executeDateUnrender();
		}, 'date', 'destroy');
	},


	// if dateProfile not specified, uses current
	executeDateRender: function(dateProfile) {
		DateComponent.prototype.executeDateRender.apply(this, arguments);

		if (this.render) {
			this.render(); // TODO: deprecate
		}

		this.trigger('datesRendered');
		this.addScroll({ isDateInit: true });
		this.startNowIndicator(); // shouldn't render yet because updateSize will be called soon
	},


	executeDateUnrender: function() {
		this.unselect();
		this.stopNowIndicator();
		this.trigger('before:datesUnrendered');

		if (this.destroy) {
			this.destroy(); // TODO: deprecate
		}

		DateComponent.prototype.executeDateUnrender.apply(this, arguments);
	},


	// "Base" rendering
	// -----------------------------------------------------------------------------------------------------------------


	bindBaseRenderHandlers: function() {
		var _this = this;

		this.on('datesRendered', function() {
			_this.whenSizeUpdated(
				_this.triggerViewRender
			);
		});

		this.on('before:datesUnrendered', function() {
			_this.triggerViewDestroy();
		});
	},


	triggerViewRender: function() {
		this.publiclyTrigger('viewRender', {
			context: this,
			args: [ this, this.el ]
		});
	},


	triggerViewDestroy: function() {
		this.publiclyTrigger('viewDestroy', {
			context: this,
			args: [ this, this.el ]
		});
	},


	// Event High-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	requestEventsRender: function(eventsPayload) {
		var _this = this;

		this.requestRender(function() {
			_this.executeEventRender(eventsPayload);
			_this.whenSizeUpdated(
				_this.triggerAfterEventsRendered
			);
		}, 'event', 'init');
	},


	requestEventsUnrender: function() {
		var _this = this;

		this.requestRender(function() {
			_this.triggerBeforeEventsDestroyed();
			_this.executeEventUnrender();
		}, 'event', 'destroy');
	},


	// Business Hour High-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	requestBusinessHoursRender: function(businessHourGenerator) {
		var _this = this;

		this.requestRender(function() {
			_this.renderBusinessHours(businessHourGenerator);
		}, 'businessHours', 'init');
	},

	requestBusinessHoursUnrender: function() {
		var _this = this;

		this.requestRender(function() {
			_this.unrenderBusinessHours();
		}, 'businessHours', 'destroy');
	},


	// Misc view rendering utils
	// -----------------------------------------------------------------------------------------------------------------


	// Binds DOM handlers to elements that reside outside the view container, such as the document
	bindGlobalHandlers: function() {
		InteractiveDateComponent.prototype.bindGlobalHandlers.apply(this, arguments);

		this.listenTo(GlobalEmitter.get(), {
			touchstart: this.processUnselect,
			mousedown: this.handleDocumentMousedown
		});
	},


	// Unbinds DOM handlers from elements that reside outside the view container
	unbindGlobalHandlers: function() {
		InteractiveDateComponent.prototype.unbindGlobalHandlers.apply(this, arguments);

		this.stopListeningTo(GlobalEmitter.get());
	},


	/* Now Indicator
	------------------------------------------------------------------------------------------------------------------*/


	// Immediately render the current time indicator and begins re-rendering it at an interval,
	// which is defined by this.getNowIndicatorUnit().
	// TODO: somehow do this for the current whole day's background too
	startNowIndicator: function() {
		var _this = this;
		var unit;
		var update;
		var delay; // ms wait value

		if (this.opt('nowIndicator')) {
			unit = this.getNowIndicatorUnit();
			if (unit) {
				update = proxy(this, 'updateNowIndicator'); // bind to `this`

				this.initialNowDate = this.calendar.getNow();
				this.initialNowQueriedMs = +new Date();

				// wait until the beginning of the next interval
				delay = this.initialNowDate.clone().startOf(unit).add(1, unit) - this.initialNowDate;
				this.nowIndicatorTimeoutID = setTimeout(function() {
					_this.nowIndicatorTimeoutID = null;
					update();
					delay = +moment.duration(1, unit);
					delay = Math.max(100, delay); // prevent too frequent
					_this.nowIndicatorIntervalID = setInterval(update, delay); // update every interval
				}, delay);
			}

			// rendering will be initiated in updateSize
		}
	},


	// rerenders the now indicator, computing the new current time from the amount of time that has passed
	// since the initial getNow call.
	updateNowIndicator: function() {
		if (
			this.isDatesRendered &&
			this.initialNowDate // activated before?
		) {
			this.unrenderNowIndicator(); // won't unrender if unnecessary
			this.renderNowIndicator(
				this.initialNowDate.clone().add(new Date() - this.initialNowQueriedMs) // add ms
			);
			this.isNowIndicatorRendered = true;
		}
	},


	// Immediately unrenders the view's current time indicator and stops any re-rendering timers.
	// Won't cause side effects if indicator isn't rendered.
	stopNowIndicator: function() {
		if (this.isNowIndicatorRendered) {

			if (this.nowIndicatorTimeoutID) {
				clearTimeout(this.nowIndicatorTimeoutID);
				this.nowIndicatorTimeoutID = null;
			}
			if (this.nowIndicatorIntervalID) {
				clearInterval(this.nowIndicatorIntervalID);
				this.nowIndicatorIntervalID = null;
			}

			this.unrenderNowIndicator();
			this.isNowIndicatorRendered = false;
		}
	},


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/


	updateSize: function(totalHeight, isAuto, isResize) {

		if (this.setHeight) { // for legacy API
			this.setHeight(totalHeight, isAuto);
		}
		else {
			InteractiveDateComponent.prototype.updateSize.apply(this, arguments);
		}

		this.updateNowIndicator();
	},


	/* Scroller
	------------------------------------------------------------------------------------------------------------------*/


	addScroll: function(scroll) {
		var queuedScroll = this.queuedScroll || (this.queuedScroll = {});

		$.extend(queuedScroll, scroll);
	},


	popScroll: function() {
		this.applyQueuedScroll();
		this.queuedScroll = null;
	},


	applyQueuedScroll: function() {
		if (this.queuedScroll) {
			this.applyScroll(this.queuedScroll);
		}
	},


	queryScroll: function() {
		var scroll = {};

		if (this.isDatesRendered) {
			$.extend(scroll, this.queryDateScroll());
		}

		return scroll;
	},


	applyScroll: function(scroll) {
		if (scroll.isDateInit && this.isDatesRendered) {
			$.extend(scroll, this.computeInitialDateScroll());
		}

		if (this.isDatesRendered) {
			this.applyDateScroll(scroll);
		}
	},


	computeInitialDateScroll: function() {
		return {}; // subclasses must implement
	},


	queryDateScroll: function() {
		return {}; // subclasses must implement
	},


	applyDateScroll: function(scroll) {
		; // subclasses must implement
	},


	/* Event Drag-n-Drop
	------------------------------------------------------------------------------------------------------------------*/


	reportEventDrop: function(eventInstance, eventMutation, el, ev) {
		var eventManager = this.calendar.eventManager;
		var undoFunc = eventManager.mutateEventsWithId(
			eventInstance.def.id,
			eventMutation,
			this.calendar
		);
		var dateMutation = eventMutation.dateMutation;

		// update the EventInstance, for handlers
		if (dateMutation) {
			eventInstance.dateProfile = dateMutation.buildNewDateProfile(
				eventInstance.dateProfile,
				this.calendar
			);
		}

		this.triggerEventDrop(
			eventInstance,
			// a drop doesn't necessarily mean a date mutation (ex: resource change)
			(dateMutation && dateMutation.dateDelta) || moment.duration(),
			undoFunc,
			el, ev
		);
	},


	// Triggers event-drop handlers that have subscribed via the API
	triggerEventDrop: function(eventInstance, dateDelta, undoFunc, el, ev) {
		this.publiclyTrigger('eventDrop', {
			context: el[0],
			args: [
				eventInstance.toLegacy(),
				dateDelta,
				undoFunc,
				ev,
				{}, // {} = jqui dummy
				this
			]
		});
	},


	/* External Element Drag-n-Drop
	------------------------------------------------------------------------------------------------------------------*/


	// Must be called when an external element, via jQuery UI, has been dropped onto the calendar.
	// `meta` is the parsed data that has been embedded into the dragging event.
	// `dropLocation` is an object that contains the new zoned start/end/allDay values for the event.
	reportExternalDrop: function(singleEventDef, isEvent, isSticky, el, ev, ui) {

		if (isEvent) {
			this.calendar.eventManager.addEventDef(singleEventDef, isSticky);
		}

		this.triggerExternalDrop(singleEventDef, isEvent, el, ev, ui);
	},


	// Triggers external-drop handlers that have subscribed via the API
	triggerExternalDrop: function(singleEventDef, isEvent, el, ev, ui) {

		// trigger 'drop' regardless of whether element represents an event
		this.publiclyTrigger('drop', {
			context: el[0],
			args: [
				singleEventDef.dateProfile.start.clone(),
				ev,
				ui,
				this
			]
		});

		if (isEvent) {
			// signal an external event landed
			this.publiclyTrigger('eventReceive', {
				context: this,
				args: [
					singleEventDef.buildInstance().toLegacy(),
					this
				]
			});
		}
	},


	/* Event Resizing
	------------------------------------------------------------------------------------------------------------------*/


	// Must be called when an event in the view has been resized to a new length
	reportEventResize: function(eventInstance, eventMutation, el, ev) {
		var eventManager = this.calendar.eventManager;
		var undoFunc = eventManager.mutateEventsWithId(
			eventInstance.def.id,
			eventMutation,
			this.calendar
		);

		// update the EventInstance, for handlers
		eventInstance.dateProfile = eventMutation.dateMutation.buildNewDateProfile(
			eventInstance.dateProfile,
			this.calendar
		);

		this.triggerEventResize(
			eventInstance,
			eventMutation.dateMutation.endDelta,
			undoFunc,
			el, ev
		);
	},


	// Triggers event-resize handlers that have subscribed via the API
	triggerEventResize: function(eventInstance, durationDelta, undoFunc, el, ev) {
		this.publiclyTrigger('eventResize', {
			context: el[0],
			args: [
				eventInstance.toLegacy(),
				durationDelta,
				undoFunc,
				ev,
				{}, // {} = jqui dummy
				this
			]
		});
	},


	/* Selection (time range)
	------------------------------------------------------------------------------------------------------------------*/


	// Selects a date span on the view. `start` and `end` are both Moments.
	// `ev` is the native mouse event that begin the interaction.
	select: function(footprint, ev) {
		this.unselect(ev);
		this.renderSelectionFootprint(footprint);
		this.reportSelection(footprint, ev);
	},


	renderSelectionFootprint: function(footprint, ev) {
		if (this.renderSelection) { // legacy method in custom view classes
			this.renderSelection(
				footprint.toLegacy(this.calendar)
			);
		}
		else {
			InteractiveDateComponent.prototype.renderSelectionFootprint.apply(this, arguments);
		}
	},


	// Called when a new selection is made. Updates internal state and triggers handlers.
	reportSelection: function(footprint, ev) {
		this.isSelected = true;
		this.triggerSelect(footprint, ev);
	},


	// Triggers handlers to 'select'
	triggerSelect: function(footprint, ev) {
		var dateProfile = this.calendar.footprintToDateProfile(footprint); // abuse of "Event"DateProfile?

		this.publiclyTrigger('select', {
			context: this,
			args: [
				dateProfile.start,
				dateProfile.end,
				ev,
				this
			]
		});
	},


	// Undoes a selection. updates in the internal state and triggers handlers.
	// `ev` is the native mouse event that began the interaction.
	unselect: function(ev) {
		if (this.isSelected) {
			this.isSelected = false;
			if (this.destroySelection) {
				this.destroySelection(); // TODO: deprecate
			}
			this.unrenderSelection();
			this.publiclyTrigger('unselect', {
				context: this,
				args: [ ev, this ]
			});
		}
	},


	/* Event Selection
	------------------------------------------------------------------------------------------------------------------*/


	selectEventInstance: function(eventInstance) {
		if (
			!this.selectedEventInstance ||
			this.selectedEventInstance !== eventInstance
		) {
			this.unselectEventInstance();

			this.getEventSegs().forEach(function(seg) {
				if (
					seg.footprint.eventInstance === eventInstance &&
					seg.el // necessary?
				) {
					seg.el.addClass('fc-selected');
				}
			});

			this.selectedEventInstance = eventInstance;
		}
	},


	unselectEventInstance: function() {
		if (this.selectedEventInstance) {

			this.getEventSegs().forEach(function(seg) {
				if (seg.el) { // necessary?
					seg.el.removeClass('fc-selected');
				}
			});

			this.selectedEventInstance = null;
		}
	},


	isEventDefSelected: function(eventDef) {
		// event references might change on refetchEvents(), while selectedEventInstance doesn't,
		// so compare IDs
		return this.selectedEventInstance && this.selectedEventInstance.def.id === eventDef.id;
	},


	/* Mouse / Touch Unselecting (time range & event unselection)
	------------------------------------------------------------------------------------------------------------------*/
	// TODO: move consistently to down/start or up/end?
	// TODO: don't kill previous selection if touch scrolling


	handleDocumentMousedown: function(ev) {
		if (isPrimaryMouseButton(ev)) {
			this.processUnselect(ev);
		}
	},


	processUnselect: function(ev) {
		this.processRangeUnselect(ev);
		this.processEventUnselect(ev);
	},


	processRangeUnselect: function(ev) {
		var ignore;

		// is there a time-range selection?
		if (this.isSelected && this.opt('unselectAuto')) {
			// only unselect if the clicked element is not identical to or inside of an 'unselectCancel' element
			ignore = this.opt('unselectCancel');
			if (!ignore || !$(ev.target).closest(ignore).length) {
				this.unselect(ev);
			}
		}
	},


	processEventUnselect: function(ev) {
		if (this.selectedEventInstance) {
			if (!$(ev.target).closest('.fc-selected').length) {
				this.unselectEventInstance();
			}
		}
	},


	/* Triggers
	------------------------------------------------------------------------------------------------------------------*/


	triggerBaseRendered: function() {
		this.publiclyTrigger('viewRender', {
			context: this,
			args: [ this, this.el ]
		});
	},


	triggerBaseUnrendered: function() {
		this.publiclyTrigger('viewDestroy', {
			context: this,
			args: [ this, this.el ]
		});
	},


	// Triggers handlers to 'dayClick'
	// Span has start/end of the clicked area. Only the start is useful.
	triggerDayClick: function(footprint, dayEl, ev) {
		var dateProfile = this.calendar.footprintToDateProfile(footprint); // abuse of "Event"DateProfile?

		this.publiclyTrigger('dayClick', {
			context: dayEl,
			args: [ dateProfile.start, ev, this ]
		});
	},


	/* Date Utils
	------------------------------------------------------------------------------------------------------------------*/


	// For DateComponent::getDayClasses
	isDateInOtherMonth: function(date, dateProfile) {
		return false;
	},


	// Arguments after name will be forwarded to a hypothetical function value
	// WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
	// Always clone your objects if you fear mutation.
	getUnzonedRangeOption: function(name) {
		var val = this.opt(name);

		if (typeof val === 'function') {
			val = val.apply(
				null,
				Array.prototype.slice.call(arguments, 1)
			);
		}

		if (val) {
			return this.calendar.parseUnzonedRange(val);
		}
	},


	/* Hidden Days
	------------------------------------------------------------------------------------------------------------------*/


	// Initializes internal variables related to calculating hidden days-of-week
	initHiddenDays: function() {
		var hiddenDays = this.opt('hiddenDays') || []; // array of day-of-week indices that are hidden
		var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
		var dayCnt = 0;
		var i;

		if (this.opt('weekends') === false) {
			hiddenDays.push(0, 6); // 0=sunday, 6=saturday
		}

		for (i = 0; i < 7; i++) {
			if (
				!(isHiddenDayHash[i] = $.inArray(i, hiddenDays) !== -1)
			) {
				dayCnt++;
			}
		}

		if (!dayCnt) {
			throw 'invalid hiddenDays'; // all days were hidden? bad.
		}

		this.isHiddenDayHash = isHiddenDayHash;
	},


	// Remove days from the beginning and end of the range that are computed as hidden.
	trimHiddenDays: function(inputUnzonedRange) {
		var start = inputUnzonedRange.getStart();
		var end = inputUnzonedRange.getEnd();

		if (start) {
			start = this.skipHiddenDays(start);
		}

		if (end) {
			end = this.skipHiddenDays(end, -1, true);
		}

		return new UnzonedRange(start, end);
	},


	// Is the current day hidden?
	// `day` is a day-of-week index (0-6), or a Moment
	isHiddenDay: function(day) {
		if (moment.isMoment(day)) {
			day = day.day();
		}
		return this.isHiddenDayHash[day];
	},


	// Incrementing the current day until it is no longer a hidden day, returning a copy.
	// DOES NOT CONSIDER validUnzonedRange!
	// If the initial value of `date` is not a hidden day, don't do anything.
	// Pass `isExclusive` as `true` if you are dealing with an end date.
	// `inc` defaults to `1` (increment one day forward each time)
	skipHiddenDays: function(date, inc, isExclusive) {
		var out = date.clone();
		inc = inc || 1;
		while (
			this.isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]
		) {
			out.add(inc, 'days');
		}
		return out;
	}

});


View.watch('displayingDates', [ 'isInDom', 'dateProfile' ], function(deps) {
	this.requestDateRender(deps.dateProfile);
}, function() {
	this.requestDateUnrender();
});


View.watch('displayingBusinessHours', [ 'displayingDates', 'businessHourGenerator' ], function(deps) {
	this.requestBusinessHoursRender(deps.businessHourGenerator);
}, function() {
	this.requestBusinessHoursUnrender();
});


View.watch('initialEvents', [ 'dateProfile' ], function(deps) {
	return this.fetchInitialEvents(deps.dateProfile);
});


View.watch('bindingEvents', [ 'initialEvents' ], function(deps) {
	this.setEvents(deps.initialEvents);
	this.bindEventChanges();
}, function() {
	this.unbindEventChanges();
	this.unsetEvents();
});


View.watch('displayingEvents', [ 'displayingDates', 'hasEvents' ], function() {
	this.requestEventsRender(this.get('currentEvents'));
}, function() {
	this.requestEventsUnrender();
});


View.watch('title', [ 'dateProfile' ], function(deps) {
	return (this.title = this.computeTitle(deps.dateProfile)); // assign to View for legacy reasons
});


View.watch('legacyDateProps', [ 'dateProfile' ], function(deps) {
	var calendar = this.calendar;
	var dateProfile = deps.dateProfile;

	// DEPRECATED, but we need to keep it updated...
	this.start = calendar.msToMoment(dateProfile.activeUnzonedRange.startMs, dateProfile.isRangeAllDay);
	this.end = calendar.msToMoment(dateProfile.activeUnzonedRange.endMs, dateProfile.isRangeAllDay);
	this.intervalStart = calendar.msToMoment(dateProfile.currentUnzonedRange.startMs, dateProfile.isRangeAllDay);
	this.intervalEnd = calendar.msToMoment(dateProfile.currentUnzonedRange.endMs, dateProfile.isRangeAllDay);
});
