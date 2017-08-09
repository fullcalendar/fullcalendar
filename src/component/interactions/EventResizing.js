
var EventResizing = FC.EventResizing = Interaction.extend({

	eventPointing: null,
	dragListener: null,
	isResizing: false,


	/*
	component impements:
		- bindSegHandlerToEl
		- publiclyTrigger
		- diffDates
		- eventRangesToEventFootprints
		- isEventInstanceGroupAllowed
		- getSafeHitFootprint
	*/


	constructor: function(component, eventPointing) {
		Interaction.call(this, component);

		this.eventPointing = eventPointing;
	},


	end: function() {
		if (this.dragListener) {
			this.dragListener.endInteraction();
		}
	},


	bindToEl: function(el) {
		var component = this.component;

		component.bindSegHandlerToEl(el, 'mousedown', this.handleMouseDown.bind(this));
		component.bindSegHandlerToEl(el, 'touchstart', this.handleTouchStart.bind(this));
	},


	handleMouseDown: function(seg, ev) {
		if (this.component.canStartResize(seg, ev)) {
			this.buildDragListener(seg, $(ev.target).is('.fc-start-resizer'))
				.startInteraction(ev, { distance: 5 });
		}
	},


	handleTouchStart: function(seg, ev) {
		if (this.component.canStartResize(seg, ev)) {
			this.buildDragListener(seg, $(ev.target).is('.fc-start-resizer'))
				.startInteraction(ev);
		}
	},


	// Creates a listener that tracks the user as they resize an event segment.
	// Generic enough to work with any type of Grid.
	buildDragListener: function(seg, isStart) {
		var _this = this;
		var component = this.component;
		var view = this.view;
		var calendar = view.calendar;
		var eventManager = calendar.eventManager;
		var el = seg.el;
		var eventDef = seg.footprint.eventDef;
		var eventInstance = seg.footprint.eventInstance;
		var isDragging;
		var resizeMutation; // zoned event date properties. falsy if invalid resize

		// Tracks mouse movement over the *grid's* coordinate map
		var dragListener = this.dragListener = new HitDragListener(component, {
			scroll: this.opt('dragScroll'),
			subjectEl: el,
			interactionStart: function() {
				isDragging = false;
			},
			dragStart: function(ev) {
				isDragging = true;

				// ensure a mouseout on the manipulated event has been reported
				_this.eventPointing.handleMouseout(seg, ev);

				_this.segResizeStart(seg, ev);
			},
			hitOver: function(hit, isOrig, origHit) {
				var isAllowed = true;
				var origHitFootprint = component.getSafeHitFootprint(origHit);
				var hitFootprint = component.getSafeHitFootprint(hit);
				var mutatedEventInstanceGroup;

				if (origHitFootprint && hitFootprint) {
					resizeMutation = isStart ?
						_this.computeEventStartResizeMutation(origHitFootprint, hitFootprint, seg.footprint) :
						_this.computeEventEndResizeMutation(origHitFootprint, hitFootprint, seg.footprint);

					if (resizeMutation) {
						mutatedEventInstanceGroup = eventManager.buildMutatedEventInstanceGroup(
							eventDef.id,
							resizeMutation
						);
						isAllowed = component.isEventInstanceGroupAllowed(mutatedEventInstanceGroup);
					}
					else {
						isAllowed = false;
					}
				}
				else {
					isAllowed = false;
				}

				if (!isAllowed) {
					resizeMutation = null;
					disableCursor();
				}
				else if (resizeMutation.isEmpty()) {
					// no change. (FYI, event dates might have zones)
					resizeMutation = null;
				}

				if (resizeMutation) {
					view.hideEventsWithId(eventDef.id);

					component.renderEventResize(
						component.eventRangesToEventFootprints(
							mutatedEventInstanceGroup.sliceRenderRanges(component.get('dateProfile').renderUnzonedRange, calendar)
						),
						seg
					);
				}
			},
			hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
				resizeMutation = null;
				view.showEventsWithId(eventDef.id); // for when out-of-bounds. show original
			},
			hitDone: function() { // resets the rendering to show the original event
				component.unrenderEventResize();
				enableCursor();
			},
			interactionEnd: function(ev) {
				if (isDragging) {
					_this.segResizeStop(seg, ev);
				}

				if (resizeMutation) { // valid date to resize to?
					// no need to re-show original, will rerender all anyways. esp important if eventRenderWait
					view.reportEventResize(eventInstance, resizeMutation, el, ev);
				}
				else {
					view.showEventsWithId(eventDef.id);
				}

				_this.dragListener = null;
			}
		});

		return dragListener;
	},


	// Called before event segment resizing starts
	segResizeStart: function(seg, ev) {
		this.isResizing = true;
		this.component.publiclyTrigger('eventResizeStart', {
			context: seg.el[0],
			args: [
				seg.footprint.getEventLegacy(),
				ev,
				{}, // jqui dummy
				this.view
			]
		});
	},


	// Called after event segment resizing stops
	segResizeStop: function(seg, ev) {
		this.isResizing = false;
		this.component.publiclyTrigger('eventResizeStop', {
			context: seg.el[0],
			args: [
				seg.footprint.getEventLegacy(),
				ev,
				{}, // jqui dummy
				this.view
			]
		});
	},


	// Returns new date-information for an event segment being resized from its start
	computeEventStartResizeMutation: function(startFootprint, endFootprint, origEventFootprint) {
		var origRange = origEventFootprint.componentFootprint.unzonedRange;
		var startDelta = this.component.diffDates(
			endFootprint.unzonedRange.getStart(),
			startFootprint.unzonedRange.getStart()
		);
		var dateMutation;
		var eventDefMutation;

		if (origRange.getStart().add(startDelta) < origRange.getEnd()) {

			dateMutation = new EventDefDateMutation();
			dateMutation.setStartDelta(startDelta);

			eventDefMutation = new EventDefMutation();
			eventDefMutation.setDateMutation(dateMutation);

			return eventDefMutation;
		}

		return false;
	},


	// Returns new date-information for an event segment being resized from its end
	computeEventEndResizeMutation: function(startFootprint, endFootprint, origEventFootprint) {
		var origRange = origEventFootprint.componentFootprint.unzonedRange;
		var endDelta = this.component.diffDates(
			endFootprint.unzonedRange.getEnd(),
			startFootprint.unzonedRange.getEnd()
		);
		var dateMutation;
		var eventDefMutation;

		if (origRange.getEnd().add(endDelta) > origRange.getStart()) {

			dateMutation = new EventDefDateMutation();
			dateMutation.setEndDelta(endDelta);

			eventDefMutation = new EventDefMutation();
			eventDefMutation.setDateMutation(dateMutation);

			return eventDefMutation;
		}

		return false;
	}

});
