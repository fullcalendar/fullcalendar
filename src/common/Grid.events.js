
/* Event-rendering and event-interaction methods for the abstract Grid class
----------------------------------------------------------------------------------------------------------------------*/

$.extend(Grid.prototype, {

	isDraggingSeg: false, // is a segment being dragged?
	isResizingSeg: false, // is a segment being resized?


	// Renders the given events onto the grid
	renderEvents: function(events) {
		// subclasses must implement
	},


	// Unrenders all events
	destroyEvents: function() {
		// subclasses must implement
	},


	// Converts an array of event objects into an array of segment objects
	eventsToSegs: function(events) {
		var _this = this;

		return $.map(events, function(event) {
			return _this.eventToSegs(event); // $.map flattens all returned arrays together
		});
	},


	// Slices a single event into an array of event segments
	eventToSegs: function(event) {
		var eventStart = event.start.clone().stripZone(); // normalize
		var eventEnd = this.view.calendar.getEventEnd(event).stripZone(); // compute (if necessary) and normalize
		var segs = this.rangeToSegs(eventStart, eventEnd); // defined by the subclass
		var i, seg;

		// assign extra event-related properties to the segment objects
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			seg.event = event;
			seg.eventStartMS = +eventStart;
			seg.eventDurationMS = eventEnd - eventStart;
		}

		return segs;
	},


	// Attaches event-element-related handlers to the container element and leverage bubbling
	bindSegHandlers: function() {
		var _this = this;
		var view = this.view;

		$.each(
			{
				mouseenter: function(seg, ev) {
					view.trigger('eventMouseover', this, seg.event, ev);
				},
				mouseleave: function(seg, ev) {
					view.trigger('eventMouseout', this, seg.event, ev);
				},
				click: function(seg, ev) {
					return view.trigger('eventClick', this, seg.event, ev); // can return `false` to cancel
				},
				mousedown: function(seg, ev) {
					if ($(ev.target).is('.fc-resizer') && view.isEventResizable(seg.event)) {
						_this.segResizeMousedown(seg, ev);
					}
					else if (view.isEventDraggable(seg.event)) {
						_this.segDragMousedown(seg, ev);
					}
				}
			},
			function(name, func) {
				// attach the handler to the container element and only listen for real event elements via bubbling
				_this.el.on(name, '.fc-content-skeleton .fc-event-container > *', function(ev) {
					var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEvents

					if (seg /*&& !_this.isDraggingSeg && !_this.isResizingSeg*/) {
						   // needs more work if we want eventMouseout to fire correctly
						func.call(this, seg, ev); // `this` will be the event element
					}
				});
			}
		);
	},


	// Called when the user does a mousedown on an event, which might lead to dragging.
	// Generic enough to work with any type of Grid.
	segDragMousedown: function(seg, ev) {
		var _this = this;
		var view = this.view;
		var el = seg.el;
		var event = seg.event;
		var start = event.start;
		var end = view.calendar.getEventEnd(event);
		var newStart = null;

		// A clone of the original element that will move with the mouse
		var mouseFollower = new MouseFollower(seg.el, {
			parentEl: view.el,
			opacity: view.opt('dragOpacity'),
			revertDuration: view.opt('dragRevertDuration'),
			zIndex: 2 // one above the .fc-view
		});

		// Tracks mouse movement over the *view's* coordinate map. Allows dragging and dropping between subcomponents
		// of the view.
		var dragListener = new DragListener(view.coordMap, {
			distance: 5,
			listenStart: function(ev) {
				mouseFollower.hide(); // don't show until we know this is a real drag
				mouseFollower.start(ev);
			},
			dragStart: function(ev) {
				_this.isDraggingSeg = true;
				view.hideEvent(event); // hide all event segments. our mouseFollower will take over

				view.trigger('eventDragStart', el[0], event, ev, {}); // last argument is jqui dummy
			},
			cellOver: function(cell, date) {
				var origDate = dragListener.origDate;
				var delta;
				var newEnd;

				if (origDate) { // must start out on a cell (weird accident if it didn't)

					if (date.hasTime() === origDate.hasTime()) { // staying all-day or staying timed
						delta = dayishDiff(date, origDate);
						newStart = start.clone().add(delta);
						if (event.end === null) { // do we need to compute an end?
							newEnd = null;
						}
						else {
							newEnd = end.clone().add(delta);
						}
					}
					else { // switching from all-day to timed, or vice versa
						newStart = date;
						newEnd = null; // end should be cleared
					}

					if (view.renderDrag(newStart, newEnd, seg)) { // have the view render a visual indication
						mouseFollower.hide(); // if the view is already using a mock event "helper", hide our own
					}
					else {
						mouseFollower.show();
					}
				}
			},
			cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
				newStart = null;
				view.destroyDrag(); // unrender whatever was done in view.renderDrag
				mouseFollower.show(); // show in case we are moving out of all cells
			},
			dragStop: function(ev) {
				var hasChanged = newStart && !newStart.isSame(start);

				// do revert animation if hasn't changed. calls a callback when finished (whether animation or not)
				mouseFollower.stop(!hasChanged, function() {
					_this.isDraggingSeg = false;
					view.destroyDrag();
					view.showEvent(event);

					view.trigger('eventDragStop', el[0], event, ev, {}); // last argument is jqui dummy

					if (hasChanged) {
						view.eventDrop(el[0], event, newStart, ev); // will rerender all events...
					}
				});
			},
			listenStop: function() {
				mouseFollower.stop(); // put in listenStop in case there was a mousedown but the drag never started
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
	},


	// Called when the user does a mousedown on an event's resizer, which might lead to resizing.
	// Generic enough to work with any type of Grid.
	segResizeMousedown: function(seg, ev) {
		var _this = this;
		var view = this.view;
		var el = seg.el;
		var event = seg.event;
		var start = event.start;
		var end = view.calendar.getEventEnd(event);
		var newEnd = null;
		var dragListener;

		function destroy() { // resets the rendering
			_this.destroyResize();
			view.showEvent(event);
		}

		// Tracks mouse movement over the *grid's* coordinate map
		dragListener = new DragListener(this.coordMap, {
			distance: 5,
			dragStart: function(ev) {
				_this.isResizingSeg = true;

				view.trigger('eventResizeStart', el[0], event, ev, {}); // last argument is jqui dummy
			},
			cellOver: function(cell, date) {
				// compute the new end. don't allow it to go before the event's start
				if (date < start) {
					date = start;
				}
				newEnd = date.clone().add(_this.cellDuration); // make it an exclusive end

				if (newEnd.isSame(end)) {
					newEnd = null;
					destroy();
				}
				else {
					_this.renderResize(start, newEnd, seg);
					view.hideEvent(event);
				}
			},
			cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
				newEnd = null;
				destroy();
			},
			dragStop: function(ev) {
				_this.isResizingSeg = false;
				destroy();

				view.trigger('eventResizeStop', el[0], event, ev, {}); // last argument is jqui dummy

				if (newEnd) {
					view.eventResize(el[0], event, newEnd, ev); // will rerender all events...
				}
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
	},


	// Generic utility for generating the HTML classNames for an event segment's element
	getSegClasses: function(seg, isDraggable, isResizable) {
		var event = seg.event;
		var classes = [
			'fc-event',
			seg.isStart ? 'fc-start' : 'fc-not-start',
			seg.isEnd ? 'fc-end' : 'fc-not-end'
		].concat(
			event.className,
			event.source ? event.source.className : []
		);

		if (isDraggable) {
			classes.push('fc-draggable');
		}
		if (isResizable) {
			classes.push('fc-resizable');
		}

		return classes;
	},


	// Utility for generating a CSS string with all the event skin-related properties
	getEventSkinCss: function(event) {
		var view = this.view;
		var source = event.source || {};
		var eventColor = event.color;
		var sourceColor = source.color;
		var optionColor = view.opt('eventColor');
		var backgroundColor =
			event.backgroundColor ||
			eventColor ||
			source.backgroundColor ||
			sourceColor ||
			view.opt('eventBackgroundColor') ||
			optionColor;
		var borderColor =
			event.borderColor ||
			eventColor ||
			source.borderColor ||
			sourceColor ||
			view.opt('eventBorderColor') ||
			optionColor;
		var textColor =
			event.textColor ||
			source.textColor ||
			view.opt('eventTextColor');
		var statements = [];
		if (backgroundColor) {
			statements.push('background-color:' + backgroundColor);
		}
		if (borderColor) {
			statements.push('border-color:' + borderColor);
		}
		if (textColor) {
			statements.push('color:' + textColor);
		}
		return statements.join(';');
	}

});


/* Event Segment Utilities
----------------------------------------------------------------------------------------------------------------------*/


// A cmp function for determining which segments should take visual priority
function compareSegs(seg1, seg2) {
	return seg1.eventStartMS - seg2.eventStartMS || // earlier events go first
		seg2.eventDurationMS - seg1.eventDurationMS || // tie? longer events go first
		seg2.event.allDay - seg1.event.allDay || // tie? put all-day events first (booleans cast to 0/1)
		(seg1.event.title || '').localeCompare(seg2.event.title); // tie? alphabetically by title
}


// Returns `true` if the segment has a rendered element and `false` otherwise
function renderedSegFilter(seg) {
	return !!seg.el;
}

