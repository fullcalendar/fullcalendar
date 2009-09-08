
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
		right: 'month,basicWeek,basicDay'
	},
	
	// event ajax
	startParam: 'start',
	endParam: 'end',
	cacheParam: '_',
	
	// time formats
	eventTimeFormat: 'h(:mm)t',
	titleFormat: {
		month: 'MMMM yyyy',
		week: "MMM d[ yyyy]{ '&#8212;' [MMM ]d yyyy}",
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
		left: 'basicDay,basicWeek,month',
		center: 'title',
		right: 'today next,prev'
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
			view.trigger('viewDisplay', _element, date);
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
				reportEvents = function(a, dontPopLoading) {
					if (+date == +prevDate) {
						for (var i=0; i<a.length; i++) {
							normalizeEvent(a[i]);
							a[i].source = src;
						}
						events = events.concat(a);
					}
					if (!dontPopLoading) {
						popLoading();
					}
					if (callback) {
						callback(a);
					}
				};
			if (typeof src == 'string') {
				var params = {};
				params[options.startParam] = Math.round(eventStart.getTime() / 1000);
				params[options.endParam] = Math.round(eventEnd.getTime() / 1000);
				params[options.cacheParam] = (new Date()).getTime();
				pushLoading();
				$.getJSON(src, params, reportEvents);
			}
			else if ($.isFunction(src)) {
				pushLoading();
				src(cloneDate(eventStart), cloneDate(eventEnd), reportEvents);
			}
			else {
				reportEvents(src, true); // src is an array
			}
		}
		
		
		
		/* Loading State
		-----------------------------------------------------------------------------*/
		
		var loadingLevel = 0;
		
		function pushLoading() {
			if (!loadingLevel++ && options.loading) {
				options.loading(true);
			}
		}
		
		function popLoading() {
			if (!--loadingLevel && options.loading) {
				options.loading(false);
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
			
			//
			// Event Rendering
			//
			
			renderEvent: function(event, stick) {
				if (typeof event != 'object') {
					event = eventsByID(event)[0]; // assumed to be ID
					if (!event) return;
				}else{
					normalizeEvent(event);
				}
				var startDelta = event.start - event._start,
					msDuration = event.end - event.start,
					i, len = events.length, e,
					found = false;
				for (i=0; i<len; i++) {
					e = events[i];
					if (e._id == event._id) {
						if (e != event) {
							e._start = cloneDate(e.start = new Date(+e.start + startDelta));
							e.end = new Date(+e.start + msDuration);
							e.title = event.title;
							e.hasTime = event.hasTime;
							if (stick && !event.source) {
								(event.source = eventSources[0]).push(event);
							}
						}
						found = true;
					}
				}
				if (!found) {
					events.push(event);
				}
				eventsChanged();
			},
			
			removeEvent: function(id) {
				if (typeof id == 'object') {
					id = id._id;
				}else{
					id += '';
				}
				removeEvents(function(e) {
					return e._id != id;
				});
			},
			
			clientEvents: function(filter) {
				if (filter) {
					return filterArray(events, filter);
				}else{
					return events;
				}
			},
			
			clientEventsByID: eventsByID,
			removeEvents: removeEvents,
			
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
				eventSources = filterArray(eventSources, function(src) {
					return src != source;
				});
				// remove all client events from that source
				events = filterArray(events, function(e) {
					return e.source != source;
				});
				eventsChanged();
			}
			
		};
		
		$.data(this, 'fullCalendar', publicMethods);
		
		function eventsByID(id) {
			id += '';
			return filterArray(events, function(e) {
				e._id == id;
			});
		}
		
		function removeEvents(filter) {
			var i, len = eventSources.length;
			if (filter) {
				events = filterArray(events, function(e) {
					return !filter(e);
				});
				// remove events from array sources
				for (i=0; i<len; i++) {
					if (typeof eventSources[i] == 'object') {
						eventSources[i] = filterArray(eventSources[i], function(e) {
							return !filter(e);
						});
					}
				}
			}else{
				events = [];
				// clear all array sources
				for (i=0; i<len; i++) {
					if (typeof eventSources[i] == 'object') {
						eventSources[i] = [];
					}
				}
			}
			eventsChanged();
		}
		
		
		
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
									.hover(function() {
										button.addClass(tm + '-state-hover');
									},
									function() {
										button.removeClass(tm + '-state-hover')
											.removeClass(tm + '-state-down');
									})
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
	
};



/* Important Event Utilities
-----------------------------------------------------------------------------*/

var fakeID = 0;

function normalizeEvent(event) {
	event._id = event._id || (typeof event.id == 'undefined' ? '_fc' + fakeID++ : event.id + '');
	event._start = cloneDate(event.start = parseDate(event.start));
	event.end = parseDate(event.end);
}

