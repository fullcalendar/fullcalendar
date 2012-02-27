
/* Additional view: table (by bruederli@kolabsys.com)
---------------------------------------------------------------------------------*/

function TableEventRenderer() {
	var t = this;
	
	// imports
	ListEventRenderer.call(t);
	var opt = t.opt;
	var sortCmp = t.sortCmp;
	var trigger = t.trigger;
	var compileSegs = t.compileDaySegs;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var reportEventElement = t.reportEventElement;
	var eventElementHandlers = t.eventElementHandlers;
	var renderEventTime = t.renderEventTime;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var getListContainer = t.getDaySegmentContainer;
	var lazySegBind = t.lazySegBind;
	var calendar = t.calendar;
	var formatDate = calendar.formatDate;
	var formatDates = calendar.formatDates;

	// exports
	t.renderEvents = renderEvents;
	t.clearEvents = clearEvents;


	/* Rendering
	--------------------------------------------------------------------*/
	
	function clearEvents() {
		reportEventClear();
		getListContainer().children('tbody').remove();
	}
	
	function renderEvents(events, modifiedEventId) {
		events.sort(sortCmp);
		reportEvents(events);
		renderSegs(compileSegs(events), modifiedEventId);
		getListContainer().removeClass('fc-list-smart fc-list-day fc-list-month fc-list-week').addClass('fc-list-' + opt('listSections'));
	}

	function renderSegs(segs, modifiedEventId) {
		var tm = opt('theme') ? 'ui' : 'fc';
		var table = getListContainer();
		var headerClass = tm + "-widget-header";
		var contentClass = tm + "-widget-content";
		var tableCols = opt('tableCols');
		var timecol = $.inArray('time', tableCols) >= 0;
		var i, j, seg, event, times, s, skinCss, skinCssAttr, skinClasses, rowClasses, segContainer, eventElements, eventElement, triggerRes;

		for (j=0; j < segs.length; j++) {
			seg = segs[j];
			
			if (seg.title) {
				$('<tbody class="fc-list-header"><tr><td class="fc-list-header ' + headerClass + '" colspan="' + tableCols.length + '">' + htmlEscape(seg.title) + '</td></tr></tbody>').appendTo(table);
			}
			segContainer = $('<tbody>').addClass('fc-list-section ' + contentClass).appendTo(table);
			s = '';
			
			for (i=0; i < seg.events.length; i++) {
				event = seg.events[i];
				times = renderEventTime(event, seg);
				skinCss = getSkinCss(event, opt);
				skinCssAttr = (skinCss ? " style='" + skinCss + "'" : '');
				skinClasses = ['fc-event-skin', 'fc-corner-left', 'fc-corner-right', 'fc-corner-top', 'fc-corner-bottom'].concat(event.className);
				if (event.source && event.source.className) {
					skinClasses = skinClasses.concat(event.source.className);
				}
				rowClasses = ['fc-event', 'fc-event-row', 'fc-'+dayIDs[event.start.getDay()]];
				if (seg.daydiff == 0) {
					rowClasses.push('fc-today');
				}
				
				s +=  "<tr class='" + rowClasses.join(' ') + "'>";
				for (var col, c=0; c < tableCols.length; c++) {
					col = tableCols[c];
					if (col == 'handle') {
						s += "<td class='fc-event-handle'>" +
							"<div class='" + skinClasses.join(' ') + "'" + skinCssAttr + ">" +
							"<span class='fc-event-inner'></span>" +
							"</div></td>";
					} else if (col == 'date') {
						s += "<td class='fc-event-date' colspan='" + (times[1] || !timecol ? 1 : 2) + "'>" + htmlEscape(times[0]) + "</td>";
					} else if (col == 'time') {
						if (times[1]) {
							s += "<td class='fc-event-time'>" + htmlEscape(times[1]) + "</td>";
						}
					} else {
						s += "<td class='fc-event-" + col + "'>" + (event[col] ? htmlEscape(event[col]) : '&nbsp;') + "</td>";
					}
				}
				s += "</tr>";
				
				// IE doesn't like innerHTML on tbody elements so we insert every row individually
				if (document.all) {
					$(s).appendTo(segContainer);
					s = '';
				}
			}

			if (!document.all)
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
			markFirstLast(segContainer);
		}
		
		//markFirstLast(table);
	}

}


fcViews.table = TableView;


function TableView(element, calendar) {
	var t = this;

	// exports
	t.render = render;
	t.select = dummy;
	t.unselect = dummy;
	t.getDaySegmentContainer = function(){ return table; };

	// imports
	View.call(t, element, calendar, 'table');
	TableEventRenderer.call(t);
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
	var div;
	var table;
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
		t.title = (t.visEnd.getTime() - t.visStart.getTime() < DAY_MS) ? formatDate(date, opt('titleFormat')) : formatDates(date, t.visEnd, opt('titleFormat'));
		
		updateOptions();

		if (!table) {
			buildSkeleton();
		} else {
			clearEvents();
		}
	}
	
	
	function updateOptions() {
		firstDay = opt('firstDay');
		nwe = opt('weekends') ? 0 : 1;
		tm = opt('theme') ? 'ui' : 'fc';
		colFormat = opt('columnFormat');
	}
	
	
	function buildSkeleton() {
		var tableCols = opt('tableCols');
		var s =
			"<table class='fc-border-separate' style='width:100%' cellspacing='0'>" +
			"<colgroup>";
		for (var c=0; c < tableCols.length; c++) {
			s += "<col class='fc-event-" + tableCols[c] + "' />";
		}
		s += "</colgroup>" +
			"</table>";
		div = $('<div>').addClass('fc-list-content').appendTo(element);
		table = $(s).appendTo(div);
	}
	
	function setHeight(height, dateChanged) {
	  if (!opt('listNoHeight'))
		  div.css('height', (height-1)+'px').css('overflow', 'auto');
	}

	function setWidth(width) {
		// nothing to be done here
	}
	
	function dummy() {
		// Stub.
	}

}
