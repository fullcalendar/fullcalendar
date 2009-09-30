/*!
 * FullCalendar v1.3.1
 * http://arshaw.com/fullcalendar/
 *
 * Use fullcalendar.css for basic styling.
 * For event drag & drop, required jQuery UI draggable.
 * For event resizing, requires jQuery UI resizable.
 *
 * Copyright (c) 2009 Adam Shaw
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: 2009-09-14 20:40:05 -0700 (Mon, 14 Sep 2009)
 * Revision: 37
 */
 
(function($) {


var fc = $.fullCalendar = {};
var views = fc.views = {};


/* Defaults
-----------------------------------------------------------------------------*/

var defaults = {

	// display
	defaultView: 'month',
	aspectRatio: 1.35,
	header: {
		left: 'title',
		center: '',
		right: 'today prev,next'
	},
	
	// editing
	//editable: false,
	//disableDragging: false,
	//disableResizing: false,
	
	allDayDefault: true,
	
	// event ajax
	startParam: 'start',
	endParam: 'end',
	cacheParam: '_',
	
	// time formats
	timeFormat: 'h(:mm)t', // for events
	titleFormat: {
		month: 'MMMM yyyy',
		week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
		day: 'dddd, MMM d, yyyy'
	},
	columnFormat: {
		month: 'ddd',
		week: 'ddd M/d',
		day: 'dddd M/d'
	},
	
	// locale
	isRTL: false,
	firstDay: 0,
	monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
	monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
	buttonText: {
		prev: '&nbsp;&#9668;&nbsp;',
		next: '&nbsp;&#9658;&nbsp;',
		today: 'today',
		month: 'month',
		week: 'week',
		day: 'day'
	},
	
	// jquery-ui theming
	theme: false,
	buttonIcons: {
		prev: 'circle-triangle-w',
		next: 'circle-triangle-e'
	}
	
};

// right-to-left defaults
var rtlDefaults = {
	header: {
		left: 'next,prev today',
		center: '',
		right: 'title'
	},
	buttonText: {
		prev: '&nbsp;&#9658;&nbsp;',
		next: '&nbsp;&#9668;&nbsp;'
	}
};

// function for adding/overriding defaults
var setDefaults = fc.setDefaults = function(d) {
	$.extend(true, defaults, d);
}



/* .fullCalendar jQuery function
-----------------------------------------------------------------------------*/

$.fn.fullCalendar = function(options) {

	// method calling
	if (typeof options == 'string') {
		var args = Array.prototype.slice.call(arguments, 1),
			res;
		this.each(function() {
			var r = $.data(this, 'fullCalendar')[options].apply(this, args);
			if (res == undefined) {
				res = r;
			}
		});
		if (res != undefined) {
			return res;
		}
		return this;
	}

	// pluck the 'events' and 'eventSources' options
	var eventSources = options.eventSources || [];
	delete options.eventSources;
	if (options.events) {
		eventSources.push(options.events);
		delete options.event;
	}
	
	// first event source reserved for 'sticky' events
	eventSources.unshift([]);
	
	// initialize options
	options = $.extend(true, {},
		defaults,
		(options.isRTL || options.isRTL==undefined && defaults.isRTL) ? rtlDefaults : {},
		options
	);
	var tm = options.theme ? 'ui' : 'fc'; // for making theme classes
	
	
	this.each(function() {
	
	
		/* Instance Initialization
		-----------------------------------------------------------------------------*/
		
		// element
		var _element = this,
			element = $(this).addClass('fc'),
			content = $("<div class='fc-content " + tm + "-widget-content'/>").appendTo(this);
		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		if (options.theme) {
			element.addClass('ui-widget');
		}
		
		// view managing
		var date = new Date(),
			viewName, view, // the current view
			prevView,
			viewInstances = {};
		if (options.year != undefined) {
			date.setYear(options.year);
		}
		if (options.month != undefined) {
			date.setMonth(options.month);
		}
		if (options.date != undefined) {
			date.setDate(options.date);
		}
		
		
		
		/* View Rendering
		-----------------------------------------------------------------------------*/
		
		function changeView(v) {
			if (v != viewName) {
				prevView = view;
				if (viewInstances[v]) {
					(view = viewInstances[v]).element.show();
				}else{
					view = viewInstances[v] = $.fullCalendar.views[v](
						$("<div class='fc-view fc-view-" + v + "'/>").appendTo(content),
						options);
				}
				if (prevView && prevView.eventsChanged) {
					// if previous view's events have been changed, mark future views' events as dirty
					eventsDirtyExcept(prevView);
					prevView.eventsChanged = false;
				}
				if (header) {
					// update 'active' view button
					header.find('div.fc-button-' + viewName).removeClass(tm + '-state-active');
					header.find('div.fc-button-' + v).addClass(tm + '-state-active');
				}
				view.name = viewName = v;
				render();
				if (prevView) {
					// hide the old element AFTER the new has been rendered, preserves scrollbars
					prevView.element.hide();
				}
			}
		}
		
		function render(inc) {
			if (_element.offsetWidth !== 0) { // visible on the screen
				if (inc || !view.date || +view.date != +date) { // !view.date means it hasn't been rendered yet
					ignoreWindowResizes = true;
					view.render(date, inc || 0, function(callback) {
						// dont refetch if new view contains the same events (or a subset)
						if (!eventStart || view.visStart < eventStart || view.visEnd > eventEnd) {
							fetchEvents(callback);
						}else{
							callback(events); // no refetching
						}
					});
					ignoreWindowResizes = false;
					view.date = cloneDate(date);
					if (header) {
						// enable/disable 'today' button
						var today = new Date();
						if (today >= view.start && today < view.end) {
							header.find('div.fc-button-today').addClass(tm + '-state-disabled');
						}else{
							header.find('div.fc-button-today').removeClass(tm + '-state-disabled');
						}
					}
				}
				else if (view.sizeDirty) {
					view.updateSize();
					view.rerenderEvents();
				}
				else if (view.eventsDirty) {
					// ensure events are rerendered if another view messed with them
					// pass in 'events' b/c event might have been added/removed
					view.clearEvents();
					view.renderEvents(events);
				}
				if (header) {
					// update title text
					header.find('h2.fc-header-title').html(view.title);
				}
				view.sizeDirty = false;
				view.eventsDirty = false;
				view.trigger('viewDisplay', _element);
			}
		}
		
		// marks other views' events as dirty
		function eventsDirtyExcept(exceptView) {
			$.each(viewInstances, function() {
				if (this != exceptView) {
					this.eventsDirty = true;
				}
			});
		}
		
		// marks other views' sizes as dirty
		function sizesDirtyExcept(exceptView) {
			$.each(viewInstances, function() {
				if (this != exceptView) {
					this.sizeDirty = true;
				}
			});
		}
		
		// called when any event objects have been added/removed/changed, rerenders
		function eventsChanged() {
			view.clearEvents();
			view.renderEvents(events);
			eventsDirtyExcept(view);
		}
		
		
		
		/* Event Sources and Fetching
		-----------------------------------------------------------------------------*/
		
		var events = [],
			eventStart, eventEnd;
		
		// Fetch from ALL sources. Clear 'events' array and populate
		function fetchEvents(callback) {
			events = [];
			eventStart = cloneDate(view.visStart);
			eventEnd = cloneDate(view.visEnd);
			var queued = eventSources.length,
				sourceDone = function() {
					if (--queued == 0) {
						if (callback) {
							callback(events);
						}
					}
				}, i=0;
			for (; i<eventSources.length; i++) {
				fetchEventSource(eventSources[i], sourceDone);
			}
		}
		
		// Fetch from a particular source. Append to the 'events' array
		function fetchEventSource(src, callback) {
			var prevViewName = view.name,
				prevDate = cloneDate(date),
				reportEvents = function(a) {
					if (prevViewName == view.name && +prevDate == +date) { // protects from fast switching
						for (var i=0; i<a.length; i++) {
							normalizeEvent(a[i], options);
							a[i].source = src;
						}
						events = events.concat(a);
						if (callback) {
							callback(a);
						}
					}
				},
				reportEventsAndPop = function(a) {
					reportEvents(a);
					popLoading();
				};
			if (typeof src == 'string') {
				var params = {};
				params[options.startParam] = Math.round(eventStart.getTime() / 1000);
				params[options.endParam] = Math.round(eventEnd.getTime() / 1000);
				params[options.cacheParam] = (new Date()).getTime();
				pushLoading();
				$.getJSON(src, params, reportEventsAndPop);
			}
			else if ($.isFunction(src)) {
				pushLoading();
				src(cloneDate(eventStart), cloneDate(eventEnd), reportEventsAndPop);
			}
			else {
				reportEvents(src); // src is an array
			}
		}
		
		
		
		/* Loading State
		-----------------------------------------------------------------------------*/
		
		var loadingLevel = 0;
		
		function pushLoading() {
			if (!loadingLevel++) {
				view.trigger('loading', _element, true);
			}
		}
		
		function popLoading() {
			if (!--loadingLevel) {
				view.trigger('loading', _element, false);
			}
		}
		
		
		
		/* Public Methods
		-----------------------------------------------------------------------------*/
		
		var publicMethods = {
		
			render: render,
			changeView: changeView,
			
			//
			// Navigation
			//
			
			prev: function() {
				render(-1);
			},
			
			next: function() {
				render(1);
			},
			
			today: function() {
				date = new Date();
				render();
			},
			
			gotoDate: function(year, month, dateNum) {
				if (year != undefined) {
					date.setYear(year);
				}
				if (month != undefined) {
					date.setMonth(month);
				}
				if (dateNum != undefined) {
					date.setDate(dateNum);
				}
				render();
			},
			
			incrementDate: function(years, months, days) {
				if (years != undefined) {
					addYears(date, years);
				}
				if (months != undefined) {
					addMonths(date, months);
				}
				if (days != undefined) {
					addDays(date, days);
				}
				render();
			},
			
			//
			// Event Manipulation
			//
			
			updateEvent: function(event) { // update an existing event
				var i, len = events.length, e,
					startDelta = event.start - event._start,
					endDelta = event.end ?
						(event.end - (event._end || view.defaultEventEnd(event))) // event._end would be null if event.end
						: 0;                                                      // was null and event was just resized
				for (i=0; i<len; i++) {
					e = events[i];
					if (e._id == event._id && e != event) {
						e.start = new Date(+e.start + startDelta);
						if (event.end) {
							if (e.end) {
								e.end = new Date(+e.end + endDelta);
							}else{
								e.end = new Date(+view.defaultEventEnd(e) + endDelta);
							}
						}else{
							e.end = null;
						}
						e.title = event.title;
						e.url = event.url;
						e.allDay = event.allDay;
						e.className = event.className;
						e.editable = event.editable;
						normalizeEvent(e, options);
					}
				}
				normalizeEvent(event, options);
				eventsChanged();
			},
			
			renderEvent: function(event, stick) { // render a new event
				normalizeEvent(event, options);
				if (!event.source) {
					if (stick) {
						(event.source = eventSources[0]).push(event);
					}
					events.push(event);
				}
				eventsChanged();
			},
			
			removeEvents: function(filter) {
				if (!filter) { // remove all
					events = [];
					// clear all array sources
					for (var i=0; i<eventSources.length; i++) {
						if (typeof eventSources[i] == 'object') {
							eventSources[i] = [];
						}
					}
				}else{
					if (!$.isFunction(filter)) { // an event ID
						var id = filter + '';
						filter = function(e) {
							return e._id == id;
						};
					}
					events = $.grep(events, filter, true);
					// remove events from array sources
					for (var i=0; i<eventSources.length; i++) {
						if (typeof eventSources[i] == 'object') {
							eventSources[i] = $.grep(eventSources[i], filter, true);
						}
					}
				}
				eventsChanged();
			},
			
			clientEvents: function(filter) {
				if ($.isFunction(filter)) {
					return $.grep(events, filter);
				}
				else if (filter) { // an event ID
					filter += '';
					return $.grep(events, function(e) {
						return e._id == filter;
					});
				}
				return events; // else, return all
			},
			
			rerenderEvents: function() {
				view.rerenderEvents(); 
			},
			
			//
			// Event Source
			//
		
			addEventSource: function(source) {
				eventSources.push(source);
				fetchEventSource(source, function() {
					eventsChanged();
				});
			},
		
			removeEventSource: function(source) {
				eventSources = $.grep(eventSources, function(src) {
					return src != source;
				});
				// remove all client events from that source
				events = $.grep(events, function(e) {
					return e.source != source;
				});
				eventsChanged();
			},
			
			refetchEvents: function() {
				fetchEvents(eventsChanged);
			}
			
		};
		
		$.data(this, 'fullCalendar', publicMethods);
		
		
		
		/* Header
		-----------------------------------------------------------------------------*/
		
		var header,
			sections = options.header;
		if (sections) {
			header = $("<table class='fc-header'/>")
				.append($("<tr/>")
					.append($("<td class='fc-header-left'/>").append(buildSection(sections.left)))
					.append($("<td class='fc-header-center'/>").append(buildSection(sections.center)))
					.append($("<td class='fc-header-right'/>").append(buildSection(sections.right))))
				.prependTo(element);
		}
		function buildSection(buttonStr) {
			if (buttonStr) {
				var tr = $("<tr/>");
				$.each(buttonStr.split(' '), function(i) {
					if (i > 0) {
						tr.append("<td><span class='fc-header-space'/></td>");
					}
					var prevButton;
					$.each(this.split(','), function(j) {
						var buttonName = this,
							buttonNameShort = this.replace(/^(basic|agenda)/, '').toLowerCase();
						if (buttonName == 'title') {
							tr.append("<td><h2 class='fc-header-title'/></td>");
							if (prevButton) {
								prevButton.addClass(tm + '-corner-right');
							}
							prevButton = null;
						}else{
							var buttonClick;
							if (publicMethods[buttonNameShort]) {
								buttonClick = publicMethods[buttonNameShort];
							}
							else if (views[buttonName]) {
								buttonClick = function() { changeView(buttonName) };
							}
							if (buttonClick) {
								if (prevButton) {
									prevButton.addClass(tm + '-no-right');
								}
								var button,
									icon = options.theme ? options.buttonIcons[buttonNameShort] : null,
									text = options.buttonText[buttonNameShort];
								if (icon) {
									button = $("<div class='fc-button-" + buttonName + " ui-state-default'>" +
										"<a><span class='ui-icon ui-icon-" + icon + "'/></a></div>");
								}
								else if (text) {
									button = $("<div class='fc-button-" + buttonName + " " + tm + "-state-default'>" +
										"<a><span>" + text + "</span></a></div>");
								}
								if (button) {
									button
										.mousedown(function() {
											button.addClass(tm + '-state-down');
										})
										.mouseup(function() {
											button.removeClass(tm + '-state-down');
										})
										.hover(
											function() {
												button.addClass(tm + '-state-hover');
											},
											function() {
												button.removeClass(tm + '-state-hover')
													.removeClass(tm + '-state-down');
											}
										)
										.appendTo($("<td/>").appendTo(tr));
									if (publicMethods[buttonNameShort]) {
										button.click(publicMethods[buttonNameShort]);
									}
									else if (views[buttonName]) {
										button.click(function() {
											changeView(buttonName);
										});
									}
									if (prevButton) {
										prevButton.addClass(tm + '-no-right');
									}else{
										button.addClass(tm + '-corner-left');
									}
									prevButton = button;
								}
							}
						}
					});
					if (prevButton) {
						prevButton.addClass(tm + '-corner-right');
					}
				});
				return $("<table/>").append(tr);
			}
		}
		
		
		
		/* Resizing
		-----------------------------------------------------------------------------*/
		
		var elementWidth,
			ignoreWindowResizes = false,
			resizeCnt = 0;
		
		$(window).resize(function() {
			if (!ignoreWindowResizes && view.date) { // view.date means the view has been rendered
				var rcnt = ++resizeCnt; // add a delay
				setTimeout(function() {
					if (rcnt == resizeCnt) {
						var newWidth = element.width();
						if (newWidth != elementWidth) {
							elementWidth = newWidth;
							view.updateSize();
							view.rerenderEvents(true);
							sizesDirtyExcept(view);
							view.trigger('windowResize', _element);
						}
					}
				}, 200);
			}
		});
		
		
		// let's begin...
		changeView(options.defaultView);
		elementWidth = element.width();
	
	});
	
	return this;
	
};



/* Important Event Utilities
-----------------------------------------------------------------------------*/

var fakeID = 0;

function normalizeEvent(event, options) {
	event._id = event._id || (event.id == undefined ? '_fc' + fakeID++ : event.id + '');
	if (event.date) {
		if (!event.start) {
			event.start = event.date;
		}
		delete event.date;
	}
	event._start = cloneDate(event.start = parseDate(event.start));
	event.end = parseDate(event.end);
	if (event.end && event.end < event.start) {
		event.end = null;
	}
	event._end = event.end ? cloneDate(event.end) : null;
	if (event.allDay == undefined) {
		event.allDay = options.allDayDefault;
	}
}


/* Grid-based Views: month, basicWeek, basicDay
-----------------------------------------------------------------------------*/

setDefaults({
	weekMode: 'fixed'
});

views.month = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addMonths(date, delta);
				date.setDate(1);
			}
			var start = this.start = cloneDate(date, true);
			start.setDate(1);
			this.title = formatDates(
				start,
				addDays(cloneDate(this.end = addMonths(cloneDate(start), 1)), -1),
				strProp(options.titleFormat, 'month'),
				options
			);
			addDays(this.visStart = cloneDate(start), -((start.getDay() - options.firstDay + 7) % 7));
			addDays(this.visEnd = cloneDate(this.end), (7 - this.visEnd.getDay() + options.firstDay) % 7);
			var rowCnt = Math.round((this.visEnd - this.visStart) / (DAY_MS * 7));
			if (options.weekMode == 'fixed') {
				addDays(this.visEnd, (6 - rowCnt) * 7);
				rowCnt = 6;
			}
			this.renderGrid(rowCnt, 7, strProp(options.columnFormat, 'month'), true, fetchEvents);
		}
	});
}

