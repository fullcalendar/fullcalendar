
var ChronoComponent = Component.extend({

	children: null,
	isRTL: false, // frequently accessed options
	nextDayThreshold: null, // "

	eventRendererClass: null,
	helperRendererClass: null,
	businessHourRendererClass: null,
	fillRendererClass: null,
	dateClickingClass: null,
	dateSelectingClass: null,
	eventPointingClass: null,
	eventDraggingClass: null,
	eventResizingClass: null,
	externalDroppingClass: null,

	eventRenderer: null,
	helperRenderer: null,
	businessHourRenderer: null,
	fillRenderer: null,
	dateClicking: null,
	dateSelecting: null,
	eventPointing: null,
	eventDragging: null,
	eventResizing: null,
	externalDropping: null,

	// self-config, overridable by subclasses
	segSelector: '.fc-event-container > *', // what constitutes an event element?

	// if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
	// of the date areas. if not defined, assumes to be day and time granularity.
	// TODO: port isTimeScale into same system?
	largeUnit: null,

	hitsNeededDepth: 0, // necessary because multiple callers might need the same hits


	constructor: function() {
		Component.call(this);

		this.children = [];

		this.nextDayThreshold = moment.duration(this.opt('nextDayThreshold'));
		this.isRTL = this.opt('isRTL');

		if (this.fillRendererClass) {
			this.fillRenderer = new this.fillRendererClass(this);
		}

		// NOTE: this.fillRenderer needs to already be assigned!
		// TODO: make ordering not matter
		if (this.eventRendererClass) {
			this.eventRenderer = new this.eventRendererClass(this);
		}

		// NOTE: this.eventRenderer needs to already be assigned!
		// TODO: make ordering not matter
		if (this.helperRendererClass) {
			this.helperRenderer = new this.helperRendererClass(this);
		}

		// NOTE: this.fillRenderer needs to already be assigned!
		// TODO: make ordering not matter
		if (this.businessHourRendererClass) {
			this.businessHourRenderer = new this.businessHourRendererClass(this);
		}

		if (this.dateSelectingClass) {
			this.dateClicking = new this.dateClickingClass(this);
		}

		if (this.dateSelectingClass) {
			this.dateSelecting = new this.dateSelectingClass(this);
		}

		if (this.eventPointingClass) {
			this.eventPointing = new this.eventPointingClass(this);
		}

		if (this.eventDraggingClass) {
			this.eventDragging = new this.eventDraggingClass(this);
		}

		if (this.eventResizingClass) {
			this.eventResizing = new this.eventResizingClass(this);
		}

		if (this.externalDroppingClass) {
			this.externalDropping = new this.externalDroppingClass(this);
		}
	},


	addChild: function(chronoComponent) {
		this.children.push(chronoComponent);
	},


	// Options
	// -----------------------------------------------------------------------------------------------------------------


	opt: function(name) {
		// subclasses must implement
	},


	publiclyTrigger: function(/**/) {
		var calendar = this._getCalendar();

		return calendar.publiclyTrigger.apply(calendar, arguments);
	},


	hasPublicHandlers: function(/**/) {
		var calendar = this._getCalendar();

		return calendar.hasPublicHandlers.apply(calendar, arguments);
	},


	// Element
	// -----------------------------------------------------------------------------------------------------------------


	// Sets the container element that the view should render inside of, does global DOM-related initializations,
	// and renders all the non-date-related content inside.
	setElement: function(el) {
		Component.prototype.setElement.apply(this, arguments);

		if (this.dateClicking) {
			this.dateClicking.bindToEl(el);
		}

		if (this.dateSelecting) {
			this.dateSelecting.bindToEl(el);
		}

		this.bindAllSegHandlersToEl(el);
	},


	bindGlobalHandlers: function() {
		if (this.externalDropping) {
			this.externalDropping.bindToDocument();
		}
	},


	unbindGlobalHandlers: function() {
		if (this.externalDropping) {
			this.externalDropping.unbindFromDocument();
		}
	},


	render: function() {
		this.renderSkeleton();
	},


	unrender: function() {
		this.endInteractions();
		this.unrenderSkeleton();
	},


	// Skeleton
	// -----------------------------------------------------------------------------------------------------------------


	// Renders the basic structure of the view before any content is rendered
	renderSkeleton: function() {
		// subclasses should implement
	},


	// Unrenders the basic structure of the view
	unrenderSkeleton: function() {
		// subclasses should implement
	},


	// Date Low-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	// date-cell content only
	renderDates: function() {
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
		this.callChildren('renderNowIndicator', date);
	},


	// Undoes the rendering actions from renderNowIndicator
	unrenderNowIndicator: function() {
		this.callChildren('unrenderNowIndicator');
	},


	// Business Hours
	// ---------------------------------------------------------------------------------------------------------------


	// Renders business-hours onto the view. Assumes updateSize has already been called.
	renderBusinessHours: function() {
		if (this.businessHourRenderer) {
			this.businessHourRenderer.render(); // TODO: eventually pass-in eventFootprints
		}

		this.callChildren('renderBusinessHours');
	},


	// Unrenders previously-rendered business-hours
	unrenderBusinessHours: function() {
		if (this.businessHourRenderer) {
			this.businessHourRenderer.unrender();
		}

		this.callChildren('unrenderBusinessHours');
	},


	// Event Rendering
	// -----------------------------------------------------------------------------------------------------------------


	// TODO: eventually rename to `renderEvents` once legacy is gone.
	renderEventsPayload: function(eventsPayload) {
		var view = this._getView();
		var id, eventInstanceGroup;
		var eventRenderRanges;
		var eventFootprints;
		var bgFootprints = [];
		var fgFootprints = [];

		for (id in eventsPayload) {
			eventInstanceGroup = eventsPayload[id];
			eventRenderRanges = eventInstanceGroup.sliceRenderRanges(view.activeUnzonedRange);
			eventFootprints = this.eventRangesToEventFootprints(eventRenderRanges);

			if (eventInstanceGroup.getEventDef().hasBgRendering()) {
				bgFootprints.push.apply(bgFootprints, eventFootprints);
			}
			else {
				fgFootprints.push.apply(fgFootprints, eventFootprints);
			}
		}

		this.renderBgEventFootprints(bgFootprints);
		this.renderFgEventFootprints(fgFootprints);
	},


	// Unrenders all events currently rendered on the grid
	unrenderEvents: function() {

		this.unrenderFgEventFootprints();
		this.unrenderBgEventFootprints();

		// we DON'T need to call updateHeight() because
		// a renderEventsPayload() call always happens after this, which will eventually call updateHeight()
	},


	renderFgEventFootprints: function(eventFootprints) {
		if (this.eventRenderer) {
			this.eventRenderer.renderFgFootprints(eventFootprints);
		}

		this.callChildren('renderFgEventFootprints', eventFootprints);
	},


	renderBgEventFootprints: function(eventFootprints) {
		if (this.eventRenderer) {
			this.eventRenderer.renderBgFootprints(eventFootprints);
		}

		this.callChildren('renderBgEventFootprints', eventFootprints);
	},


	// Removes event elements from the view.
	unrenderFgEventFootprints: function() {
		this.endInteractions(); // TODO: called too frequently

		if (this.eventRenderer) {
			this.eventRenderer.unrenderFgFootprints();
		}

		this.callChildren('unrenderFgEventFootprints');
	},


	// Removes event elements from the view.
	unrenderBgEventFootprints: function() {
		this.endInteractions(); // TODO: called too frequently

		if (this.eventRenderer) {
			this.eventRenderer.unrenderBgFootprints();
		}

		this.callChildren('unrenderBgEventFootprints');
	},


	// Retrieves all segment objects that are rendered in the view
	getEventSegs: function() {
		var segs = this.eventRenderer ?
			this.eventRenderer.getSegs() :
			[];
		var children = this.children;
		var i;

		for (i = 0; i < children.length; i++) {
			segs.push.apply( // append
				segs,
				children[i].getEventSegs()
			);
		}

		return segs;
	},


	// Interaction
	// ---------------------------------------------------------------------------------------------------------------


	bindDateHandlerToEl: function(el, name, handler) {
		var _this = this;

		// attach a handler to the grid's root element.
		// jQuery will take care of unregistering them when removeElement gets called.
		this.el.on(name, function(ev) {
			if (
				!$(ev.target).is(
					_this.segSelector + ',' + // directly on an event element
					_this.segSelector + ' *,' + // within an event element
					'.fc-more,' + // a "more.." link
					'a[data-goto]' // a clickable nav link
				)
			) {
				return handler.call(_this, ev);
			}
		});
	},


	bindSegHandlerToEl: function(el, name, handler) {
		var _this = this;

		el.on(name, this.segSelector, function(ev) {
			var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEventsPayload

			if (seg && !_this.shouldIgnoreEventPointing()) {
				return handler.call(_this, seg, ev); // context will be the Grid
			}
		});
	},


	bindAllSegHandlersToEl: function(el) {
		[
			this.eventPointing,
			this.eventDragging,
			this.eventResizing
		].forEach(function(eventInteraction) {
			if (eventInteraction) {
				eventInteraction.bindToEl(el);
			}
		});
	},


	shouldIgnoreMouse: function() {
		// HACK
		// This will still work even though bindDateHandlerToEl doesn't use GlobalEmitter.
		return GlobalEmitter.get().shouldIgnoreMouse();
	},


	shouldIgnoreTouch: function() {
		var view = this._getView();

		// On iOS (and Android?) when a new selection is initiated overtop another selection,
		// the touchend never fires because the elements gets removed mid-touch-interaction (my theory).
		// HACK: simply don't allow this to happen.
		// ALSO: prevent selection when an *event* is already raised.
		return view.isSelected || view.selectedEvent;
	},


	shouldIgnoreEventPointing: function() {
		// only call the handlers if there is not a drag/resize in progress
		return (this.eventDragging && this.eventDragging.isDragging) ||
			(this.eventResizing && this.eventResizing.isResizing);
	},


	canStartSelection: function(seg, ev) {
		return getEvIsTouch(ev) &&
			!this.canStartResize(seg, ev) &&
			(this.isEventDefDraggable(seg.footprint.eventDef) ||
			 this.isEventDefResizable(seg.footprint.eventDef));
	},


	canStartDrag: function(seg, ev) {
		return !this.canStartResize(seg, ev) &&
			this.isEventDefDraggable(seg.footprint.eventDef);
	},


	canStartResize: function(seg, ev) {
		var view = this._getView();
		var eventDef = seg.footprint.eventDef;

		return (!getEvIsTouch(ev) || view.isEventDefSelected(eventDef)) &&
			this.isEventDefResizable(eventDef) &&
			$(ev.target).is('.fc-resizer');
	},


	// Kills all in-progress dragging.
	// Useful for when public API methods that result in re-rendering are invoked during a drag.
	// Also useful for when touch devices misbehave and don't fire their touchend.
	endInteractions: function() {
		[
			this.dateClicking,
			this.dateSelecting,
			this.eventPointing,
			this.eventDragging,
			this.eventResizing
		].forEach(function(interaction) {
			if (interaction) {
				interaction.end();
			}
		});
	},


	// Diffs the two dates, returning a duration, based on granularity of the grid
	// TODO: port isTimeScale into this system?
	diffDates: function(a, b) {
		if (this.largeUnit) {
			return diffByUnit(a, b, this.largeUnit);
		}
		else {
			return diffDayTime(a, b);
		}
	},


	// is it allowed, in relation to the view's validRange?
	// NOTE: very similar to isExternalInstanceGroupAllowed
	isEventInstanceGroupAllowed: function(eventInstanceGroup) {
		var view = this._getView();
		var eventFootprints = this.eventRangesToEventFootprints(eventInstanceGroup.getAllEventRanges());
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			// TODO: just use getAllEventRanges directly
			if (!view.validUnzonedRange.containsRange(eventFootprints[i].componentFootprint.unzonedRange)) {
				return false;
			}
		}

		return view.calendar.isEventInstanceGroupAllowed(eventInstanceGroup);
	},


	// NOTE: very similar to isEventInstanceGroupAllowed
	// when it's a completely anonymous external drag, no event.
	isExternalInstanceGroupAllowed: function(eventInstanceGroup) {
		var view = this._getView();
		var eventFootprints = this.eventRangesToEventFootprints(eventInstanceGroup.getAllEventRanges());
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			if (!view.validUnzonedRange.containsRange(eventFootprints[i].componentFootprint.unzonedRange)) {
				return false;
			}
		}

		for (i = 0; i < eventFootprints.length; i++) {
			// treat it as a selection
			// TODO: pass in eventInstanceGroup instead
			//  because we don't want calendar's constraint system to depend on a component's
			//  determination of footprints.
			if (!view.calendar.isSelectionFootprintAllowed(eventFootprints[i].componentFootprint)) {
				return false;
			}
		}

		return true;
	},


	// Drag-n-Drop Rendering (for both events and external elements)
	// ---------------------------------------------------------------------------------------------------------------


	// Renders a visual indication of a event or external-element drag over the given drop zone.
	// If an external-element, seg will be `null`.
	// Must return elements used for any mock events.
	renderDrag: function(eventFootprints, seg) {
		var dragEls = null;
		var children = this.children;
		var i;
		var childDragEls;

		for (i = 0; i < children.length; i++) {
			childDragEls = children[i].renderDrag(eventFootprints, seg);

			if (childDragEls) {
				if (!dragEls) {
					dragEls = childDragEls;
				}
				else {
					dragEls = dragEls.add(childDragEls);
				}
			}
		}

		return dragEls;
	},


	// Unrenders a visual indication of an event or external-element being dragged.
	unrenderDrag: function() {
		this.callChildren('unrenderDrag');
	},


	// Event Resizing
	// ---------------------------------------------------------------------------------------------------------------


	// Renders a visual indication of an event being resized.
	// Must return elements used for any mock events.
	renderEventResize: function(eventFootprints, seg) {
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

		this.callChildren('renderSelectionFootprint', componentFootprint);
	},


	// Unrenders a visual indication of selection
	unrenderSelection: function() {
		this.unrenderHighlight();

		this.callChildren('unrenderSelection');
	},


	// Highlight
	// ---------------------------------------------------------------------------------------------------------------


	// Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
	renderHighlight: function(componentFootprint) {
		if (this.fillRenderer) {
			this.fillRenderer.render(
				'highlight',
				this.componentFootprintToSegs(componentFootprint),
				{
					getClasses: function() {
						return [ 'fc-highlight' ];
					}
				}
			);
		}

		this.callChildren('renderHighlight', componentFootprint);
	},


	// Unrenders the emphasis on a date range
	unrenderHighlight: function() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('highlight');
		}

		this.callChildren('unrenderHighlight');
	},


	// Hit Areas
	// ---------------------------------------------------------------------------------------------------------------
	// just because all ChronoComponents support this interface
	// doesn't mean they need to have their own internal coord system. they can defer to sub-components.


	hitsNeeded: function() {
		if (!(this.hitsNeededDepth++)) {
			this.prepareHits();
		}

		this.callChildren('hitsNeeded');
	},


	hitsNotNeeded: function() {
		if (this.hitsNeededDepth && !(--this.hitsNeededDepth)) {
			this.releaseHits();
		}

		this.callChildren('hitsNotNeeded');
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
		var children = this.children;
		var i;
		var hit;

		for (i = 0; i < children.length; i++) {
			hit = children[i].queryHit(leftOffset, topOffset);

			if (hit) {
				break;
			}
		}

		return hit;
	},


	getSafeHitFootprint: function(hit) {
		var view = this._getView();
		var footprint = this.getHitFootprint(hit);

		if (!view.activeUnzonedRange.containsRange(footprint.unzonedRange)) {
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


	// Event Drag-n-Drop
	// ---------------------------------------------------------------------------------------------------------------


	// Computes if the given event is allowed to be dragged by the user
	isEventDefDraggable: function(eventDef) {
		return this.isEventDefStartEditable(eventDef);
	},


	isEventDefStartEditable: function(eventDef) {
		var isEditable = eventDef.isStartExplicitlyEditable();

		if (isEditable == null) {
			isEditable = this.opt('eventStartEditable');

			if (isEditable == null) {
				isEditable = this.isEventDefGenerallyEditable(eventDef);
			}
		}

		return isEditable;
	},


	isEventDefGenerallyEditable: function(eventDef) {
		var isEditable = eventDef.isExplicitlyEditable();

		if (isEditable == null) {
			isEditable = this.opt('editable');
		}

		return isEditable;
	},


	// Event Resizing
	// ---------------------------------------------------------------------------------------------------------------


	// Computes if the given event is allowed to be resized from its starting edge
	isEventDefResizableFromStart: function(eventDef) {
		return this.opt('eventResizableFromStart') && this.isEventDefResizable(eventDef);
	},


	// Computes if the given event is allowed to be resized from its ending edge
	isEventDefResizableFromEnd: function(eventDef) {
		return this.isEventDefResizable(eventDef);
	},


	// Computes if the given event is allowed to be resized by the user at all
	isEventDefResizable: function(eventDef) {
		var isResizable = eventDef.isDurationExplicitlyEditable();

		if (isResizable == null) {
			isResizable = this.opt('eventDurationEditable');

			if (isResizable == null) {
				isResizable = this.isEventDefGenerallyEditable(eventDef);
			}
		}
		return isResizable;
	},


	/* Converting eventRange -> eventFootprint
	------------------------------------------------------------------------------------------------------------------*/


	eventRangesToEventFootprints: function(eventRanges) {
		var eventFootprints = [];
		var i;

		for (i = 0; i < eventRanges.length; i++) {
			eventFootprints.push.apply(eventFootprints,
				this.eventRangeToEventFootprints(eventRanges[i])
			);
		}

		return eventFootprints;
	},


	// Given an event's unzoned date range, return an array of eventSpan objects.
	// eventSpan - { start, end, isStart, isEnd, otherthings... }
	// Subclasses can override.
	// Subclasses are obligated to forward eventRange.isStart/isEnd to the resulting spans.
	// TODO: somehow more DRY with Calendar::eventRangeToEventFootprints
	eventRangeToEventFootprints: function(eventRange) {
		return [
			new EventFootprint(
				new ComponentFootprint(
					eventRange.unzonedRange,
					eventRange.eventDef.isAllDay()
				),
				eventRange.eventDef,
				eventRange.eventInstance // might not exist
			)
		];
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


	callChildren: function(methodName) {
		var args = Array.prototype.slice.call(arguments, 1);
		var children = this.children;
		var i, child;

		for (i = 0; i < children.length; i++) {
			child = children[i];
			child[methodName].apply(child, args);
		}
	},


	_getCalendar: function() { // TODO: strip out. move to generic parent.
		return this.calendar || this.view.calendar;
	},


	_getView: function() { // TODO: strip out. move to generic parent.
		return this.view;
	}

});
