/*!
 * FullCalendar v1.4.4
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
 * Date: Wed Feb 3 22:56:20 2010 -0800
 *
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
	weekends: true,
	
	// editing
	//editable: false,
	//disableDragging: false,
	//disableResizing: false,
	
	allDayDefault: true,
	
	// event ajax
	startParam: 'start',
	endParam: 'end',
	
	// time formats
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
	timeFormat: { // for event elements
		'': 'h(:mm)t' // default
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
		prevYear: '&nbsp;&lt;&lt;&nbsp;',
		nextYear: '&nbsp;&gt;&gt;&nbsp;',
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
		next: '&nbsp;&#9668;&nbsp;',
		prevYear: '&nbsp;&gt;&gt;&nbsp;',
		nextYear: '&nbsp;&lt;&lt;&nbsp;'
	},
	buttonIcons: {
		prev: 'circle-triangle-e',
		next: 'circle-triangle-w'
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
		delete options.events;
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
			element = $(_element).addClass('fc'),
			elementWidth,
			content = $("<div class='fc-content " + tm + "-widget-content' style='position:relative'/>").prependTo(_element), // relative for ie6
			contentWidth,
			contentHeight;
			
		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		if (options.theme) {
			element.addClass('ui-widget');
		}
		
		// view managing
		var date = new Date(),
			viewName, view, // the current view
			viewInstances = {};
			
		if (options.year != undefined && options.year != date.getFullYear()) {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(options.year);
		}
		if (options.month != undefined && options.month != date.getMonth()) {
			date.setDate(1);
			date.setMonth(options.month);
		}
		if (options.date != undefined) {
			date.setDate(options.date);
		}
		
		
		
		/* View Rendering
		-----------------------------------------------------------------------------*/
		
		function changeView(v) {
			if (v != viewName) {
				fixContentSize();
				if (view) {
					if (view.eventsChanged) {
						eventsDirtyExcept(view);
						view.eventsChanged = false;
					}
					view.element.hide();
				}
				if (viewInstances[v]) {
					(view = viewInstances[v]).element.show();
					if (view.shown) {
						view.shown();
					}
				}else{
					view = viewInstances[v] = $.fullCalendar.views[v](
						$("<div class='fc-view fc-view-" + v + "'/>").appendTo(content),
						options);
				}
				if (header) {
					// update 'active' view button
					header.find('div.fc-button-' + viewName).removeClass(tm + '-state-active');
					header.find('div.fc-button-' + v).addClass(tm + '-state-active');
				}
				view.name = viewName = v;
				render();
				unfixContentSize();
			}
		}
		
		function render(inc, forceUpdateSize) {
			if ((elementWidth = _element.offsetWidth) !== 0) { // visible on the screen
				if (!contentHeight || forceUpdateSize) {
					contentWidth = content.width();
					contentHeight = calculateContentHeight();
				}
				if (inc || !view.date || date < view.start || date >= view.end) { // !view.date means it hasn't been rendered yet
					fixContentSize();
					view.render(date, inc || 0, contentWidth, contentHeight, function(callback) {
						// dont refetch if new view contains the same events (or a subset)
						if (!eventStart || view.visStart < eventStart || view.visEnd > eventEnd) {
							fetchEvents(callback);
						}else{
							callback(events); // no refetching
						}
					});
					unfixContentSize();
					view.date = cloneDate(date);
				}
				else if (view.sizeDirty || forceUpdateSize) {
					view.updateSize(contentWidth, contentHeight);
					view.clearEvents();
					view.renderEvents(events);
				}
				else if (view.eventsDirty) {
					// ensure events are rerendered if another view messed with them
					// pass in 'events' b/c event might have been added/removed
					// executed on a changeView
					view.clearEvents();
					view.renderEvents(events);
				}
				if (header) {
					// update title text
					header.find('h2.fc-header-title').html(view.title);
					// enable/disable 'today' button
					var today = new Date();
					if (today >= view.start && today < view.end) {
						header.find('div.fc-button-today').addClass(tm + '-state-disabled');
					}else{
						header.find('div.fc-button-today').removeClass(tm + '-state-disabled');
					}
				}
				view.sizeDirty = false;
				view.eventsDirty = false;
				view.trigger('viewDisplay', _element);
			}
		}
		
		// marks other views' events as dirty
		function eventsDirtyExcept(exceptView) { // TODO: otherViewsEventsDirty
			$.each(viewInstances, function() {
				if (this != exceptView) {
					this.eventsDirty = true;
				}
			});
		}
		
		// called when any event objects have been added/removed/changed, rerenders
		function eventsChanged() {
			view.clearEvents();
			view.renderEvents(events);
			eventsDirtyExcept(view);
		}
		
		// marks other views' sizes as dirty
		function sizesDirtyExcept(exceptView) {
			$.each(viewInstances, function() {
				if (this != exceptView) {
					this.sizeDirty = true;
				}
			});
		}
		
		// called when we know the element size has changed
		function sizeChanged(fix) {
			contentWidth = content.width();
			contentHeight = calculateContentHeight();
			if (fix) {
				fixContentSize();
			}
			view.updateSize(contentWidth, contentHeight);
			if (fix) {
				unfixContentSize();
			}
			sizesDirtyExcept(view);
			view.rerenderEvents();
		}
		
		// calculate what the height of the content should be
		function calculateContentHeight() {
			if (options.contentHeight) {
				return options.contentHeight;
			}
			else if (options.height) {
				return options.height - (header ? header.height() : 0) - vsides(content[0]);
			}
			return Math.round(contentWidth / Math.max(options.aspectRatio, .5));
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
					if (prevViewName == view.name && +prevDate == +date && // protects from fast switching
						$.inArray(src, eventSources) != -1) {              // makes sure source hasn't been removed
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
				if (options.cacheParam) {
					params[options.cacheParam] = (new Date()).getTime(); // TODO: deprecate cacheParam
				}
				pushLoading();
				$.ajax({
					url: src,
					dataType: 'json',
					data: params,
					cache: options.cacheParam || false, // don't let jquery prevent caching if cacheParam is being used
					success: reportEventsAndPop
				});
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
		
			render: function() {
				render(0, true); // true forces size to updated
				sizesDirtyExcept(view);
				eventsDirtyExcept(view);
			},
			
			changeView: changeView,
			
			getView: function() {
				return view;
			},
			
			getDate: function() {
				return date;
			},
			
			option: function(name, value) {
				if (value == undefined) {
					return options[name];
				}
				if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
					if (!contentSizeFixed) {
						options[name] = value;
						sizeChanged();
					}
				}
			},
			
			destroy: function() {
				$(window).unbind('resize', windowResize);
				if (header) {
					header.remove();
				}
				content.remove();
				$.removeData(_element, 'fullCalendar');
			},
			
			//
			// Navigation
			//
			
			prev: function() {
				render(-1);
			},
			
			next: function() {
				render(1);
			},
			
			prevYear: function() {
				addYears(date, -1);
				render();
			},
			
			nextYear: function() {
				addYears(date, 1);
				render();
			},
			
			today: function() {
				date = new Date();
				render();
			},
			
			gotoDate: function(year, month, dateNum) {
				if (typeof year == 'object') {
					date = cloneDate(year); // provided 1 argument, a Date
				}else{
					if (year != undefined) {
						date.setFullYear(year);
					}
					if (month != undefined) {
						date.setMonth(month);
					}
					if (dateNum != undefined) {
						date.setDate(dateNum);
					}
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
				eventsDirtyExcept(view);
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
					$.each(this.split(','), function(j, buttonName) {
						if (buttonName == 'title') {
							tr.append("<td><h2 class='fc-header-title'>&nbsp;</h2></td>");
							if (prevButton) {
								prevButton.addClass(tm + '-corner-right');
							}
							prevButton = null;
						}else{
							var buttonClick;
							if (publicMethods[buttonName]) {
								buttonClick = publicMethods[buttonName];
							}
							else if (views[buttonName]) {
								buttonClick = function() {
									button.removeClass(tm + '-state-hover');
									changeView(buttonName)
								};
							}
							if (buttonClick) {
								if (prevButton) {
									prevButton.addClass(tm + '-no-right');
								}
								var button,
									icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null,
									text = smartProperty(options.buttonText, buttonName);
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
										.click(function() {
											if (!button.hasClass(tm + '-state-disabled')) {
												buttonClick();
											}
										})
										.mousedown(function() {
											button
												.not('.' + tm + '-state-active')
												.not('.' + tm + '-state-disabled')
												.addClass(tm + '-state-down');
										})
										.mouseup(function() {
											button.removeClass(tm + '-state-down');
										})
										.hover(
											function() {
												button
													.not('.' + tm + '-state-active')
													.not('.' + tm + '-state-disabled')
													.addClass(tm + '-state-hover');
											},
											function() {
												button
													.removeClass(tm + '-state-hover')
													.removeClass(tm + '-state-down');
											}
										)
										.appendTo($("<td/>").appendTo(tr));
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
		
		var contentSizeFixed = false,
			resizeCnt = 0;
		
		function fixContentSize() {
			if (!contentSizeFixed) {
				contentSizeFixed = true;
				content.css({
					overflow: 'hidden',
					height: contentHeight
				});
				// TODO: previous action might have caused scrollbars
				// which will make the window width more narrow, possibly changing the aspect ratio
			}
		}
		
		function unfixContentSize() {
			if (contentSizeFixed) {
				content.css({
					overflow: 'visible',
					height: ''
				});
				if ($.browser.msie && ($.browser.version=='6.0' || $.browser.version=='7.0')) {
					// in IE6/7 the inside of the content div was invisible
					// bizarre hack to get this work... need both lines
					content[0].clientHeight;
					content.hide().show();
				}
				contentSizeFixed = false;
			}
		}
		
		function windowResize() {
			if (!contentSizeFixed) {
				if (view.date) { // view has already been rendered
					var rcnt = ++resizeCnt; // add a delay
					setTimeout(function() {
						if (rcnt == resizeCnt && !contentSizeFixed) {
							var newWidth = element.width();
							if (newWidth != elementWidth) {
								elementWidth = newWidth;
								sizeChanged(true);
								view.trigger('windowResize', _element);
							}
						}
					}, 200);
				}else{
					render(); // render for first time
					// was probably in a 0x0 iframe that has just been resized
				}
			}
		};
		$(window).resize(windowResize);
		
		
		// let's begin...
		changeView(options.defaultView);
		
		// in IE, when in 0x0 iframe, initial resize never gets called, so do this...
		if ($.browser.msie && !$('body').width()) {
			setTimeout(function() {
				render();
				content.hide().show(); // needed for IE 6
				view.rerenderEvents(); // needed for IE 7 // TODO: could probably skip recompile
			}, 0);
		}
	
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
	if (event.end && event.end <= event.start) {
		event.end = null;
	}
	event._end = event.end ? cloneDate(event.end) : null;
	if (event.allDay == undefined) {
		event.allDay = options.allDayDefault;
	}
	if (event.className) {
		if (typeof event.className == 'string') {
			event.className = event.className.split(/\s+/);
		}
	}else{
		event.className = [];
	}
}
// TODO: if there is no title or start date, return false to indicate an invalid event


/* Grid-based Views: month, basicWeek, basicDay
-----------------------------------------------------------------------------*/

setDefaults({
	weekMode: 'fixed'
});

views.month = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addMonths(date, delta);
				date.setDate(1);
			}
			// start/end
			var start = this.start = cloneDate(date, true);
			start.setDate(1);
			this.end = addMonths(cloneDate(start), 1);
			// visStart/visEnd
			var visStart = this.visStart = cloneDate(start),
				visEnd = this.visEnd = cloneDate(this.end),
				nwe = options.weekends ? 0 : 1;
			if (nwe) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			addDays(visStart, -((visStart.getDay() - Math.max(options.firstDay, nwe) + 7) % 7));
			addDays(visEnd, (7 - visEnd.getDay() + Math.max(options.firstDay, nwe)) % 7);
			// row count
			var rowCnt = Math.round((visEnd - visStart) / (DAY_MS * 7));
			if (options.weekMode == 'fixed') {
				addDays(visEnd, (6 - rowCnt) * 7);
				rowCnt = 6;
			}
			// title
			this.title = formatDate(
				start,
				this.option('titleFormat'),
				options
			);
			// render
			this.renderGrid(
				rowCnt, options.weekends ? 7 : 5,
				this.option('columnFormat'),
				true,
				width, height,
				fetchEvents
			);
		}
	});
}

views.basicWeek = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addDays(date, delta * 7);
			}
			var visStart = this.visStart = cloneDate(
					this.start = addDays(cloneDate(date), -((date.getDay() - options.firstDay + 7) % 7))
				),
				visEnd = this.visEnd = cloneDate(
					this.end = addDays(cloneDate(visStart), 7)
				);
			if (!options.weekends) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			this.title = formatDates(
				visStart,
				addDays(cloneDate(visEnd), -1),
				this.option('titleFormat'),
				options
			);
			this.renderGrid(
				1, options.weekends ? 7 : 5,
				this.option('columnFormat'),
				false,
				width, height,
				fetchEvents
			);
		}
	});
};

