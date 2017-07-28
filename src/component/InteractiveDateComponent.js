
var InteractiveDateComponent = DateComponent.extend({

	dateClickingClass: null,
	dateSelectingClass: null,
	eventPointingClass: null,
	eventDraggingClass: null,
	eventResizingClass: null,
	externalDroppingClass: null,

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


	constructor: function() {
		DateComponent.call(this);

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


	unrender: function() {
		this.endInteractions();

		Component.prototype.unrender.apply(this, arguments);
	},


	bindGlobalHandlers: function() {
		Component.prototype.bindGlobalHandlers.apply(this, arguments);

		if (this.externalDropping) {
			this.externalDropping.bindToDocument();
		}
	},


	unbindGlobalHandlers: function() {
		Component.prototype.unbindGlobalHandlers.apply(this, arguments);

		if (this.externalDropping) {
			this.externalDropping.unbindFromDocument();
		}
	},


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


	// Event Mutation / Constraints
	// ---------------------------------------------------------------------------------------------------------------


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
	}

});