views.basicWeek = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta * 7);
			}
			this.title = formatDates(
				this.start = this.visStart = addDays(cloneDate(date), -((date.getDay() - options.firstDay + 7) % 7)),
				addDays(cloneDate(this.end = this.visEnd = addDays(cloneDate(this.start), 7)), -1),
				strProp(options.titleFormat, 'week'),
				options
			);
			this.renderGrid(1, 7, strProp(options.columnFormat, 'week'), false, fetchEvents);
		}
	});
};

views.basicDay = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta);
			}
			this.title = formatDate(date, strProp(options.titleFormat, 'day'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderGrid(1, 1, strProp(options.columnFormat, 'day'), false, fetchEvents);
		}
	});
}


// rendering bugs

var tdTopBug, trTopBug, tbodyTopBug,
	tdHeightBug,
	rtlLeftDiff;


function Grid(element, options, methods) {
	
	var tm, firstDay,
		rtl, dis, dit,  // day index sign / translate
		rowCnt, colCnt,
		colWidth,
		thead, tbody,
		cachedSegs, //...
		
	// initialize superclass
	view = $.extend(this, viewMethods, methods, {
		renderGrid: renderGrid,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		updateSize: updateSize,
		defaultEventEnd: function(event) { // calculates an end if event doesnt have one, mostly for resizing
			return cloneDate(event.start);
		},
		visEventEnd: function(event) { // returns exclusive 'visible' end, for rendering
			if (event.end) {
				var end = cloneDate(event.end);
				return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
			}else{
				return addDays(cloneDate(event.start), 1);
			}
		}
	});
	view.init(element, options);
	
	
	
	/* Grid Rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-grid').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}

	function renderGrid(r, c, colFormat, showNumbers, fetchEvents) {
		rowCnt = r;
		colCnt = c;
		
		var month = view.start.getMonth(),
			today = clearTime(new Date()),
			s, i, j, d = cloneDate(view.visStart);
		
		// update option-derived variables
		tm = options.theme ? 'ui' : 'fc'; 
		firstDay = options.firstDay;
		if (rtl = options.isRTL) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		
		if (!tbody) { // first time, build all cells from scratch
		
			var table = $("<table/>").appendTo(element);
			
			s = "<thead><tr>";
			for (i=0; i<colCnt; i++) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					(i==dit ? ' fc-leftmost' : '') +
					"'>" + formatDate(d, colFormat, options) + "</th>";
				addDays(d, 1);
			}
			thead = $(s + "</tr></thead>").appendTo(table);
			
			s = "<tbody>";
			d = cloneDate(view.visStart);
			for (i=0; i<rowCnt; i++) {
				s += "<tr class='fc-week" + i + "'>";
				for (j=0; j<colCnt; j++) {
					s += "<td class='fc-" +
						dayIDs[d.getDay()] + ' ' + // needs to be first
						tm + '-state-default fc-day' + (i*colCnt+j) +
						(j==dit ? ' fc-leftmost' : '') +
						(rowCnt>1 && d.getMonth() != month ? ' fc-other-month' : '') +
						(+d == +today ?
						' fc-today '+tm+'-state-highlight' :
						' fc-not-today') + "'>" +
						(showNumbers ? "<div class='fc-day-number'>" + d.getDate() + "</div>" : '') +
						"<div class='fc-day-content'><div>&nbsp;</div></div></td>";
					addDays(d, 1);
				}
				s += "</tr>";
			}
			tbody = $(s + "</tbody>").appendTo(table);
			tbody.find('td').click(dayClick);
		
		}else{ // NOT first time, reuse as many cells as possible
		
			view.clearEvents();
		
			var prevRowCnt = tbody.find('tr').length;
			if (rowCnt < prevRowCnt) {
				tbody.find('tr:gt(' + (rowCnt-1) + ')').remove(); // remove extra rows
			}
			else if (rowCnt > prevRowCnt) { // needs to create new rows...
				s = '';
				for (i=prevRowCnt; i<rowCnt; i++) {
					s += "<tr class='fc-week" + i + "'>";
					for (j=0; j<colCnt; j++) {
						s += "<td class='fc-" +
							dayIDs[d.getDay()] + ' ' + // needs to be first
							tm + '-state-default fc-new fc-day' + (i*colCnt+j) +
							(j==dit ? ' fc-leftmost' : '') + "'>" +
							(showNumbers ? "<div class='fc-day-number'></div>" : '') +
							"<div class='fc-day-content'><div>&nbsp;</div></div>" +
							"</td>";
						addDays(d, 1);
					}
					s += "</tr>";
				}
				tbody.append(s);
			}
			tbody.find('td.fc-new').removeClass('fc-new').click(dayClick);
			
			// re-label and re-class existing cells
			d = cloneDate(view.visStart);
			tbody.find('td').each(function() {
				var td = $(this);
				if (rowCnt > 1) {
					if (d.getMonth() == month) {
						td.removeClass('fc-other-month');
					}else{
						td.addClass('fc-other-month');
					}
				}
				if (+d == +today) {
					td.removeClass('fc-not-today')
						.addClass('fc-today')
						.addClass(tm + '-state-highlight');
				}else{
					td.addClass('fc-not-today')
						.removeClass('fc-today')
						.removeClass(tm + '-state-highlight');
				}
				td.find('div.fc-day-number').text(d.getDate());
				addDays(d, 1);
			});
			
			if (rowCnt == 1) { // more changes likely (week or day view)
			
				// redo column header text and class
				d = cloneDate(view.visStart);
				thead.find('th').each(function() {
					$(this).text(formatDate(d, colFormat, options));
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
				});
				
				// redo cell day-of-weeks
				d = cloneDate(view.visStart);
				tbody.find('td').each(function() {
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
				});
				
			}
		
		}
		
		updateSize();
		fetchEvents(renderEvents);
	
	};
	
	
	function dayClick() {
		var date = addDays(
			cloneDate(view.visStart),
			parseInt(this.className.match(/fc\-day(\d+)/)[1])
		);
		view.trigger('dayClick', this, date);
	}
	
	
	function updateSize() {
	
		var height = Math.round(element.width() / options.aspectRatio),
			leftTDs = tbody.find('tr td:first-child'),
			tbodyHeight = height - thead.height(),
			rowHeight1, rowHeight2;
		
		if (options.weekMode == 'variable') {
			rowHeight1 = rowHeight2 = Math.floor(tbodyHeight / (rowCnt==1 ? 2 : 6));
		}else{
			rowHeight1 = Math.floor(tbodyHeight / rowCnt);
			rowHeight2 = tbodyHeight - rowHeight1*(rowCnt-1);
		}

		if (tdTopBug == undefined) {
			// nasty bugs in opera 9.25
			// position() returning relative to direct parent
			var tr = tbody.find('tr:first'),
				td = tr.find('td:first'),
				trTop = tr.position().top,
				tdTop = td.position().top;
			tdTopBug = tdTop < 0;
			trTopBug = trTop != tdTop;
			tbodyTopBug = tbody.position().top != trTop;
		}
		
		if (tdHeightBug == undefined) {
			// bug in firefox where cell height includes padding
			td.height(rowHeight1);
			tdHeightBug = rowHeight1 != td.height();
		}
		
		if (tdHeightBug) {
			leftTDs.slice(0, -1).height(rowHeight1);
			leftTDs.slice(-1).height(rowHeight2);
		}else{
			setOuterHeight(leftTDs.slice(0, -1), rowHeight1);
			setOuterHeight(leftTDs.slice(-1), rowHeight2);
		}
		
		setOuterWidth(
			thead.find('th').slice(0, -1),
			colWidth = Math.floor(element.width() / colCnt)
		);
		
	}
	
	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	
	function renderEvents(events) {
		view.reportEvents(events);
		renderSegs(cachedSegs = compileSegs(events));
	}
	
	
	function rerenderEvents(skipCompile) {
		view.clearEvents();
		if (skipCompile) {
			renderSegs(cachedSegs);
		}else{
			renderEvents(view.cachedEvents);
		}
	}
	
	
	function compileSegs(events) {
		var d1 = cloneDate(view.visStart);
		var d2 = addDays(cloneDate(d1), colCnt);
		var rows = [];
		for (var i=0; i<rowCnt; i++) {
			rows.push(stackSegs(view.sliceSegs(events, d1, d2)));
			addDays(d1, 7);
			addDays(d2, 7);
		}
		return rows;
	}
	
	
	function renderSegs(segRows) {
		var i, len = segRows.length, levels,
			tr, td,
			innerDiv,
			top,
			weekHeight,
			j, segs,
			levelHeight,
			k, seg,
			event,
			eventClasses,
			startElm, endElm,
			left1, left2,
			eventElement, eventAnchor,
			triggerRes;
		for (i=0; i<len; i++) {
			levels = segRows[i];
			tr = tbody.find('tr:eq('+i+')');
			td = tr.find('td:first');
			innerDiv = td.find('div.fc-day-content div').css('position', 'relative');
			top = innerDiv.position().top;
			if (tdTopBug) {
				top -= td.position().top;
			}
			if (trTopBug) {
				top += tr.position().top;
			}
			if (tbodyTopBug) {
				top += tbody.position().top;
			}
			weekHeight = 0;
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				levelHeight = 0;
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					event = seg.event;
					eventClasses = event.className;
					if (typeof eventClasses == 'object') { // an array
						eventClasses = eventClasses.slice(0);
					}
					else if (typeof eventClasses == 'string') {
						eventClasses = eventClasses.split(' ');
					}
					else {
						eventClasses = [];
					}
					eventClasses.push('fc-event', 'fc-event-hori');
					startElm = seg.isStart ?
						tr.find('td:eq('+((seg.start.getDay()-firstDay+colCnt)%colCnt)+') div.fc-day-content div') :
						tbody;
					endElm = seg.isEnd ?
						tr.find('td:eq('+((seg.end.getDay()-firstDay+colCnt-1)%colCnt)+') div.fc-day-content div') :
						tbody;
					if (rtl) {
						left1 = endElm.position().left;
						left2 = startElm.position().left + startElm.width();
						if (seg.isStart) {
							eventClasses.push('fc-corner-right');
						}
						if (seg.isEnd) {
							eventClasses.push('fc-corner-left');
						}
					}else{
						left1 = startElm.position().left;
						left2 = endElm.position().left + endElm.width();
						if (seg.isStart) {
							eventClasses.push('fc-corner-left');
						}
						if (seg.isEnd) {
							eventClasses.push('fc-corner-right');
						}
					}
					eventElement = $("<div class='" + eventClasses.join(' ') + "'/>")
						.append(eventAnchor = $("<a/>")
							.append(event.allDay || !seg.isStart ? null :
								$("<span class='fc-event-time'/>")
									.html(formatDates(event.start, event.end, options.timeFormat, options)))
							.append($("<span class='fc-event-title'/>")
								.text(event.title)));
					if (event.url) {
						eventAnchor.attr('href', event.url);
					}
					triggerRes = view.trigger('eventRender', event, event, eventElement);
					if (triggerRes !== false) {
						if (triggerRes && typeof triggerRes != 'boolean') {
							eventElement = $(triggerRes);
						}
						eventElement
							.css({
								position: 'absolute',
								top: top,
								left: left1 + (rtlLeftDiff||0),
								zIndex: 2
							})
							.appendTo(element);
						setOuterWidth(eventElement, left2-left1, true);
						if (rtl && rtlLeftDiff == undefined) {
							// bug in IE6 where offsets are miscalculated with direction:rtl
							rtlLeftDiff = left1 - eventElement.position().left;
							if (rtlLeftDiff) {
								eventElement.css('left', left1 + rtlLeftDiff);
							}
						}
						eventElementHandlers(event, eventElement);
						if (event.editable || event.editable == undefined && options.editable) {
							draggableEvent(event, eventElement);
							if (seg.isEnd) {
								resizableEvent(event, eventElement);
							}
						}
						view.reportEventElement(event, eventElement);
						levelHeight = Math.max(levelHeight, eventElement.outerHeight(true));
					}
				}
				weekHeight += levelHeight;
				top += levelHeight;
			}
			innerDiv.height(weekHeight);
		}
	}
	
	function eventElementHandlers(event, eventElement) {
		eventElement
			.click(function(ev) {
				if (!eventElement.hasClass('ui-draggable-dragging')) {
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
	}
	
	
	
	/* Draggable
	-----------------------------------------------------------------------------*/
	
	
	function draggableEvent(event, eventElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var matrix;
			eventElement.draggable({
				zIndex: 3,
				delay: 50,
				opacity: options.dragOpacity,
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell || !cell.rowDelta && !cell.colDelta);
						if (cell) {
							view.showOverlay(cell);
						}else{
							view.hideOverlay();
						}
					});
					tbody.find('tr').each(function() {
						matrix.row(this, tbodyTopBug);
					});
					var tds = tbody.find('tr:first td');
					if (rtl) {
						tds = $(tds.get().reverse());
					}
					tds.each(function() {
						matrix.col(this);
					});
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					matrix.mouse(ev.pageX, ev.pageY);
				},
				drag: function(ev) {
					matrix.mouse(ev.pageX, ev.pageY);
				},
				stop: function(ev, ui) {
					view.hideOverlay();
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					var cell = matrix.cell;
					if (!cell || !cell.rowDelta && !cell.colDelta) {
						view.showEvents(event, eventElement);
					}else{
						var dayDelta = cell.rowDelta*7 + cell.colDelta*dis;
						view.moveEvent(event, dayDelta);
						view.trigger('eventDrop', this, event, dayDelta, 0, function() {
							view.moveEvent(event, -dayDelta);
							rerenderEvents();
						}, ev, ui);
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						rerenderEvents();
					}
				}
			});
		}
	}
	
	
	
	/* Resizable
	-----------------------------------------------------------------------------*/
	
	
	function resizableEvent(event, eventElement) {
		if (!options.disableResizing && eventElement.resizable) {
			eventElement.resizable({
				handles: rtl ? 'w' : 'e',
				grid: colWidth,
				minWidth: colWidth/2, // need this or else IE throws errors when too small
				containment: element,
				start: function(ev, ui) {
					eventElement.css('z-index', 3);
					view.hideEvents(event, eventElement);
					view.trigger('eventResizeStart', this, event, ev, ui);
				},
				stop: function(ev, ui) {
					view.trigger('eventResizeStop', this, event, ev, ui);
					// ui.size.width wasn't working with grid correctly, use .width()
					var dayDelta = Math.round((eventElement.width() - ui.originalSize.width) / colWidth);
					if (dayDelta) {
						view.resizeEvent(event, dayDelta);
						view.trigger('eventResize', this, event, dayDelta, 0, function() {
							view.resizeEvent(event, -dayDelta);
							rerenderEvents();
						}, ev, ui);
						rerenderEvents();
					}else{
						view.showEvents(event, eventElement);
					}
					eventElement.css('z-index', 2);
				}
			});
		}
	}

};