views.basicDay = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addDays(date, delta);
				if (!options.weekends) {
					skipWeekend(date, delta < 0 ? -1 : 1);
				}
			}
			this.title = formatDate(date, this.option('titleFormat'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderGrid(
				1, 1,
				this.option('columnFormat'),
				false,
				width, height,
				fetchEvents
			);
		}
	});
}


// rendering bugs

var tdHeightBug;


function Grid(element, options, methods) {
	
	var tm, firstDay,
		nwe,            // no weekends (int)
		rtl, dis, dit,  // day index sign / translate
		viewWidth, viewHeight,
		rowCnt, colCnt,
		colWidth,
		thead, tbody,
		cachedEvents=[],
		segmentContainer,
		dayContentPositions = new HorizontalPositionCache(function(dayOfWeek) {
			return tbody.find('td:eq(' + ((dayOfWeek - Math.max(firstDay,nwe)+colCnt) % colCnt) + ') div div')
		}),
		// ...
		
	// initialize superclass
	view = $.extend(this, viewMethods, methods, {
		renderGrid: renderGrid,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		clearEvents: clearEvents,
		updateSize: updateSize,
		defaultEventEnd: function(event) { // calculates an end if event doesnt have one, mostly for resizing
			return cloneDate(event.start);
		}
	});
	view.init(element, options);
	
	
	
	/* Grid Rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-grid').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}

	function renderGrid(r, c, colFormat, showNumbers, width, height, fetchEvents) {
		rowCnt = r;
		colCnt = c;
		
		// update option-derived variables
		tm = options.theme ? 'ui' : 'fc';
		nwe = options.weekends ? 0 : 1;
		firstDay = options.firstDay;
		if (rtl = options.isRTL) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		
		var month = view.start.getMonth(),
			today = clearTime(new Date()),
			s, i, j, d = cloneDate(view.visStart);
		
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
				if (nwe) {
					skipWeekend(d);
				}
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
						"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></td>";
					addDays(d, 1);
					if (nwe) {
						skipWeekend(d);
					}
				}
				s += "</tr>";
			}
			tbody = $(s + "</tbody>").appendTo(table);
			tbody.find('td').click(dayClick);
			
			segmentContainer = $("<div/>").appendTo(element); // style='position:absolute;top:0;left:0' // made it a little slower for some reason
		
		}else{ // NOT first time, reuse as many cells as possible
		
			clearEvents();
		
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
							"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div>" +
							"</td>";
						addDays(d, 1);
						if (nwe) {
							skipWeekend(d);
						}
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
				if (nwe) {
					skipWeekend(d);
				}
			});
			
			if (rowCnt == 1) { // more changes likely (week or day view)
			
				// redo column header text and class
				d = cloneDate(view.visStart);
				thead.find('th').each(function() {
					$(this).text(formatDate(d, colFormat, options));
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
					if (nwe) {
						skipWeekend(d);
					}
				});
				
				// redo cell day-of-weeks
				d = cloneDate(view.visStart);
				tbody.find('td').each(function() {
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
					if (nwe) {
						skipWeekend(d);
					}
				});
				
			}
		
		}
		
		updateSize(width, height);
		fetchEvents(renderEvents);
	
	};
	
	
	function dayClick(ev) {
		var n = parseInt(this.className.match(/fc\-day(\d+)/)[1]),
			date = addDays(
				cloneDate(view.visStart),
				Math.floor(n/colCnt) * 7 + n % colCnt
			);
		view.trigger('dayClick', this, date, true, ev);
	}
	
	
	function updateSize(width, height) { // does not render/position the events
		viewWidth = width;
		viewHeight = height;
		dayContentPositions.clear();
		
		var leftTDs = tbody.find('tr td:first-child'),
			tbodyHeight = viewHeight - thead.height(),
			rowHeight1, rowHeight2;
		
		if (options.weekMode == 'variable') {
			rowHeight1 = rowHeight2 = Math.floor(tbodyHeight / (rowCnt==1 ? 2 : 6));
		}else{
			rowHeight1 = Math.floor(tbodyHeight / rowCnt);
			rowHeight2 = tbodyHeight - rowHeight1*(rowCnt-1);
		}
		
		if (tdHeightBug == undefined) {
			// bug in firefox where cell height includes padding
			var tr = tbody.find('tr:first'),
				td = tr.find('td:first');
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
			colWidth = Math.floor(viewWidth / colCnt)
		);
		
	}

	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	
	function renderEvents(events) {
		view.reportEvents(cachedEvents = events);
		renderSegs(compileSegs(events));
	}
	
	
	function rerenderEvents(modifiedEventId) {
		clearEvents();
		renderSegs(compileSegs(cachedEvents), modifiedEventId);
	}
	
	
	function clearEvents() {
		view._clearEvents(); // only clears the hashes
		segmentContainer.empty();
	}
	
	
	function compileSegs(events) {
		var d1 = cloneDate(view.visStart),
			d2 = addDays(cloneDate(d1), colCnt),
			visEventsEnds = $.map(events, visEventEnd),
			i, row,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<rowCnt; i++) {
			row = stackSegs(view.sliceSegs(events, visEventsEnds, d1, d2));
			for (j=0; j<row.length; j++) {
				level = row[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.row = i;
					seg.level = j;
					segs.push(seg);
				}
			}
			addDays(d1, 7);
			addDays(d2, 7);
		}
		return segs;
	}
	
	
	
	function renderSegs(segs, modifiedEventId) {
		_renderDaySegs(
			segs,
			rowCnt,
			view,
			0,
			viewWidth,
			function(i) { return tbody.find('tr:eq('+i+')') },
			dayContentPositions.left,
			dayContentPositions.right,
			segmentContainer,
			bindSegHandlers,
			modifiedEventId
		);
	}
	
	
	
	function visEventEnd(event) { // returns exclusive 'visible' end, for rendering
		if (event.end) {
			var end = cloneDate(event.end);
			return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
		}else{
			return addDays(cloneDate(event.start), 1);
		}
	}
	
	
	
	function bindSegHandlers(event, eventElement, seg) {
		view.eventElementHandlers(event, eventElement);
		if (event.editable || event.editable == undefined && options.editable) {
			draggableEvent(event, eventElement);
			if (seg.isEnd) {
				view.resizableDayEvent(event, eventElement, colWidth);
			}
		}
	}
	
	
	
	/* Event Dragging
	-----------------------------------------------------------------------------*/
	
	
	function draggableEvent(event, eventElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var matrix;
			eventElement.draggable({
				zIndex: 9,
				delay: 50,
				opacity: view.option('dragOpacity'),
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell || !cell.rowDelta && !cell.colDelta);
						if (cell) {
							view.showOverlay(cell);
						}else{
							view.hideOverlay();
						}
					});
					tbody.find('tr').each(function() {
						matrix.row(this);
					});
					var tds = tbody.find('tr:first td');
					if (rtl) {
						tds = $(tds.get().reverse());
					}
					tds.each(function() {
						matrix.col(this);
					});
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
						if ($.browser.msie) {
							eventElement.css('filter', ''); // clear IE opacity side-effects
						}
						view.showEvents(event, eventElement);
					}else{
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						view.eventDrop(this, event, cell.rowDelta*7+cell.colDelta*dis, 0, event.allDay, ev, ui);
					}
				}
			});
		}
	}
	
	
	// event resizing w/ 'view' methods...

};


