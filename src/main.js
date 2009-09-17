
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
	
	// regional
	isRTL: false,
	weekStart: 0,
	monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
	monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
	buttonText: {
		prev: '&#9668;',
		next: '&#9658;',
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
		prev: '&#9658;',
		next: '&#9668;'
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
		var args = Array.prototype.slice.call(arguments, 1), res;
		this.each(function() {
			var r = $.data(this, 'fullCalendar')[options].apply(this, args);
			if (typeof res == 'undefined') res = r;
		});
		if (typeof res != 'undefined') {
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
		(options.isRTL || typeof options.isRTL == 'undefined' && defaults.isRTL) ? rtlDefaults : {},
		options
	);
	var tm = options.theme ? 'ui' : 'fc';
	
	
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
		if (options.year) {
			date.setYear(options.year);
		}
		if (options.month) {
			date.setMonth(options.month);
		}
		if (options.date) {
			date.setDate(options.date);
		}
		
		
		
		/* View Rendering
		-----------------------------------------------------------------------------*/
		
		function switchView(v) {
			if (v != viewName) {
				prevView = view;
				if (viewInstances[v]) {
					(view = viewInstances[v]).element.show();
				}else{
					view = viewInstances[v] = $.fullCalendar.views[v](
						$("<div class='fc-view fc-view-" + v + "'/>").appendTo(content),
						options);
				}
				if (prevView) {
					prevView.element.hide();
					if (prevView.eventsChanged) {
						eventsDirtyExcept(prevView);
						prevView.eventsChanged = false;
					}
				}
				if (header) {
					header.find('div.fc-button-' + viewName).removeClass(tm + '-state-active');
					header.find('div.fc-button-' + v).addClass(tm + '-state-active');
				}
				view.name = viewName = v;
				render();
			}
		}
		
		function render(inc) {
			if (inc || !view.date || +view.date != +date) {
				ignoreResizes = true;
				view.render(date, inc || 0, function(callback) {
					if (!eventStart || view.visStart < eventStart || view.visEnd > eventEnd) {
						fetchEvents(callback);
					}else{
						callback(events);
					}
				});
				ignoreResizes = false;
				view.date = cloneDate(date);
				if (header) {
					var today = new Date();
					if (today >= view.start && today < view.end) {
						header.find('div.fc-button-today').addClass(tm + '-state-disabled');
					}else{
						header.find('div.fc-button-today').removeClass(tm + '-state-disabled');
					}
				}
			}
			else if (view.eventsDirty) {
				view.rerenderEvents();
			}
			if (header) {
				header.find('h2.fc-header-title').html(view.title);
			}
			view.eventsDirty = false;
			view.trigger('viewDisplay', _element);
		}
		
		function eventsDirtyExcept(exceptView) {
			$.each(viewInstances, function() {
				if (this != exceptView) {
					this.eventsDirty = true;
				}
			});
		}
		
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
			var prevDate = cloneDate(date),
				reportEvents = function(a) {
					if (+date == +prevDate) {
						for (var i=0; i<a.length; i++) {
							normalizeEvent(a[i]);
							a[i].source = src;
						}
						events = events.concat(a);
					}
					if (callback) {
						callback(a);
					}
				},
				reportPopEvents = function(a) {
					reportEvents(a);
					popLoading();
				};
			if (typeof src == 'string') {
				var params = {};
				params[options.startParam] = Math.round(eventStart.getTime() / 1000);
				params[options.endParam] = Math.round(eventEnd.getTime() / 1000);
				params[options.cacheParam] = (new Date()).getTime();
				pushLoading();
				$.getJSON(src, params, reportPopEvents);
			}
			else if ($.isFunction(src)) {
				pushLoading();
				src(cloneDate(eventStart), cloneDate(eventEnd), reportPopEvents);
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
				if (typeof year != 'undefined') {
					date.setYear(year);
				}
				if (typeof month != 'undefined') {
					date.setMonth(month);
				}
				if (typeof dateNum != 'undefined') {
					date.setDate(dateNum);
				}
				render();
			},
			
			moveDate: function(years, months, days) {
				if (typeof years != 'undefined') {
					addYears(date, years);
				}
				if (typeof months != 'undefined') {
					addMonths(date, months);
				}
				if (typeof days != 'undefined') {
					addDays(date, days);
				}
				render();
			},
			
			//
			// Event Rendering
			//
			
			updateEvent: function(event) {
				var startDelta = event.start - event._start,
					endDelta = event.end ? (event.end - (event._end || view.defaultEventEnd(event))) : 0,
					i, len = events.length, e;
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
						e.allDay = event.allDay;
						normalizeEvent(e);
					}
				}
				normalizeEvent(event);
				eventsChanged();
			},
			
			renderEvent: function(event, stick) {
				normalizeEvent(event);
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
				else {
					return events;
				}
			},
			
			rerenderEvents: function() {
				view.rerenderEvents();
			},
			
			//
			// Event Source
			//
		
			addEventSource: function(src) {
				eventSources.push(src);
				fetchEventSource(src, function() {
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
				var tr = $("<tr/>"),
					prevTitle = false;
				$.each(buttonStr.split(' '), function(i) {
					if (i > 0) {
						tr.append("<td><span class='fc-header-space'/></td>");
					}
					$.each(this.split(','), function(j) {
						var buttonName = this,
							buttonNameShort = this.replace(/^(basic|agenda)/, '').toLowerCase();
						if (buttonName == 'title') {
							tr.find('> :last div').addClass(tm + '-corner-right');
							tr.append("<td><h2 class='fc-header-title'/></td>");
							prevTitle = true;
						}else{
							var buttonClick;
							if (publicMethods[buttonNameShort]) {
								buttonClick = publicMethods[buttonNameShort];
							}
							else if (views[buttonName]) {
								buttonClick = function() { switchView(buttonName) };
							}
							if (buttonClick) {
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
											switchView(buttonName);
										});
									}
									if (j == 0 || prevTitle) {
										button.addClass(tm + '-corner-left');
									}else{
										button.addClass(tm + '-no-left');
									}
									prevTitle = false;
								}
							}
						}
					});
					tr.find('> :last div').addClass(tm + '-corner-right');
				});
				return $("<table/>").append(tr);
			}
		}
		
		
		
		/* Resizing
		-----------------------------------------------------------------------------*/
		
		var elementWidth,
			ignoreResizes = false,
			resizeCnt = 0;
		
		$(window).resize(function() {
			if (!ignoreResizes) {
				var rcnt = ++resizeCnt; // add a delay
				setTimeout(function() {
					if (rcnt == resizeCnt) {
						var newWidth = element.width();
						if (newWidth != elementWidth) {
							elementWidth = newWidth;
							view.updateSize();
							view.rerenderEvents(true);
							view.trigger('windowResize', _element);
						}
					}
				}, 200);
			}
		});
		
		
		// let's begin...
		switchView(options.defaultView);
		elementWidth = element.width();
	
	});
	
	return this;
	
};



/* Important Event Utilities
-----------------------------------------------------------------------------*/

var fakeID = 0;

function normalizeEvent(event) {
	event._id = event._id || (typeof event.id == 'undefined' ? '_fc' + fakeID++ : event.id + '');
	if (event.date) {
		if (!event.start) {
			event.start = event.date;
		}
		delete event.date;
	}
	event._start = cloneDate(event.start = parseDate(event.start));
	event.end = parseDate(event.end);
	if (event.end && event.end < event.start) {
		event.end = cloneDate(event.start);
	}
	event._end = event.end ? cloneDate(event.end) : null;
	if (typeof event.allDay == 'undefined') {
		event.allDay = true;
	}
}