/* Methods & Utilities for All Views
-----------------------------------------------------------------------------*/

var viewMethods = {

	/*
	 * Objects inheriting these methods must implement the following properties/methods:
	 * - title
	 * - start
	 * - end
	 * - visStart
	 * - visEnd
	 * - defaultEventEnd(event)
	 * - visEventEnd(event)
	 * - render(events)
	 * - rerenderEvents()
	 *
	 *
	 * z-index reservations:
	 * 1. day-overlay
	 * 2. events
	 * 3. dragging/resizing events
	 *
	 */
	
	

	init: function(element, options) {
		this.element = element;
		this.options = options;
		this.cachedEvents = [];
		this.eventsByID = {};
		this.eventElements = [];
		this.eventElementsByID = {};
	},
	
	
	
	// triggers an event handler, always append view as last arg
	
	trigger: function(name, thisObj) {
		if (this.options[name]) {
			return this.options[name].apply(thisObj || this, Array.prototype.slice.call(arguments, 2).concat([this]));
		}
	},
	
	
	
	// returns a Date object for an event's end
	
	eventEnd: function(event) {
		return event.end || this.defaultEventEnd(event);
	},
	
	
	
	// report when view receives new events
	
	reportEvents: function(events) { // events are already normalized at this point
		var i, len=events.length, event,
			eventsByID = this.eventsByID = {},
			cachedEvents = this.cachedEvents = [];
		for (i=0; i<len; i++) {
			event = events[i];
			if (eventsByID[event._id]) {
				eventsByID[event._id].push(event);
			}else{
				eventsByID[event._id] = [event];
			}
			cachedEvents.push(event);
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
	
	clearEvents: function() { // only remove ELEMENTS
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
		this._eee(event, exceptElement, 'hide');
	},
	
	_eee: function(event, exceptElement, funcName) { // event-element-each
		var elements = this.eventElementsByID[event._id],
			i, len = elements.length;
		for (i=0; i<len; i++) {
			if (elements[i] != exceptElement) {
				elements[i][funcName]();
			}
		}
	},
	
	
	
	// event modification reporting
	
	moveEvent: function(event, days, minutes) { // actually DO the date changes
		minutes = minutes || 0;
		var events = this.eventsByID[event._id],
			i, len=events.length, e;
		for (i=0; i<len; i++) {
			e = events[i];
			e.allDay = event.allDay;
			addMinutes(addDays(e.start, days, true), minutes);
			if (e.end) {
				e.end = addMinutes(addDays(e.end, days, true), minutes);
			}
			normalizeEvent(e, this.options);
		}
		this.eventsChanged = true;
	},
	
	resizeEvent: function(event, days, minutes) { // actually DO the date changes
		minutes = minutes || 0;
		var events = this.eventsByID[event._id],
			i, len=events.length, e;
		for (i=0; i<len; i++) {
			e = events[i];
			e.end = addMinutes(addDays(this.eventEnd(e), days, true), minutes);
			normalizeEvent(e, this.options);
		}
		this.eventsChanged = true;
	},
	
	
	
	// semi-transparent overlay (while dragging)
	
	showOverlay: function(props) {
		if (!this.dayOverlay) {
			this.dayOverlay = $("<div class='fc-cell-overlay' style='position:absolute;z-index:1;display:none'/>")
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


/* Date Math
-----------------------------------------------------------------------------*/

var DAY_MS = 86400000,
	HOUR_MS = 3600000;

function addYears(d, n, keepTime) {
	d.setFullYear(d.getFullYear() + n);
	if (!keepTime) {
		clearTime(d);
	}
	return d;
}

function addMonths(d, n, keepTime) { // prevents day overflow/underflow
	var m = d.getMonth() + n,
		check = cloneDate(d);
	check.setDate(1);
	check.setMonth(m);
	d.setMonth(m);
	if (!keepTime) {
		clearTime(d);
	}
	while (d.getMonth() != check.getMonth()) {
		d.setDate(d.getDate() + (d < check ? 1 : -1));
	}
	return d;
}

function addDays(d, n, keepTime) { // deals with daylight savings
	var dd = d.getDate() + n,
		check = cloneDate(d);
	check.setHours(12); // set to middle of day
	check.setDate(dd);
	d.setDate(dd);
	if (!keepTime) {
		clearTime(d);
	}
	while (d.getDate() != check.getDate()) {
		d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
	}
	return d;
}

function addMinutes(d, n) {
	d.setMinutes(d.getMinutes() + n);
	return d;
}

function clearTime(d) {
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0); 
	d.setMilliseconds(0);
	return d;
}

function cloneDate(d, dontKeepTime) {
	if (dontKeepTime) {
		return clearTime(new Date(+d));
	}
	return new Date(+d);
}



/* Date Parsing
-----------------------------------------------------------------------------*/

var parseDate = fc.parseDate = function(s) {
	if (typeof s == 'object') { // already a Date object
		return s;
	}
	if (typeof s == 'number') { // a UNIX timestamp
		return new Date(s * 1000);
	}
	if (typeof s == 'string') {
		if (s.match(/^\d+$/)) { // a UNIX timestamp
			return new Date(parseInt(s) * 1000);
		}
		return parseISO8601(s, true) || Date.parse(s) || null;
	}
	return null;
}

var parseISO8601 = fc.parseISO8601 = function(s, ignoreTimezone) {
	// derived from http://delete.me.uk/2005/03/iso8601.html
	var d = s.match(parseISO8601Regex);
	if (!d) return null;
	var offset = 0;
	var date = new Date(d[1], 0, 1);
	if (d[3]) { date.setMonth(d[3] - 1); }
	if (d[5]) { date.setDate(d[5]); }
	if (d[7]) { date.setHours(d[7]); }
	if (d[8]) { date.setMinutes(d[8]); }
	if (d[10]) { date.setSeconds(d[10]); }
	if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
	if (!ignoreTimezone) {
		if (d[14]) {
			offset = (Number(d[16]) * 60) + Number(d[17]);
			offset *= ((d[15] == '-') ? 1 : -1);
		}
		offset -= date.getTimezoneOffset();
	}
	return new Date(Number(date) + (offset * 60 * 1000));
}

var parseISO8601Regex = new RegExp(
	"([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
	"(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
	"(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?");



/* Date Formatting
-----------------------------------------------------------------------------*/

var formatDate = fc.formatDate = function(date, format, options) {
	return formatDates(date, null, format, options);
}

var formatDates = fc.formatDates = function(date1, date2, format, options) {
	options = options || defaults;
	var date = date1,
		otherDate = date2,
		i, len = format.length, c,
		i2, formatter,
		res = '';
	for (i=0; i<len; i++) {
		c = format.charAt(i);
		if (c == "'") {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == "'") {
					if (date) {
						if (i2 == i+1) {
							res += "'";
						}else{
							res += format.substring(i+1, i2);
						}
						i = i2;
					}
					break;
				}
			}
		}
		else if (c == '(') {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == ')') {
					var subres = formatDate(date, format.substring(i+1, i2), options);
					if (parseInt(subres.replace(/\D/, ''))) {
						res += subres;
					}
					i = i2;
					break;
				}
			}
		}
		else if (c == '[') {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == ']') {
					var subformat = format.substring(i+1, i2);
					var subres = formatDate(date, subformat, options);
					if (subres != formatDate(otherDate, subformat, options)) {
						res += subres;
					}
					i = i2;
					break;
				}
			}
		}
		else if (c == '{') {
			date = date2;
			otherDate = date1;
		}
		else if (c == '}') {
			date = date1;
			otherDate = date2;
		}
		else {
			for (i2=len; i2>i; i2--) {
				if (formatter = dateFormatters[format.substring(i, i2)]) {
					if (date) {
						res += formatter(date, options);
					}
					i = i2 - 1;
					break;
				}
			}
			if (i2 == i) {
				if (date) {
					res += c;
				}
			}
		}
	}
	return res;
}