function _renderDaySegs(segs, rowCnt, view, minLeft, maxLeft, getRow, dayContentLeft, dayContentRight, segmentContainer, bindSegHandlers, modifiedEventId) {

	var options=view.options,
		rtl=options.isRTL,
		i, segCnt=segs.length, seg,
		event,
		className,
		left, right,
		html='',
		eventElements,
		eventElement,
		triggerRes,
		hsideCache={},
		vmarginCache={},
		key, val,
		rowI, top, levelI, levelHeight,
		rowDivs=[],
		rowDivTops=[];
		
	// calculate desired position/dimensions, create html
	for (i=0; i<segCnt; i++) {
		seg = segs[i];
		event = seg.event;
		className = 'fc-event fc-event-hori ';
		if (rtl) {
			if (seg.isStart) {
				className += 'fc-corner-right ';
			}
			if (seg.isEnd) {
				className += 'fc-corner-left ';
			}
			left = seg.isEnd ? dayContentLeft(seg.end.getDay()-1) : minLeft;
			right = seg.isStart ? dayContentRight(seg.start.getDay()) : maxLeft;
		}else{
			if (seg.isStart) {
				className += 'fc-corner-left ';
			}
			if (seg.isEnd) {
				className += 'fc-corner-right ';
			}
			left = seg.isStart ? dayContentLeft(seg.start.getDay()) : minLeft;
			right = seg.isEnd ? dayContentRight(seg.end.getDay()-1) : maxLeft;
		}
		html +=
			"<div class='" + className + event.className.join(' ') + "' style='position:absolute;z-index:8;left:"+left+"px'>" +
				"<a" + (event.url ? " href='" + htmlEscape(event.url) + "'" : '') + ">" +
					(!event.allDay && seg.isStart ?
						"<span class='fc-event-time'>" +
							htmlEscape(formatDates(event.start, event.end, view.option('timeFormat'), options)) +
						"</span>"
					:'') +
					"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
				"</a>" +
				((event.editable || event.editable == undefined && options.editable) && !options.disableResizing && $.fn.resizable ?
					"<div class='ui-resizable-handle ui-resizable-" + (rtl ? 'w' : 'e') + "'></div>"
					: '') +
			"</div>";
		seg.left = left;
		seg.outerWidth = right - left;
	}
	segmentContainer[0].innerHTML = html; // faster than html()
	eventElements = segmentContainer.children();
	
	// retrieve elements, run through eventRender callback, bind handlers
	for (i=0; i<segCnt; i++) {
		seg = segs[i];
		eventElement = $(eventElements[i]); // faster than eq()
		event = seg.event;
		triggerRes = view.trigger('eventRender', event, event, eventElement);
		if (triggerRes === false) {
			eventElement.remove();
		}else{
			if (triggerRes && triggerRes !== true) {
				eventElement.remove();
				eventElement = $(triggerRes)
					.css({
						position: 'absolute',
						left: seg.left
					})
					.appendTo(segmentContainer);
			}
			seg.element = eventElement;
			if (event._id === modifiedEventId) {
				bindSegHandlers(event, eventElement, seg);
			}else{
				eventElement[0]._fci = i; // for lazySegBind
			}
			view.reportEventElement(event, eventElement);
		}
	}
	
	lazySegBind(segmentContainer, segs, bindSegHandlers);
	
	// record event horizontal sides
	for (i=0; i<segCnt; i++) {
		seg = segs[i];
		if (eventElement = seg.element) {
			val = hsideCache[key = seg.key = cssKey(eventElement[0])];
			seg.hsides = val == undefined ? (hsideCache[key] = hsides(eventElement[0], true)) : val;
		}
	}
	
	// set event widths
	for (i=0; i<segCnt; i++) {
		seg = segs[i];
		if (eventElement = seg.element) {
			eventElement[0].style.width = seg.outerWidth - seg.hsides + 'px';
		}
	}
	
	// record event heights
	for (i=0; i<segCnt; i++) {
		seg = segs[i];
		if (eventElement = seg.element) {
			val = vmarginCache[key = seg.key];
			seg.outerHeight = eventElement[0].offsetHeight + (
				val == undefined ? (vmarginCache[key] = vmargins(eventElement[0])) : val
			);
		}
	}
	
	// set row heights, calculate event tops (in relation to row top)
	for (i=0, rowI=0; rowI<rowCnt; rowI++) {
		top = levelI = levelHeight = 0;
		while (i<segCnt && (seg = segs[i]).row == rowI) {
			if (seg.level != levelI) {
				top += levelHeight;
				levelHeight = 0;
				levelI++;
			}
			levelHeight = Math.max(levelHeight, seg.outerHeight||0);
			seg.top = top;
			i++;
		}
		rowDivs[rowI] = getRow(rowI).find('td:first div.fc-day-content > div') // optimal selector?
			.height(top + levelHeight);
	}
	
	// calculate row tops
	for (rowI=0; rowI<rowCnt; rowI++) {
		rowDivTops[rowI] = rowDivs[rowI][0].offsetTop;
	}
	
	// set event tops
	for (i=0; i<segCnt; i++) {
		seg = segs[i];
		if (eventElement = seg.element) {
			eventElement[0].style.top = rowDivTops[seg.row] + seg.top + 'px';
			event = seg.event;
			view.trigger('eventAfterRender', event, event, eventElement);
		}
	}
	
}



