
 
function Calendar(element, options, eventSources) {
	var t = this;
	
	
	// exports
	t.options = options;
	t.render = render;
	t.destroy = destroy;
	t.refetchEvents = refetchEvents;
	t.reportEvents = reportEvents;
	t.reportEventChange = reportEventChange;
	t.rerenderEvents = rerenderEvents;
	t.changeView = changeView;
	t.select = select;
	t.unselect = unselect;
	t.prev = prev;
	t.next = next;
	t.prevYear = prevYear;
	t.nextYear = nextYear;
	t.today = today;
	t.gotoDate = gotoDate;
	t.incrementDate = incrementDate;
	t.formatDate = function(format, date) { return formatDate(format, date, options) };
	t.formatDates = function(format, date1, date2) { return formatDates(format, date1, date2, options) };
	t.getDate = getDate;
	t.getView = getView;
	t.option = option;
	t.trigger = trigger;
	
	
	// imports
	EventManager.call(t, options, eventSources);
	var isFetchNeeded = t.isFetchNeeded;
	var fetchEvents = t.fetchEvents;
	
	
	// locals
	var _element = element[0];
	var header;
	var headerElement;
	var content;
	var tm; // for making theme classes
	var currentView;
	var viewInstances = {};
	var elementOuterWidth;
	var suggestedViewHeight;
	var absoluteViewElement;
	var resizeUID = 0;
	var ignoreWindowResize = 0;
	var date = new Date();
	var events = [];
	var _dragElement;
	
	
	
	/* Main Rendering
	-----------------------------------------------------------------------------*/
	
	
	setYMD(date, options.year, options.month, options.date);
	
	
	function render(inc) {
		if (!content) {
			initialRender();
		}else{
			calcSize();
			markSizesDirty();
			markEventsDirty();
			renderView(inc);
		}
	}
	
	
	function initialRender() {
		tm = options.theme ? 'ui' : 'fc';
		element.addClass('fc');
		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		if (options.theme) {
			element.addClass('ui-widget');
		}
		content = $("<div class='fc-content' style='position:relative'/>")
			.prependTo(element);
		header = new Header(t, options);
		headerElement = header.render();
		if (headerElement) {
			element.prepend(headerElement);
		}
		changeView(options.defaultView);
		$(window).resize(windowResize);
		// needed for IE in a 0x0 iframe, b/c when it is resized, never triggers a windowResize
		if (!bodyVisible()) {
			lateRender();
		}
	}
	
	
	// called when we know the calendar couldn't be rendered when it was initialized,
	// but we think it's ready now
	function lateRender() {
		setTimeout(function() { // IE7 needs this so dimensions are calculated correctly
			if (!currentView.start && bodyVisible()) { // !currentView.start makes sure this never happens more than once
				renderView();
			}
		},0);
	}
	
	
	function destroy() {
		$(window).unbind('resize', windowResize);
		header.destroy();
		content.remove();
		element.removeClass('fc fc-rtl ui-widget');
	}
	
	
	
	function elementVisible() {
		return _element.offsetWidth !== 0;
	}
	
	
	function bodyVisible() {
		return $('body')[0].offsetWidth !== 0;
	}
	
	
	
	/* View Rendering
	-----------------------------------------------------------------------------*/
	
	// TODO: improve view switching (still weird transition in IE, and FF has whiteout problem)
	
	function changeView(newViewName) {
		if (!currentView || newViewName != currentView.name) {
			ignoreWindowResize++; // because setMinHeight might change the height before render (and subsequently setSize) is reached

			unselect();
			
			var oldView = currentView;
			var newViewElement;
				
			if (oldView) {
				(oldView.beforeHide || noop)(); // called before changing min-height. if called after, scroll state is reset (in Opera)
				setMinHeight(content, content.height());
				oldView.element.hide();
			}else{
				setMinHeight(content, 1); // needs to be 1 (not 0) for IE7, or else view dimensions miscalculated
			}
			content.css('overflow', 'hidden');
			
			currentView = viewInstances[newViewName];
			if (currentView) {
				currentView.element.show();
			}else{
				currentView = viewInstances[newViewName] = new fcViews[newViewName](
					newViewElement = absoluteViewElement =
						$("<div class='fc-view fc-view-" + newViewName + "' style='position:absolute'/>")
							.appendTo(content),
					t // the calendar object
				);
			}
			
			if (oldView) {
				header.deactivateButton(oldView.name);
			}
			header.activateButton(newViewName);
			
			renderView(); // after height has been set, will make absoluteViewElement's position=relative, then set to null
			
			content.css('overflow', '');
			if (oldView) {
				setMinHeight(content, 1);
			}
			
			if (!newViewElement) {
				(currentView.afterShow || noop)(); // called after setting min-height/overflow, so in final scroll state (for Opera)
			}
			
			ignoreWindowResize--;
		}
	}
	
	
	
	function renderView(inc) {
		if (elementVisible()) {
			ignoreWindowResize++; // because renderEvents might temporarily change the height before setSize is reached

			unselect();
			
			if (suggestedViewHeight === undefined) {
				calcSize();
			}
			
			var forceEventRender = false;
			if (!currentView.start || inc || date < currentView.start || date >= currentView.end) {
				// view must render an entire new date range (and refetch/render events)
				currentView.render(date, inc || 0); // responsible for clearing events
				setSize(true);
				forceEventRender = true;
			}
			else if (currentView.sizeDirty) {
				// view must resize (and rerender events)
				currentView.clearEvents();
				setSize();
				forceEventRender = true;
			}
			else if (currentView.eventsDirty) {
				currentView.clearEvents();
				forceEventRender = true;
			}
			currentView.sizeDirty = false;
			currentView.eventsDirty = false;
			updateEvents(forceEventRender);
			
			elementOuterWidth = element.outerWidth();
			
			header.updateTitle(currentView.title);
			var today = new Date();
			if (today >= currentView.start && today < currentView.end) {
				header.disableButton('today');
			}else{
				header.enableButton('today');
			}
			
			ignoreWindowResize--;
			currentView.trigger('viewDisplay', _element);
		}
	}
	
	
	
	/* Resizing
	-----------------------------------------------------------------------------*/
	
	
	function updateSize() {
		markSizesDirty();
		if (elementVisible()) {
			calcSize();
			setSize();
			unselect();
			currentView.clearEvents();
			currentView.renderEvents(events);
			currentView.sizeDirty = false;
		}
	}
	
	
	function markSizesDirty() {
		$.each(viewInstances, function(i, inst) {
			inst.sizeDirty = true;
		});
	}
	
	
	function calcSize() {
		if (options.contentHeight) {
			suggestedViewHeight = options.contentHeight;
		}
		else if (options.height) {
			suggestedViewHeight = options.height - (headerElement ? headerElement.height() : 0) - vsides(content);
		}
		else {
			suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
		}
	}
	
	
	function setSize(dateChanged) { // todo: dateChanged?
		ignoreWindowResize++;
		currentView.setHeight(suggestedViewHeight, dateChanged);
		if (absoluteViewElement) {
			absoluteViewElement.css('position', 'relative');
			absoluteViewElement = null;
		}
		currentView.setWidth(content.width(), dateChanged);
		ignoreWindowResize--;
	}
	
	
	function windowResize() {
		if (!ignoreWindowResize) {
			if (currentView.start) { // view has already been rendered
				var uid = ++resizeUID;
				setTimeout(function() { // add a delay
					if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
						if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
							ignoreWindowResize++; // in case the windowResize callback changes the height
							updateSize();
							currentView.trigger('windowResize', _element);
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
	
	
	
	/* Event Fetching/Rendering
	-----------------------------------------------------------------------------*/
	
	
	// fetches events if necessary, rerenders events if necessary (or if forced)
	function updateEvents(forceRender) {
		if (!options.lazyFetching || isFetchNeeded(currentView.visStart, currentView.visEnd)) {
			refetchEvents();
		}
		else if (forceRender) {
			rerenderEvents();
		}
	}
	
	
	function refetchEvents() {
		fetchEvents(currentView.visStart, currentView.visEnd); // will call reportEvents
	}
	
	
	// called when event data arrives
	function reportEvents(_events) {
		events = _events;
		rerenderEvents();
	}
	
	
	// called when a single event's data has been changed
	function reportEventChange(eventID) {
		rerenderEvents(eventID);
	}
	
	
	// attempts to rerenderEvents
	function rerenderEvents(modifiedEventID) {
		markEventsDirty();
		if (elementVisible()) {
			currentView.clearEvents();
			currentView.renderEvents(events, modifiedEventID);
			currentView.eventsDirty = false;
		}
	}
	
	
	function markEventsDirty() {
		$.each(viewInstances, function(i, inst) {
			inst.eventsDirty = true;
		});
	}
	


	/* Selection
	-----------------------------------------------------------------------------*/
	

	function select(start, end, allDay) {
		currentView.select(start, end, allDay===undefined ? true : allDay);
	}
	

	function unselect() { // safe to be called before renderView
		if (currentView) {
			currentView.unselect();
		}
	}
	
	
	
	/* Date
	-----------------------------------------------------------------------------*/
	
	
	function prev() {
		renderView(-1);
	}
	
	
	function next() {
		renderView(1);
	}
	
	
	function prevYear() {
		addYears(date, -1);
		renderView();
	}
	
	
	function nextYear() {
		addYears(date, 1);
		renderView();
	}
	
	
	function today() {
		date = new Date();
		renderView();
	}
	
	
	function gotoDate(year, month, dateOfMonth) {
		if (year instanceof Date) {
			date = cloneDate(year); // provided 1 argument, a Date
		}else{
			setYMD(date, year, month, dateOfMonth);
		}
		renderView();
	}
	
	
	function incrementDate(years, months, days) {
		if (years !== undefined) {
			addYears(date, years);
		}
		if (months !== undefined) {
			addMonths(date, months);
		}
		if (days !== undefined) {
			addDays(date, days);
		}
		renderView();
	}
	
	
	function getDate() {
		return cloneDate(date);
	}
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	
	
	function getView() {
		return currentView;
	}
	
	
	function option(name, value) {
		if (value === undefined) {
			return options[name];
		}
		if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
			options[name] = value;
			updateSize();
		}
	}
	
	
	function trigger(name, thisObj) {
		if (options[name]) {
			return options[name].apply(
				thisObj || _element,
				Array.prototype.slice.call(arguments, 2)
			);
		}
	}
	
	
	
	/* External Dragging
	------------------------------------------------------------------------*/
	
	if (options.droppable) {
		$(document)
			.bind('dragstart', function(ev, ui) {
				var _e = ev.target;
				var e = $(_e);
				if (!e.parents('.fc').length) { // not already inside a calendar
					var accept = options.dropAccept;
					if ($.isFunction(accept) ? accept.call(_e, e) : e.is(accept)) {
						_dragElement = _e;
						currentView.dragStart(_dragElement, ev, ui);
					}
				}
			})
			.bind('dragstop', function(ev, ui) {
				if (_dragElement) {
					currentView.dragStop(_dragElement, ev, ui);
					_dragElement = null;
				}
			});
	}
	

}