var dateFormatters = {
	s	: function(d)	{ return d.getSeconds() },
	ss	: function(d)	{ return zeroPad(d.getSeconds()) },
	m	: function(d)	{ return d.getMinutes() },
	mm	: function(d)	{ return zeroPad(d.getMinutes()) },
	h	: function(d)	{ return d.getHours() % 12 || 12 },
	hh	: function(d)	{ return zeroPad(d.getHours() % 12 || 12) },
	H	: function(d)	{ return d.getHours() },
	HH	: function(d)	{ return zeroPad(d.getHours()) },
	d	: function(d)	{ return d.getDate() },
	dd	: function(d)	{ return zeroPad(d.getDate()) },
	ddd	: function(d,o)	{ return o.dayNamesShort[d.getDay()] },
	dddd: function(d,o)	{ return o.dayNames[d.getDay()] },
	M	: function(d)	{ return d.getMonth() + 1 },
	MM	: function(d)	{ return zeroPad(d.getMonth() + 1) },
	MMM	: function(d,o)	{ return o.monthNamesShort[d.getMonth()] },
	MMMM: function(d,o)	{ return o.monthNames[d.getMonth()] },
	yy	: function(d)	{ return (d.getFullYear()+'').substring(2) },
	yyyy: function(d)	{ return d.getFullYear() },
	t	: function(d)	{ return d.getHours() < 12 ? 'a' : 'p' },
	tt	: function(d)	{ return d.getHours() < 12 ? 'am' : 'pm' },
	T	: function(d)	{ return d.getHours() < 12 ? 'A' : 'P' },
	TT	: function(d)	{ return d.getHours() < 12 ? 'AM' : 'PM' },
	u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
	S	: function(d)	{
		var date = d.getDate();
		if (date > 10 && date < 20) return 'th';
		return ['st', 'nd', 'rd'][date%10-1] || 'th';
	}
};



