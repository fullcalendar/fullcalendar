
/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/

var View = FC.View = Class.extend(EmitterMixin, ListenerMixin, {

	type: null, // subclass' view name (string)
	name: null, // deprecated. use `type` instead
	title: null, // the text that will be displayed in the header's title

	calendar: null, // owner Calendar object
	options: null, // hash containing all options. already merged with view-specific-options
	el: null, // the view's containing element. set by Calendar

	isDateSet: false,
	isDateRendered: false,
	dateRenderQueue: null,

	isEventsBound: false,
	isEventsSet: false,
	isEventsRendered: false,
	eventRenderQueue: null,

	// range the view is actually displaying (moments)
	start: null,
	end: null, // exclusive

	// range the view is formally responsible for (moments)
	// may be different from start/end. for example, a month view might have 1st-31st, excluding padded dates
	intervalStart: null,
	intervalEnd: null, // exclusive
	intervalDuration: null,
	intervalUnit: null, // name of largest unit being displayed, like "month" or "week"

	isRTL: false,
	isSelected: false, // boolean whether a range of time is user-selected or not
	selectedEvent: null,

	eventOrderSpecs: null, // criteria for ordering events when they have same date/time

	// classNames styled by jqui themes
	widgetHeaderClass: null,
	widgetContentClass: null,
	highlightStateClass: null,

	// for date utils, computed from options
	nextDayThreshold: null,
	isHiddenDayHash: null,

	// now indicator
	isNowIndicatorRendered: null,
	initialNowDate: null, // result first getNow call
	initialNowQueriedMs: null, // ms time the getNow was called
	nowIndicatorTimeoutID: null, // for refresh timing of now indicator
	nowIndicatorIntervalID: null, // "


	constructor: function(calendar, type, options, intervalDuration) {

		this.calendar = calendar;
		this.type = this.name = type; // .name is deprecated
		this.options = options;
		this.intervalDuration = intervalDuration || moment.duration(1, 'day');

		this.nextDayThreshold = moment.duration(this.opt('nextDayThreshold'));
		this.initThemingProps();
		this.initHiddenDays();
		this.isRTL = this.opt('isRTL');

		this.eventOrderSpecs = parseFieldSpecs(this.opt('eventOrder'));

		this.dateRenderQueue = new TaskQueue();
		this.eventRenderQueue = new TaskQueue(this.opt('eventRenderWait'));

		this.initialize();
	},


	// A good place for subclasses to initialize member variables
	initialize: function() {
		// subclasses can implement
	},


	// Retrieves an option with the given name
	opt: function(name) {
		return this.options[name];
	},


	// Triggers handlers that are view-related. Modifies args before passing to calendar.
	publiclyTrigger: function(name, thisObj) { // arguments beyond thisObj are passed along
		var calendar = this.calendar;

		return calendar.publiclyTrigger.apply(
			calendar,
			[name, thisObj || this].concat(
				Array.prototype.slice.call(arguments, 2), // arguments beyond thisObj
				[ this ] // always make the last argument a reference to the view. TODO: deprecate
			)
		);
	},


	// Returns a proxy of the given promise that will be rejected if the given event fires
	// before the promise resolves.
	rejectOn: function(eventName, promise) {
		var _this = this;

		return new Promise(function(resolve, reject) {
			_this.one(eventName, reject);

			function cleanup() {
				_this.off(eventName, reject);
			}

			promise.then(function(res) { // success
				cleanup();
				resolve(res);
			}, function() { // failure
				cleanup();
				reject();
			});
		});
	},


	/* Date Computation
	------------------------------------------------------------------------------------------------------------------*/


	// Updates all internal dates for displaying the given unzoned range.
	setRange: function(range) {
		$.extend(this, range); // assigns every property to this object's member variables
		this.updateTitle();
	},


	// Given a single current unzoned date, produce information about what range to display.
	// Subclasses can override. Must return all properties.
	computeRange: function(date) {
		var intervalUnit = computeIntervalUnit(this.intervalDuration);
		var intervalStart = date.clone().startOf(intervalUnit);
		var intervalEnd = intervalStart.clone().add(this.intervalDuration);
		var start, end;

		// normalize the range's time-ambiguity
		if (/year|month|week|day/.test(intervalUnit)) { // whole-days?
			intervalStart.stripTime();
			intervalEnd.stripTime();
		}
		else { // needs to have a time?
			if (!intervalStart.hasTime()) {
				intervalStart = this.calendar.time(0); // give 00:00 time
			}
			if (!intervalEnd.hasTime()) {
				intervalEnd = this.calendar.time(0); // give 00:00 time
			}
		}

		start = intervalStart.clone();
		start = this.skipHiddenDays(start);
		end = intervalEnd.clone();
		end = this.skipHiddenDays(end, -1, true); // exclusively move backwards

		return {
			intervalUnit: intervalUnit,
			intervalStart: intervalStart,
			intervalEnd: intervalEnd,
			start: start,
			end: end
		};
	},


	// Computes the new date when the user hits the prev button, given the current date
	computePrevDate: function(date) {
		return this.massageCurrentDate(
			date.clone().startOf(this.intervalUnit).subtract(this.intervalDuration), -1
		);
	},


	// Computes the new date when the user hits the next button, given the current date
	computeNextDate: function(date) {
		return this.massageCurrentDate(
			date.clone().startOf(this.intervalUnit).add(this.intervalDuration)
		);
	},


	// Given an arbitrarily calculated current date of the calendar, returns a date that is ensured to be completely
	// visible. `direction` is optional and indicates which direction the current date was being
	// incremented or decremented (1 or -1).
	massageCurrentDate: function(date, direction) {
		if (this.intervalDuration.as('days') <= 1) { // if the view displays a single day or smaller
			if (this.isHiddenDay(date)) {
				date = this.skipHiddenDays(date, direction);
				date.startOf('day');
			}
		}

		return date;
	},


	/* Title and Date Formatting
	------------------------------------------------------------------------------------------------------------------*/


	// Sets the view's title property to the most updated computed value
	updateTitle: function() {
		this.title = this.computeTitle();
		this.calendar.setToolbarsTitle(this.title);
	},


	// Computes what the title at the top of the calendar should be for this view
	computeTitle: function() {
		var start, end;

		// for views that span a large unit of time, show the proper interval, ignoring stray days before and after
		if (this.intervalUnit === 'year' || this.intervalUnit === 'month') {
			start = this.intervalStart;
			end = this.intervalEnd;
		}
		else { // for day units or smaller, use the actual day range
			start = this.start;
			end = this.end;
		}

		return this.formatRange(
			{
				// in case intervalStart/End has a time, make sure timezone is correct
				start: this.calendar.applyTimezone(start),
				end: this.calendar.applyTimezone(end)
			},
			this.opt('titleFormat') || this.computeTitleFormat(),
			this.opt('titleRangeSeparator')
		);
	},


	// Generates the format string that should be used to generate the title for the current date range.
	// Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
	computeTitleFormat: function() {
		if (this.intervalUnit == 'year') {
			return 'YYYY';
		}
		else if (this.intervalUnit == 'month') {
			return this.opt('monthYearFormat'); // like "September 2014"
		}
		else if (this.intervalDuration.as('days') > 1) {
			return 'll'; // multi-day range. shorter, like "Sep 9 - 10 2014"
		}
		else {
			return 'LL'; // one day. longer, like "September 9 2014"
		}
	},


	// Utility for formatting a range. Accepts a range object, formatting string, and optional separator.
	// Displays all-day ranges naturally, with an inclusive end. Takes the current isRTL into account.
	// The timezones of the dates within `range` will be respected.
	formatRange: function(range, formatStr, separator) {
		var end = range.end;

		if (!end.hasTime()) { // all-day?
			end = end.clone().subtract(1); // convert to inclusive. last ms of previous day
		}

		return formatRange(range.start, end, formatStr, separator, this.opt('isRTL'));
	},


	getAllDayHtml: function() {
		return this.opt('allDayHtml') || htmlEscape(this.opt('allDayText'));
	},


	/* Navigation
	------------------------------------------------------------------------------------------------------------------*/


	// Generates HTML for an anchor to another view into the calendar.
	// Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
	// `gotoOptions` can either be a moment input, or an object with the form:
	// { date, type, forceOff }
	// `type` is a view-type like "day" or "week". default value is "day".
	// `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
	buildGotoAnchorHtml: function(gotoOptions, attrs, innerHtml) {
		var date, type, forceOff;
		var finalOptions;

		if ($.isPlainObject(gotoOptions)) {
			date = gotoOptions.date;
			type = gotoOptions.type;
			forceOff = gotoOptions.forceOff;
		}
		else {
			date = gotoOptions; // a single moment input
		}
		date = FC.moment(date); // if a string, parse it

		finalOptions = { // for serialization into the link
			date: date.format('YYYY-MM-DD'),
			type: type || 'day'
		};

		if (typeof attrs === 'string') {
			innerHtml = attrs;
			attrs = null;
		}

		attrs = attrs ? ' ' + attrsToStr(attrs) : ''; // will have a leading space
		innerHtml = innerHtml || '';

		if (!forceOff && this.opt('navLinks')) {
			return '<a' + attrs +
				' data-goto="' + htmlEscape(JSON.stringify(finalOptions)) + '">' +
				innerHtml +
				'</a>';
		}
		else {
			return '<span' + attrs + '>' +
				innerHtml +
				'</span>';
		}
	},


	// Rendering Non-date-related Content
	// -----------------------------------------------------------------------------------------------------------------


	// Sets the container element that the view should render inside of, does global DOM-related initializations,
	// and renders all the non-date-related content inside.
	setElement: function(el) {
		this.el = el;
		this.bindGlobalHandlers();
		this.renderSkeleton();
	},


	// Removes the view's container element from the DOM, clearing any content beforehand.
	// Undoes any other DOM-related attachments.
	removeElement: function() {
		this.unsetDate();
		this.unrenderSkeleton();

		this.unbindGlobalHandlers();

		this.el.remove();
		// NOTE: don't null-out this.el in case the View was destroyed within an API callback.
		// We don't null-out the View's other jQuery element references upon destroy,
		//  so we shouldn't kill this.el either.
	},


	// Renders the basic structure of the view before any content is rendered
	renderSkeleton: function() {
		// subclasses should implement
	},


	// Unrenders the basic structure of the view
	unrenderSkeleton: function() {
		// subclasses should implement
	},


	// Date Setting/Unsetting
	// -----------------------------------------------------------------------------------------------------------------


	setDate: function(date) {
		var isReset = this.isDateSet;

		this.isDateSet = true;
		this.handleDate(date, isReset);
		this.trigger(isReset ? 'dateReset' : 'dateSet', date);
	},


	unsetDate: function() {
		if (this.isDateSet) {
			this.isDateSet = false;
			this.handleDateUnset();
			this.trigger('dateUnset');
		}
	},


	// Date Handling
	// -----------------------------------------------------------------------------------------------------------------


	handleDate: function(date, isReset) {
		var _this = this;

		this.unbindEvents(); // will do nothing if not already bound
		this.requestDateRender(date).then(function() {
			// wish we could start earlier, but setRange/computeRange needs to execute first
			_this.bindEvents(); // will request events
		});
	},


	handleDateUnset: function() {
		this.unbindEvents();
		this.requestDateUnrender();
	},


	// Date Render Queuing
	// -----------------------------------------------------------------------------------------------------------------


	// if date not specified, uses current
	requestDateRender: function(date) {
		var _this = this;

		return this.dateRenderQueue.add(function() {
			return _this.executeDateRender(date);
		});
	},


	requestDateUnrender: function() {
		var _this = this;

		return this.dateRenderQueue.add(function() {
			return _this.executeDateUnrender();
		});
	},


	// Date High-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	// if date not specified, uses current
	executeDateRender: function(date) {
		var _this = this;

		// if rendering a new date, reset scroll to initial state (scrollTime)
		if (date) {
			this.captureInitialScroll();
		}
		else {
			this.captureScroll(); // a rerender of the current date
		}

		this.freezeHeight();

		return this.executeDateUnrender().then(function() {

			if (date) {
				_this.setRange(_this.computeRange(date));
			}

			if (_this.render) {
				_this.render(); // TODO: deprecate
			}

			_this.renderDates();
			_this.updateSize();
			_this.renderBusinessHours(); // might need coordinates, so should go after updateSize()
			_this.startNowIndicator();

			_this.thawHeight();
			_this.releaseScroll();

			_this.isDateRendered = true;
			_this.onDateRender();
			_this.trigger('dateRender');
		});
	},


	executeDateUnrender: function() {
		var _this = this;

		if (_this.isDateRendered) {
			return this.requestEventsUnrender().then(function() {

				_this.unselect();
				_this.stopNowIndicator();
				_this.triggerUnrender();
				_this.unrenderBusinessHours();
				_this.unrenderDates();

				if (_this.destroy) {
					_this.destroy(); // TODO: deprecate
				}

				_this.isDateRendered = false;
				_this.trigger('dateUnrender');
			});
		}
		else {
			return Promise.resolve();
		}
	},


	// Date Rendering Triggers
	// -----------------------------------------------------------------------------------------------------------------


	onDateRender: function() {
		this.triggerRender();
	},


	// Date Low-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	// date-cell content only
	renderDates: function() {
		// subclasses should implement
	},


	// date-cell content only
	unrenderDates: function() {
		// subclasses should override
	},


	// Misc view rendering utils
	// -------------------------


	// Signals that the view's content has been rendered
	triggerRender: function() {
		this.publiclyTrigger('viewRender', this, this, this.el);
	},


	// Signals that the view's content is about to be unrendered
	triggerUnrender: function() {
		this.publiclyTrigger('viewDestroy', this, this, this.el);
	},


	// Binds DOM handlers to elements that reside outside the view container, such as the document
	bindGlobalHandlers: function() {
		this.listenTo(GlobalEmitter.get(), {
			touchstart: this.processUnselect,
			mousedown: this.handleDocumentMousedown
		});
	},


	// Unbinds DOM handlers from elements that reside outside the view container
	unbindGlobalHandlers: function() {
		this.stopListeningTo(GlobalEmitter.get());
	},


	// Initializes internal variables related to theming
	initThemingProps: function() {
		var tm = this.opt('theme') ? 'ui' : 'fc';

		this.widgetHeaderClass = tm + '-widget-header';
		this.widgetContentClass = tm + '-widget-content';
		this.highlightStateClass = tm + '-state-highlight';
	},


	/* Business Hours
	------------------------------------------------------------------------------------------------------------------*/


	// Renders business-hours onto the view. Assumes updateSize has already been called.
	renderBusinessHours: function() {
		// subclasses should implement
	},


	// Unrenders previously-rendered business-hours
	unrenderBusinessHours: function() {
		// subclasses should implement
	},


	/* Now Indicator
	------------------------------------------------------------------------------------------------------------------*/


	// Immediately render the current time indicator and begins re-rendering it at an interval,
	// which is defined by this.getNowIndicatorUnit().
	// TODO: somehow do this for the current whole day's background too
	startNowIndicator: function() {
		var _this = this;
		var unit;
		var update;
		var delay; // ms wait value

		if (this.opt('nowIndicator')) {
			unit = this.getNowIndicatorUnit();
			if (unit) {
				update = proxy(this, 'updateNowIndicator'); // bind to `this`

				this.initialNowDate = this.calendar.getNow();
				this.initialNowQueriedMs = +new Date();
				this.renderNowIndicator(this.initialNowDate);
				this.isNowIndicatorRendered = true;

				// wait until the beginning of the next interval
				delay = this.initialNowDate.clone().startOf(unit).add(1, unit) - this.initialNowDate;
				this.nowIndicatorTimeoutID = setTimeout(function() {
					_this.nowIndicatorTimeoutID = null;
					update();
					delay = +moment.duration(1, unit);
					delay = Math.max(100, delay); // prevent too frequent
					_this.nowIndicatorIntervalID = setInterval(update, delay); // update every interval
				}, delay);
			}
		}
	},


	// rerenders the now indicator, computing the new current time from the amount of time that has passed
	// since the initial getNow call.
	updateNowIndicator: function() {
		if (this.isNowIndicatorRendered) {
			this.unrenderNowIndicator();
			this.renderNowIndicator(
				this.initialNowDate.clone().add(new Date() - this.initialNowQueriedMs) // add ms
			);
		}
	},


	// Immediately unrenders the view's current time indicator and stops any re-rendering timers.
	// Won't cause side effects if indicator isn't rendered.
	stopNowIndicator: function() {
		if (this.isNowIndicatorRendered) {

			if (this.nowIndicatorTimeoutID) {
				clearTimeout(this.nowIndicatorTimeoutID);
				this.nowIndicatorTimeoutID = null;
			}
			if (this.nowIndicatorIntervalID) {
				clearTimeout(this.nowIndicatorIntervalID);
				this.nowIndicatorIntervalID = null;
			}

			this.unrenderNowIndicator();
			this.isNowIndicatorRendered = false;
		}
	},


	// Returns a string unit, like 'second' or 'minute' that defined how often the current time indicator
	// should be refreshed. If something falsy is returned, no time indicator is rendered at all.
	getNowIndicatorUnit: function() {
		// subclasses should implement
	},


	// Renders a current time indicator at the given datetime
	renderNowIndicator: function(date) {
		// subclasses should implement
	},


	// Undoes the rendering actions from renderNowIndicator
	unrenderNowIndicator: function() {
		// subclasses should implement
	},


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/


	// Refreshes anything dependant upon sizing of the container element of the grid
	updateSize: function(isResize) {

		if (isResize) {
			this.captureScroll();
		}

		this.updateHeight(isResize);
		this.updateWidth(isResize);
		this.updateNowIndicator();

		if (isResize) {
			this.releaseScroll();
		}
	},


	// Refreshes the horizontal dimensions of the calendar
	updateWidth: function(isResize) {
		// subclasses should implement
	},


	// Refreshes the vertical dimensions of the calendar
	updateHeight: function(isResize) {
		var calendar = this.calendar; // we poll the calendar for height information

		this.setHeight(
			calendar.getSuggestedViewHeight(),
			calendar.isHeightAuto()
		);
	},


	// Updates the vertical dimensions of the calendar to the specified height.
	// if `isAuto` is set to true, height becomes merely a suggestion and the view should use its "natural" height.
	setHeight: function(height, isAuto) {
		// subclasses should implement
	},


	/* Scroller
	------------------------------------------------------------------------------------------------------------------*/


	capturedScroll: null,
	capturedScrollDepth: 0,


	captureScroll: function() {
		if (!(this.capturedScrollDepth++)) {
			this.capturedScroll = this.isDateRendered ? this.queryScroll() : {}; // require a render first
			return true; // root?
		}
		return false;
	},


	captureInitialScroll: function(forcedScroll) {
		if (this.captureScroll()) { // root?
			this.capturedScroll.isInitial = true;

			if (forcedScroll) {
				$.extend(this.capturedScroll, forcedScroll);
			}
			else {
				this.capturedScroll.isComputed = true;
			}
		}
	},


	releaseScroll: function() {
		var scroll = this.capturedScroll;
		var isRoot = this.discardScroll();

		if (scroll.isComputed) {
			if (isRoot) {
				// only compute initial scroll if it will actually be used (is the root capture)
				$.extend(scroll, this.computeInitialScroll());
			}
			else {
				scroll = null; // scroll couldn't be computed. don't apply it to the DOM
			}
		}

		if (scroll) {
			// we act immediately on a releaseScroll operation, as opposed to captureScroll.
			// if capture/release wraps a render operation that screws up the scroll,
			// we still want to restore it a good state after, regardless of depth.

			if (scroll.isInitial) {
				this.hardSetScroll(scroll); // outsmart how browsers set scroll on initial DOM
			}
			else {
				this.setScroll(scroll);
			}
		}
	},


	discardScroll: function() {
		if (!(--this.capturedScrollDepth)) {
			this.capturedScroll = null;
			return true; // root?
		}
		return false;
	},


	computeInitialScroll: function() {
		return {};
	},


	queryScroll: function() {
		return {};
	},


	hardSetScroll: function(scroll) {
		var _this = this;
		var exec = function() { _this.setScroll(scroll); };
		exec();
		setTimeout(exec, 0); // to surely clear the browser's initial scroll for the DOM
	},


	setScroll: function(scroll) {
	},


	/* Height Freezing
	------------------------------------------------------------------------------------------------------------------*/


	freezeHeight: function() {
		this.calendar.freezeContentHeight();
	},


	thawHeight: function() {
		this.calendar.thawContentHeight();
	},


	// Event Binding/Unbinding
	// -----------------------------------------------------------------------------------------------------------------


	bindEvents: function() {
		var _this = this;

		if (!this.isEventsBound) {
			this.isEventsBound = true;
			this.rejectOn('eventsUnbind', this.requestEvents()).then(function(events) { // TODO: test rejection
				_this.listenTo(_this.calendar, 'eventsReset', _this.setEvents);
				_this.setEvents(events);
			});
		}
	},


	unbindEvents: function() {
		if (this.isEventsBound) {
			this.isEventsBound = false;
			this.stopListeningTo(this.calendar, 'eventsReset');
			this.unsetEvents();
			this.trigger('eventsUnbind');
		}
	},


	// Event Setting/Unsetting
	// -----------------------------------------------------------------------------------------------------------------


	setEvents: function(events) {
		var isReset = this.isEventSet;

		this.isEventsSet = true;
		this.handleEvents(events, isReset);
		this.trigger(isReset ? 'eventsReset' : 'eventsSet', events);
	},


	unsetEvents: function() {
		if (this.isEventsSet) {
			this.isEventsSet = false;
			this.handleEventsUnset();
			this.trigger('eventsUnset');
		}
	},


	whenEventsSet: function() {
		var _this = this;

		if (this.isEventsSet) {
			return Promise.resolve(this.getCurrentEvents());
		}
		else {
			return new Promise(function(resolve) {
				_this.one('eventsSet', resolve);
			});
		}
	},


	// Event Handling
	// -----------------------------------------------------------------------------------------------------------------


	handleEvents: function(events, isReset) {
		this.requestEventsRender(events);
	},


	handleEventsUnset: function() {
		this.requestEventsUnrender();
	},


	// Event Render Queuing
	// -----------------------------------------------------------------------------------------------------------------


	// assumes any previous event renders have been cleared already
	requestEventsRender: function(events) {
		var _this = this;

		return this.eventRenderQueue.add(function() { // might not return a promise if debounced!? bad
			return _this.executeEventsRender(events);
		});
	},


	requestEventsUnrender: function() {
		var _this = this;

		if (this.isEventsRendered) {
			return this.eventRenderQueue.addQuickly(function() {
				return _this.executeEventsUnrender();
			});
		}
		else {
			return Promise.resolve();
		}
	},


	requestCurrentEventsRender: function() {
		if (this.isEventsSet) {
			this.requestEventsRender(this.getCurrentEvents());
		}
		else {
			return Promise.reject();
		}
	},


	// Event High-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	executeEventsRender: function(events) {
		var _this = this;

		this.captureScroll();
		this.freezeHeight();

		return this.executeEventsUnrender().then(function() {
			_this.renderEvents(events);

			_this.thawHeight();
			_this.releaseScroll();

			_this.isEventsRendered = true;
			_this.onEventsRender();
			_this.trigger('eventsRender');
		});
	},


	executeEventsUnrender: function() {
		if (this.isEventsRendered) {
			this.onBeforeEventsUnrender();

			this.captureScroll();
			this.freezeHeight();

			if (this.destroyEvents) {
				this.destroyEvents(); // TODO: deprecate
			}

			this.unrenderEvents();

			this.thawHeight();
			this.releaseScroll();

			this.isEventsRendered = false;
			this.trigger('eventsUnrender');
		}

		return Promise.resolve(); // always synchronous
	},


	// Event Rendering Triggers
	// -----------------------------------------------------------------------------------------------------------------


	// Signals that all events have been rendered
	onEventsRender: function() {
		this.renderedEventSegEach(function(seg) {
			this.publiclyTrigger('eventAfterRender', seg.event, seg.event, seg.el);
		});
		this.publiclyTrigger('eventAfterAllRender');
	},


	// Signals that all event elements are about to be removed
	onBeforeEventsUnrender: function() {
		this.renderedEventSegEach(function(seg) {
			this.publiclyTrigger('eventDestroy', seg.event, seg.event, seg.el);
		});
	},


	// Event Low-level Rendering
	// -----------------------------------------------------------------------------------------------------------------


	// Renders the events onto the view.
	renderEvents: function(events) {
		// subclasses should implement
	},


	// Removes event elements from the view.
	unrenderEvents: function() {
		// subclasses should implement
	},


	// Event Data Access
	// -----------------------------------------------------------------------------------------------------------------


	requestEvents: function() {
		return this.calendar.requestEvents(this.start, this.end);
	},


	getCurrentEvents: function() {
		return this.calendar.getPrunedEventCache();
	},


	// Event Rendering Utils
	// -----------------------------------------------------------------------------------------------------------------


	// Given an event and the default element used for rendering, returns the element that should actually be used.
	// Basically runs events and elements through the eventRender hook.
	resolveEventEl: function(event, el) {
		var custom = this.publiclyTrigger('eventRender', event, event, el);

		if (custom === false) { // means don't render at all
			el = null;
		}
		else if (custom && custom !== true) {
			el = $(custom);
		}

		return el;
	},


	// Hides all rendered event segments linked to the given event
	showEvent: function(event) {
		this.renderedEventSegEach(function(seg) {
			seg.el.css('visibility', '');
		}, event);
	},


	// Shows all rendered event segments linked to the given event
	hideEvent: function(event) {
		this.renderedEventSegEach(function(seg) {
			seg.el.css('visibility', 'hidden');
		}, event);
	},


	// Iterates through event segments that have been rendered (have an el). Goes through all by default.
	// If the optional `event` argument is specified, only iterates through segments linked to that event.
	// The `this` value of the callback function will be the view.
	renderedEventSegEach: function(func, event) {
		var segs = this.getEventSegs();
		var i;

		for (i = 0; i < segs.length; i++) {
			if (!event || segs[i].event._id === event._id) {
				if (segs[i].el) {
					func.call(this, segs[i]);
				}
			}
		}
	},


	// Retrieves all the rendered segment objects for the view
	getEventSegs: function() {
		// subclasses must implement
		return [];
	},


	/* Event Drag-n-Drop
	------------------------------------------------------------------------------------------------------------------*/


	// Computes if the given event is allowed to be dragged by the user
	isEventDraggable: function(event) {
		return this.isEventStartEditable(event);
	},


	isEventStartEditable: function(event) {
		return firstDefined(
			event.startEditable,
			(event.source || {}).startEditable,
			this.opt('eventStartEditable'),
			this.isEventGenerallyEditable(event)
		);
	},


	isEventGenerallyEditable: function(event) {
		return firstDefined(
			event.editable,
			(event.source || {}).editable,
			this.opt('editable')
		);
	},


	// Must be called when an event in the view is dropped onto new location.
	// `dropLocation` is an object that contains the new zoned start/end/allDay values for the event.
	reportSegDrop: function(seg, dropLocation, largeUnit, el, ev) {
		var calendar = this.calendar;
		var mutateResult = calendar.mutateSeg(seg, dropLocation, largeUnit);
		var undoFunc = function() {
			mutateResult.undo();
			calendar.reportEventChange();
		};

		this.triggerEventDrop(seg.event, mutateResult.dateDelta, undoFunc, el, ev);
		calendar.reportEventChange(); // will rerender events
	},


	// Triggers event-drop handlers that have subscribed via the API
	triggerEventDrop: function(event, dateDelta, undoFunc, el, ev) {
		this.publiclyTrigger('eventDrop', el[0], event, dateDelta, undoFunc, ev, {}); // {} = jqui dummy
	},


	/* External Element Drag-n-Drop
	------------------------------------------------------------------------------------------------------------------*/


	// Must be called when an external element, via jQuery UI, has been dropped onto the calendar.
	// `meta` is the parsed data that has been embedded into the dragging event.
	// `dropLocation` is an object that contains the new zoned start/end/allDay values for the event.
	reportExternalDrop: function(meta, dropLocation, el, ev, ui) {
		var eventProps = meta.eventProps;
		var eventInput;
		var event;

		// Try to build an event object and render it. TODO: decouple the two
		if (eventProps) {
			eventInput = $.extend({}, eventProps, dropLocation);
			event = this.calendar.renderEvent(eventInput, meta.stick)[0]; // renderEvent returns an array
		}

		this.triggerExternalDrop(event, dropLocation, el, ev, ui);
	},


	// Triggers external-drop handlers that have subscribed via the API
	triggerExternalDrop: function(event, dropLocation, el, ev, ui) {

		// trigger 'drop' regardless of whether element represents an event
		this.publiclyTrigger('drop', el[0], dropLocation.start, ev, ui);

		if (event) {
			this.publiclyTrigger('eventReceive', null, event); // signal an external event landed
		}
	},


	/* Drag-n-Drop Rendering (for both events and external elements)
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a event or external-element drag over the given drop zone.
	// If an external-element, seg will be `null`.
	// Must return elements used for any mock events.
	renderDrag: function(dropLocation, seg) {
		// subclasses must implement
	},


	// Unrenders a visual indication of an event or external-element being dragged.
	unrenderDrag: function() {
		// subclasses must implement
	},


	/* Event Resizing
	------------------------------------------------------------------------------------------------------------------*/


	// Computes if the given event is allowed to be resized from its starting edge
	isEventResizableFromStart: function(event) {
		return this.opt('eventResizableFromStart') && this.isEventResizable(event);
	},


	// Computes if the given event is allowed to be resized from its ending edge
	isEventResizableFromEnd: function(event) {
		return this.isEventResizable(event);
	},


	// Computes if the given event is allowed to be resized by the user at all
	isEventResizable: function(event) {
		var source = event.source || {};

		return firstDefined(
			event.durationEditable,
			source.durationEditable,
			this.opt('eventDurationEditable'),
			event.editable,
			source.editable,
			this.opt('editable')
		);
	},


	// Must be called when an event in the view has been resized to a new length
	reportSegResize: function(seg, resizeLocation, largeUnit, el, ev) {
		var calendar = this.calendar;
		var mutateResult = calendar.mutateSeg(seg, resizeLocation, largeUnit);
		var undoFunc = function() {
			mutateResult.undo();
			calendar.reportEventChange();
		};

		this.triggerEventResize(seg.event, mutateResult.durationDelta, undoFunc, el, ev);
		calendar.reportEventChange(); // will rerender events
	},


	// Triggers event-resize handlers that have subscribed via the API
	triggerEventResize: function(event, durationDelta, undoFunc, el, ev) {
		this.publiclyTrigger('eventResize', el[0], event, durationDelta, undoFunc, ev, {}); // {} = jqui dummy
	},


	/* Selection (time range)
	------------------------------------------------------------------------------------------------------------------*/


	// Selects a date span on the view. `start` and `end` are both Moments.
	// `ev` is the native mouse event that begin the interaction.
	select: function(span, ev) {
		this.unselect(ev);
		this.renderSelection(span);
		this.reportSelection(span, ev);
	},


	// Renders a visual indication of the selection
	renderSelection: function(span) {
		// subclasses should implement
	},


	// Called when a new selection is made. Updates internal state and triggers handlers.
	reportSelection: function(span, ev) {
		this.isSelected = true;
		this.triggerSelect(span, ev);
	},


	// Triggers handlers to 'select'
	triggerSelect: function(span, ev) {
		this.publiclyTrigger(
			'select',
			null,
			this.calendar.applyTimezone(span.start), // convert to calendar's tz for external API
			this.calendar.applyTimezone(span.end), // "
			ev
		);
	},


	// Undoes a selection. updates in the internal state and triggers handlers.
	// `ev` is the native mouse event that began the interaction.
	unselect: function(ev) {
		if (this.isSelected) {
			this.isSelected = false;
			if (this.destroySelection) {
				this.destroySelection(); // TODO: deprecate
			}
			this.unrenderSelection();
			this.publiclyTrigger('unselect', null, ev);
		}
	},


	// Unrenders a visual indication of selection
	unrenderSelection: function() {
		// subclasses should implement
	},


	/* Event Selection
	------------------------------------------------------------------------------------------------------------------*/


	selectEvent: function(event) {
		if (!this.selectedEvent || this.selectedEvent !== event) {
			this.unselectEvent();
			this.renderedEventSegEach(function(seg) {
				seg.el.addClass('fc-selected');
			}, event);
			this.selectedEvent = event;
		}
	},


	unselectEvent: function() {
		if (this.selectedEvent) {
			this.renderedEventSegEach(function(seg) {
				seg.el.removeClass('fc-selected');
			}, this.selectedEvent);
			this.selectedEvent = null;
		}
	},


	isEventSelected: function(event) {
		// event references might change on refetchEvents(), while selectedEvent doesn't,
		// so compare IDs
		return this.selectedEvent && this.selectedEvent._id === event._id;
	},


	/* Mouse / Touch Unselecting (time range & event unselection)
	------------------------------------------------------------------------------------------------------------------*/
	// TODO: move consistently to down/start or up/end?
	// TODO: don't kill previous selection if touch scrolling


	handleDocumentMousedown: function(ev) {
		if (isPrimaryMouseButton(ev)) {
			this.processUnselect(ev);
		}
	},


	processUnselect: function(ev) {
		this.processRangeUnselect(ev);
		this.processEventUnselect(ev);
	},


	processRangeUnselect: function(ev) {
		var ignore;

		// is there a time-range selection?
		if (this.isSelected && this.opt('unselectAuto')) {
			// only unselect if the clicked element is not identical to or inside of an 'unselectCancel' element
			ignore = this.opt('unselectCancel');
			if (!ignore || !$(ev.target).closest(ignore).length) {
				this.unselect(ev);
			}
		}
	},


	processEventUnselect: function(ev) {
		if (this.selectedEvent) {
			if (!$(ev.target).closest('.fc-selected').length) {
				this.unselectEvent();
			}
		}
	},


	/* Day Click
	------------------------------------------------------------------------------------------------------------------*/


	// Triggers handlers to 'dayClick'
	// Span has start/end of the clicked area. Only the start is useful.
	triggerDayClick: function(span, dayEl, ev) {
		this.publiclyTrigger(
			'dayClick',
			dayEl,
			this.calendar.applyTimezone(span.start), // convert to calendar's timezone for external API
			ev
		);
	},


	/* Date Utils
	------------------------------------------------------------------------------------------------------------------*/


	// Initializes internal variables related to calculating hidden days-of-week
	initHiddenDays: function() {
		var hiddenDays = this.opt('hiddenDays') || []; // array of day-of-week indices that are hidden
		var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
		var dayCnt = 0;
		var i;

		if (this.opt('weekends') === false) {
			hiddenDays.push(0, 6); // 0=sunday, 6=saturday
		}

		for (i = 0; i < 7; i++) {
			if (
				!(isHiddenDayHash[i] = $.inArray(i, hiddenDays) !== -1)
			) {
				dayCnt++;
			}
		}

		if (!dayCnt) {
			throw 'invalid hiddenDays'; // all days were hidden? bad.
		}

		this.isHiddenDayHash = isHiddenDayHash;
	},


	// Is the current day hidden?
	// `day` is a day-of-week index (0-6), or a Moment
	isHiddenDay: function(day) {
		if (moment.isMoment(day)) {
			day = day.day();
		}
		return this.isHiddenDayHash[day];
	},


	// Incrementing the current day until it is no longer a hidden day, returning a copy.
	// If the initial value of `date` is not a hidden day, don't do anything.
	// Pass `isExclusive` as `true` if you are dealing with an end date.
	// `inc` defaults to `1` (increment one day forward each time)
	skipHiddenDays: function(date, inc, isExclusive) {
		var out = date.clone();
		inc = inc || 1;
		while (
			this.isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]
		) {
			out.add(inc, 'days');
		}
		return out;
	},


	// Returns the date range of the full days the given range visually appears to occupy.
	// Returns a new range object.
	computeDayRange: function(range) {
		var startDay = range.start.clone().stripTime(); // the beginning of the day the range starts
		var end = range.end;
		var endDay = null;
		var endTimeMS;

		if (end) {
			endDay = end.clone().stripTime(); // the beginning of the day the range exclusively ends
			endTimeMS = +end.time(); // # of milliseconds into `endDay`

			// If the end time is actually inclusively part of the next day and is equal to or
			// beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
			// Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
			if (endTimeMS && endTimeMS >= this.nextDayThreshold) {
				endDay.add(1, 'days');
			}
		}

		// If no end was specified, or if it is within `startDay` but not past nextDayThreshold,
		// assign the default duration of one day.
		if (!end || endDay <= startDay) {
			endDay = startDay.clone().add(1, 'days');
		}

		return { start: startDay, end: endDay };
	},


	// Does the given event visually appear to occupy more than one day?
	isMultiDayEvent: function(event) {
		var range = this.computeDayRange(event); // event is range-ish

		return range.end.diff(range.start, 'days') > 1;
	}

});
