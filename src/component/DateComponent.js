
var DateComponent = FC.DateComponent = Component.extend({

	uid: null,
	childrenByUid: null,
	isRTL: false, // frequently accessed options
	nextDayThreshold: null, // "

	eventRendererClass: null,
	helperRendererClass: null,
	businessHourRendererClass: null,
	fillRendererClass: null,

	eventRenderer: null,
	helperRenderer: null,
	businessHourRenderer: null,
	fillRenderer: null,

	hitsNeededDepth: 0, // necessary because multiple callers might need the same hits

	hasAllDayBusinessHours: false, // TODO: unify with largeUnit and isTimeScale?

	isDatesRendered: false,
	isEventsRendered: false,
	eventChangeset: null,


	constructor: function() {
		Component.call(this);

		this.uid = String(DateComponent.guid++);
		this.childrenByUid = [];

		this.nextDayThreshold = moment.duration(this.opt('nextDayThreshold'));
		this.isRTL = this.opt('isRTL');

		if (this.fillRendererClass) {
			this.fillRenderer = new this.fillRendererClass(this);
		}

		if (this.eventRendererClass) { // fillRenderer is optional -----v
			this.eventRenderer = new this.eventRendererClass(this, this.fillRenderer);
		}

		if (this.helperRendererClass && this.eventRenderer) {
			this.helperRenderer = new this.helperRendererClass(this, this.eventRenderer);
		}

		if (this.businessHourRendererClass && this.fillRenderer) {
			this.businessHourRenderer = new this.businessHourRendererClass(this, this.fillRenderer);
		}
	},


	addChild: function(child) {
		if (!this.childrenByUid[child.uid]) {
			this.childrenByUid[child.uid] = child;
		}
	},


	removeChild: function(child) {
		if (this.childrenByUid[child.uid]) {
			delete this.childrenByUid[child.uid];
		}
	},


	removeChildren: function() { // all
		var children = Object.values(this.childrenByUid); // because childrenByUid will mutate while iterating
		var i;

		// aggregators can only do one at a time
		for (i = 0; i < children.length; i++) {
			this.removeChild(children[i]);
		}
	},


	requestRender: function(method, args, namespace, actionType) {
		var _this = this;

		this._getView().calendar.renderQueue.queue(function() {
			method.apply(_this, args);
		}, this.uid, namespace, actionType);
	},


	afterSizing: function(method, args) {
		var _this = this;

		this._getView().calendar.afterSizing(function() {
			method.apply(_this, args);
		});
	},


	startBatchRender: function() {
		this._getView().calendar.startBatchRender();
	},


	stopBatchRender: function() {
		this._getView().calendar.stopBatchRender();
	},


	updateSize: function(totalHeight, isAuto, isResize) {
		this.callChildren('updateSize', arguments);
	},


	// Options
	// -----------------------------------------------------------------------------------------------------------------


	opt: function(name) {
		return this._getView().opt(name); // default implementation
	},


	publiclyTrigger: function(/**/) {
		var calendar = this._getCalendar();

		return calendar.publiclyTrigger.apply(calendar, arguments);
	},


	hasPublicHandlers: function(/**/) {
		var calendar = this._getCalendar();

		return calendar.hasPublicHandlers.apply(calendar, arguments);
	},


	// Date
	// -----------------------------------------------------------------------------------------------------------------


	handleDateProfileSet: function(dateProfile) {
		this.setDateProfileInChildren(dateProfile);
	},


	handleDateProfileUnset: function() {
		this.unsetDateProfileInChildren();
	},


	setDateProfileInChildren: function(dateProfile) {
		this.setInChildren('dateProfile', dateProfile);
	},


	unsetDateProfileInChildren: function() {
		this.unsetInChildren('dateProfile');
	},


	executeDateRender: function(dateProfile, skipScroll) { // wrapper
		this.renderDates(dateProfile);
		this.trigger('after:date:render');
		this.isDatesRendered = true;
	},


	executeDateUnrender: function() { // wrapper
		this.trigger('before:date:unrender');
		this.unrenderDates();
		this.isDatesRendered = false;
	},


	// date-cell content only
	renderDates: function(dateProfile) {
		// subclasses should implement
	},


	// date-cell content only
	unrenderDates: function() {
		// subclasses should override
	},


	// Now-Indicator
	// -----------------------------------------------------------------------------------------------------------------


	// Returns a string unit, like 'second' or 'minute' that defined how often the current time indicator
	// should be refreshed. If something falsy is returned, no time indicator is rendered at all.
	getNowIndicatorUnit: function() {
		// subclasses should implement
	},


	// Renders a current time indicator at the given datetime
	renderNowIndicator: function(date) {
		this.callChildren('renderNowIndicator', arguments);
	},


	// Undoes the rendering actions from renderNowIndicator
	unrenderNowIndicator: function() {
		this.callChildren('unrenderNowIndicator', arguments);
	},


	// Business Hours
	// ---------------------------------------------------------------------------------------------------------------


	setBusinessHoursInChildren: function(businessHours) {
		this.setInChildren('businessHours', businessHours);
	},


	unsetBusinessHoursInChildren: function() {
		this.unsetInChildren('businessHours');
	},


	// Renders business-hours onto the view. Assumes updateSize has already been called.
	renderBusinessHours: function(businessHourPayload) {
		var unzonedRange = this.get('dateProfile').activeUnzonedRange;
		var eventInstanceGroup = businessHourPayload[this.hasAllDayBusinessHours ? 'allDay' : 'timed'];
		var eventFootprints;

		if (eventInstanceGroup) {
			eventFootprints = this.eventRangesToEventFootprints(
				eventInstanceGroup.sliceRenderRanges(unzonedRange)
			);
		}
		else {
			eventFootprints = [];
		}

		this.renderBusinessHourEventFootprints(eventFootprints);
	},


	renderBusinessHourEventFootprints: function(eventFootprints) {
		if (this.businessHourRenderer) {
			this.businessHourRenderer.renderEventFootprints(eventFootprints);
		}
	},


	// Unrenders previously-rendered business-hours
	unrenderBusinessHours: function() {
		if (this.businessHourRenderer) {
			this.businessHourRenderer.unrender();
		}
	},


	// Event Data Handling
	// -----------------------------------------------------------------------------------------------------------------


	handleEventChangeset: function(changeset) {
		if (this.hasOwnEventRendering()) {

			if (!this.eventInstanceRepo) {
				this.eventInstanceRepo = new EventInstanceChangeset();
			}
			this.eventInstanceRepo.applyChangeset(changeset);

			if (this.has('displayingEvents')) {
				this.requestRenderEventChangeset(changeset);
			}
		}

		this.callChildren('handleEventChangeset', [ changeset ]);
	},


	handleEventClear: function() {
		if (this.hasOwnEventRendering()) {

			if (this.eventInstanceRepo) {
				this.eventInstanceRepo.clear();
				this.eventInstanceRepo = null;
			}

			if (this.has('displayingEvents')) {
				this.requestRenderEventClear();
			}
		}

		this.callChildren('handleEventClear', arguments);
	},


	// Event Displaying
	// -----------------------------------------------------------------------------------------------------------------


	hasOwnEventRendering: function() {
		return this.eventRenderer || this.renderEvents; // or legacy function
	},


	startDisplayingEvents: function() {
		if (this.eventRenderer) {
			this.eventRenderer.rangeUpdated();
		}

		if (this.eventInstanceRepo) {
			this.requestRenderEventChangeset(this.eventInstanceRepo);
		}
	},


	stopDisplayingEvents: function() {
		if (this.eventInstanceRepo) {
			this.requestRenderEventClear();
		}
	},


	requestRenderEventChangeset: function(changeset) {
		this.requestRender(this.renderEventChangeset, [ changeset ], 'event', 'change');
	},


	requestRenderEventClear: function() {
		this.requestRender(this.renderEventClear, null, 'event', 'clear');
	},


	renderEventChangeset: function(changeset) {
		this.renderEventClear();
		this.renderEventsss(this.eventInstanceRepo.byDefId);
		this.afterSizing(this.triggerAfterEventsRender);
		this.isEventsRendered = true;
	},


	renderEventClear: function() {
		if (this.isEventsRendered) {
			this.triggerBeforeEventsUnrender();
			this.unrenderEventsss();
			this.isEventsRendered = false;
		}
	},


	// TODO: rename once legacy `renderEvents` is out of the way
	renderEventsss: function(eventInstanceHash) {
		if (this.eventRenderer) {
			this.eventRenderer.renderInstanceHash(eventInstanceHash);
		}
		else if (this.renderEvents) { // legacy
			this.renderEvents(convertEventInstanceHashToLegacyArray(eventInstanceHash));
		}
	},


	// TODO: rename once legacy `renderEvents` is out of the way
	unrenderEventsss: function() {
		if (this.eventRenderer) {
			this.eventRenderer.unrender();
		}
		else if (this.destroyEvents) { // legacy
			this.destroyEvents();
		}
	},


	triggerBeforeEventsUnrender: function() {
		if (this.hasPublicHandlers('eventDestroy')) {
			this.getEventSegs().forEach(function(seg) {
				var legacy;

				if (seg.el) { // necessary?
					legacy = seg.footprint.getEventLegacy();

					_this.publiclyTrigger('eventDestroy', {
						context: legacy,
						args: [ legacy, seg.el, _this ]
					});
				}
			});
		}
	},


	triggerAfterEventsRender: function() {
		if (this.hasPublicHandlers('eventAfterRender')) {
			this.getEventSegs().forEach(function(segs) {
				var legacy;

				if (seg.el) { // necessary?
					legacy = seg.footprint.getEventLegacy();

					_this.publiclyTrigger('eventAfterRender', {
						context: legacy,
						args: [ legacy, seg.el, _this ]
					});
				}
			});
		}

		this.trigger('after:events:render');
	},


	getEventSegs: function() { // just for itself
		if (this.eventRenderer) {
			this.eventRenderer.getSegs();
		}

		return [];
	},


	// Drag-n-Drop Rendering (for both events and external elements)
	// ---------------------------------------------------------------------------------------------------------------


	// Renders a visual indication of a event or external-element drag over the given drop zone.
	// If an external-element, seg will be `null`.
	// Must return elements used for any mock events.
	renderDrag: function(eventFootprints, seg, isTouch) {
		var childrenByUid = this.childrenByUid;
		var uid;
		var renderedHelper = false;

		for (uid in childrenByUid) {
			if (childrenByUid[uid].renderDrag(eventFootprints, seg, isTouch)) {
				renderedHelper = true;
			}
		}

		return renderedHelper;
	},


	// Unrenders a visual indication of an event or external-element being dragged.
	unrenderDrag: function() {
		this.callChildren('unrenderDrag', arguments);
	},


	// Event Resizing
	// ---------------------------------------------------------------------------------------------------------------


	// Renders a visual indication of an event being resized.
	renderEventResize: function(eventFootprints, seg, isTouch) {
		// subclasses must implement
	},


	// Unrenders a visual indication of an event being resized.
	unrenderEventResize: function() {
		// subclasses must implement
	},


	// Selection
	// ---------------------------------------------------------------------------------------------------------------


	// Renders a visual indication of the selection
	// TODO: rename to `renderSelection` after legacy is gone
	renderSelectionFootprint: function(componentFootprint) {
		this.renderHighlight(componentFootprint);

		this.callChildren('renderSelectionFootprint', arguments);
	},


	// Unrenders a visual indication of selection
	unrenderSelection: function() {
		this.unrenderHighlight();

		this.callChildren('unrenderSelection', arguments);
	},


	// Highlight
	// ---------------------------------------------------------------------------------------------------------------


	// Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
	renderHighlight: function(componentFootprint) {
		if (this.fillRenderer) {
			this.fillRenderer.renderFootprint(
				'highlight',
				componentFootprint,
				{
					getClasses: function() {
						return [ 'fc-highlight' ];
					}
				}
			);
		}

		this.callChildren('renderHighlight', arguments);
	},


	// Unrenders the emphasis on a date range
	unrenderHighlight: function() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('highlight');
		}

		this.callChildren('unrenderHighlight', arguments);
	},


	// Hit Areas
	// ---------------------------------------------------------------------------------------------------------------
	// just because all DateComponents support this interface
	// doesn't mean they need to have their own internal coord system. they can defer to sub-components.


	hitsNeeded: function() {
		if (!(this.hitsNeededDepth++)) {
			this.prepareHits();
		}

		this.callChildren('hitsNeeded', arguments);
	},


	hitsNotNeeded: function() {
		if (this.hitsNeededDepth && !(--this.hitsNeededDepth)) {
			this.releaseHits();
		}

		this.callChildren('hitsNotNeeded', arguments);
	},


	prepareHits: function() {
		// subclasses can implement
	},


	releaseHits: function() {
		// subclasses can implement
	},


	// Given coordinates from the topleft of the document, return data about the date-related area underneath.
	// Can return an object with arbitrary properties (although top/right/left/bottom are encouraged).
	// Must have a `grid` property, a reference to this current grid. TODO: avoid this
	// The returned object will be processed by getHitFootprint and getHitEl.
	queryHit: function(leftOffset, topOffset) {
		var childrenByUid = this.childrenByUid;
		var uid;
		var hit;

		for (uid in childrenByUid) {
			hit = childrenByUid[uid].queryHit(leftOffset, topOffset);

			if (hit) {
				break;
			}
		}

		return hit;
	},


	getSafeHitFootprint: function(hit) {
		var dateProfile = this.get('dateProfile');
		var footprint = this.getHitFootprint(hit);

		if (!dateProfile.activeUnzonedRange.containsRange(footprint.unzonedRange)) {
			return null;
		}

		return footprint;
	},


	getHitFootprint: function(hit) {
	},


	// Given position-level information about a date-related area within the grid,
	// should return a jQuery element that best represents it. passed to dayClick callback.
	getHitEl: function(hit) {
	},


	/* Converting eventRange -> eventFootprint
	------------------------------------------------------------------------------------------------------------------*/


	eventRangesToEventFootprints: function(eventRanges) {
		var eventFootprints = [];
		var i;

		for (i = 0; i < eventRanges.length; i++) {
			eventFootprints.push(
				eventRangeToEventFootprint(eventRanges[i])
			);
		}

		return eventFootprints;
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
		return [];
	},


	// Utils
	// ---------------------------------------------------------------------------------------------------------------


	callChildren: function(methodName, args) {
		var childrenByUid = this.childrenByUid;
		var uid;

		for (uid in childrenByUid) {
			childrenByUid[uid][methodName].apply(childrenByUid[uid], args);
		}
	},


	setInChildren: function(propName, propValue) {
		var childrenByUid = this.childrenByUid;
		var uid;

		for (uid in childrenByUid) {
			childrenByUid[uid].set(propName, propValue);
		}
	},


	unsetInChildren: function(propName) {
		var childrenByUid = this.childrenByUid;
		var uid;

		for (uid in childrenByUid) {
			childrenByUid[uid].unset(propName);
		}
	},


	_getCalendar: function() { // TODO: strip out. move to generic parent.
		return this.calendar || this.view.calendar;
	},


	_getView: function() { // TODO: strip out. move to generic parent.
		return this.view;
	}

});


