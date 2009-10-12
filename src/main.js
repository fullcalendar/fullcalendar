
var fc = $.fullCalendar = {};
var views = fc.views = {};


/* Defaults
-----------------------------------------------------------------------------*/

var defaults = {

	// display
	defaultView: 'month',
	aspectRatio: 1.35,
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'month,agendaWeek,agendaDay'
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
		left: 'agendaDay,agendaWeek,month',
		center: 'title',
		right: 'today next,prev'
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
			element = $(this).addClass('fc'),
			content = $("<div class='fc-content " + tm + "-widget-content' style='position:relative'/>").appendTo(this); // relative for ie6
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
		
		function render(inc) {
			if (_element.offsetWidth !== 0) { // visible on the screen
				if (inc || !view.date || +view.date != +date) { // !view.date means it hasn't been rendered yet
					fixContentSize();
					view.render(date, inc || 0, function(callback) {
						// dont refetch if new view contains the same events (or a subset)
						if (!eventStart || view.visStart < eventStart || view.visEnd > eventEnd) {
							fetchEvents(callback);
						}else{
							callback(events); // no refetching
						}
					});
					unfixContentSize();
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
						var buttonName = this;
						if (buttonName == 'title') {
							tr.append("<td><h2 class='fc-header-title'/></td>");
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
								buttonClick = function() { changeView(buttonName) };
							}
							if (buttonClick) {
								if (prevButton) {
									prevButton.addClass(tm + '-no-right');
								}
								var button,
									icon = options.theme ? viewOption(options, 'buttonIcons', buttonName) : null,
									text = viewOption(options, 'buttonText', buttonName);
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
										.click(buttonClick)
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
			contentSizeFixed = false,
			resizeCnt = 0;
		
		function fixContentSize() {
			if (!contentSizeFixed) {
				contentSizeFixed = true;
				content.css({
					overflow: 'hidden',
					height: Math.round(content.width() / options.aspectRatio)
				});
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
		
		$(window).resize(function() {
			if (!contentSizeFixed && view.date) { // view.date means the view has been rendered
				var rcnt = ++resizeCnt; // add a delay
				setTimeout(function() {
					if (rcnt == resizeCnt && !contentSizeFixed) {
						var newWidth = element.width();
						if (newWidth != elementWidth) {
							elementWidth = newWidth;
							fixContentSize();
							view.updateSize();
							unfixContentSize();
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



// TODO: rename

function viewOption(options, property, viewName) {
	var v = options[property];
	if (typeof v == 'object') {
		if (v[viewName] != undefined) {
			return v[viewName];
		}
		var parts = viewName.split(/(?=[A-Z])/),
			i=parts.length-1, res;
		for (; i>=0; i--) {
			res = v[parts[i].toLowerCase()];
			if (res != undefined) {
				return res;
			}
		}
		return v[''];
	}
	return v;
}



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

