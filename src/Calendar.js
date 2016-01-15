
var Calendar = FC.Calendar = Class.extend({

	dirDefaults: null, // option defaults related to LTR or RTL
	langDefaults: null, // option defaults related to current locale
	overrides: null, // option overrides given to the fullCalendar constructor
	options: null, // all defaults combined with overrides
	viewSpecCache: null, // cache of view definitions
	view: null, // current View object
	header: null,
	loadingLevel: 0, // number of simultaneous loading tasks


	// a lot of this class' OOP logic is scoped within this constructor function,
	// but in the future, write individual methods on the prototype.
	constructor: Calendar_constructor,


	// Subclasses can override this for initialization logic after the constructor has been called
	initialize: function() {
	},


	// Initializes `this.options` and other important options-related objects
	initOptions: function(overrides) {
		var lang, langDefaults;
		var isRTL, dirDefaults;

		// converts legacy options into non-legacy ones.
		// in the future, when this is removed, don't use `overrides` reference. make a copy.
		overrides = massageOverrides(overrides);

		lang = overrides.lang;
		langDefaults = langOptionHash[lang];
		if (!langDefaults) {
			lang = Calendar.defaults.lang;
			langDefaults = langOptionHash[lang] || {};
		}

		isRTL = firstDefined(
			overrides.isRTL,
			langDefaults.isRTL,
			Calendar.defaults.isRTL
		);
		dirDefaults = isRTL ? Calendar.rtlDefaults : {};

		this.dirDefaults = dirDefaults;
		this.langDefaults = langDefaults;
		this.overrides = overrides;
		this.options = mergeOptions([ // merge defaults and overrides. lowest to highest precedence
			Calendar.defaults, // global defaults
			dirDefaults,
			langDefaults,
			overrides
		]);
		populateInstanceComputableOptions(this.options);

		this.viewSpecCache = {}; // somewhat unrelated
	},


	// Gets information about how to create a view. Will use a cache.
	getViewSpec: function(viewType) {
		var cache = this.viewSpecCache;

		return cache[viewType] || (cache[viewType] = this.buildViewSpec(viewType));
	},


	// Given a duration singular unit, like "week" or "day", finds a matching view spec.
	// Preference is given to views that have corresponding buttons.
	getUnitViewSpec: function(unit) {
		var viewTypes;
		var i;
		var spec;

		if ($.inArray(unit, intervalUnits) != -1) {

			// put views that have buttons first. there will be duplicates, but oh well
			viewTypes = this.header.getViewsWithButtons();
			$.each(FC.views, function(viewType) { // all views
				viewTypes.push(viewType);
			});

			for (i = 0; i < viewTypes.length; i++) {
				spec = this.getViewSpec(viewTypes[i]);
				if (spec) {
					if (spec.singleUnit == unit) {
						return spec;
					}
				}
			}
		}
	},


	// Builds an object with information on how to create a given view
	buildViewSpec: function(requestedViewType) {
		var viewOverrides = this.overrides.views || {};
		var specChain = []; // for the view. lowest to highest priority
		var defaultsChain = []; // for the view. lowest to highest priority
		var overridesChain = []; // for the view. lowest to highest priority
		var viewType = requestedViewType;
		var spec; // for the view
		var overrides; // for the view
		var duration;
		var unit;

		// iterate from the specific view definition to a more general one until we hit an actual View class
		while (viewType) {
			spec = fcViews[viewType];
			overrides = viewOverrides[viewType];
			viewType = null; // clear. might repopulate for another iteration

			if (typeof spec === 'function') { // TODO: deprecate
				spec = { 'class': spec };
			}

			if (spec) {
				specChain.unshift(spec);
				defaultsChain.unshift(spec.defaults || {});
				duration = duration || spec.duration;
				viewType = viewType || spec.type;
			}

			if (overrides) {
				overridesChain.unshift(overrides); // view-specific option hashes have options at zero-level
				duration = duration || overrides.duration;
				viewType = viewType || overrides.type;
			}
		}

		spec = mergeProps(specChain);
		spec.type = requestedViewType;
		if (!spec['class']) {
			return false;
		}

		if (duration) {
			duration = moment.duration(duration);
			if (duration.valueOf()) { // valid?
				spec.duration = duration;
				unit = computeIntervalUnit(duration);

				// view is a single-unit duration, like "week" or "day"
				// incorporate options for this. lowest priority
				if (duration.as(unit) === 1) {
					spec.singleUnit = unit;
					overridesChain.unshift(viewOverrides[unit] || {});
				}
			}
		}

		spec.defaults = mergeOptions(defaultsChain);
		spec.overrides = mergeOptions(overridesChain);

		this.buildViewSpecOptions(spec);
		this.buildViewSpecButtonText(spec, requestedViewType);

		return spec;
	},


	// Builds and assigns a view spec's options object from its already-assigned defaults and overrides
	buildViewSpecOptions: function(spec) {
		spec.options = mergeOptions([ // lowest to highest priority
			Calendar.defaults, // global defaults
			spec.defaults, // view's defaults (from ViewSubclass.defaults)
			this.dirDefaults,
			this.langDefaults, // locale and dir take precedence over view's defaults!
			this.overrides, // calendar's overrides (options given to constructor)
			spec.overrides // view's overrides (view-specific options)
		]);
		populateInstanceComputableOptions(spec.options);
	},


	// Computes and assigns a view spec's buttonText-related options
	buildViewSpecButtonText: function(spec, requestedViewType) {

		// given an options object with a possible `buttonText` hash, lookup the buttonText for the
		// requested view, falling back to a generic unit entry like "week" or "day"
		function queryButtonText(options) {
			var buttonText = options.buttonText || {};
			return buttonText[requestedViewType] ||
				(spec.singleUnit ? buttonText[spec.singleUnit] : null);
		}

		// highest to lowest priority
		spec.buttonTextOverride =
			queryButtonText(this.overrides) || // constructor-specified buttonText lookup hash takes precedence
			spec.overrides.buttonText; // `buttonText` for view-specific options is a string

		// highest to lowest priority. mirrors buildViewSpecOptions
		spec.buttonTextDefault =
			queryButtonText(this.langDefaults) ||
			queryButtonText(this.dirDefaults) ||
			spec.defaults.buttonText || // a single string. from ViewSubclass.defaults
			queryButtonText(Calendar.defaults) ||
			(spec.duration ? this.humanizeDuration(spec.duration) : null) || // like "3 days"
			requestedViewType; // fall back to given view name
	},


	// Given a view name for a custom view or a standard view, creates a ready-to-go View object
	instantiateView: function(viewType) {
		var spec = this.getViewSpec(viewType);

		return new spec['class'](this, viewType, spec.options, spec.duration);
	},


	// Returns a boolean about whether the view is okay to instantiate at some point
	isValidViewType: function(viewType) {
		return Boolean(this.getViewSpec(viewType));
	},


	// Should be called when any type of async data fetching begins
	pushLoading: function() {
		if (!(this.loadingLevel++)) {
			this.trigger('loading', null, true, this.view);
		}
	},


	// Should be called when any type of async data fetching completes
	popLoading: function() {
		if (!(--this.loadingLevel)) {
			this.trigger('loading', null, false, this.view);
		}
	},


	// Given arguments to the select method in the API, returns a span (unzoned start/end and other info)
	buildSelectSpan: function(zonedStartInput, zonedEndInput) {
		var start = this.moment(zonedStartInput).stripZone();
		var end;

		if (zonedEndInput) {
			end = this.moment(zonedEndInput).stripZone();
		}
		else if (start.hasTime()) {
			end = start.clone().add(this.defaultTimedEventDuration);
		}
		else {
			end = start.clone().add(this.defaultAllDayEventDuration);
		}

		return { start: start, end: end };
	}

});