/* Agenda Views: agendaWeek/agendaDay
-----------------------------------------------------------------------------*/

setDefaults({
	allDaySlot: true,
	allDayText: 'all-day',
	firstHour: 6,
	slotMinutes: 30,
	defaultEventMinutes: 120,
	axisFormat: 'h(:mm)tt',
	timeFormat: {
		agenda: 'h:mm{ - h:mm}'
	},
	dragOpacity: {
		agenda: .5
	},
	minTime: 0,
	maxTime: 24
});

views.agendaWeek = function(element, options) {
	return new Agenda(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addDays(date, delta * 7);
			}
			var visStart = this.visStart = cloneDate(
					this.start = addDays(cloneDate(date), -((date.getDay() - options.firstDay + 7) % 7))
				),
				visEnd = this.visEnd = cloneDate(
					this.end = addDays(cloneDate(visStart), 7)
				);
			if (!options.weekends) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			this.title = formatDates(
				visStart,
				addDays(cloneDate(visEnd), -1),
				this.option('titleFormat'),
				options
			);
			this.renderAgenda(
				options.weekends ? 7 : 5,
				this.option('columnFormat'),
				width, height,
				fetchEvents
			);
		}
	});
};

views.agendaDay = function(element, options) {
	return new Agenda(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addDays(date, delta);
				if (!options.weekends) {
					skipWeekend(date, delta < 0 ? -1 : 1);
				}
			}
			this.title = formatDate(date, this.option('titleFormat'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderAgenda(
				1,
				this.option('columnFormat'),
				width, height,
				fetchEvents
			);
		}
	});
};