/* Element Dimensions
-----------------------------------------------------------------------------*/

function setOuterWidth(element, width, includeMargins) {
	element.each(function() {
		var e = $(this);
		var w = width - (
			(parseInt(e.css('border-left-width')) || 0) +
			(parseInt(e.css('padding-left')) || 0) +
			(parseInt(e.css('padding-right')) || 0) +
			(parseInt(e.css('border-right-width')) || 0));
		if (includeMargins) {
			w -=
				(parseInt(e.css('margin-left')) || 0) +
				(parseInt(e.css('margin-right')) || 0);
		}
		e.width(w);
	});
}

function setOuterHeight(element, height, includeMargins) {
	element.each(function() {
		var e = $(this);
		var h = height - (
			(parseInt(e.css('border-top-width')) || 0) +
			(parseInt(e.css('padding-top')) || 0) +
			(parseInt(e.css('padding-bottom')) || 0) +
			(parseInt(e.css('border-bottom-width')) || 0));
		if (includeMargins) {
			h -=
				(parseInt(e.css('margin-top')) || 0) +
				(parseInt(e.css('margin-bottom')) || 0);
		}
		e.height(h);
	});
}



/* Hover Matrix
-----------------------------------------------------------------------------*/

function HoverMatrix(changeCallback) {

	var tops=[], lefts=[],
		prevRowE, prevColE,
		origRow, origCol,
		currRow, currCol;
	
	this.row = function(e, topBug) {
		prevRowE = $(e);
		tops.push(prevRowE.offset().top + (topBug ? prevRowE.parent().position().top : 0));
	};
	
	this.col = function(e) {
		prevColE = $(e);
		lefts.push(prevColE.offset().left);
	};

	this.mouse = function(x, y) {
		if (origRow == undefined) {
			tops.push(tops[tops.length-1] + prevRowE.outerHeight());
			lefts.push(lefts[lefts.length-1] + prevColE.outerWidth());
			currRow = currCol = -1;
		}
		var r, c;
		for (r=0; r<tops.length && y>=tops[r]; r++) ;
		for (c=0; c<lefts.length && x>=lefts[c]; c++) ;
		r = r >= tops.length ? -1 : r - 1;
		c = c >= lefts.length ? -1 : c - 1;
		if (r != currRow || c != currCol) {
			currRow = r;
			currCol = c;
			if (r == -1 || c == -1) {
				this.cell = null;
			}else{
				if (origRow == undefined) {
					origRow = r;
					origCol = c;
				}
				this.cell = {
					row: r,
					col: c,
					top: tops[r],
					left: lefts[c],
					width: lefts[c+1] - lefts[c],
					height: tops[r+1] - tops[r],
					isOrig: r==origRow && c==origCol,
					rowDelta: r-origRow,
					colDelta: c-origCol
				};
			}
			changeCallback(this.cell);
		}
	};

}



/* Misc Utils
-----------------------------------------------------------------------------*/

var undefined,
	dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function zeroPad(n) {
	return (n < 10 ? '0' : '') + n;
}

function strProp(s, prop) {
	return typeof s == 'string' ? s : s[prop];
}


})(jQuery);