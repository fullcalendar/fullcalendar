
/* Additional view: list (by bruederli@kolabsys.com)
---------------------------------------------------------------------------------*/

function ListEventRenderer() {
	var t = this;
	
	// exports
	t.renderEvents = renderEvents;
	t.renderEventTime = renderEventTime;
	t.compileDaySegs = compileSegs; // for DayEventRenderer
	t.clearEvents = clearEvents;
	t.lazySegBind = lazySegBind;
	t.sortCmp = sortCmp;
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var reportEventElement = t.reportEventElement;
	var eventElementHandlers = t.eventElementHandlers;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var getListContainer = t.getDaySegmentContainer;
	var calendar = t.calendar;
	var formatDate = calendar.formatDate;
	var formatDates = calendar.formatDates;
	
	
	/* Rendering
	--------------------------------------------------------------------*/
	
	function clearEvents() {
		reportEventClear();
		getListContainer().empty();
	}
	
	function renderEvents(events, modifiedEventId) {
		events.sort(sortCmp);
		reportEvents(events);
		renderSegs(compileSegs(events), modifiedEventId);
	}
	
	function compileSegs(events) {
		var segs = [];
		var colFormat = opt('titleFormat', 'day');
		var firstDay = opt('firstDay');
		var segmode = opt('listSections');
		var event, i, dd, wd, md, seg, segHash, curSegHash, segDate, curSeg = -1;
		var today = clearTime(new Date());
		var weekstart = addDays(cloneDate(today), -((today.getDay() - firstDay + 7) % 7));
		
		for (i=0; i < events.length; i++) {
			event = events[i];
			
			// skip events out of range
			if ((event.end || event.start) < t.start || event.start > t.visEnd)
				continue;
			
			// define sections of this event
			// create smart sections such as today, tomorrow, this week, next week, next month, ect.
			segDate = cloneDate(event.start < t.start && event.end > t.start ? t.start : event.start, true);
			dd = dayDiff(segDate, today);
			wd = Math.floor(dayDiff(segDate, weekstart) / 7);
			md = segDate.getMonth() + ((segDate.getYear() - today.getYear()) * 12) - today.getMonth();
			
			// build section title
			if (segmode == 'smart') {
				if (dd < 0) {
					segHash = opt('listTexts', 'past');
				} else if (dd == 0) {
					segHash = opt('listTexts', 'today');
				} else if (dd == 1) {
					segHash = opt('listTexts', 'tomorrow');
				} else if (wd == 0) {
					segHash = opt('listTexts', 'thisWeek');
				} else if (wd == 1) {
					segHash = opt('listTexts', 'nextWeek');
				} else if (md == 0) {
					segHash = opt('listTexts', 'thisMonth');
				} else if (md == 1) {
					segHash = opt('listTexts', 'nextMonth');
				} else if (md > 1) {
					segHash = opt('listTexts', 'future');
				}
			} else if (segmode == 'month') {
				segHash = formatDate(segDate, 'MMMM yyyy');
			} else if (segmode == 'week') {
				segHash = opt('listTexts', 'week') + formatDate(segDate, ' W');
			} else if (segmode == 'day') {
				segHash = formatDate(segDate, colFormat);
			} else {
				segHash = '';
			}
			
			// start new segment
			if (segHash != curSegHash) {
				segs[++curSeg] = { events: [], start: segDate, title: segHash, daydiff: dd, weekdiff: wd, monthdiff: md };
				curSegHash = segHash;
			}
			
			segs[curSeg].events.push(event);
		}
		
		return segs;
	}

	function sortCmp(a, b) {
		var sd = a.start.getTime() - b.start.getTime();
		return sd || (a.end ? a.end.getTime() : 0) - (b.end ? b.end.getTime() : 0);
	}
	
	function renderSegs(segs, modifiedEventId) {
		var tm = opt('theme') ? 'ui' : 'fc';
		var headerClass = tm + "-widget-header";
		var contentClass = tm + "-widget-content";
		var i, j, seg, event, times, s, skinCss, skinCssAttr, classes, segContainer, eventElement, eventElements, triggerRes;

		for (j=0; j < segs.length; j++) {
			seg = segs[j];
			
			if (seg.title) {
				$('<div class="fc-list-header ' + headerClass + '">' + htmlEscape(seg.title) + '</div>').appendTo(getListContainer());
			}
			segContainer = $('<div>').addClass('fc-list-section ' + contentClass).appendTo(getListContainer());
			s = '';
			
			for (i=0; i < seg.events.length; i++) {
				event = seg.events[i];
				times = renderEventTime(event, seg);
				skinCss = getSkinCss(event, opt);
				skinCssAttr = (skinCss ? " style='" + skinCss + "'" : '');
				classes = ['fc-event', 'fc-event-skin', 'fc-event-vert', 'fc-corner-top', 'fc-corner-bottom'].concat(event.className);
				if (event.source && event.source.className) {
					classes = classes.concat(event.source.className);
				}
				
				s += 
					"<div class='" + classes.join(' ') + "'" + skinCssAttr + ">" +
					"<div class='fc-event-inner fc-event-skin'" + skinCssAttr + ">" +
					"<div class='fc-event-head fc-event-skin'" + skinCssAttr + ">" +
					"<div class='fc-event-time'>" +
					(times[0] ? '<span class="fc-col-date">' + times[0] + '</span> ' : '') +
					(times[1] ? '<span class="fc-col-time">' + times[1] + '</span>' : '') +
					"</div>" +
					"</div>" +
					"<div class='fc-event-content'>" +
					"<div class='fc-event-title'>" +
					htmlEscape(event.title) +
					"</div>" +
					"</div>" +
					"<div class='fc-event-bg'></div>" +
					"</div>" + // close inner
					"</div>";  // close outer
			}
			
			segContainer[0].innerHTML = s;
			eventElements = segContainer.children();

			// retrieve elements, run through eventRender callback, bind event handlers
			for (i=0; i < seg.events.length; i++) {
				event = seg.events[i];
				eventElement = $(eventElements[i]); // faster than eq()
				triggerRes = trigger('eventRender', event, event, eventElement);
				if (triggerRes === false) {
					eventElement.remove();
				} else {
					if (triggerRes && triggerRes !== true) {
						eventElement.remove();
						eventElement = $(triggerRes).appendTo(segContainer);
					}
					if (event._id === modifiedEventId) {
						eventElementHandlers(event, eventElement, seg);
					} else {
						eventElement[0]._fci = i; // for lazySegBind
					}
					reportEventElement(event, eventElement);
				}
			}
		
			lazySegBind(segContainer, seg, eventElementHandlers);
		}
		
		markFirstLast(getListContainer());
	}
	
	// event time/date range to display
	function renderEventTime(event, seg) {
		var timeFormat = opt('timeFormat');
		var dateFormat = opt('columnFormat');
		var segmode = opt('listSections');
		var duration = event.end ? event.end.getTime() - event.start.getTime() : 0;
		var datestr = '', timestr = '';
		
		if (segmode == 'smart') {
			if (event.start < seg.start) {
				datestr = opt('listTexts', 'until') + ' ' + formatDate(event.end, (event.allDay || event.end.getDate() != seg.start.getDate()) ? dateFormat : timeFormat);
			} else if (duration > DAY_MS) {
				datestr = formatDates(event.start, event.end, dateFormat + '{ - ' + dateFormat + '}');
			} else if (seg.daydiff == 0) {
				datestr = opt('listTexts', 'today');
			}	else if (seg.daydiff == 1) {
				datestr = opt('listTexts', 'tomorrow');
			} else if (seg.weekdiff == 0 || seg.weekdiff == 1) {
				datestr = formatDate(event.start, 'dddd');
			} else if (seg.daydiff > 1 || seg.daydiff < 0) {
				datestr = formatDate(event.start, dateFormat);
			}
		} else if (segmode != 'day') {
			datestr = formatDates(event.start, event.end, dateFormat + (duration > DAY_MS ? '{ - ' + dateFormat + '}' : ''));
		}
		
		if (!datestr && event.allDay) {
			timestr = opt('allDayText');
		} else if ((duration < DAY_MS || !datestr) && !event.allDay) {
			timestr = formatDates(event.start, event.end, timeFormat);
		}
		
		return [datestr, timestr];
	}
	
	function lazySegBind(container, seg, bindHandlers) {
		container.unbind('mouseover').mouseover(function(ev) {
			var parent = ev.target, e = parent, i, event;
			while (parent != this) {
				e = parent;
				parent = parent.parentNode;
			}
			if ((i = e._fci) !== undefined) {
				e._fci = undefined;
				event = seg.events[i];
				bindHandlers(event, container.children().eq(i), seg);
				$(ev.target).trigger(ev);
			}
			ev.stopPropagation();
		});
	}
	
}


