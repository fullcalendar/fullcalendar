
/* Event-rendering and event-interaction methods for the abstract Grid class
----------------------------------------------------------------------------------------------------------------------*/

Grid.mixin({

	mousedOverSeg: null, // the segment object the user's mouse is over. null if over nothing
	isDraggingSeg: false, // is a segment being dragged? boolean
	isResizingSeg: false, // is a segment being resized? boolean
	isDraggingExternal: false, // jqui-dragging an external element? boolean
	segs: null, // the event segments currently rendered in the grid


	// Renders the given events onto the grid
	renderEvents: function(events) {
		var segs = this.eventsToSegs(events);
		var bgSegs = [];
		var fgSegs = [];
		var i, seg;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];

			if (isBgEvent(seg.event)) {
				bgSegs.push(seg);
			}
			else {
				fgSegs.push(seg);
			}
		}

		// Render each different type of segment.
		// Each function may return a subset of the segs, segs that were actually rendered.
		bgSegs = this.renderBgSegs(bgSegs) || bgSegs;
		fgSegs = this.renderFgSegs(fgSegs) || fgSegs;

		this.segs = bgSegs.concat(fgSegs);
	},


	// Unrenders all events currently rendered on the grid
	destroyEvents: function() {
		this.triggerSegMouseout(); // trigger an eventMouseout if user's mouse is over an event

		this.destroyFgSegs();
		this.destroyBgSegs();

		this.segs = null;
	},


	// Retrieves all rendered segment objects currently rendered on the grid
	getEventSegs: function() {
		return this.segs || [];
	},


	/* Foreground Segment Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Renders foreground event segments onto the grid. May return a subset of segs that were rendered.
	renderFgSegs: function(segs) {
		// subclasses must implement
	},


	// Unrenders all currently rendered foreground segments
	destroyFgSegs: function() {
		// subclasses must implement
	},


	// Renders and assigns an `el` property for each foreground event segment.
	// Only returns segments that successfully rendered.
	// A utility that subclasses may use.
	renderFgSegEls: function(segs, disableResizing) {
		var view = this.view;
		var html = '';
		var renderedSegs = [];
		var i;

		if (segs.length) { // don't build an empty html string

			// build a large concatenation of event segment HTML
			for (i = 0; i < segs.length; i++) {
				html += this.fgSegHtml(segs[i], disableResizing);
			}

			// Grab individual elements from the combined HTML string. Use each as the default rendering.
			// Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
			$(html).each(function(i, node) {
				var seg = segs[i];
				var el = view.resolveEventEl(seg.event, $(node));

				if (el) {
					el.data('fc-seg', seg); // used by handlers
					seg.el = el;
					renderedSegs.push(seg);
				}
			});
		}

		return renderedSegs;
	},


	// Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
	fgSegHtml: function(seg, disableResizing) {
		// subclasses should implement
	},


	/* Background Segment Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Renders the given background event segments onto the grid.
	// Returns a subset of the segs that were actually rendered.
	renderBgSegs: function(segs) {
		return this.renderFill('bgEvent', segs);
	},


	// Unrenders all the currently rendered background event segments
	destroyBgSegs: function() {
		this.destroyFill('bgEvent');
	},


	// Renders a background event element, given the default rendering. Called by the fill system.
	bgEventSegEl: function(seg, el) {
		return this.view.resolveEventEl(seg.event, el); // will filter through eventRender
	},


	// Generates an array of classNames to be used for the default rendering of a background event.
	// Called by the fill system.
	bgEventSegClasses: function(seg) {
		var event = seg.event;
		var source = event.source || {};

		return [ 'fc-bgevent' ].concat(
			event.className,
			source.className || []
		);
	},


	// Generates a semicolon-separated CSS string to be used for the default rendering of a background event.
	// Called by the fill system.
	// TODO: consolidate with getEventSkinCss?
	bgEventSegCss: function(seg) {
		var view = this.view;
		var event = seg.event;
		var source = event.source || {};

		return {
			'background-color':
				event.backgroundColor ||
				event.color ||
				source.backgroundColor ||
				source.color ||
				view.opt('eventBackgroundColor') ||
				view.opt('eventColor')
		};
	},


	// Generates an array of classNames to be used for the rendering business hours overlay. Called by the fill system.
	businessHoursSegClasses: function(seg) {
		return [ 'fc-nonbusiness', 'fc-bgevent' ];
	},


	/* Handlers
	------------------------------------------------------------------------------------------------------------------*/


	// Attaches event-element-related handlers to the container element and leverage bubbling
	bindSegHandlers: function() {
		var _this = this;
		var view = this.view;

		$.each(
			{
				mouseenter: function(seg, ev) {
					_this.triggerSegMouseover(seg, ev);
				},
				mouseleave: function(seg, ev) {
					_this.triggerSegMouseout(seg, ev);
				},
				click: function(seg, ev) {
					return view.trigger('eventClick', this, seg.event, ev); // can return `false` to cancel
				},
				mousedown: function(seg, ev) {
					if ($(ev.target).is('.fc-resizer') && view.isEventResizable(seg.event)) {
						_this.segResizeMousedown(seg, ev, $(ev.target).is('.fc-start-resizer'));
					}
					else if (view.isEventDraggable(seg.event)) {
						_this.segDragMousedown(seg, ev);
					}
				}
			},
			function(name, func) {
				// attach the handler to the container element and only listen for real event elements via bubbling
				_this.el.on(name, '.fc-event-container > *', function(ev) {
					var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEvents

					// only call the handlers if there is not a drag/resize in progress
					if (seg && !_this.isDraggingSeg && !_this.isResizingSeg) {
						return func.call(this, seg, ev); // `this` will be the event element
					}
				});
			}
		);
	},


	// Updates internal state and triggers handlers for when an event element is moused over
	triggerSegMouseover: function(seg, ev) {
		if (!this.mousedOverSeg) {
			this.mousedOverSeg = seg;
			this.view.trigger('eventMouseover', seg.el[0], seg.event, ev);
		}
	},


	// Updates internal state and triggers handlers for when an event element is moused out.
	// Can be given no arguments, in which case it will mouseout the segment that was previously moused over.
	triggerSegMouseout: function(seg, ev) {
		ev = ev || {}; // if given no args, make a mock mouse event

		if (this.mousedOverSeg) {
			seg = seg || this.mousedOverSeg; // if given no args, use the currently moused-over segment
			this.mousedOverSeg = null;
			this.view.trigger('eventMouseout', seg.el[0], seg.event, ev);
		}
	},


	/* Event Dragging
	------------------------------------------------------------------------------------------------------------------*/


	// Called when the user does a mousedown on an event, which might lead to dragging.
	// Generic enough to work with any type of Grid.
	segDragMousedown: function(seg, ev) {
		var _this = this;
		var view = this.view;
		var calendar = view.calendar;
		var el = seg.el;
		var event = seg.event;
		var dropLocation;

		// A clone of the original element that will move with the mouse
		var mouseFollower = new MouseFollower(seg.el, {
			parentEl: view.el,
			opacity: view.opt('dragOpacity'),
			revertDuration: view.opt('dragRevertDuration'),
			zIndex: 2 // one above the .fc-view
		});

		// Tracks mouse movement over the *view's* coordinate map. Allows dragging and dropping between subcomponents
		// of the view.
		var dragListener = new CellDragListener(view.coordMap, {
			distance: 5,
			scroll: view.opt('dragScroll'),
			subjectEl: el,
			subjectCenter: true,
			listenStart: function(ev) {
				mouseFollower.hide(); // don't show until we know this is a real drag
				mouseFollower.start(ev);
			},
			dragStart: function(ev) {
				_this.triggerSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
				_this.segDragStart(seg, ev);
				view.hideEvent(event); // hide all event segments. our mouseFollower will take over
			},
			cellOver: function(cell, isOrig, origCell) {

				// starting cell could be forced (DayGrid.limit)
				if (seg.cell) {
					origCell = seg.cell;
				}

				dropLocation = _this.computeEventDrop(origCell, cell, event);

				if (dropLocation && !calendar.isEventRangeAllowed(dropLocation, event)) {
					disableCursor();
					dropLocation = null;
				}

				// if a valid drop location, have the subclass render a visual indication
				if (dropLocation && view.renderDrag(dropLocation, seg)) {
					mouseFollower.hide(); // if the subclass is already using a mock event "helper", hide our own
				}
				else {
					mouseFollower.show(); // otherwise, have the helper follow the mouse (no snapping)
				}

				if (isOrig) {
					dropLocation = null; // needs to have moved cells to be a valid drop
				}
			},
			cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
				view.destroyDrag(); // unrender whatever was done in renderDrag
				mouseFollower.show(); // show in case we are moving out of all cells
				dropLocation = null;
			},
			cellDone: function() { // Called after a cellOut OR before a dragStop
				enableCursor();
			},
			dragStop: function(ev) {
				// do revert animation if hasn't changed. calls a callback when finished (whether animation or not)
				mouseFollower.stop(!dropLocation, function() {
					view.destroyDrag();
					view.showEvent(event);
					_this.segDragStop(seg, ev);

					if (dropLocation) {
						view.reportEventDrop(event, dropLocation, this.largeUnit, el, ev);
					}
				});
			},
			listenStop: function() {
				mouseFollower.stop(); // put in listenStop in case there was a mousedown but the drag never started
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
	},


	// Called before event segment dragging starts
	segDragStart: function(seg, ev) {
		this.isDraggingSeg = true;
		this.view.trigger('eventDragStart', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
	},


	// Called after event segment dragging stops
	segDragStop: function(seg, ev) {
		this.isDraggingSeg = false;
		this.view.trigger('eventDragStop', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
	},


	// Given the cell an event drag began, and the cell event was dropped, calculates the new start/end/allDay
	// values for the event. Subclasses may override and set additional properties to be used by renderDrag.
	// A falsy returned value indicates an invalid drop.
	computeEventDrop: function(startCell, endCell, event) {
		var calendar = this.view.calendar;
		var dragStart = startCell.start;
		var dragEnd = endCell.start;
		var delta;
		var dropLocation;

		if (dragStart.hasTime() === dragEnd.hasTime()) {
			delta = this.diffDates(dragEnd, dragStart);

			// if an all-day event was in a timed area and it was dragged to a different time,
			// guarantee an end and adjust start/end to have times
			if (event.allDay && durationHasTime(delta)) {
				dropLocation = {
					start: event.start.clone(),
					end: calendar.getEventEnd(event), // will be an ambig day
					allDay: false // for normalizeEventRangeTimes
				};
				calendar.normalizeEventRangeTimes(dropLocation);
			}
			// othewise, work off existing values
			else {
				dropLocation = {
					start: event.start.clone(),
					end: event.end ? event.end.clone() : null,
					allDay: event.allDay // keep it the same
				};
			}

			dropLocation.start.add(delta);
			if (dropLocation.end) {
				dropLocation.end.add(delta);
			}
		}
		else {
			// if switching from day <-> timed, start should be reset to the dropped date, and the end cleared
			dropLocation = {
				start: dragEnd.clone(),
				end: null, // end should be cleared
				allDay: !dragEnd.hasTime()
			};
		}

		return dropLocation;
	},


	// Utility for apply dragOpacity to a jQuery set
	applyDragOpacity: function(els) {
		var opacity = this.view.opt('dragOpacity');

		if (opacity != null) {
			els.each(function(i, node) {
				// Don't use jQuery (will set an IE filter), do it the old fashioned way.
				// In IE8, a helper element will disappears if there's a filter.
				node.style.opacity = opacity;
			});
		}
	},


	/* External Element Dragging
	------------------------------------------------------------------------------------------------------------------*/


	// Called when a jQuery UI drag is initiated anywhere in the DOM
	externalDragStart: function(ev, ui) {
		var view = this.view;
		var el;
		var accept;

		if (view.opt('droppable')) { // only listen if this setting is on
			el = $((ui ? ui.item : null) || ev.target);

			// Test that the dragged element passes the dropAccept selector or filter function.
			// FYI, the default is "*" (matches all)
			accept = view.opt('dropAccept');
			if ($.isFunction(accept) ? accept.call(el[0], el) : el.is(accept)) {
				if (!this.isDraggingExternal) { // prevent double-listening if fired twice
					this.listenToExternalDrag(el, ev, ui);
				}
			}
		}
	},


	// Called when a jQuery UI drag starts and it needs to be monitored for cell dropping
	listenToExternalDrag: function(el, ev, ui) {
		var _this = this;
		var meta = getDraggedElMeta(el); // extra data about event drop, including possible event to create
		var dragListener;
		var dropLocation; // a null value signals an unsuccessful drag

		// listener that tracks mouse movement over date-associated pixel regions
		dragListener = new CellDragListener(this.coordMap, {
			listenStart: function() {
				_this.isDraggingExternal = true;
			},
			cellOver: function(cell) {
				dropLocation = _this.computeExternalDrop(cell, meta);
				if (dropLocation) {
					_this.renderDrag(dropLocation); // called without a seg parameter
				}
				else { // invalid drop cell
					disableCursor();
				}
			},
			cellOut: function() {
				dropLocation = null; // signal unsuccessful
				_this.destroyDrag();
				enableCursor();
			},
			dragStop: function() {
				_this.destroyDrag();
				enableCursor();

				if (dropLocation) { // element was dropped on a valid date/time cell
					_this.view.reportExternalDrop(meta, dropLocation, el, ev, ui);
				}
			},
			listenStop: function() {
				_this.isDraggingExternal = false;
			}
		});

		dragListener.startDrag(ev); // start listening immediately
	},


	// Given a cell to be dropped upon, and misc data associated with the jqui drag (guaranteed to be a plain object),
	// returns start/end dates for the event that would result from the hypothetical drop. end might be null.
	// Returning a null value signals an invalid drop cell.
	computeExternalDrop: function(cell, meta) {
		var dropLocation = {
			start: cell.start.clone(),
			end: null
		};

		// if dropped on an all-day cell, and element's metadata specified a time, set it
		if (meta.startTime && !dropLocation.start.hasTime()) {
			dropLocation.start.time(meta.startTime);
		}

		if (meta.duration) {
			dropLocation.end = dropLocation.start.clone().add(meta.duration);
		}

		if (!this.view.calendar.isExternalDropRangeAllowed(dropLocation, meta.eventProps)) {
			return null;
		}

		return dropLocation;
	},



	/* Drag Rendering (for both events and an external elements)
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event or external element being dragged.
	// `dropLocation` contains hypothetical start/end/allDay values the event would have if dropped. end can be null.
	// `seg` is the internal segment object that is being dragged. If dragging an external element, `seg` is null.
	// A truthy returned value indicates this method has rendered a helper element.
	renderDrag: function(dropLocation, seg) {
		// subclasses must implement
	},


	// Unrenders a visual indication of an event or external element being dragged
	destroyDrag: function() {
		// subclasses must implement
	},


	/* Resizing
	------------------------------------------------------------------------------------------------------------------*/


	// Called when the user does a mousedown on an event's resizer, which might lead to resizing.
	// Generic enough to work with any type of Grid.
	segResizeMousedown: function(seg, ev, isStart) {
		var _this = this;
		var view = this.view;
		var calendar = view.calendar;
		var el = seg.el;
		var event = seg.event;
		var eventEnd = calendar.getEventEnd(event);
		var dragListener;
		var resizeLocation; // falsy if invalid resize

		// Tracks mouse movement over the *grid's* coordinate map
		dragListener = new CellDragListener(this.coordMap, {
			distance: 5,
			scroll: view.opt('dragScroll'),
			subjectEl: el,
			dragStart: function(ev) {
				_this.triggerSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
				_this.segResizeStart(seg, ev);
			},
			cellOver: function(cell, isOrig, origCell) {
				resizeLocation = isStart ?
					_this.computeEventStartResize(origCell, cell, event) :
					_this.computeEventEndResize(origCell, cell, event);

				if (resizeLocation) {
					if (!calendar.isEventRangeAllowed(resizeLocation, event)) {
						disableCursor();
						resizeLocation = null;
					}
					// no change? (TODO: how does this work with timezones?)
					else if (resizeLocation.start.isSame(event.start) && resizeLocation.end.isSame(eventEnd)) {
						resizeLocation = null;
					}
				}

				if (resizeLocation) {
					view.hideEvent(event);
					_this.renderEventResize(resizeLocation, seg);
				}
			},
			cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
				resizeLocation = null;
			},
			cellDone: function() { // resets the rendering to show the original event
				_this.destroyEventResize();
				view.showEvent(event);
				enableCursor();
			},
			dragStop: function(ev) {
				_this.segResizeStop(seg, ev);

				if (resizeLocation) { // valid date to resize to?
					view.reportEventResize(event, resizeLocation, this.largeUnit, el, ev);
				}
			}
		});

		dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
	},


	// Called before event segment resizing starts
	segResizeStart: function(seg, ev) {
		this.isResizingSeg = true;
		this.view.trigger('eventResizeStart', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
	},


	// Called after event segment resizing stops
	segResizeStop: function(seg, ev) {
		this.isResizingSeg = false;
		this.view.trigger('eventResizeStop', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
	},


	// Returns new date-information for an event segment being resized from its start
	computeEventStartResize: function(startCell, endCell, event) {
		return this.computeEventResize('start', startCell, endCell, event);
	},


	// Returns new date-information for an event segment being resized from its end
	computeEventEndResize: function(startCell, endCell, event) {
		return this.computeEventResize('end', startCell, endCell, event);
	},


	// Returns new date-information for an event segment being resized from its start OR end
	// `type` is either 'start' or 'end'
	computeEventResize: function(type, startCell, endCell, event) {
		var calendar = this.view.calendar;
		var delta = this.diffDates(endCell[type], startCell[type]);
		var range;
		var defaultDuration;

		// build original values to work from, guaranteeing a start and end
		range = {
			start: event.start.clone(),
			end: calendar.getEventEnd(event),
			allDay: event.allDay
		};

		// if an all-day event was in a timed area and was resized to a time, adjust start/end to have times
		if (range.allDay && durationHasTime(delta)) {
			range.allDay = false;
			calendar.normalizeEventRangeTimes(range);
		}

		range[type].add(delta); // apply delta to start or end

		// if the event was compressed too small, find a new reasonable duration for it
		if (!range.start.isBefore(range.end)) {

			defaultDuration = event.allDay ?
				calendar.defaultAllDayEventDuration :
				calendar.defaultTimedEventDuration;

			// between the cell's duration and the event's default duration, use the smaller of the two.
			// example: if year-length slots, and compressed to one slot, we don't want the event to be a year long
			if (this.cellDuration && this.cellDuration < defaultDuration) {
				defaultDuration = this.cellDuration;
			}

			if (type == 'start') { // resizing the start?
				range.start = range.end.clone().subtract(defaultDuration);
			}
			else { // resizing the end?
				range.end = range.start.clone().add(defaultDuration);
			}
		}

		return range;
	},


	// Renders a visual indication of an event being resized.
	// `range` has the updated dates of the event. `seg` is the original segment object involved in the drag.
	renderEventResize: function(range, seg) {
		// subclasses must implement
	},


	// Unrenders a visual indication of an event being resized.
	destroyEventResize: function() {
		// subclasses must implement
	},


	/* Rendering Utils
	------------------------------------------------------------------------------------------------------------------*/


	// Compute the text that should be displayed on an event's element.
	// `range` can be the Event object itself, or something range-like, with at least a `start`.
	// If event times are disabled, or the event has no time, will return a blank string.
	// If not specified, formatStr will default to the eventTimeFormat setting,
	// and displayEnd will default to the displayEventEnd setting.
	getEventTimeText: function(range, formatStr, displayEnd) {

		if (formatStr == null) {
			formatStr = this.eventTimeFormat;
		}

		if (displayEnd == null) {
			displayEnd = this.displayEventEnd;
		}

		if (this.displayEventTime && range.start.hasTime()) {
			if (displayEnd && range.end) {
				return this.view.formatRange(range, formatStr);
			}
			else {
				return range.start.format(formatStr);
			}
		}

		return '';
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


	// Utility for generating event skin-related CSS properties
	getEventSkinCss: function(event) {
		var view = this.view;
		var source = event.source || {};
		var eventColor = event.color;
		var sourceColor = source.color;
		var optionColor = view.opt('eventColor');

		return {
			'background-color':
				event.backgroundColor ||
				eventColor ||
				source.backgroundColor ||
				sourceColor ||
				view.opt('eventBackgroundColor') ||
				optionColor,
			'border-color':
				event.borderColor ||
				eventColor ||
				source.borderColor ||
				sourceColor ||
				view.opt('eventBorderColor') ||
				optionColor,
			color:
				event.textColor ||
				source.textColor ||
				view.opt('eventTextColor')
		};
	},


	/* Converting events -> ranges -> segs
	------------------------------------------------------------------------------------------------------------------*/


	// Converts an array of event objects into an array of event segment objects.
	// A custom `rangeToSegsFunc` may be given for arbitrarily slicing up events.
	// Doesn't guarantee an order for the resulting array.
	eventsToSegs: function(events, rangeToSegsFunc) {
		var eventRanges = this.eventsToRanges(events);
		var segs = [];
		var i;

		for (i = 0; i < eventRanges.length; i++) {
			segs.push.apply(
				segs,
				this.eventRangeToSegs(eventRanges[i], rangeToSegsFunc)
			);
		}

		return segs;
	},


	// Converts an array of events into an array of "range" objects.
	// A "range" object is a plain object with start/end properties denoting the time it covers. Also an event property.
	// For "normal" events, this will be identical to the event's start/end, but for "inverse-background" events,
	// will create an array of ranges that span the time *not* covered by the given event.
	// Doesn't guarantee an order for the resulting array.
	eventsToRanges: function(events) {
		var _this = this;
		var eventsById = groupEventsById(events);
		var ranges = [];

		// group by ID so that related inverse-background events can be rendered together
		$.each(eventsById, function(id, eventGroup) {
			if (eventGroup.length) {
				ranges.push.apply(
					ranges,
					isInverseBgEvent(eventGroup[0]) ?
						_this.eventsToInverseRanges(eventGroup) :
						_this.eventsToNormalRanges(eventGroup)
				);
			}
		});

		return ranges;
	},


	// Converts an array of "normal" events (not inverted rendering) into a parallel array of ranges
	eventsToNormalRanges: function(events) {
		var calendar = this.view.calendar;
		var ranges = [];
		var i, event;
		var eventStart, eventEnd;

		for (i = 0; i < events.length; i++) {
			event = events[i];

			// make copies and normalize by stripping timezone
			eventStart = event.start.clone().stripZone();
			eventEnd = calendar.getEventEnd(event).stripZone();

			ranges.push({
				event: event,
				start: eventStart,
				end: eventEnd,
				eventStartMS: +eventStart,
				eventDurationMS: eventEnd - eventStart
			});
		}

		return ranges;
	},


	// Converts an array of events, with inverse-background rendering, into an array of range objects.
	// The range objects will cover all the time NOT covered by the events.
	eventsToInverseRanges: function(events) {
		var view = this.view;
		var viewStart = view.start.clone().stripZone(); // normalize timezone
		var viewEnd = view.end.clone().stripZone(); // normalize timezone
		var normalRanges = this.eventsToNormalRanges(events); // will give us normalized dates we can use w/o copies
		var inverseRanges = [];
		var event0 = events[0]; // assign this to each range's `.event`
		var start = viewStart; // the end of the previous range. the start of the new range
		var i, normalRange;

		// ranges need to be in order. required for our date-walking algorithm
		normalRanges.sort(compareNormalRanges);

		for (i = 0; i < normalRanges.length; i++) {
			normalRange = normalRanges[i];

			// add the span of time before the event (if there is any)
			if (normalRange.start > start) { // compare millisecond time (skip any ambig logic)
				inverseRanges.push({
					event: event0,
					start: start,
					end: normalRange.start
				});
			}

			start = normalRange.end;
		}

		// add the span of time after the last event (if there is any)
		if (start < viewEnd) { // compare millisecond time (skip any ambig logic)
			inverseRanges.push({
				event: event0,
				start: start,
				end: viewEnd
			});
		}

		return inverseRanges;
	},


	// Slices the given event range into one or more segment objects.
	// A `rangeToSegsFunc` custom slicing function can be given.
	eventRangeToSegs: function(eventRange, rangeToSegsFunc) {
		var segs;
		var i, seg;

		if (rangeToSegsFunc) {
			segs = rangeToSegsFunc(eventRange);
		}
		else {
			segs = this.rangeToSegs(eventRange); // defined by the subclass
		}

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			seg.event = eventRange.event;
			seg.eventStartMS = eventRange.eventStartMS;
			seg.eventDurationMS = eventRange.eventDurationMS;
		}

		return segs;
	}

});


/* Utilities
----------------------------------------------------------------------------------------------------------------------*/


function isBgEvent(event) { // returns true if background OR inverse-background
	var rendering = getEventRendering(event);
	return rendering === 'background' || rendering === 'inverse-background';
}


function isInverseBgEvent(event) {
	return getEventRendering(event) === 'inverse-background';
}


function getEventRendering(event) {
	return firstDefined((event.source || {}).rendering, event.rendering);
}


function groupEventsById(events) {
	var eventsById = {};
	var i, event;

	for (i = 0; i < events.length; i++) {
		event = events[i];
		(eventsById[event._id] || (eventsById[event._id] = [])).push(event);
	}

	return eventsById;
}


// A cmp function for determining which non-inverted "ranges" (see above) happen earlier
function compareNormalRanges(range1, range2) {
	return range1.eventStartMS - range2.eventStartMS; // earlier ranges go first
}


// A cmp function for determining which segments should take visual priority
// DOES NOT WORK ON INVERTED BACKGROUND EVENTS because they have no eventStartMS/eventDurationMS
function compareSegs(seg1, seg2) {
	return seg1.eventStartMS - seg2.eventStartMS || // earlier events go first
		seg2.eventDurationMS - seg1.eventDurationMS || // tie? longer events go first
		seg2.event.allDay - seg1.event.allDay || // tie? put all-day events first (booleans cast to 0/1)
		(seg1.event.title || '').localeCompare(seg2.event.title); // tie? alphabetically by title
}

fc.compareSegs = compareSegs; // export


/* External-Dragging-Element Data
----------------------------------------------------------------------------------------------------------------------*/

// Require all HTML5 data-* attributes used by FullCalendar to have this prefix.
// A value of '' will query attributes like data-event. A value of 'fc' will query attributes like data-fc-event.
fc.dataAttrPrefix = '';

// Given a jQuery element that might represent a dragged FullCalendar event, returns an intermediate data structure
// to be used for Event Object creation.
// A defined `.eventProps`, even when empty, indicates that an event should be created.
function getDraggedElMeta(el) {
	var prefix = fc.dataAttrPrefix;
	var eventProps; // properties for creating the event, not related to date/time
	var startTime; // a Duration
	var duration;
	var stick;

	if (prefix) { prefix += '-'; }
	eventProps = el.data(prefix + 'event') || null;

	if (eventProps) {
		if (typeof eventProps === 'object') {
			eventProps = $.extend({}, eventProps); // make a copy
		}
		else { // something like 1 or true. still signal event creation
			eventProps = {};
		}

		// pluck special-cased date/time properties
		startTime = eventProps.start;
		if (startTime == null) { startTime = eventProps.time; } // accept 'time' as well
		duration = eventProps.duration;
		stick = eventProps.stick;
		delete eventProps.start;
		delete eventProps.time;
		delete eventProps.duration;
		delete eventProps.stick;
	}

	// fallback to standalone attribute values for each of the date/time properties
	if (startTime == null) { startTime = el.data(prefix + 'start'); }
	if (startTime == null) { startTime = el.data(prefix + 'time'); } // accept 'time' as well
	if (duration == null) { duration = el.data(prefix + 'duration'); }
	if (stick == null) { stick = el.data(prefix + 'stick'); }

	// massage into correct data types
	startTime = startTime != null ? moment.duration(startTime) : null;
	duration = duration != null ? moment.duration(duration) : null;
	stick = Boolean(stick);

	return { eventProps: eventProps, startTime: startTime, duration: duration, stick: stick };
}