function Agenda(element, options, methods) {

	var head, body, bodyContent, bodyTable, bg,
		colCnt,
		axisWidth, colWidth, slotHeight,
		viewWidth, viewHeight,
		cachedEvents=[],
		daySegmentContainer,
		slotSegmentContainer,
		tm, firstDay,
		nwe,            // no weekends (int)
		rtl, dis, dit,  // day index sign / translate
		minMinute, maxMinute,
		colContentPositions = new HorizontalPositionCache(function(col) {
			return bg.find('td:eq(' + col + ') div div');
		}),
		slotTopCache = {},
		// ...
		
	view = $.extend(this, viewMethods, methods, {
		renderAgenda: renderAgenda,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		clearEvents: clearEvents,
		updateSize: updateSize,
		shown: resetScroll,
		defaultEventEnd: function(event) {
			var start = cloneDate(event.start);
			if (event.allDay) {
				return start;
			}
			return addMinutes(start, options.defaultEventMinutes);
		}
	});
	view.init(element, options);
	
	
	
	/* Time-slot rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-agenda').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}
	
	function renderAgenda(c, colFormat, width, height, fetchEvents) {
		colCnt = c;
		
		// update option-derived variables
		tm = options.theme ? 'ui' : 'fc';
		nwe = options.weekends ? 0 : 1;
		firstDay = options.firstDay;
		if (rtl = options.isRTL) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		minMinute = parseTime(options.minTime);
		maxMinute = parseTime(options.maxTime);
		
		var d0 = rtl ? addDays(cloneDate(view.visEnd), -1) : cloneDate(view.visStart),
			d = cloneDate(d0),
			today = clearTime(new Date());
		
		if (!head) { // first time rendering, build from scratch
		
			var i,
				minutes,
				slotNormal = options.slotMinutes % 15 == 0, //...
			
			// head
			s = "<div class='fc-agenda-head' style='position:relative;z-index:4'>" +
				"<table style='width:100%'>" +
				"<tr class='fc-first" + (options.allDaySlot ? '' : ' fc-last') + "'>" +
				"<th class='fc-leftmost " +
					tm + "-state-default'>&nbsp;</th>";
			for (i=0; i<colCnt; i++) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					"'>" + formatDate(d, colFormat, options) + "</th>";
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
			}
			s += "<th class='" + tm + "-state-default'>&nbsp;</th></tr>";
			if (options.allDaySlot) {
				s += "<tr class='fc-all-day'>" +
						"<th class='fc-axis fc-leftmost " + tm + "-state-default'>" + options.allDayText + "</th>" +
						"<td colspan='" + colCnt + "' class='" + tm + "-state-default'>" +
							"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></td>" +
						"<th class='" + tm + "-state-default'>&nbsp;</th>" +
					"</tr><tr class='fc-divider fc-last'><th colspan='" + (colCnt+2) + "' class='" +
						tm + "-state-default fc-leftmost'><div/></th></tr>";
			}
			s+= "</table></div>";
			head = $(s).appendTo(element);
			head.find('td').click(slotClick);
			
			// all-day event container
			daySegmentContainer = $("<div style='position:absolute;top:0;left:0'/>").appendTo(head);
			
			// body
			d = zeroDate();
			var maxd = addMinutes(cloneDate(d), maxMinute);
			addMinutes(d, minMinute);
			s = "<table>";
			for (i=0; d < maxd; i++) {
				minutes = d.getMinutes();
				s += "<tr class='" +
					(i==0 ? 'fc-first' : (minutes==0 ? '' : 'fc-minor')) +
					"'><th class='fc-axis fc-leftmost " + tm + "-state-default'>" +
					((!slotNormal || minutes==0) ? formatDate(d, options.axisFormat) : '&nbsp;') + 
					"</th><td class='fc-slot" + i + ' ' +
						tm + "-state-default'><div style='position:relative'>&nbsp;</div></td></tr>";
				addMinutes(d, options.slotMinutes);
			}
			s += "</table>";
			body = $("<div class='fc-agenda-body' style='position:relative;z-index:2;overflow:auto'/>")
				.append(bodyContent = $("<div style='position:relative;overflow:hidden'>")
					.append(bodyTable = $(s)))
				.appendTo(element);
			body.find('td').click(slotClick);
			
			// slot event container
			slotSegmentContainer = $("<div/>").appendTo(bodyContent);
			
			// background stripes
			d = cloneDate(d0);
			s = "<div class='fc-agenda-bg' style='position:absolute;z-index:1'>" +
				"<table style='width:100%;height:100%'><tr class='fc-first'>";
			for (i=0; i<colCnt; i++) {
				s += "<td class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default ' +
					(i==0 ? 'fc-leftmost ' : '') +
					(+d == +today ? tm + '-state-highlight fc-today' : 'fc-not-today') +
					"'><div class='fc-day-content'><div>&nbsp;</div></div></td>";
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
			}
			s += "</tr></table></div>";
			bg = $(s).appendTo(element);
			
		}else{ // skeleton already built, just modify it
		
			clearEvents();
			
			// redo column header text and class
			head.find('tr:first th').slice(1, -1).each(function() {
				$(this).text(formatDate(d, colFormat, options));
				this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
			});
			
			// change classes of background stripes
			d = cloneDate(d0);
			bg.find('td').each(function() {
				this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
				if (+d == +today) {
					$(this)
						.removeClass('fc-not-today')
						.addClass('fc-today')
						.addClass(tm + '-state-highlight');
				}else{
					$(this)
						.addClass('fc-not-today')
						.removeClass('fc-today')
						.removeClass(tm + '-state-highlight');
				}
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
			});
		
		}
		
		updateSize(width, height);
		resetScroll();
		fetchEvents(renderEvents);
		
	};
	
	
	function resetScroll() {
		var d0 = zeroDate(),
			scrollDate = cloneDate(d0);
		scrollDate.setHours(options.firstHour);
		var go = function() {
			body.scrollTop(timePosition(d0, scrollDate) + 1); // +1 for the border
				// TODO: +1 doesn't apply when firstHour=0
		}
		if ($.browser.opera) {
			setTimeout(go, 0); // opera 10 (and earlier?) needs this
		}else{
			go();
		}
	}
	
	
	function updateSize(width, height) {
		viewWidth = width;
		viewHeight = height;
		colContentPositions.clear();
		slotTopCache = {};
		
		body.width(width);
		body.height(height - head.height());
		bodyTable.width('');
		
		var topTDs = head.find('tr:first th'),
			stripeTDs = bg.find('td'),
			contentWidth = slotSegmentContainer.width(); // body[0].clientWidth isn't reliable here in IE6
			
		bodyTable.width(contentWidth);
		
		// time-axis width
		axisWidth = 0;
		setOuterWidth(
			head.find('tr:lt(2) th:first').add(body.find('tr:first th'))
				.width('')
				.each(function() {
					axisWidth = Math.max(axisWidth, $(this).outerWidth());
				}),
			axisWidth
		);
		
		// column width
		colWidth = Math.floor((contentWidth - axisWidth) / colCnt);
		setOuterWidth(stripeTDs.slice(0, -1), colWidth);
		setOuterWidth(topTDs.slice(1, -2), colWidth);
		setOuterWidth(topTDs.slice(-2, -1), contentWidth - axisWidth - colWidth*(colCnt-1));
		
		bg.css({
			top: head.find('tr').height(),
			left: axisWidth,
			width: contentWidth - axisWidth,
			height: height
		});
		
		slotHeight = body.find('tr:first div').height() + 1;
	}
	
	function slotClick(ev) {
		var col = Math.floor((ev.pageX - bg.offset().left) / colWidth),
			date = addDays(cloneDate(view.visStart), dit + dis*col),
			rowMatch = this.className.match(/fc-slot(\d+)/);
		if (rowMatch) {
			var mins = parseInt(rowMatch[1]) * options.slotMinutes,
				hours = Math.floor(mins/60);
			date.setHours(hours);
			date.setMinutes(mins%60 + minMinute);
			view.trigger('dayClick', this, date, false, ev);
		}else{
			view.trigger('dayClick', this, date, true, ev);
		}
	}
	
	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	function renderEvents(events, modifiedEventId) {
		view.reportEvents(cachedEvents = events);
		var i, len=events.length,
			dayEvents=[],
			slotEvents=[];
		for (i=0; i<len; i++) {
			if (events[i].allDay) {
				dayEvents.push(events[i]);
			}else{
				slotEvents.push(events[i]);
			}
		}
		renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
		renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
	}
	
	
	function rerenderEvents(modifiedEventId) {
		clearEvents();
		renderEvents(cachedEvents, modifiedEventId);
	}
	
	
	function clearEvents() {
		view._clearEvents(); // only clears the hashes
		daySegmentContainer.empty();
		slotSegmentContainer.empty();
	}
	
	
	
	
	
	function compileDaySegs(events) {
		var levels = stackSegs(view.sliceSegs(events, $.map(events, visEventEnd), view.visStart, view.visEnd)),
			i, levelCnt=levels.length, level,
			j, seg,
			segs=[];
		for (i=0; i<levelCnt; i++) {
			level = levels[i];
			for (j=0; j<level.length; j++) {
				seg = level[j];
				seg.row = 0;
				seg.level = i;
				segs.push(seg);
			}
		}
		return segs;
	}
	
	
	function compileSlotSegs(events) {
		var d = addMinutes(cloneDate(view.visStart), minMinute),
			visEventEnds = $.map(events, visEventEnd),
			i, col,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<colCnt; i++) {
			col = stackSegs(view.sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute-minMinute)));
			countForwardSegs(col);
			for (j=0; j<col.length; j++) {
				level = col[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.col = i;
					seg.level = j;
					segs.push(seg);
				}
			}
			addDays(d, 1, true);
		}
		return segs;
	}
	
	
	
	
	// renders 'all-day' events at the top
	
	function renderDaySegs(segs, modifiedEventId) {
		if (options.allDaySlot) {
			_renderDaySegs(
				segs,
				1,
				view,
				axisWidth,
				viewWidth,
				function() {
					return head.find('tr.fc-all-day')
				},
				function(dayOfWeek) {
					return axisWidth + colContentPositions.left(day2col(dayOfWeek));
				},
				function(dayOfWeek) {
					return axisWidth + colContentPositions.right(day2col(dayOfWeek));
				},
				daySegmentContainer,
				bindDaySegHandlers,
				modifiedEventId
			);
			updateSize(viewWidth, viewHeight); // might have pushed the body down, so resize
		}
	}
	
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segs, modifiedEventId) {
	
		var i, segCnt=segs.length, seg,
			event,
			className,
			top, bottom,
			colI, levelI, forward,
			leftmost,
			availWidth,
			outerWidth,
			left,
			html='',
			eventElements,
			eventElement,
			triggerRes,
			vsideCache={},
			hsideCache={},
			key, val,
			titleSpan,
			height;
			
		// calculate position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			className = 'fc-event fc-event-vert ';
			if (seg.isStart) {
				className += 'fc-corner-top ';
			}
			if (seg.isEnd) {
				className += 'fc-corner-bottom ';
			}
			top = timePosition(seg.start, seg.start);
			bottom = timePosition(seg.start, seg.end);
			colI = seg.col;
			levelI = seg.level;
			forward = seg.forward || 0;
			leftmost = axisWidth + colContentPositions.left(colI*dis + dit);
			availWidth = axisWidth + colContentPositions.right(colI*dis + dit) - leftmost;
			availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
			if (levelI) {
				// indented and thin
				outerWidth = availWidth / (levelI + forward + 1);
			}else{
				if (forward) {
					// moderately wide, aligned left still
					outerWidth = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
				}else{
					// can be entire width, aligned left
					outerWidth = availWidth;
				}
			}
			left = leftmost +                                  // leftmost possible
				(availWidth / (levelI + forward + 1) * levelI) // indentation
				* dis + (rtl ? availWidth - outerWidth : 0);   // rtl
			seg.top = top;
			seg.left = left;
			seg.outerWidth = outerWidth;
			seg.outerHeight = bottom - top;
			html +=
				"<div class='" + className + event.className.join(' ') + "' style='position:absolute;z-index:8;top:" + top + "px;left:" + left + "px'>" +
					"<a" + (event.url ? " href='" + htmlEscape(event.url) + "'" : '') + ">" +
						"<span class='fc-event-bg'></span>" +
						"<span class='fc-event-time'>" + htmlEscape(formatDates(event.start, event.end, view.option('timeFormat'))) + "</span>" +
						"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
					"</a>" +
					((event.editable || event.editable == undefined && options.editable) && !options.disableResizing && $.fn.resizable ?
						"<div class='ui-resizable-handle ui-resizable-s'>=</div>"
						: '') +
				"</div>";
		}
		slotSegmentContainer[0].innerHTML = html; // faster than html()
		eventElements = slotSegmentContainer.children();
		
		// retrieve elements, run through eventRender callback, bind event handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			eventElement = $(eventElements[i]); // faster than eq()
			triggerRes = view.trigger('eventRender', event, event, eventElement);
			if (triggerRes === false) {
				eventElement.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					eventElement.remove();
					eventElement = $(triggerRes)
						.css({
							position: 'absolute',
							top: seg.top,
							left: seg.left
						})
						.appendTo(slotSegmentContainer);
				}
				seg.element = eventElement;
				if (event._id === modifiedEventId) {
					bindSlotSegHandlers(event, eventElement, seg);
				}else{
					eventElement[0]._fci = i; // for lazySegBind
				}
				view.reportEventElement(event, eventElement);
			}
		}
		
		lazySegBind(slotSegmentContainer, segs, bindSlotSegHandlers);
		
		// record event sides and title positions
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				val = vsideCache[key = seg.key = cssKey(eventElement[0])];
				seg.vsides = val == undefined ? (vsideCache[key] = vsides(eventElement[0], true)) : val;
				val = hsideCache[key];
				seg.hsides = val == undefined ? (hsideCache[key] = hsides(eventElement[0], true)) : val;
				titleSpan = eventElement.find('span.fc-event-title');
				if (titleSpan.length) {
					seg.titleTop = titleSpan[0].offsetTop;
				}
			}
		}
		
		// set all positions/dimensions at once
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				eventElement[0].style.width = seg.outerWidth - seg.hsides + 'px';
				eventElement[0].style.height = (height = seg.outerHeight - seg.vsides) + 'px';
				event = seg.event;
				if (seg.titleTop != undefined && height - seg.titleTop < 10) {
					// not enough room for title, put it in the time header
					eventElement.find('span.fc-event-time')
						.text(formatDate(event.start, view.option('timeFormat')) + ' - ' + event.title);
					eventElement.find('span.fc-event-title')
						.remove();
				}
				view.trigger('eventAfterRender', event, event, eventElement);
			}
		}
					
	}
	
	
	
	
	
	function visEventEnd(event) { // returns exclusive 'visible' end, for rendering
		if (event.allDay) {
			if (event.end) {
				var end = cloneDate(event.end);
				return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
			}else{
				return addDays(cloneDate(event.start), 1);
			}
		}
		if (event.end) {
			return cloneDate(event.end);
		}else{
			return addMinutes(cloneDate(event.start), options.defaultEventMinutes);
		}
	}
	
	
	
	function bindDaySegHandlers(event, eventElement, seg) {
		view.eventElementHandlers(event, eventElement);
		if (event.editable || event.editable == undefined && options.editable) {
			draggableDayEvent(event, eventElement, seg.isStart);
			if (seg.isEnd) {
				view.resizableDayEvent(event, eventElement, colWidth);
			}
		}
	}
	
	
	
	function bindSlotSegHandlers(event, eventElement, seg) {
		view.eventElementHandlers(event, eventElement);
		if (event.editable || event.editable == undefined && options.editable) {
			var timeElement = eventElement.find('span.fc-event-time');
			draggableSlotEvent(event, eventElement, timeElement);
			if (seg.isEnd) {
				resizableSlotEvent(event, eventElement, timeElement);
			}
		}
	}

	
	
	
	/* Event Dragging
	-----------------------------------------------------------------------------*/
	
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement, isStart) {
		if (!options.disableDragging && eventElement.draggable) {
			var origPosition, origWidth,
				resetElement,
				allDay=true,
				matrix;
			eventElement.draggable({
				zIndex: 9,
				opacity: view.option('dragOpacity', 'month'), // use whatever the month view was using
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					origPosition = eventElement.position();
					origWidth = eventElement.width();
					resetElement = function() {
						if (!allDay) {
							eventElement
								.width(origWidth)
								.height('')
								.draggable('option', 'grid', null);
							allDay = true;
						}
					};
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell || !cell.rowDelta && !cell.colDelta);
						if (cell) {
							if (!cell.row) { // on full-days
								resetElement();
								view.showOverlay(cell);
							}else{ // mouse is over bottom slots
								if (isStart && allDay) {
									// convert event to temporary slot-event
									setOuterHeight(
										eventElement.width(colWidth - 10), // don't use entire width
										slotHeight * Math.round(
											(event.end ? ((event.end - event.start)/MINUTE_MS) : options.defaultEventMinutes)
											/options.slotMinutes)
									);
									eventElement.draggable('option', 'grid', [colWidth, 1]);
									allDay = false;
								}
								view.hideOverlay();
							}
						}else{ // mouse is outside of everything
							view.hideOverlay();
						}
					});
					matrix.row(head.find('td'));
					bg.find('td').each(function() {
						matrix.col(this);
					});
					matrix.row(body);
					matrix.mouse(ev.pageX, ev.pageY);
				},
				drag: function(ev, ui) {
					matrix.mouse(ev.pageX, ev.pageY);
				},
				stop: function(ev, ui) {
					view.hideOverlay();
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					var cell = matrix.cell,
						dayDelta = dis * (
							allDay ? // can't trust cell.colDelta when using slot grid
							(cell ? cell.colDelta : 0) :
							Math.floor((ui.position.left - origPosition.left) / colWidth)
						);
					if (!cell || !dayDelta && !cell.rowDelta) {
						// over nothing (has reverted)
						resetElement();
						if ($.browser.msie) {
							eventElement.css('filter', ''); // clear IE opacity side-effects
						}
						view.showEvents(event, eventElement);
					}else{
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						view.eventDrop(
							this, event, dayDelta,
							allDay ? 0 : // minute delta
								Math.round((eventElement.offset().top - bodyContent.offset().top) / slotHeight)
								* options.slotMinutes
								+ minMinute
								- (event.start.getHours() * 60 + event.start.getMinutes()),
							allDay, ev, ui
						);
					}
				}
			});
		}
	}
	
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var origPosition,
				resetElement,
				prevSlotDelta, slotDelta,
				allDay=false,
				matrix;
			eventElement.draggable({
				zIndex: 9,
				scroll: false,
				grid: [colWidth, slotHeight],
				axis: colCnt==1 ? 'y' : false,
				opacity: view.option('dragOpacity'),
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					if ($.browser.msie) {
						eventElement.find('span.fc-event-bg').hide(); // nested opacities mess up in IE, just hide
					}
					origPosition = eventElement.position();
					resetElement = function() {
						// convert back to original slot-event
						if (allDay) {
							timeElement.css('display', ''); // show() was causing display=inline
							eventElement.draggable('option', 'grid', [colWidth, slotHeight]);
							allDay = false;
						}
					};
					prevSlotDelta = 0;
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell);
						if (cell) {
							if (!cell.row && options.allDaySlot) { // over full days
								if (!allDay) {
									// convert to temporary all-day event
									allDay = true;
									timeElement.hide();
									eventElement.draggable('option', 'grid', null);
								}
								view.showOverlay(cell);
							}else{ // on slots
								resetElement();
								view.hideOverlay();
							}
						}else{
							view.hideOverlay();
						}
					});
					if (options.allDaySlot) {
						matrix.row(head.find('td'));
					}
					bg.find('td').each(function() {
						matrix.col(this);
					});
					matrix.row(body);
					matrix.mouse(ev.pageX, ev.pageY);
				},
				drag: function(ev, ui) {
					slotDelta = Math.round((ui.position.top - origPosition.top) / slotHeight);
					if (slotDelta != prevSlotDelta) {
						if (!allDay) {
							// update time header
							var minuteDelta = slotDelta*options.slotMinutes,
								newStart = addMinutes(cloneDate(event.start), minuteDelta),
								newEnd;
							if (event.end) {
								newEnd = addMinutes(cloneDate(event.end), minuteDelta);
							}
							timeElement.text(formatDates(newStart, newEnd, view.option('timeFormat')));
						}
						prevSlotDelta = slotDelta;
					}
					matrix.mouse(ev.pageX, ev.pageY);
				},
				stop: function(ev, ui) {
					view.hideOverlay();
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					var cell = matrix.cell,
						dayDelta = dis * (
							allDay ? // can't trust cell.colDelta when using slot grid
							(cell ? cell.colDelta : 0) : 
							Math.floor((ui.position.left - origPosition.left) / colWidth)
						);
					if (!cell || !slotDelta && !dayDelta) {
						resetElement();
						if ($.browser.msie) {
							eventElement
								.css('filter', '') // clear IE opacity side-effects
								.find('span.fc-event-bg').css('display', ''); // .show() made display=inline
						}
						eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
						view.showEvents(event, eventElement);
					}else{
						view.eventDrop(
							this, event, dayDelta,
							allDay ? 0 : slotDelta * options.slotMinutes, // minute delta
							allDay, ev, ui
						);
					}
				}
			});
		}
	}
	
	
	
	
	/* Event Resizing
	-----------------------------------------------------------------------------*/
	
	// for TIMESLOT events

	function resizableSlotEvent(event, eventElement, timeElement) {
		if (!options.disableResizing && eventElement.resizable) {
			var slotDelta, prevSlotDelta;
			eventElement.resizable({
				handles: {
					s: 'div.ui-resizable-s'
				},
				grid: slotHeight,
				start: function(ev, ui) {
					slotDelta = prevSlotDelta = 0;
					view.hideEvents(event, eventElement);
					if ($.browser.msie && $.browser.version == '6.0') {
						eventElement.css('overflow', 'hidden');
					}
					eventElement.css('z-index', 9);
					view.trigger('eventResizeStart', this, event, ev, ui);
				},
				resize: function(ev, ui) {
					// don't rely on ui.size.height, doesn't take grid into account
					slotDelta = Math.round((Math.max(slotHeight, eventElement.height()) - ui.originalSize.height) / slotHeight);
					if (slotDelta != prevSlotDelta) {
						timeElement.text(
							formatDates(
								event.start,
								(!slotDelta && !event.end) ? null : // no change, so don't display time range
									addMinutes(view.eventEnd(event), options.slotMinutes*slotDelta),
								view.option('timeFormat')
							)
						);
						prevSlotDelta = slotDelta;
					}
				},
				stop: function(ev, ui) {
					view.trigger('eventResizeStop', this, event, ev, ui);
					if (slotDelta) {
						view.eventResize(this, event, 0, options.slotMinutes*slotDelta, ev, ui);
					}else{
						eventElement.css('z-index', 8);
						view.showEvents(event, eventElement);
						// BUG: if event was really short, need to put title back in span
					}
				}
			});
		}
	}
	
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	
	// get the Y coordinate of the given time on the given day (both Date objects)
	
	function timePosition(day, time) { // both date objects. day holds 00:00 of current day
		day = cloneDate(day, true);
		if (time < addMinutes(cloneDate(day), minMinute)) {
			return 0;
		}
		if (time >= addMinutes(cloneDate(day), maxMinute)) {
			return bodyContent.height();
		}
		var slotMinutes = options.slotMinutes,
			minutes = time.getHours()*60 + time.getMinutes() - minMinute,
			slotI = Math.floor(minutes / slotMinutes),
			slotTop = slotTopCache[slotI];
		if (slotTop == undefined) {
			slotTop = slotTopCache[slotI] = body.find('tr:eq(' + slotI + ') td div')[0].offsetTop;
		}
		return Math.max(0, Math.round(
			slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
		));
	}
	
	
	
	
	function day2col(dayOfWeek) {
		return ((dayOfWeek - Math.max(firstDay,nwe)+colCnt) % colCnt)*dis+dit;
	}
	

}