fcViews.list = ListView;


function ListView(element, calendar) {
	var t = this;

	// exports
	t.render = render;
	t.select = dummy;
	t.unselect = dummy;
	t.getDaySegmentContainer = function(){ return body; };

	// imports
	View.call(t, element, calendar, 'list');
	ListEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
  var clearEvents = t.clearEvents;
	var reportEventClear = t.reportEventClear;
	var formatDates = calendar.formatDates;
	var formatDate = calendar.formatDate;

	// overrides
	t.setWidth = setWidth;
	t.setHeight = setHeight;
	
	// locals
	var body;
	var firstDay;
	var nwe;
	var tm;
	var colFormat;
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, opt('listPage') * delta);
		}
		t.start = t.visStart = cloneDate(date, true);
		t.end = addDays(cloneDate(t.start), opt('listPage'));
		t.visEnd = addDays(cloneDate(t.start), opt('listRange'));
		addMinutes(t.visEnd, -1);  // set end to 23:59
		t.title = formatDates(date, t.visEnd, opt('titleFormat'));
		
		updateOptions();

		if (!body) {
			buildSkeleton();
		} else {
			clearEvents();
		}
	}
	
	
	function updateOptions() {
		firstDay = opt('firstDay');
		nwe = opt('weekends') ? 0 : 1;
		tm = opt('theme') ? 'ui' : 'fc';
		colFormat = opt('columnFormat', 'day');
	}
	
	
	function buildSkeleton() {
		body = $('<div>').addClass('fc-list-content').appendTo(element);
	}
	
	function setHeight(height, dateChanged) {
	  if (!opt('listNoHeight'))
		  body.css('height', (height-1)+'px').css('overflow', 'auto');
	}

	function setWidth(width) {
		// nothing to be done here
	}
	
	function dummy() {
		// Stub.
	}

}
