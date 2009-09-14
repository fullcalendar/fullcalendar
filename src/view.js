
var viewMethods = {

	//
	// Objects inheriting these methods must implement the following properties/methods:
	// - title
	// - start
	// - end
	// - visStart
	// - visEnd
	// - defaultEventEnd(event)
	// - visEventEnd(event)
	//
	// - render
	// - rerenderEvents
	//

	init: function(element, options) {
		this.element = element;
		this.options = options;
		this.cachedEvents = [];
		this.eventsByID = {};
		this.eventElements = [];
		this.eventElementsByID = {};
	},
	
	
	
	// trigger event handlers, always append view as last arg
	
	trigger: function(name, thisObj) {
		if (this.options[name]) {
			return this.options[name].apply(thisObj || this, Array.prototype.slice.call(arguments, 2).concat([this]));
		}
	},
	
	
	
	//
	
	eventEnd: function(event) {
		return event.end || this.defaultEventEnd(event);
	},
	
	
	
	// event/element creation reporting
	
	reportEvents: function(events) {
		var i, len=events.length, event,
			fakeID = 0,
			eventsByID = this.eventsByID = {},
			cachedEvents = this.cachedEvents = [];
		for (i=0; i<len; i++) { // TODO: move _id creation to more global 'cleanEvents'
			event = events[i];
			if (eventsByID[event._id]) {
				eventsByID[event._id].push(event);
			}else{
				eventsByID[event._id] = [event];
			}
			cachedEvents.push(event);
		}
	},

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
	
	clearEvents: function() { // just remove ELEMENTS
		$.each(this.eventElements, function() {
			this.remove();
		});
		this.eventElements = [];
		this.eventElementsByID = {};
	},
	
	showEvents: function(event, exceptElement) {
		this._eee(event, exceptElement, 'show');
	},
	
	hideEvents: function(event, exceptElement) {
		this._eee(event, exceptElement, 'hide'); // fadeOut
	},
	
	_eee: function(event, exceptElement, funcName) { // event-element-each
		var elements = this.eventElementsByID[event._id];
		for (var i=0; i<elements.length; i++) {
			if (elements[i] != exceptElement) {
				elements[i][funcName]();
			}
		}
	},
	
	
	
	// event modification reporting
	
	moveEvent: function(event, days, minutes) { // and actually DO the date change too
		minutes = minutes || 0;
		var i, event2, events = this.eventsByID[event._id];
		for (i=0; i<events.length; i++) {
			event2 = events[i];
			event2.allDay = event.allDay;
			addMinutes(addDays(event2.start, days, true), minutes);
			if (event.end) {
				event2.end = addMinutes(addDays(this.eventEnd(event2), days, true), minutes);
			}else{
				event2.end = null;
			}
			normalizeEvent(event2);
		}
		this.eventsChanged = true;
	},
	
	resizeEvent: function(event, days, minutes) { // and actually DO the date change too
		minutes = minutes || 0;
		var i, event2, events = this.eventsByID[event._id];
		for (i=0; i<events.length; i++) {
			event2 = events[i];
			event2.end = addMinutes(addDays(this.eventEnd(event2), days, true), minutes);
			normalizeEvent(event2);
		}
		this.eventsChanged = true;
	},
	
	
	
	// semi-transparent overlay (for days while dragging)
	
	showOverlay: function(props) {
		if (!this.dayOverlay) {
			this.dayOverlay = $("<div class='fc-cell-overlay' style='position:absolute;display:none'/>")
				.appendTo(this.element);
		}
		var o = this.element.offset();
		this.dayOverlay
			.css({
				top: props.top - o.top,
				left: props.left - o.left,
				width: props.width,
				height: props.height
			})
			.show();
	},
	
	hideOverlay: function() {
		if (this.dayOverlay) {
			this.dayOverlay.hide();
		}
	},
	
	
	
	// event rendering utilities
	
	sliceSegs: function(events, start, end) {
		var segs = [],
			i, len=events.length, event,
			eventStart, eventEnd,
			segStart, segEnd,
			isStart, isEnd;
		for (i=0; i<len; i++) {
			event = events[i];
			eventStart = event.start;
			eventEnd = this.visEventEnd(event);
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


// more event rendering utilities

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
					if (seg.end > levels[j][k].start && seg.start < levels[j][k].end) {
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
		//seg.after = 0;
	}
	return levels;
}

function segCmp(a, b) {
	return  (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
}

function segsCollide(seg1, seg2) {
	return seg1.end > seg2.start && seg1.start < seg2.end;
}