DateComponent.guid = 0; // TODO: better system for this?


DateComponent.watch('handleDateProfile', [ 'dateProfile' ], function(deps) {
	this.handleDateProfileSet(deps.dateProfile);
}, function() {
	this.handleDateProfileUnset();
});


DateComponent.watch('businessHoursInChildren', [ 'businessHours' ], function(deps) {
	this.setBusinessHoursInChildren(deps.businessHours);
}, function() {
	this.unsetBusinessHoursInChildren();
});


DateComponent.watch('displayingDates', [ 'dateProfile' ], function(deps) {
	this.requestRender(this.executeDateRender, [ deps.dateProfile ], 'date', 'init');
}, function() {
	this.requestRender(this.executeDateUnrender, null, 'date', 'destroy');
});


DateComponent.watch('displayingBusinessHours', [ 'displayingDates', 'businessHours' ], function(deps) {
	this.requestRender(this.renderBusinessHours, [ deps.businessHours ], 'businessHours', 'init');
}, function() {
	this.requestRender(this.unrenderBusinessHours, null, 'businessHours', 'destroy');
});


DateComponent.watch('displayingEvents', [ 'displayingDates' ], function() {
	this.startDisplayingEvents();
}, function() {
	this.stopDisplayingEvents();
});


// legacy

function convertEventInstanceHashToLegacyArray(eventInstancesByDefId) {
	var eventDefId;
	var eventInstances;
	var legacyEvents = [];
	var i;

	for (eventDefId in eventInstancesByDefId) {
		eventInstances = eventInstancesByDefId[eventDefId];

		for (i = 0; i < eventInstances.length; i++) {
			legacyEvents.push(
				eventInstances[i].toLegacy()
			);
		}
	}

	return legacyEvents;
}