Calendar.mixin(Emitter);


function Calendar_constructor(element, overrides) {
	var t = this;


	t.initOptions(overrides || {});
	var options = this.options;

	
	// Exports
	// -----------------------------------------------------------------------------------

	t.render = render;
	t.destroy = destroy;
	t.refetchEvents = refetchEvents;
	t.reportEvents = reportEvents;
	t.reportEventChange = reportEventChange;
	t.rerenderEvents = renderEvents; // `renderEvents` serves as a rerender. an API method
	t.changeView = renderView; // `renderView` will switch to another view
	t.select = select;
	t.unselect = unselect;
	t.prev = prev;
	t.next = next;
	t.prevYear = prevYear;
	t.nextYear = nextYear;
	t.today = today;
	t.gotoDate = gotoDate;
	t.incrementDate = incrementDate;
	t.zoomTo = zoomTo;
	t.getDate = getDate;
	t.getCalendar = getCalendar;
	t.getView = getView;
	t.option = option;
	t.trigger = trigger;



	// Language-data Internals
	// -----------------------------------------------------------------------------------
	// Apply overrides to the current language's data


	var localeData = createObject( // make a cheap copy
		getMomentLocaleData(options.lang) // will fall back to en
	);

	if (options.monthNames) {
		localeData._months = options.monthNames;
	}
	if (options.monthNamesShort) {
		localeData._monthsShort = options.monthNamesShort;
	}
	if (options.dayNames) {
		localeData._weekdays = options.dayNames;
	}
	if (options.dayNamesShort) {
		localeData._weekdaysShort = options.dayNamesShort;
	}
	if (options.firstDay != null) {
		var _week = createObject(localeData._week); // _week: { dow: # }
		_week.dow = options.firstDay;
		localeData._week = _week;
	}

	// assign a normalized value, to be used by our .week() moment extension
	localeData._fullCalendar_weekCalc = (function(weekCalc) {
		if (typeof weekCalc === 'function') {
			return weekCalc;
		}
		else if (weekCalc === 'local') {
			return weekCalc;
		}
		else if (weekCalc === 'iso' || weekCalc === 'ISO') {
			return 'ISO';
		}
	})(options.weekNumberCalculation);



	// Calendar-specific Date Utilities
	// -----------------------------------------------------------------------------------


	t.defaultAllDayEventDuration = moment.duration(options.defaultAllDayEventDuration);
	t.defaultTimedEventDuration = moment.duration(options.defaultTimedEventDuration);


	// Builds a moment using the settings of the current calendar: timezone and language.
	// Accepts anything the vanilla moment() constructor accepts.
	t.moment = function() {
		var mom;

		if (options.timezone === 'local') {
			mom = FC.moment.apply(null, arguments);

			// Force the moment to be local, because FC.moment doesn't guarantee it.
			if (mom.hasTime()) { // don't give ambiguously-timed moments a local zone
				mom.local();
			}
		}
		else if (options.timezone === 'UTC') {
			mom = FC.moment.utc.apply(null, arguments); // process as UTC
		}
		else {
			mom = FC.moment.parseZone.apply(null, arguments); // let the input decide the zone
		}

		if ('_locale' in mom) { // moment 2.8 and above
			mom._locale = localeData;
		}
		else { // pre-moment-2.8
			mom._lang = localeData;
		}

		return mom;
	};


	// Returns a boolean about whether or not the calendar knows how to calculate
	// the timezone offset of arbitrary dates in the current timezone.
	t.getIsAmbigTimezone = function() {
		return options.timezone !== 'local' && options.timezone !== 'UTC';
	};


	// Returns a copy of the given date in the current timezone. Has no effect on dates without times.
	t.applyTimezone = function(date) {
		if (!date.hasTime()) {
			return date.clone();
		}

		var zonedDate = t.moment(date.toArray());
		var timeAdjust = date.time() - zonedDate.time();
		var adjustedZonedDate;

		// Safari sometimes has problems with this coersion when near DST. Adjust if necessary. (bug #2396)
		if (timeAdjust) { // is the time result different than expected?
			adjustedZonedDate = zonedDate.clone().add(timeAdjust); // add milliseconds
			if (date.time() - adjustedZonedDate.time() === 0) { // does it match perfectly now?
				zonedDate = adjustedZonedDate;
			}
		}

		return zonedDate;
	};


	// Returns a moment for the current date, as defined by the client's computer or from the `now` option.
	// Will return an moment with an ambiguous timezone.
	t.getNow = function() {
		var now = options.now;
		if (typeof now === 'function') {
			now = now();
		}
		return t.moment(now).stripZone();
	};


	// Get an event's normalized end date. If not present, calculate it from the defaults.
	t.getEventEnd = function(event) {
		if (event.end) {
			return event.end.clone();
		}
		else {
			return t.getDefaultEventEnd(event.allDay, event.start);
		}
	};


	// Given an event's allDay status and start date, return what its fallback end date should be.
	// TODO: rename to computeDefaultEventEnd
	t.getDefaultEventEnd = function(allDay, zonedStart) {
		var end = zonedStart.clone();

		if (allDay) {
			end.stripTime().add(t.defaultAllDayEventDuration);
		}
		else {
			end.add(t.defaultTimedEventDuration);
		}

		if (t.getIsAmbigTimezone()) {
			end.stripZone(); // we don't know what the tzo should be
		}

		return end;
	};


	// Produces a human-readable string for the given duration.
	// Side-effect: changes the locale of the given duration.
	t.humanizeDuration = function(duration) {
		return (duration.locale || duration.lang).call(duration, options.lang) // works moment-pre-2.8
			.humanize();
	};


	
	// Imports
	// -----------------------------------------------------------------------------------


	EventManager.call(t, options);
	var isFetchNeeded = t.isFetchNeeded;
	var fetchEvents = t.fetchEvents;



	// Locals
	// -----------------------------------------------------------------------------------


	var _element = element[0];
	var header;
	var headerElement;
	var content;
	var tm; // for making theme classes
	var currentView; // NOTE: keep this in sync with this.view
	var viewsByType = {}; // holds all instantiated view instances, current or not
	var suggestedViewHeight;
	var windowResizeProxy; // wraps the windowResize function
	var ignoreWindowResize = 0;
	var events = [];
	var date; // unzoned
	
	
	
	// Main Rendering
	// -----------------------------------------------------------------------------------


	// compute the initial ambig-timezone date
	if (options.defaultDate != null) {
		date = t.moment(options.defaultDate).stripZone();
	}
	else {
		date = t.getNow(); // getNow already returns unzoned
	}
	
	
	function render() {
		if (!content) {
			initialRender();
		}
		else if (elementVisible()) {
			// mainly for the public API
			calcSize();
			renderView();
		}
	}
	
	
	function initialRender() {
		tm = options.theme ? 'ui' : 'fc';
		element.addClass('fc');

		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		else {
			element.addClass('fc-ltr');
		}

		if (options.theme) {
			element.addClass('ui-widget');
		}
		else {
			element.addClass('fc-unthemed');
		}

		content = $("<div class='fc-view-container'/>").prependTo(element);

		header = t.header = new Header(t, options);
		headerElement = header.render();
		if (headerElement) {
			element.prepend(headerElement);
		}

		renderView(options.defaultView);

		if (options.handleWindowResize) {
			windowResizeProxy = debounce(windowResize, options.windowResizeDelay); // prevents rapid calls
			$(window).resize(windowResizeProxy);
		}
	}
	
	
	function destroy() {

		if (currentView) {
			currentView.removeElement();

			// NOTE: don't null-out currentView/t.view in case API methods are called after destroy.
			// It is still the "current" view, just not rendered.
		}

		header.removeElement();
		content.remove();
		element.removeClass('fc fc-ltr fc-rtl fc-unthemed ui-widget');

		if (windowResizeProxy) {
			$(window).unbind('resize', windowResizeProxy);
		}
	}
	
	
	function elementVisible() {
		return element.is(':visible');
	}
	
	

	// View Rendering
	// -----------------------------------------------------------------------------------


	// Renders a view because of a date change, view-type change, or for the first time.
	// If not given a viewType, keep the current view but render different dates.
	function renderView(viewType) {
		ignoreWindowResize++;

		// if viewType is changing, remove the old view's rendering
		if (currentView && viewType && currentView.type !== viewType) {
			header.deactivateButton(currentView.type);
			freezeContentHeight(); // prevent a scroll jump when view element is removed
			currentView.removeElement();
			currentView = t.view = null;
		}

		// if viewType changed, or the view was never created, create a fresh view
		if (!currentView && viewType) {
			currentView = t.view =
				viewsByType[viewType] ||
				(viewsByType[viewType] = t.instantiateView(viewType));

			currentView.setElement(
				$("<div class='fc-view fc-" + viewType + "-view' />").appendTo(content)
			);
			header.activateButton(viewType);
		}

		if (currentView) {

			// in case the view should render a period of time that is completely hidden
			date = currentView.massageCurrentDate(date);

			// render or rerender the view
			if (
				!currentView.displaying ||
				!date.isWithin(currentView.intervalStart, currentView.intervalEnd) // implicit date window change
			) {
				if (elementVisible()) {

					currentView.display(date); // will call freezeContentHeight
					unfreezeContentHeight(); // immediately unfreeze regardless of whether display is async

					// need to do this after View::render, so dates are calculated
					updateHeaderTitle();
					updateTodayButton();

					getAndRenderEvents();
				}
			}
		}

		unfreezeContentHeight(); // undo any lone freezeContentHeight calls
		ignoreWindowResize--;
	}

	

	// Resizing
	// -----------------------------------------------------------------------------------


	t.getSuggestedViewHeight = function() {
		if (suggestedViewHeight === undefined) {
			calcSize();
		}
		return suggestedViewHeight;
	};


	t.isHeightAuto = function() {
		return options.contentHeight === 'auto' || options.height === 'auto';
	};
	
	
	function updateSize(shouldRecalc) {
		if (elementVisible()) {

			if (shouldRecalc) {
				_calcSize();
			}

			ignoreWindowResize++;
			currentView.updateSize(true); // isResize=true. will poll getSuggestedViewHeight() and isHeightAuto()
			ignoreWindowResize--;

			return true; // signal success
		}
	}


	function calcSize() {
		if (elementVisible()) {
			_calcSize();
		}
	}
	
	
	function _calcSize() { // assumes elementVisible
		if (typeof options.contentHeight === 'number') { // exists and not 'auto'
			suggestedViewHeight = options.contentHeight;
		}
		else if (typeof options.height === 'number') { // exists and not 'auto'
			suggestedViewHeight = options.height - (headerElement ? headerElement.outerHeight(true) : 0);
		}
		else {
			suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
		}
	}
	
	
	function windowResize(ev) {
		if (
			!ignoreWindowResize &&
			ev.target === window && // so we don't process jqui "resize" events that have bubbled up
			currentView.start // view has already been rendered
		) {
			if (updateSize(true)) {
				currentView.trigger('windowResize', _element);
			}
		}
	}
	
	
	
	/* Event Fetching/Rendering
	-----------------------------------------------------------------------------*/
	// TODO: going forward, most of this stuff should be directly handled by the view


	function refetchEvents() { // can be called as an API method
		destroyEvents(); // so that events are cleared before user starts waiting for AJAX
		fetchAndRenderEvents();
	}


	function renderEvents() { // destroys old events if previously rendered
		if (elementVisible()) {
			freezeContentHeight();
			currentView.displayEvents(events);
			unfreezeContentHeight();
		}
	}


	function destroyEvents() {
		freezeContentHeight();
		currentView.clearEvents();
		unfreezeContentHeight();
	}
	

	function getAndRenderEvents() {
		if (!options.lazyFetching || isFetchNeeded(currentView.start, currentView.end)) {
			fetchAndRenderEvents();
		}
		else {
			renderEvents();
		}
	}


	function fetchAndRenderEvents() {
		fetchEvents(currentView.start, currentView.end);
			// ... will call reportEvents
			// ... which will call renderEvents
	}

	
	// called when event data arrives
	function reportEvents(_events) {
		events = _events;
		renderEvents();
	}


	// called when a single event's data has been changed
	function reportEventChange() {
		renderEvents();
	}



	/* Header Updating
	-----------------------------------------------------------------------------*/


	function updateHeaderTitle() {
		header.updateTitle(currentView.title);
	}


	function updateTodayButton() {
		var now = t.getNow();
		if (now.isWithin(currentView.intervalStart, currentView.intervalEnd)) {
			header.disableButton('today');
		}
		else {
			header.enableButton('today');
		}
	}
	


	/* Selection
	-----------------------------------------------------------------------------*/
	

	// this public method receives start/end dates in any format, with any timezone
	function select(zonedStartInput, zonedEndInput) {
		currentView.select(
			t.buildSelectSpan.apply(t, arguments)
		);
	}
	

	function unselect() { // safe to be called before renderView
		if (currentView) {
			currentView.unselect();
		}
	}
	
	
	
	/* Date
	-----------------------------------------------------------------------------*/
	
	
	function prev() {
		date = currentView.computePrevDate(date);
		renderView();
	}
	
	
	function next() {
		date = currentView.computeNextDate(date);
		renderView();
	}
	
	
	function prevYear() {
		date.add(-1, 'years');
		renderView();
	}
	
	
	function nextYear() {
		date.add(1, 'years');
		renderView();
	}
	
	
	function today() {
		date = t.getNow();
		renderView();
	}
	
	
	function gotoDate(zonedDateInput) {
		date = t.moment(zonedDateInput).stripZone();
		renderView();
	}
	
	
	function incrementDate(delta) {
		date.add(moment.duration(delta));
		renderView();
	}


	// Forces navigation to a view for the given date.
	// `viewType` can be a specific view name or a generic one like "week" or "day".
	function zoomTo(newDate, viewType) {
		var spec;

		viewType = viewType || 'day'; // day is default zoom
		spec = t.getViewSpec(viewType) || t.getUnitViewSpec(viewType);

		date = newDate.clone();
		renderView(spec ? spec.type : null);
	}
	
	
	// for external API
	function getDate() {
		return t.applyTimezone(date); // infuse the calendar's timezone
	}



	/* Height "Freezing"
	-----------------------------------------------------------------------------*/
	// TODO: move this into the view

	t.freezeContentHeight = freezeContentHeight;
	t.unfreezeContentHeight = unfreezeContentHeight;


	function freezeContentHeight() {
		content.css({
			width: '100%',
			height: content.height(),
			overflow: 'hidden'
		});
	}


	function unfreezeContentHeight() {
		content.css({
			width: '',
			height: '',
			overflow: ''
		});
	}
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	

	function getCalendar() {
		return t;
	}

	
	function getView() {
		return currentView;
	}
	
	
	function option(name, value) {
		if (value === undefined) {
			return options[name];
		}
		if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
			options[name] = value;
			updateSize(true); // true = allow recalculation of height
		}
	}
	
	
	function trigger(name, thisObj) { // overrides the Emitter's trigger method :(
		var args = Array.prototype.slice.call(arguments, 2);

		thisObj = thisObj || _element;
		this.triggerWith(name, thisObj, args); // Emitter's method

		if (options[name]) {
			return options[name].apply(thisObj, args);
		}
	}

	t.initialize();
}
