
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
	lazyFetching: true,
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
	},
	
	//selectable: false,
	unselectAuto: true
	
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
};



/* .fullCalendar jQuery function
-----------------------------------------------------------------------------*/

$.fn.fullCalendar = function(options) {

	// method calling
	if (typeof options == 'string') {
		var args = Array.prototype.slice.call(arguments, 1),
			res;
		this.each(function() {
			var data = $.data(this, 'fullCalendar');
			if (data) {
				var meth = data[options];
				if (meth) {
					var r = meth.apply(this, args);
					if (res === undefined) {
						res = r;
					}
				}
			}
		});
		if (res !== undefined) {
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
		(options.isRTL || options.isRTL===undefined && defaults.isRTL) ? rtlDefaults : {},
		options
	);
	var tm = options.theme ? 'ui' : 'fc'; // for making theme classes
	
	
	this.each(function() {
	
	
		/* Instance Initialization
		-----------------------------------------------------------------------------*/
		
		// element
		var _element = this,
			element = $(_element).addClass('fc'),
			elementOuterWidth,
			content = $("<div class='fc-content " + tm + "-widget-content' style='position:relative'/>").prependTo(_element),
			suggestedViewHeight,
			resizeUID = 0,
			ignoreWindowResize = 0,
			date = new Date(),
			viewName,  // the current view name (TODO: look into getting rid of)
			view,      // the current view
			viewInstances = {},
			absoluteViewElement;
			
			
			
		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		if (options.theme) {
			element.addClass('ui-widget');
		}
			
		if (options.year !== undefined && options.year != date.getFullYear()) {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(options.year);
		}
		if (options.month !== undefined && options.month != date.getMonth()) {
			date.setDate(1);
			date.setMonth(options.month);
		}
		if (options.date !== undefined) {
			date.setDate(options.date);
		}
		
		
		
		/* View Rendering
		-----------------------------------------------------------------------------*/
		
		function changeView(v) {
			if (v != viewName) {
				ignoreWindowResize++; // because setMinHeight might change the height before render (and subsequently setSize) is reached

				viewUnselect();
				
				var oldView = view,
					newViewElement;
					
				if (oldView) {
					if (oldView.eventsChanged) {
						eventsDirty();
						oldView.eventDirty = oldView.eventsChanged = false;
					}
					if (oldView.beforeHide) {
						oldView.beforeHide(); // called before changing min-height. if called after, scroll state is reset (in Opera)
					}
					setMinHeight(content, content.height());
					oldView.element.hide();
				}else{
					setMinHeight(content, 1); // needs to be 1 (not 0) for IE7, or else view dimensions miscalculated
				}
				content.css('overflow', 'hidden');
				
				if (viewInstances[v]) {
					(view = viewInstances[v]).element.show();
				}else{
					view = viewInstances[v] = fc.views[v](
						newViewElement = absoluteViewElement =
							$("<div class='fc-view fc-view-" + v + "' style='position:absolute'/>")
								.appendTo(content),
						options
					);
				}
				
				if (header) {
					// update 'active' view button
					header.find('div.fc-button-' + viewName).removeClass(tm + '-state-active');
					header.find('div.fc-button-' + v).addClass(tm + '-state-active');
				}
				
				view.name = viewName = v;
				render(); // after height has been set, will make absoluteViewElement's position=relative, then set to null
				content.css('overflow', '');
				if (oldView) {
					setMinHeight(content, 1);
				}
				if (!newViewElement && view.afterShow) {
					view.afterShow(); // called after setting min-height/overflow, so in final scroll state (for Opera)
				}
				
				ignoreWindowResize--;
			}
		}
		
		
		function render(inc) {
			if (elementVisible()) {
				ignoreWindowResize++; // because view.renderEvents might temporarily change the height before setSize is reached

				viewUnselect();
				
				if (suggestedViewHeight === undefined) {
					calcSize();
				}
				
				if (!view.start || inc || date < view.start || date >= view.end) {
					view.render(date, inc || 0); // responsible for clearing events
					setSize(true);
					if (!eventStart || !options.lazyFetching || view.visStart < eventStart || view.visEnd > eventEnd) {
						fetchAndRenderEvents();
					}else{
						view.renderEvents(events); // don't refetch
					}
				}
				else if (view.sizeDirty || view.eventsDirty || !options.lazyFetching) {
					view.clearEvents();
					if (view.sizeDirty) {
						setSize();
					}
					if (options.lazyFetching) {
						view.renderEvents(events); // don't refetch
					}else{
						fetchAndRenderEvents();
					}
				}
				elementOuterWidth = element.outerWidth();
				view.sizeDirty = false;
				view.eventsDirty = false;
				
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
				
				ignoreWindowResize--;
				view.trigger('viewDisplay', _element);
			}
		}
		
		
		function elementVisible() {
			return _element.offsetWidth !== 0;
		}
		
		function bodyVisible() {
			return $('body')[0].offsetWidth !== 0;
		}

		function viewUnselect() {
			if (view) {
				view.unselect();
			}
		}
		
		
		// called when any event objects have been added/removed/changed, rerenders
		function eventsChanged() {
			eventsDirty();
			if (elementVisible()) {
				view.clearEvents();
				view.renderEvents(events);
				view.eventsDirty = false;
			}
		}
		
		// marks other views' events as dirty
		function eventsDirty() {
			$.each(viewInstances, function() {
				this.eventsDirty = true;
			});
		}
		
		// called when we know the element size has changed
		function sizeChanged() {
			sizesDirty();
			if (elementVisible()) {
				calcSize();
				setSize();
				view.rerenderEvents();
				view.sizeDirty = false;
			}
		}
		
		// marks other views' sizes as dirty
		function sizesDirty() {
			$.each(viewInstances, function() {
				this.sizeDirty = true;
			});
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
					if (!--queued) {
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
		
		
		// for convenience
		function fetchAndRenderEvents() {
			fetchEvents(function(events) {
				view.renderEvents(events); // maintain `this` in view
			});
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
				calcSize();
				sizesDirty();
				eventsDirty();
				render();
			},
			
			changeView: changeView,
			
			getView: function() {
				return view;
			},
			
			getDate: function() {
				return date;
			},
			
			option: function(name, value) {
				if (value === undefined) {
					return options[name];
				}
				if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
					options[name] = value;
					sizeChanged();
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
					if (year !== undefined) {
						date.setFullYear(year);
					}
					if (month !== undefined) {
						date.setMonth(month);
					}
					if (dateNum !== undefined) {
						date.setDate(dateNum);
					}
				}
				render();
			},
			
			incrementDate: function(years, months, days) {
				if (years !== undefined) {
					addYears(date, years);
				}
				if (months !== undefined) {
					addMonths(date, months);
				}
				if (days !== undefined) {
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
			
			rerenderEvents: eventsChanged, // TODO: think of renaming eventsChanged
			
			//
			// Event Source
			//
		
			addEventSource: function(source) {
				eventSources.push(source);
				fetchEventSource(source, eventsChanged);
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
			},
			
			//
			// selection
			//
			
			select: function(start, end, allDay) {
				view.select(start, end, allDay);
			},
			
			unselect: function() {
				view.unselect();
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
									changeView(buttonName);
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
		
		
		function calcSize() {
			if (options.contentHeight) {
				suggestedViewHeight = options.contentHeight;
			}
			else if (options.height) {
				suggestedViewHeight = options.height - (header ? header.height() : 0) - vsides(content[0]);
			}
			else {
				suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
			}
		}
		
		
		function setSize(dateChanged) {
			ignoreWindowResize++;
			view.setHeight(suggestedViewHeight, dateChanged);
			if (absoluteViewElement) {
				absoluteViewElement.css('position', 'relative');
				absoluteViewElement = null;
			}
			view.setWidth(content.width(), dateChanged);
			ignoreWindowResize--;
		}
		
		
		function windowResize() {
			if (!ignoreWindowResize) {
				if (view.start) { // view has already been rendered
					var uid = ++resizeUID;
					setTimeout(function() { // add a delay
						if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
							if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
								ignoreWindowResize++; // in case the windowResize callback changes the height
								sizeChanged();
								view.trigger('windowResize', _element);
								ignoreWindowResize--;
							}
						}
					}, 200);
				}else{
					// calendar must have been initialized in a 0x0 iframe that has just been resized
					lateRender();
				}
			}
		}
		$(window).resize(windowResize);
		
		
		// let's begin...
		changeView(options.defaultView);
		
		
		// needed for IE in a 0x0 iframe, b/c when it is resized, never triggers a windowResize
		if (!bodyVisible()) {
			lateRender();
		}
		
		
		// called when we know the calendar couldn't be rendered when it was initialized,
		// but we think it's ready now
		function lateRender() {
			setTimeout(function() { // IE7 needs this so dimensions are calculated correctly
				if (!view.start && bodyVisible()) { // !view.start makes sure this never happens more than once
					render();
				}
			},0);
		}

	
	});
	
	return this;
	
};



/* Important Event Utilities
-----------------------------------------------------------------------------*/

var fakeID = 0;

function normalizeEvent(event, options) {
	event._id = event._id || (event.id === undefined ? '_fc' + fakeID++ : event.id + '');
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
	if (event.allDay === undefined) {
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

