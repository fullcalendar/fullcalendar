
/* Methods & Utilities for All Views
-----------------------------------------------------------------------------*/

var viewMethods = {

	// TODO: maybe change the 'vis' variables to 'excl'

	/*
	 * Objects inheriting these methods must implement the following properties/methods:
	 * - title
	 * - start
	 * - end
	 * - visStart
	 * - visEnd
	 * - defaultEventEnd(event)
	 * - render(events)
	 * - rerenderEvents()
	 *
	 *
	 * z-index reservations:
	 * 3 - day-overlay
	 * 8 - events
	 * 9 - dragging/resizing events
	 *
	 */
	
	

	init: function(element, options) {
		this.element = element;
		this.options = options;
		this.eventsByID = {};
		this.eventElements = [];
		this.eventElementsByID = {};
		this.overlays = [];
	},
	
	
	
	// triggers an event handler, always append view as last arg
	
	trigger: function(name, thisObj) {
		if (this.options[name]) {
			return this.options[name].apply(thisObj || this, Array.prototype.slice.call(arguments, 2).concat([this]));
		}
	},
	
	
	
	// returns a Date object for an event's end
	
	eventEnd: function(event) {
		return event.end ? cloneDate(event.end) : this.defaultEventEnd(event); // TODO: make sure always using copies
	},
	
	
	
	// report when view receives new events
	
	reportEvents: function(events) { // events are already normalized at this point
		var i, len=events.length, event,
			eventsByID = this.eventsByID = {};
		for (i=0; i<len; i++) {
			event = events[i];
			if (eventsByID[event._id]) {
				eventsByID[event._id].push(event);
			}else{
				eventsByID[event._id] = [event];
			}
		}
	},
	
	
	
	// report when view creates an element for an event

	reportEventElement: function(event, element) {
		this.eventElements.push(element);
		var eventElementsByID = this.eventElementsByID;
		if (eventElementsByID[event._id]) {
			eventElementsByID[event._id].push(element);
		}else{
			eventElementsByID[event._id] = [element];
		}
	},
	
	
	
	// event element manipulation
	
	_clearEvents: function() { // only resets hashes
		this.eventElements = [];
		this.eventElementsByID = {};
	},
	
	showEvents: function(event, exceptElement) {
		this._eee(event, exceptElement, 'show');
	},
	
	hideEvents: function(event, exceptElement) {
		this._eee(event, exceptElement, 'hide');
	},
	
	_eee: function(event, exceptElement, funcName) { // event-element-each
		var elements = this.eventElementsByID[event._id],
			i, len = elements.length;
		for (i=0; i<len; i++) {
			if (elements[i][0] != exceptElement[0]) { // AHAHAHAHAHAHAHAH
				elements[i][funcName]();
			}
		}
	},
	
	
	
	// event modification reporting
	
	eventDrop: function(e, event, dayDelta, minuteDelta, allDay, ev, ui) {
		var view = this,
			oldAllDay = event.allDay,
			eventId = event._id;
		view.moveEvents(view.eventsByID[eventId], dayDelta, minuteDelta, allDay);
		view.trigger('eventDrop', e, event, dayDelta, minuteDelta, allDay, function() { // TODO: change docs
			// TODO: investigate cases where this inverse technique might not work
			view.moveEvents(view.eventsByID[eventId], -dayDelta, -minuteDelta, oldAllDay);
			view.rerenderEvents();
		}, ev, ui);
		view.eventsChanged = true;
		view.rerenderEvents(eventId);
	},
	
	eventResize: function(e, event, dayDelta, minuteDelta, ev, ui) {
		var view = this,
			eventId = event._id;
		view.elongateEvents(view.eventsByID[eventId], dayDelta, minuteDelta);
		view.trigger('eventResize', e, event, dayDelta, minuteDelta, function() {
			// TODO: investigate cases where this inverse technique might not work
			view.elongateEvents(view.eventsByID[eventId], -dayDelta, -minuteDelta);
			view.rerenderEvents();
		}, ev, ui);
		view.eventsChanged = true;
		view.rerenderEvents(eventId);
	},
	
	
	
	// event modification
	
	moveEvents: function(events, dayDelta, minuteDelta, allDay) {
		minuteDelta = minuteDelta || 0;
		for (var e, len=events.length, i=0; i<len; i++) {
			e = events[i];
			if (allDay !== undefined) {
				e.allDay = allDay;
			}
			addMinutes(addDays(e.start, dayDelta, true), minuteDelta);
			if (e.end) {
				e.end = addMinutes(addDays(e.end, dayDelta, true), minuteDelta);
			}
			normalizeEvent(e, this.options);
		}
	},
	
	elongateEvents: function(events, dayDelta, minuteDelta) {
		minuteDelta = minuteDelta || 0;
		for (var e, len=events.length, i=0; i<len; i++) {
			e = events[i];
			e.end = addMinutes(addDays(this.eventEnd(e), dayDelta, true), minuteDelta);
			normalizeEvent(e, this.options);
		}
	},
	
	
	
	// semi-transparent overlay (while dragging or selecting)
	
	renderOverlay: function(rect, parent) {
		var e = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>")
			.css(rect)
			.appendTo(parent);
		this.overlays.push(e);
		return e;
	},
	
	clearOverlays: function() {
		$.each(this.overlays, function() {
			this.remove();
		});
		this.overlays = [];
	},
	
	
	
	
	// common horizontal event resizing

	resizableDayEvent: function(event, eventElement, colWidth) {
		var view = this;
		if (!view.options.disableResizing && eventElement.resizable) {
			eventElement.resizable({
				handles: view.options.isRTL ? {w:'div.ui-resizable-w'} : {e:'div.ui-resizable-e'},
				grid: colWidth,
				minWidth: colWidth/2, // need this or else IE throws errors when too small
				containment: view.element.parent().parent(), // the main element...
				             // ... a fix. wouldn't allow extending to last column in agenda views (jq ui bug?)
				start: function(ev, ui) {
					eventElement.css('z-index', 9);
					view.hideEvents(event, eventElement);
					view.trigger('eventResizeStart', this, event, ev, ui);
				},
				stop: function(ev, ui) {
					view.trigger('eventResizeStop', this, event, ev, ui);
					// ui.size.width wasn't working with grid correctly, use .width()
					var dayDelta = Math.round((eventElement.width() - ui.originalSize.width) / colWidth);
					if (dayDelta) {
						view.eventResize(this, event, dayDelta, 0, ev, ui);
					}else{
						eventElement.css('z-index', 8);
						view.showEvents(event, eventElement);
					}
				}
			});
		}
	},
	
	
	
	// attaches eventClick, eventMouseover, eventMouseout
	
	eventElementHandlers: function(event, eventElement) {
		var view = this;
		eventElement
			.click(function(ev) {
				if (!eventElement.hasClass('ui-draggable-dragging') &&
					!eventElement.hasClass('ui-resizable-resizing')) {
						return view.trigger('eventClick', this, event, ev);
					}
			})
			.hover(
				function(ev) {
					view.trigger('eventMouseover', this, event, ev);
				},
				function(ev) {
					view.trigger('eventMouseout', this, event, ev);
				}
			);
	},
	
	
	
	// get a property from the 'options' object, using smart view naming
	
	option: function(name, viewName) {
		var v = this.options[name];
		if (typeof v == 'object') {
			return smartProperty(v, viewName || this.name);
		}
		return v;
	},
	
	
	
	// event rendering utilities
	
	sliceSegs: function(events, visEventEnds, start, end) {
		var segs = [],
			i, len=events.length, event,
			eventStart, eventEnd,
			segStart, segEnd,
			isStart, isEnd;
		for (i=0; i<len; i++) {
			event = events[i];
			eventStart = event.start;
			eventEnd = visEventEnds[i];
			if (eventEnd > start && eventStart < end) {
				if (eventStart < start) {
					segStart = cloneDate(start);
					isStart = false;
				}else{
					segStart = eventStart;
					isStart = true;
				}
				if (eventEnd > end) {
					segEnd = cloneDate(end);
					isEnd = false;
				}else{
					segEnd = eventEnd;
					isEnd = true;
				}
				segs.push({
					event: event,
					start: segStart,
					end: segEnd,
					isStart: isStart,
					isEnd: isEnd,
					msLength: segEnd - segStart
				});
			}
		} 
		return segs.sort(segCmp);
	}
	

};



