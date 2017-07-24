
var CoordChronoComponentMixin = {

	// self-config, overridable by subclasses
	segSelector: '.fc-event-container > *', // what constitutes an event element?

	// if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
	// of the date areas. if not defined, assumes to be day and time granularity.
	// TODO: port isTimeScale into same system?
	largeUnit: null,

	segDragListener: null,
	segResizeListener: null,
	externalDragListener: null,

	hitsNeededDepth: 0, // necessary because multiple callers might need the same hits

	// self-config, overridable by subclasses
	hasDayInteractions: true, // can user click/select ranges of time?

	dragListeners: null,

	eventPointingClass: EventPointing,
	eventPointing: null,


	initCoordChronoComponent: function() {
		this.dragListeners = [];
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


	// Kills all in-progress dragging.
	// Useful for when public API methods that result in re-rendering are invoked during a drag.
	// Also useful for when touch devices misbehave and don't fire their touchend.
	clearDragListeners: function() {
		var dragListeners = this.dragListeners;
		var i;

		for (i = 0; i < dragListeners.length; i++) {
			dragListeners[i].endInteraction();
		}

		// TODO: get these to start using registerDragListener()
		if (this.segDragListener) {
			this.segDragListener.endInteraction(); // will clear this.segDragListener
		}
		if (this.segResizeListener) {
			this.segResizeListener.endInteraction(); // will clear this.segResizeListener
		}
		if (this.externalDragListener) {
			this.externalDragListener.endInteraction(); // will clear this.externalDragListener
		}
	},


	/* Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Sets the container element that the grid should render inside of.
	// Does other DOM-related initializations.
	setElement: function(el) {
		ChronoComponent.prototype.setElement.apply(this, arguments);

		if (this.hasDayInteractions) {
			new DateClicking(this);
			new DateSelecting(this);
		}

		this.eventPointing = new this.eventPointingClass(this);

		// for NON-EventPointing interactions.....
		// attach event-element-related handlers. in Grid.events
		// same garbage collection note as above.
		this.bindSegHandlersToEl(this.el);
	},


	// Removes the grid's container element from the DOM. Undoes any other DOM-related attachments.
	// DOES NOT remove any content beforehand (doesn't clear events or call unrenderDates), unlike View
	removeElement: function() {
		ChronoComponent.prototype.removeElement.apply(this, arguments);

		this.clearDragListeners();
	},


	unrenderEvents: function() {
		ChronoComponent.prototype.unrenderEvents.apply(this, arguments);

		this.clearDragListeners(); // we wanted to add this action to event rendering teardown
	},


	/* Binding
	------------------------------------------------------------------------------------------------------------------*/


	// Binds DOM handlers to elements that reside outside the grid, such as the document
	bindGlobalHandlers: function() {
		ChronoComponent.prototype.bindGlobalHandlers.apply(this, arguments);

		this.listenTo($(document), {
			dragstart: this.externalDragStart, // jqui
			sortstart: this.externalDragStart // jqui
		});
	},


	// Unbinds DOM handlers from elements that reside outside the grid
	unbindGlobalHandlers: function() {
		ChronoComponent.prototype.unbindGlobalHandlers.apply(this, arguments);

		this.stopListeningTo($(document));
	},


	// TODO: move this into Day*Pointing* ?
	bindDayHandler: function(name, handler) {
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


	// Attaches event-element-related handlers to an arbitrary container element. leverages bubbling.
	bindSegHandlersToEl: function(el) {
		this.bindSegHandlerToEl(el, 'touchstart', this.handleSegTouchStart);
		this.bindSegHandlerToEl(el, 'mousedown', this.handleSegMousedown);
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


	shouldIgnoreMouse: function() {
		// HACK
		// This will still work even though bindDayHandler doesn't use GlobalEmitter.
		return GlobalEmitter.get().shouldIgnoreMouse();
	},


	shouldIgnoreTouch: function() {
		// On iOS (and Android?) when a new selection is initiated overtop another selection,
		// the touchend never fires because the elements gets removed mid-touch-interaction (my theory).
		// HACK: simply don't allow this to happen.
		// ALSO: prevent selection when an *event* is already raised.
		return this.view.isSelected || this.view.selectedEvent;
	},


	shouldIgnoreEventPointing: function() {
		// only call the handlers if there is not a drag/resize in progress
		return this.isDraggingSeg || this.isResizingSeg;
	},


	registerDragListener: function(dragListener) {
		this.dragListeners.push(dragListener);
	},


	/* Handlers
	------------------------------------------------------------------------------------------------------------------*/


	handleSegMousedown: function(seg, ev) {
		var view = this._getView();
		var isResizing = this.startSegResize(seg, ev, { distance: 5 });

		if (!isResizing && view.isEventDefDraggable(seg.footprint.eventDef)) {
			this.buildSegDragListener(seg)
				.startInteraction(ev, {
					distance: 5
				});
		}
	},


	handleSegTouchStart: function(seg, ev) {
		var view = this._getView();
		var eventDef = seg.footprint.eventDef;
		var isSelected = view.isEventDefSelected(eventDef);
		var isDraggable = view.isEventDefDraggable(eventDef);
		var isResizable = view.isEventDefResizable(eventDef);
		var isResizing = false;
		var dragListener;
		var eventLongPressDelay;

		if (isSelected && isResizable) {
			// only allow resizing of the event is selected
			isResizing = this.startSegResize(seg, ev);
		}

		if (!isResizing && (isDraggable || isResizable)) { // allowed to be selected?

			eventLongPressDelay = this.opt('eventLongPressDelay');
			if (eventLongPressDelay == null) {
				eventLongPressDelay = this.opt('longPressDelay'); // fallback
			}

			dragListener = isDraggable ?
				this.buildSegDragListener(seg) :
				this.buildSegSelectListener(seg); // seg isn't draggable, but still needs to be selected

			dragListener.startInteraction(ev, { // won't start if already started
				delay: isSelected ? 0 : eventLongPressDelay // do delay if not already selected
			});
		}
	},


	/* Misc
	------------------------------------------------------------------------------------------------------------------*/


	// seg isn't draggable, but let's use a generic DragListener
	// simply for the delay, so it can be selected.
	// Has side effect of setting/unsetting `segDragListener`
	buildSegSelectListener: function(seg) {
		var _this = this;
		var view = this._getView();
		var eventDef = seg.footprint.eventDef;
		var eventInstance = seg.footprint.eventInstance; // null for inverse-background events

		if (this.segDragListener) {
			return this.segDragListener;
		}

		var dragListener = this.segDragListener = new DragListener({
			dragStart: function(ev) {
				if (
					dragListener.isTouch &&
					!view.isEventDefSelected(eventDef) &&
					eventInstance
				) {
					// if not previously selected, will fire after a delay. then, select the event
					view.selectEventInstance(eventInstance);
				}
			},
			interactionEnd: function(ev) {
				_this.segDragListener = null;
			}
		});

		return dragListener;
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


	/* Event Helper
	------------------------------------------------------------------------------------------------------------------*/
	// TODO: should probably move this to Grid.events, like we did event dragging / resizing


	renderHelperEventFootprints: function(eventFootprints, sourceSeg) {
		return this.renderHelperEventFootprintEls(eventFootprints, sourceSeg)
			.addClass('fc-helper');
	},


	renderHelperEventFootprintEls: function(eventFootprints, sourceSeg) {
		// Subclasses must implement.
		// Must return all mock event elements.
	},


	// Unrenders a mock event
	// TODO: have this in ChronoComponent
	unrenderHelper: function() {
		// subclasses must implement
	},


	fabricateEventFootprint: function(componentFootprint) {
		var view = this._getView();
		var calendar = view.calendar;
		var eventDateProfile = calendar.footprintToDateProfile(componentFootprint);
		var dummyEvent = new SingleEventDef(new EventSource(calendar));
		var dummyInstance;

		dummyEvent.dateProfile = eventDateProfile;
		dummyInstance = dummyEvent.buildInstance();

		return new EventFootprint(componentFootprint, dummyEvent, dummyInstance);
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection. Will highlight by default but can be overridden by subclasses.
	// Given a span (unzoned start/end and other misc data)
	renderSelectionFootprint: function(componentFootprint) {
		this.renderHighlight(componentFootprint);
	},


	// Unrenders any visual indications of a selection. Will unrender a highlight by default.
	unrenderSelection: function() {
		this.unrenderHighlight();
	},


	/* Hit Area
	------------------------------------------------------------------------------------------------------------------*/


	hitsNeeded: function() {
		if (!(this.hitsNeededDepth++)) {
			this.prepareHits();
		}
	},


	hitsNotNeeded: function() {
		if (this.hitsNeededDepth && !(--this.hitsNeededDepth)) {
			this.releaseHits();
		}
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
	}

};
