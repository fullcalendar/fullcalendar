
/*
Contains:
- event clicking/mouseover/mouseout
- things that are common to event dragging AND resizing
- event helper rendering
*/
Grid.mixin({

	// self-config, overridable by subclasses
	segSelector: '.fc-event-container > *', // what constitutes an event element?

	mousedOverSeg: null, // the segment object the user's mouse is over. null if over nothing

	// if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
	// of the date areas. if not defined, assumes to be day and time granularity.
	// TODO: port isTimeScale into same system?
	largeUnit: null,


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


	// Attaches event-element-related handlers for *all* rendered event segments of the view.
	bindSegHandlers: function() {
		this.bindSegHandlersToEl(this.el);
	},


	// Attaches event-element-related handlers to an arbitrary container element. leverages bubbling.
	bindSegHandlersToEl: function(el) {
		this.bindSegHandlerToEl(el, 'touchstart', this.handleSegTouchStart);
		this.bindSegHandlerToEl(el, 'mouseenter', this.handleSegMouseover);
		this.bindSegHandlerToEl(el, 'mouseleave', this.handleSegMouseout);
		this.bindSegHandlerToEl(el, 'mousedown', this.handleSegMousedown);
		this.bindSegHandlerToEl(el, 'click', this.handleSegClick);
	},


	// Executes a handler for any a user-interaction on a segment.
	// Handler gets called with (seg, ev), and with the `this` context of the Grid
	bindSegHandlerToEl: function(el, name, handler) {
		var _this = this;

		el.on(name, this.segSelector, function(ev) {
			var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEventsPayload

			// only call the handlers if there is not a drag/resize in progress
			if (seg && !_this.isDraggingSeg && !_this.isResizingSeg) {
				return handler.call(_this, seg, ev); // context will be the Grid
			}
		});
	},


	handleSegClick: function(seg, ev) {
		var res = this.publiclyTrigger('eventClick', { // can return `false` to cancel
			context: seg.el[0],
			args: [ seg.footprint.getEventLegacy(), ev, this.view ]
		});

		if (res === false) {
			ev.preventDefault();
		}
	},


	// Updates internal state and triggers handlers for when an event element is moused over
	handleSegMouseover: function(seg, ev) {
		if (
			!GlobalEmitter.get().shouldIgnoreMouse() &&
			!this.mousedOverSeg
		) {
			this.mousedOverSeg = seg;

			if (this.view.isEventDefResizable(seg.footprint.eventDef)) {
				seg.el.addClass('fc-allow-mouse-resize');
			}

			this.publiclyTrigger('eventMouseover', {
				context: seg.el[0],
				args: [ seg.footprint.getEventLegacy(), ev, this.view ]
			});
		}
	},


	// Updates internal state and triggers handlers for when an event element is moused out.
	// Can be given no arguments, in which case it will mouseout the segment that was previously moused over.
	handleSegMouseout: function(seg, ev) {
		ev = ev || {}; // if given no args, make a mock mouse event

		if (this.mousedOverSeg) {
			seg = seg || this.mousedOverSeg; // if given no args, use the currently moused-over segment
			this.mousedOverSeg = null;

			if (this.view.isEventDefResizable(seg.footprint.eventDef)) {
				seg.el.removeClass('fc-allow-mouse-resize');
			}

			this.publiclyTrigger('eventMouseout', {
				context: seg.el[0],
				args: [ seg.footprint.getEventLegacy(), ev, this.view ]
			});
		}
	},


	handleSegMousedown: function(seg, ev) {
		var isResizing = this.startSegResize(seg, ev, { distance: 5 });

		if (!isResizing && this.view.isEventDefDraggable(seg.footprint.eventDef)) {
			this.buildSegDragListener(seg)
				.startInteraction(ev, {
					distance: 5
				});
		}
	},


	handleSegTouchStart: function(seg, ev) {
		var view = this.view;
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


	// seg isn't draggable, but let's use a generic DragListener
	// simply for the delay, so it can be selected.
	// Has side effect of setting/unsetting `segDragListener`
	buildSegSelectListener: function(seg) {
		var _this = this;
		var view = this.view;
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
		var eventFootprints = this.eventRangesToEventFootprints(eventInstanceGroup.getAllEventRanges());
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			// TODO: just use getAllEventRanges directly
			if (!this.view.validUnzonedRange.containsRange(eventFootprints[i].componentFootprint.unzonedRange)) {
				return false;
			}
		}

		return this.view.calendar.isEventInstanceGroupAllowed(eventInstanceGroup);
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
		var calendar = this.view.calendar;
		var eventDateProfile = calendar.footprintToDateProfile(componentFootprint);
		var dummyEvent = new SingleEventDef(new EventSource(calendar));
		var dummyInstance;

		dummyEvent.dateProfile = eventDateProfile;
		dummyInstance = dummyEvent.buildInstance();

		return new EventFootprint(componentFootprint, dummyEvent, dummyInstance);
	}

});