function lazySegBind(container, segs, bindHandlers) {
	container.unbind('mouseover').mouseover(function(ev) {
		var parent=ev.target, e,
			i, seg;
		while (parent != this) {
			e = parent;
			parent = parent.parentNode;
		}
		if ((i = e._fci) !== undefined) {
			e._fci = undefined;
			seg = segs[i];
			bindHandlers(seg.event, seg.element, seg);
			$(ev.target).trigger(ev);
		}
		ev.stopPropagation();
	});
}



// event rendering calculation utilities

function stackSegs(segs) {
	var levels = [],
		i, len = segs.length, seg,
		j, collide, k;
	for (i=0; i<len; i++) {
		seg = segs[i];
		j = 0; // the level index where seg should belong
		while (true) {
			collide = false;
			if (levels[j]) {
				for (k=0; k<levels[j].length; k++) {
					if (segsCollide(levels[j][k], seg)) {
						collide = true;
						break;
					}
				}
			}
			if (collide) {
				j++;
			}else{
				break;
			}
		}
		if (levels[j]) {
			levels[j].push(seg);
		}else{
			levels[j] = [seg];
		}
	}
	return levels;
}

function segCmp(a, b) {
	return  (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
}

function segsCollide(seg1, seg2) {
	return seg1.end > seg2.start && seg1.start < seg2.end;
}