// count the number of colliding, higher-level segments (for event squishing)

function countForwardSegs(levels) {
	var i, j, k, level, segForward, segBack;
	for (i=levels.length-1; i>0; i--) {
		level = levels[i];
		for (j=0; j<level.length; j++) {
			segForward = level[j];
			for (k=0; k<levels[i-1].length; k++) {
				segBack = levels[i-1][k];
				if (segsCollide(segForward, segBack)) {
					segBack.forward = Math.max(segBack.forward||0, (segForward.forward||0)+1);
				}
			}
		}
	}
}


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
			if (allDay != undefined) {
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
	
	
	
	// semi-transparent overlay (while dragging)
	
	showOverlay: function(props) {
		if (!this.dayOverlay) {
			this.dayOverlay = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3;display:none'/>")
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
		if ((i = e._fci) != undefined) {
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




/* Date Math
-----------------------------------------------------------------------------*/

var DAY_MS = 86400000,
	HOUR_MS = 3600000,
	MINUTE_MS = 60000;

function addYears(d, n, keepTime) {
	d.setFullYear(d.getFullYear() + n);
	if (!keepTime) {
		clearTime(d);
	}
	return d;
}

function addMonths(d, n, keepTime) { // prevents day overflow/underflow
	if (+d) { // prevent infinite looping on invalid dates
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
	}
	return d;
}

function addDays(d, n, keepTime) { // deals with daylight savings
	if (+d) {
		var dd = d.getDate() + n,
			check = cloneDate(d);
		check.setHours(9); // set to middle of day
		check.setDate(dd);
		d.setDate(dd);
		if (!keepTime) {
			clearTime(d);
		}
		fixDate(d, check);
	}
	return d;
}
fc.addDays = addDays;

function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
	if (+d) { // prevent infinite looping on invalid dates
		while (d.getDate() != check.getDate()) {
			d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
		}
	}
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

function zeroDate() { // returns a Date with time 00:00:00 and dateOfMonth=1
	var i=0, d;
	do {
		d = new Date(1970, i++, 1);
	} while (d.getHours() != 0);
	return d;
}

function skipWeekend(date, inc, excl) {
	inc = inc || 1;
	while (date.getDay()==0 || (excl && date.getDay()==1 || !excl && date.getDay()==6)) {
		addDays(date, inc);
	}
	return date;
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
		return parseISO8601(s, true) || (s ? new Date(s) : null);
	}
	// TODO: never return invalid dates (like from new Date(<string>)), return null instead
	return null;
}

var parseISO8601 = fc.parseISO8601 = function(s, ignoreTimezone) {
	// derived from http://delete.me.uk/2005/03/iso8601.html
	// TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
	var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?$/);
	if (!m) {
		return null;
	}
	var date = new Date(m[1], 0, 1),
		check = new Date(m[1], 0, 1, 9, 0),
		offset = 0;
	if (m[3]) {
		date.setMonth(m[3] - 1);
		check.setMonth(m[3] - 1);
	}
	if (m[5]) {
		date.setDate(m[5]);
		check.setDate(m[5]);
	}
	fixDate(date, check);
	if (m[7]) {
		date.setHours(m[7]);
	}
	if (m[8]) {
		date.setMinutes(m[8]);
	}
	if (m[10]) {
		date.setSeconds(m[10]);
	}
	if (m[12]) {
		date.setMilliseconds(Number("0." + m[12]) * 1000);
	}
	fixDate(date, check);
	if (!ignoreTimezone) {
		if (m[14]) {
			offset = Number(m[16]) * 60 + Number(m[17]);
			offset *= m[15] == '-' ? 1 : -1;
		}
		offset -= date.getTimezoneOffset();
	}
	return new Date(+date + (offset * 60 * 1000));
}

var parseTime = fc.parseTime = function(s) { // returns minutes since start of day
	if (typeof s == 'number') { // an hour
		return s * 60;
	}
	if (typeof s == 'object') { // a Date object
		return s.getHours() * 60 + s.getMinutes();
	}
	var m = s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);
	if (m) {
		var h = parseInt(m[1]);
		if (m[3]) {
			h %= 12;
			if (m[3].toLowerCase().charAt(0) == 'p') {
				h += 12;
			}
		}
		return h * 60 + (m[2] ? parseInt(m[2]) : 0);
	}
};



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
	element.each(function(i, _element) {
		_element.style.width = width - hsides(_element, includeMargins) + 'px';
	});
}

