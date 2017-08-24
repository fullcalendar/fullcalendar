
var DateComponent = FC.DateComponent = Component.extend({

	uid: null,
	childrenByUid: null,
	isRTL: false, // frequently accessed options
	nextDayThreshold: null, // "
	dateProfile: null, // hack

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


	constructor: function() {
		Component.call(this);

		this.uid = String(DateComponent.guid++);
		this.childrenByUid = {};

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

			this.listenToAndEmit(child, 'after:events:render');

			// make new children catch up with old props
			// TODO: what about eventDataSource? better system for this?
			if (this.has('dateProfile')) {
				child.set('dateProfile', this.get('dateProfile'));
			}
			if (this.has('businessHourGenerator')) {
				this.setBusinessHourGeneratorInChild(this.get('businessHourGenerator'), child);
			}
		}
	},


	removeChild: function(child) {
		if (this.childrenByUid[child.uid]) {
			delete this.childrenByUid[child.uid];

			this.stopListeningTo(child);
		}
	},


	removeChildren: function() { // all
		var children = Object.values(this.childrenByUid); // because childrenByUid will mutate while iterating
		var i;

		for (i = 0; i < children.length; i++) {
			this.removeChild(children[i]);
		}
	},


	requestRender: function(method, args, namespace, actionType) {
		var _this = this;
		var renderQueue = this._getView().calendar.renderQueue;

		renderQueue.queue(function() {
			method.apply(_this, args);
		}, this.uid, namespace, actionType);
	},


	whenSizeUpdated: function(func) {
		var renderQueue = this._getView().calendar.renderQueue;

		if (!renderQueue.isRunning && !renderQueue.isPaused) {
			func.call(this);
		}
		else {
			renderQueue.one('stop', func.bind(this));
		}
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


	setDateProfileInChildren: function(dateProfile) {
		this.setInChildren('dateProfile', dateProfile);
	},


	unsetDateProfileInChildren: function() {
		this.unsetInChildren('dateProfile');
	},


	executeDateRender: function(dateProfile) {
		this.executeDateUnrender();
		this.dateProfile = dateProfile; // for rendering
		this.renderDates(dateProfile);
		this.isDatesRendered = true;
	},


	executeDateUnrender: function() { // wrapper
		if (this.isDatesRendered) {
			this.dateProfile = null;
			this.unrenderDates();
			this.isDatesRendered = false;
		}
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


	setBusinessHourGeneratorInChildren: function(businessHourGenerator) {
		this.iterChildren(this.setBusinessHourGeneratorInChild.bind(this, businessHourGenerator));
	},


	unsetBusinessHourGeneratorInChildren: function() {
		this.iterChildren(this.unsetBusinessHourGeneratorInChild.bind(this));
	},


	setBusinessHourGeneratorInChild: function(businessHourGenerator, child) {
		child.set('businessHourGenerator', businessHourGenerator);
	},


	unsetBusinessHourGeneratorInChild: function(child) {
		child.unset('businessHourGenerator');
	},


	// Renders business-hours onto the view. Assumes updateSize has already been called.
	renderBusinessHours: function(businessHourPayload) {
		var unzonedRange = this.dateProfile.activeUnzonedRange;
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


	// Event Data
	// ---------------------------------------------------------------------------------------------------------------


	setEventDataSourceInChildren: function(eventDataSource) {
		this.setInChildren('eventDataSource', eventDataSource);
	},


	unsetEventDataSourceInChildren: function() {
		this.unsetInChildren('eventDataSource');
	},


	// Event Displaying
	// -----------------------------------------------------------------------------------------------------------------


	startDisplayingEvents: function(eventDataSource) {
		if (eventDataSource.isPopulated) {
			this.requestEventRender(eventDataSource.instanceRepo);
		}

		this.listenTo(eventDataSource, 'receive', function(eventInstanceChangeset) {
			this.requestEventRender(eventDataSource.instanceRepo);
		});
	},


	stopDisplayingEvents: function(eventDataSource) {
		this.stopListeningTo(eventDataSource);

		this.requestEventUnrender();
	},


	requestEventRender: function(eventInstanceRepo) {
		this.requestRender(this.executeEventRender, [ eventInstanceRepo ], 'event', 'destroy');
	},


	requestEventUnrender: function() {
		this.requestRender(this.executeEventUnrender, null, 'event', 'destroy');
	},


	executeEventRender: function(eventInstanceRepo) {
		this.executeEventUnrender();
		if (this.renderEventsss(eventInstanceRepo) !== false) {
			this.triggerAfterEventsRender();
			this.isEventsRendered = true;
		}
	},


	executeEventUnrender: function() {
		if (this.isEventsRendered) {
			this.triggerBeforeEventsUnrender();
			this.unrenderEventsss();
			this.isEventsRendered = false;
		}
	},


	// TODO: rename once legacy `renderEvents` is out of the way
	// returning `false` indicates that nothing happened
	renderEventsss: function(eventInstanceRepo) {
		if (this.eventRenderer) {
			this.eventRenderer.rangeUpdated(); // poorly named now
			this.eventRenderer.renderInstanceHash(eventInstanceRepo.byDefId);
		}
		else if (this.renderEvents) { // legacy
			this.renderEvents(convertEventInstanceHashToLegacyArray(eventInstanceRepo.byDefId));
		}
		else {
			return false;
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


	triggerAfterEventsRender: function() {
		this.trigger('after:events:render', this.getEventSegs());
	},


	triggerBeforeEventsUnrender: function() {
		this.triggerEventDestroyForSegs(this.getEventSegs());
	},


	triggerEventDestroyForSegs: function(segs) {
		var _this = this;

		if (this.hasPublicHandlers('eventDestroy')) {
			segs.forEach(function(seg) {
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


	getRecursiveEventSegs: function() { // TODO: get rid of
		var segs = this.getEventSegs();

		this.iterChildren(function(child) {
			segs.push.apply(segs, child.getRecursiveEventSegs());
		});

		return segs;
	},


	getRecursiveBusinessHourSegs: function() { // TODO: get rid of
		var segs = this.businessHourRenderer ? this.businessHourRenderer.getSegs() : [];

		this.iterChildren(function(child) {
			segs.push.apply(segs, child.getRecursiveBusinessHourSegs());
		});

		return segs;
	},


	getEventSegs: function() { // just for itself
		if (this.eventRenderer) {
			return this.eventRenderer.getSegs();
		}

		return [];
	},


	// Event Rendering Utils
	// -----------------------------------------------------------------------------------------------------------------


	// Hides all rendered event segments linked to the given event
	// RECURSIVE with subcomponents
	showEventsWithId: function(eventDefId) {
		this.getEventSegs().forEach(function(seg) {
			if (
				seg.footprint.eventDef.id === eventDefId &&
				seg.el // necessary?
			) {
				seg.el.css('visibility', '');
			}
		});

		this.callChildren('showEventsWithId', arguments);
	},


	// Shows all rendered event segments linked to the given event
	// RECURSIVE with subcomponents
	hideEventsWithId: function(eventDefId) {
		this.getEventSegs().forEach(function(seg) {
			if (
				seg.footprint.eventDef.id === eventDefId &&
				seg.el // necessary?
			) {
				seg.el.css('visibility', 'hidden');
			}
		});

		this.callChildren('hideEventsWithId', arguments);
	},


	// Drag-n-Drop Rendering (for both events and external elements)
	// ---------------------------------------------------------------------------------------------------------------


	// Renders a visual indication of a event or external-element drag over the given drop zone.
	// If an external-element, seg will be `null`.
	// Must return elements used for any mock events.
	renderDrag: function(eventFootprints, seg, isTouch) {
		var renderedHelper = false;

		this.iterChildren(function(child) {
			if (child.renderDrag(eventFootprints, seg, isTouch)) {
				renderedHelper = true;
			}
		});

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
		this.callChildren('renderEventResize', arguments);
	},


	// Unrenders a visual indication of an event being resized.
	unrenderEventResize: function() {
		this.callChildren('unrenderEventResize', arguments);
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
		var footprint = this.getHitFootprint(hit);

		if (!this.dateProfile.activeUnzonedRange.containsRange(footprint.unzonedRange)) {
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
			eventFootprints.push.apply( // append
				eventFootprints,
				this.eventRangeToEventFootprints(eventRanges[i])
			);
		}

		return eventFootprints;
	},


	eventRangeToEventFootprints: function(eventRange) {
		return [ eventRangeToEventFootprint(eventRange) ];
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
		this.iterChildren(function(child) {
			child[methodName].apply(child, args);
		});
	},


	setInChildren: function(propName, propValue) {
		this.iterChildren(function(child) {
			child.set(propName, propValue);
		});
	},


	unsetInChildren: function(propName) {
		this.iterChildren(function(child) {
			child.unset(propName);
		});
	},


	iterChildren: function(func) {
		var childrenByUid = this.childrenByUid;
		var uid;

		for (uid in childrenByUid) {
			func(childrenByUid[uid]);
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


DateComponent.watch('dateProfileInChildren', [ 'dateProfile' ], function(deps) {
	this.setDateProfileInChildren(deps.dateProfile);
}, function() {
	this.unsetDateProfileInChildren();
});


DateComponent.watch('businessHourGeneratorInChildren', [ 'businessHourGenerator' ], function(deps) {
	this.setBusinessHourGeneratorInChildren(deps.businessHourGenerator);
}, function() {
	this.unsetBusinessHourGeneratorInChildren();
});


DateComponent.watch('businessHours', [ 'businessHourGenerator', 'dateProfile' ], function(deps) {
	var businessHourGenerator = deps.businessHourGenerator;
	var unzonedRange = deps.dateProfile.activeUnzonedRange;

	return {
		allDay: businessHourGenerator.buildEventInstanceGroup(true, unzonedRange),
		timed: businessHourGenerator.buildEventInstanceGroup(false, unzonedRange)
	};
});


DateComponent.watch('eventDataSourceInChildren', [ 'eventDataSource' ], function(deps) {
	this.setEventDataSourceInChildren(deps.eventDataSource);
}, function(deps) {
	this.unsetEventDataSourceInChildren(deps.eventDataSource);
});


DateComponent.watch('displayingDates', [ 'dateProfile' ], function(deps) {
	this.requestRender(this.executeDateRender, [ deps.dateProfile ], 'date', 'destroy');
}, function() {
	this.requestRender(this.executeDateUnrender, null, 'date', 'destroy');
});


DateComponent.watch('displayingBusinessHours', [ 'displayingDates', 'businessHours' ], function(deps) {
	this.requestRender(this.renderBusinessHours, [ deps.businessHours ], 'businessHours', 'init');
}, function() {
	this.requestRender(this.unrenderBusinessHours, null, 'businessHours', 'destroy');
});


DateComponent.watch('displayingEvents', [ 'displayingDates', 'eventDataSource' ], function(deps) {
	this.startDisplayingEvents(deps.eventDataSource);
}, function(deps) {
	this.stopDisplayingEvents(deps.eventDataSource);
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