function setOuterHeight(element, height, includeMargins) {
	element.each(function(i, _element) {
		_element.style.height = height - vsides(_element, includeMargins) + 'px';
	});
}


function hsides(_element, includeMargins) {
	return (parseFloat(jQuery.curCSS(_element, 'paddingLeft', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'paddingRight', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'borderLeftWidth', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'borderRightWidth', true)) || 0) +
	       (includeMargins ? hmargins(_element) : 0);
}

function hmargins(_element) {
	return (parseFloat(jQuery.curCSS(_element, 'marginLeft', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'marginRight', true)) || 0);
}

function vsides(_element, includeMargins) {
	return (parseFloat(jQuery.curCSS(_element, 'paddingTop', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'paddingBottom', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'borderTopWidth', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'borderBottomWidth', true)) || 0) +
	       (includeMargins ? vmargins(_element) : 0);
}

function vmargins(_element) {
	return (parseFloat(jQuery.curCSS(_element, 'marginTop', true)) || 0) +
	       (parseFloat(jQuery.curCSS(_element, 'marginBottom', true)) || 0);
}



/* Position Calculation
-----------------------------------------------------------------------------*/
// nasty bugs in opera 9.25
// position()'s top returning incorrectly with TR/TD or elements within TD

var topBug;

function topCorrect(tr) { // tr/th/td or anything else
	if (topBug !== false) {
		var cell;
		if (tr.is('th,td')) {
			tr = (cell = tr).parent();
		}
		if (topBug == undefined && tr.is('tr')) {
			topBug = tr.position().top != tr.children().position().top;
		}
		if (topBug) {
			return tr.parent().position().top + (cell ? tr.position().top - cell.position().top : 0);
		}
	}
	return 0;
}



/* Hover Matrix
-----------------------------------------------------------------------------*/

function HoverMatrix(changeCallback) {

	var t=this,
		tops=[], lefts=[],
		prevRowE, prevColE,
		origRow, origCol,
		currRow, currCol;
	
	t.row = function(e) {
		prevRowE = $(e);
		tops.push(prevRowE.offset().top + topCorrect(prevRowE));
	};
	
	t.col = function(e) {
		prevColE = $(e);
		lefts.push(prevColE.offset().left);
	};

	t.mouse = function(x, y) {
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
				t.cell = null;
			}else{
				if (origRow == undefined) {
					origRow = r;
					origCol = c;
				}
				t.cell = {
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
			changeCallback(t.cell);
		}
	};

}



/* Misc Utils
-----------------------------------------------------------------------------*/

var undefined,
	dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
	arrayPop = Array.prototype.pop;

function zeroPad(n) {
	return (n < 10 ? '0' : '') + n;
}

function smartProperty(obj, name) { // get a camel-cased/namespaced property of an object
	if (obj[name] != undefined) {
		return obj[name];
	}
	var parts = name.split(/(?=[A-Z])/),
		i=parts.length-1, res;
	for (; i>=0; i--) {
		res = obj[parts[i].toLowerCase()];
		if (res != undefined) {
			return res;
		}
	}
	return obj[''];
}

function htmlEscape(s) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&#039;')
		.replace(/"/g, '&quot;')
}



function HorizontalPositionCache(getElement) {

	var t = this,
		elements = {},
		lefts = {},
		rights = {};
		
	function e(i) {
		return elements[i] =
			elements[i] || getElement(i);
	}
	
	t.left = function(i) {
		return lefts[i] =
			lefts[i] == undefined ? e(i).position().left : lefts[i];
	};
	
	t.right = function(i) {
		return rights[i] =
			rights[i] == undefined ? t.left(i) + e(i).width() : rights[i];
	};
	
	t.clear = function() {
		elements = {};
		lefts = {};
		rights = {};
	};
	
}



function cssKey(_element) {
	return _element.id + '/' + _element.className + '/' + _element.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig, '');
}




})(jQuery);