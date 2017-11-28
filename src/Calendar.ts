import * as $ from 'jquery'
import * as moment from 'moment'
import { capitaliseFirstLetter, debounce } from './util'
import { globalDefaults, englishDefaults, rtlDefaults } from './options'
import Iterator from './common/Iterator'
import GlobalEmitter from './common/GlobalEmitter'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import { default as ListenerMixin, ListenerInterface } from './common/ListenerMixin'
import Toolbar from './Toolbar'
import OptionsManager from './OptionsManager'
import ViewSpecManager from './ViewSpecManager'
import Constraints from './Constraints'
import { getMomentLocaleData } from './locale'
import momentExt from './moment-ext'
import UnzonedRange from './models/UnzonedRange'
import ComponentFootprint from './models/ComponentFootprint'
import EventDateProfile from './models/event/EventDateProfile'
import EventManager from './models/EventManager'
import BusinessHourGenerator from './models/BusinessHourGenerator'
import EventSourceParser from './models/event-source/EventSourceParser'
import EventDefParser from './models/event/EventDefParser'
import SingleEventDef from './models/event/SingleEventDef'
import EventDefMutation from './models/event/EventDefMutation'
import EventSource from './models/event-source/EventSource'
import { getThemeSystemClass } from './theme/ThemeRegistry'


export default class Calendar {

	on: EmitterInterface['on']
	one: EmitterInterface['one']
	off: EmitterInterface['off']
	trigger: EmitterInterface['trigger']
	triggerWith: EmitterInterface['triggerWith']
	hasHandlers: EmitterInterface['hasHandlers']
	listenTo: ListenerInterface['listenTo']
	stopListeningTo: ListenerInterface['stopListeningTo']

	// not for internal use. use options module directly instead.
	static defaults: any = globalDefaults
	static englishDefaults: any = englishDefaults
	static rtlDefaults: any = rtlDefaults

	view: any // current View object
	viewsByType: any // holds all instantiated view instances, current or not
	currentDate: any // unzoned moment. private (public API should use getDate instead)
	theme: any
	eventManager: any
	constraints: any
	optionsManager: any
	viewSpecManager: any
	businessHourGenerator: any
	loadingLevel: number = 0 // number of simultaneous loading tasks

	defaultAllDayEventDuration: any
	defaultTimedEventDuration: any
	localeData: any

	el: any
	contentEl: any
	suggestedViewHeight: any
	ignoreUpdateViewSize: number = 0
	freezeContentHeightDepth: number = 0
	windowResizeProxy: any

	header: any
	footer: any
	toolbarsManager: any


	constructor(el, overrides) {

		// declare the current calendar instance relies on GlobalEmitter. needed for garbage collection.
		// unneeded() is called in destroy.
		GlobalEmitter.needed();

		this.el = el;
		this.viewsByType = {};

		this.optionsManager = new OptionsManager(this, overrides);
		this.viewSpecManager = new ViewSpecManager(this.optionsManager, this);
		this.initMomentInternals(); // needs to happen after options hash initialized
		this.initCurrentDate();
		this.initEventManager();
		this.constraints = new Constraints(this.eventManager, this);

		this.constructed();
	}


	// useful for monkeypatching. used?
	constructed() {
	}


	getView() {
		return this.view;
	}


	publiclyTrigger(name, triggerInfo) {
		var optHandler = this.opt(name);
		var context;
		var args;

		if ($.isPlainObject(triggerInfo)) {
			context = triggerInfo.context;
			args = triggerInfo.args;
		}
		else if ($.isArray(triggerInfo)) {
			args = triggerInfo;
		}

		if (context == null) {
			context = this.el[0]; // fallback context
		}

		if (!args) {
			args = [];
		}

		this.triggerWith(name, context, args); // Emitter's method

		if (optHandler) {
			return optHandler.apply(context, args);
		}
	}


	hasPublicHandlers(name) {
		return this.hasHandlers(name) ||
			this.opt(name); // handler specified in options
	}


	// Options Public API
	// -----------------------------------------------------------------------------------------------------------------


	// public getter/setter
	option(name, value) {
		var newOptionHash;

		if (typeof name === 'string') {
			if (value === undefined) { // getter
				return this.optionsManager.get(name);
			}
			else { // setter for individual option
				newOptionHash = {};
				newOptionHash[name] = value;
				this.optionsManager.add(newOptionHash);
			}
		}
		else if (typeof name === 'object') { // compound setter with object input
			this.optionsManager.add(name);
		}
	}


	// private getter
	opt(name) {
		return this.optionsManager.get(name);
	}


	// View
	// -----------------------------------------------------------------------------------------------------------------


	// Given a view name for a custom view or a standard view, creates a ready-to-go View object
	instantiateView(viewType) {
		var spec = this.viewSpecManager.getViewSpec(viewType);

		return new spec['class'](this, spec);
	}


	// Returns a boolean about whether the view is okay to instantiate at some point
	isValidViewType(viewType) {
		return Boolean(this.viewSpecManager.getViewSpec(viewType));
	}


	changeView(viewName, dateOrRange) {

		if (dateOrRange) {

			if (dateOrRange.start && dateOrRange.end) { // a range
				this.optionsManager.recordOverrides({ // will not rerender
					visibleRange: dateOrRange
				});
			}
			else { // a date
				this.currentDate = this.moment(dateOrRange).stripZone(); // just like gotoDate
			}
		}

		this.renderView(viewName);
	}


	// Forces navigation to a view for the given date.
	// `viewType` can be a specific view name or a generic one like "week" or "day".
	zoomTo(newDate, viewType) {
		var spec;

		viewType = viewType || 'day'; // day is default zoom
		spec = this.viewSpecManager.getViewSpec(viewType) ||
			this.viewSpecManager.getUnitViewSpec(viewType);

		this.currentDate = newDate.clone();
		this.renderView(spec ? spec.type : null);
	}


	// Current Date
	// -----------------------------------------------------------------------------------------------------------------


	initCurrentDate() {
		var defaultDateInput = this.opt('defaultDate');

		// compute the initial ambig-timezone date
		if (defaultDateInput != null) {
			this.currentDate = this.moment(defaultDateInput).stripZone();
		}
		else {
			this.currentDate = this.getNow(); // getNow already returns unzoned
		}
	}


	prev() {
		var view = this.view;
		var prevInfo = view.dateProfileGenerator.buildPrev(view.get('dateProfile'));

		if (prevInfo.isValid) {
			this.currentDate = prevInfo.date;
			this.renderView();
		}
	}


	next() {
		var view = this.view;
		var nextInfo = view.dateProfileGenerator.buildNext(view.get('dateProfile'));

		if (nextInfo.isValid) {
			this.currentDate = nextInfo.date;
			this.renderView();
		}
	}


	prevYear() {
		this.currentDate.add(-1, 'years');
		this.renderView();
	}


	nextYear() {
		this.currentDate.add(1, 'years');
		this.renderView();
	}


	today() {
		this.currentDate = this.getNow(); // should deny like prev/next?
		this.renderView();
	}


	gotoDate(zonedDateInput) {
		this.currentDate = this.moment(zonedDateInput).stripZone();
		this.renderView();
	}


	incrementDate(delta) {
		this.currentDate.add(moment.duration(delta));
		this.renderView();
	}


	// for external API
	getDate() {
		return this.applyTimezone(this.currentDate); // infuse the calendar's timezone
	}


	// Loading Triggering
	// -----------------------------------------------------------------------------------------------------------------


	// Should be called when any type of async data fetching begins
	pushLoading() {
		if (!(this.loadingLevel++)) {
			this.publiclyTrigger('loading', [ true, this.view ]);
		}
	}


	// Should be called when any type of async data fetching completes
	popLoading() {
		if (!(--this.loadingLevel)) {
			this.publiclyTrigger('loading', [ false, this.view ]);
		}
	}


	// High-level Rendering
	// -----------------------------------------------------------------------------------


	render() {
		if (!this.contentEl) {
			this.initialRender();
		}
		else if (this.elementVisible()) {
			// mainly for the public API
			this.calcSize();
			this.updateViewSize();
		}
	}


	initialRender() {
		var el = this.el;

		el.addClass('fc');

		// event delegation for nav links
		el.on('click.fc', 'a[data-goto]', (ev) => {
			var anchorEl = $(ev.currentTarget);
			var gotoOptions = anchorEl.data('goto'); // will automatically parse JSON
			var date = this.moment(gotoOptions.date);
			var viewType = gotoOptions.type;

			// property like "navLinkDayClick". might be a string or a function
			var customAction = this.view.opt('navLink' + capitaliseFirstLetter(viewType) + 'Click');

			if (typeof customAction === 'function') {
				customAction(date, ev);
			}
			else {
				if (typeof customAction === 'string') {
					viewType = customAction;
				}
				this.zoomTo(date, viewType);
			}
		});

		// called immediately, and upon option change
		this.optionsManager.watch('settingTheme', [ '?theme', '?themeSystem' ], (opts) => {
			var themeClass = getThemeSystemClass(opts.themeSystem || opts.theme);
			var theme = new themeClass(this.optionsManager);
			var widgetClass = theme.getClass('widget');

			this.theme = theme;

			if (widgetClass) {
				el.addClass(widgetClass);
			}
		}, () => {
			var widgetClass = this.theme.getClass('widget');

			this.theme = null;

			if (widgetClass) {
				el.removeClass(widgetClass);
			}
		});

		this.optionsManager.watch('settingBusinessHourGenerator', [ '?businessHours' ], (deps) => {
			this.businessHourGenerator = new BusinessHourGenerator(deps.businessHours, this);

			if (this.view) {
				this.view.set('businessHourGenerator', this.businessHourGenerator);
			}
		}, () => {
			this.businessHourGenerator = null;
		});

		// called immediately, and upon option change.
		// HACK: locale often affects isRTL, so we explicitly listen to that too.
		this.optionsManager.watch('applyingDirClasses', [ '?isRTL', '?locale' ], (opts) => {
			el.toggleClass('fc-ltr', !opts.isRTL);
			el.toggleClass('fc-rtl', opts.isRTL);
		});

		this.contentEl = $("<div class='fc-view-container'/>").prependTo(el);

		this.initToolbars();
		this.renderHeader();
		this.renderFooter();
		this.renderView(this.opt('defaultView'));

		if (this.opt('handleWindowResize')) {
			$(window).resize(
				this.windowResizeProxy = debounce( // prevents rapid calls
					this.windowResize.bind(this),
					this.opt('windowResizeDelay')
				)
			);
		}
	}


	destroy() {
		if (this.view) {
			this.clearView();
		}

		this.toolbarsManager.proxyCall('removeElement');
		this.contentEl.remove();
		this.el.removeClass('fc fc-ltr fc-rtl');

		// removes theme-related root className
		this.optionsManager.unwatch('settingTheme');
		this.optionsManager.unwatch('settingBusinessHourGenerator');

		this.el.off('.fc'); // unbind nav link handlers

		if (this.windowResizeProxy) {
			$(window).unbind('resize', this.windowResizeProxy);
			this.windowResizeProxy = null;
		}

		GlobalEmitter.unneeded();
	}


	elementVisible() {
		return this.el.is(':visible');
	}


	// Render Queue
	// -----------------------------------------------------------------------------------------------------------------


	bindViewHandlers(view) {

		view.watch('titleForCalendar', [ 'title' ], (deps) => { // TODO: better system
			if (view === this.view) { // hack
				this.setToolbarsTitle(deps.title);
			}
		});

		view.watch('dateProfileForCalendar', [ 'dateProfile' ], (deps) => {
			if (view === this.view) { // hack
				this.currentDate = deps.dateProfile.date; // might have been constrained by view dates
				this.updateToolbarButtons(deps.dateProfile);
			}
		});
	}


	unbindViewHandlers(view) {
		view.unwatch('titleForCalendar');
		view.unwatch('dateProfileForCalendar');
	}


	// View Rendering
	// -----------------------------------------------------------------------------------


	// Renders a view because of a date change, view-type change, or for the first time.
	// If not given a viewType, keep the current view but render different dates.
	// Accepts an optional scroll state to restore to.
	renderView(viewType?) {
		var oldView = this.view;
		var newView;

		this.freezeContentHeight();

		if (oldView && viewType && oldView.type !== viewType) {
			this.clearView();
		}

		// if viewType changed, or the view was never created, create a fresh view
		if (!this.view && viewType) {
			newView = this.view =
				this.viewsByType[viewType] ||
				(this.viewsByType[viewType] = this.instantiateView(viewType));

			this.bindViewHandlers(newView);

			newView.startBatchRender(); // so that setElement+setDate rendering are joined
			newView.setElement(
				$("<div class='fc-view fc-" + viewType + "-view' />").appendTo(this.contentEl)
			);

			this.toolbarsManager.proxyCall('activateButton', viewType);
		}

		if (this.view) {

			// prevent unnecessary change firing
			if (this.view.get('businessHourGenerator') !== this.businessHourGenerator) {
				this.view.set('businessHourGenerator', this.businessHourGenerator);
			}

			this.view.setDate(this.currentDate);

			if (newView) {
				newView.stopBatchRender();
			}
		}

		this.thawContentHeight();
	}


	// Unrenders the current view and reflects this change in the Header.
	// Unregsiters the `view`, but does not remove from viewByType hash.
	clearView() {
		var currentView = this.view;

		this.toolbarsManager.proxyCall('deactivateButton', currentView.type);

		this.unbindViewHandlers(currentView);

		currentView.removeElement();
		currentView.unsetDate(); // so bindViewHandlers doesn't fire with old values next time

		this.view = null;
	}


	// Destroys the view, including the view object. Then, re-instantiates it and renders it.
	// Maintains the same scroll state.
	// TODO: maintain any other user-manipulated state.
	reinitView() {
		var oldView = this.view;
		var scroll = oldView.queryScroll(); // wouldn't be so complicated if Calendar owned the scroll
		this.freezeContentHeight();

		this.clearView();
		this.calcSize();
		this.renderView(oldView.type); // needs the type to freshly render

		this.view.applyScroll(scroll);
		this.thawContentHeight();
	}


	// Resizing
	// -----------------------------------------------------------------------------------


	getSuggestedViewHeight() {
		if (this.suggestedViewHeight == null) {
			this.calcSize();
		}
		return this.suggestedViewHeight;
	}


	isHeightAuto() {
		return this.opt('contentHeight') === 'auto' || this.opt('height') === 'auto';
	}


	updateViewSize(isResize=false) {
		var view = this.view;
		var scroll;

		if (!this.ignoreUpdateViewSize && view) {

			if (isResize) {
				this.calcSize();
				scroll = view.queryScroll();
			}

			this.ignoreUpdateViewSize++;

			view.updateSize(
				this.getSuggestedViewHeight(),
				this.isHeightAuto(),
				isResize
			);

			this.ignoreUpdateViewSize--;

			if (isResize) {
				view.applyScroll(scroll);
			}

			return true; // signal success
		}
	}


	calcSize() {
		if (this.elementVisible()) {
			this._calcSize();
		}
	}


	_calcSize() { // assumes elementVisible
		var contentHeightInput = this.opt('contentHeight');
		var heightInput = this.opt('height');

		if (typeof contentHeightInput === 'number') { // exists and not 'auto'
			this.suggestedViewHeight = contentHeightInput;
		}
		else if (typeof contentHeightInput === 'function') { // exists and is a function
			this.suggestedViewHeight = contentHeightInput();
		}
		else if (typeof heightInput === 'number') { // exists and not 'auto'
			this.suggestedViewHeight = heightInput - this.queryToolbarsHeight();
		}
		else if (typeof heightInput === 'function') { // exists and is a function
			this.suggestedViewHeight = heightInput() - this.queryToolbarsHeight();
		}
		else if (heightInput === 'parent') { // set to height of parent element
			this.suggestedViewHeight = this.el.parent().height() - this.queryToolbarsHeight();
		}
		else {
			this.suggestedViewHeight = Math.round(
				this.contentEl.width() /
				Math.max(this.opt('aspectRatio'), .5)
			);
		}
	}


	windowResize(ev) {
		if (
			ev.target === window && // so we don't process jqui "resize" events that have bubbled up
			this.view &&
			this.view.isDatesRendered
		) {
			if (this.updateViewSize(true)) { // isResize=true, returns true on success
				this.publiclyTrigger('windowResize', [ this.view ]);
			}
		}
	}


	/* Height "Freezing"
	-----------------------------------------------------------------------------*/


	freezeContentHeight() {
		if (!(this.freezeContentHeightDepth++)) {
			this.forceFreezeContentHeight();
		}
	}


	forceFreezeContentHeight() {
		this.contentEl.css({
			width: '100%',
			height: this.contentEl.height(),
			overflow: 'hidden'
		});
	}


	thawContentHeight() {
		this.freezeContentHeightDepth--;

		// always bring back to natural height
		this.contentEl.css({
			width: '',
			height: '',
			overflow: ''
		});

		// but if there are future thaws, re-freeze
		if (this.freezeContentHeightDepth) {
			this.forceFreezeContentHeight();
		}
	}


	// Toolbar
	// -----------------------------------------------------------------------------------------------------------------


	initToolbars() {
		this.header = new Toolbar(this, this.computeHeaderOptions());
		this.footer = new Toolbar(this, this.computeFooterOptions());
		this.toolbarsManager = new Iterator([ this.header, this.footer ]);
	}


	computeHeaderOptions() {
		return {
			extraClasses: 'fc-header-toolbar',
			layout: this.opt('header')
		};
	}


	computeFooterOptions() {
		return {
			extraClasses: 'fc-footer-toolbar',
			layout: this.opt('footer')
		};
	}


	// can be called repeatedly and Header will rerender
	renderHeader() {
		var header = this.header;

		header.setToolbarOptions(this.computeHeaderOptions());
		header.render();

		if (header.el) {
			this.el.prepend(header.el);
		}
	}


	// can be called repeatedly and Footer will rerender
	renderFooter() {
		var footer = this.footer;

		footer.setToolbarOptions(this.computeFooterOptions());
		footer.render();

		if (footer.el) {
			this.el.append(footer.el);
		}
	}


	setToolbarsTitle(title) {
		this.toolbarsManager.proxyCall('updateTitle', title);
	}


	updateToolbarButtons(dateProfile) {
		var now = this.getNow();
		var view = this.view;
		var todayInfo = view.dateProfileGenerator.build(now);
		var prevInfo = view.dateProfileGenerator.buildPrev(view.get('dateProfile'));
		var nextInfo = view.dateProfileGenerator.buildNext(view.get('dateProfile'));

		this.toolbarsManager.proxyCall(
			(todayInfo.isValid && !dateProfile.currentUnzonedRange.containsDate(now)) ?
				'enableButton' :
				'disableButton',
			'today'
		);

		this.toolbarsManager.proxyCall(
			prevInfo.isValid ?
				'enableButton' :
				'disableButton',
			'prev'
		);

		this.toolbarsManager.proxyCall(
			nextInfo.isValid ?
				'enableButton' :
				'disableButton',
			'next'
		);
	}


	queryToolbarsHeight() {
		return this.toolbarsManager.items.reduce(function(accumulator, toolbar) {
			var toolbarHeight = toolbar.el ? toolbar.el.outerHeight(true) : 0; // includes margin
			return accumulator + toolbarHeight;
		}, 0);
	}


	// Selection
	// -----------------------------------------------------------------------------------------------------------------


	// this public method receives start/end dates in any format, with any timezone
	select(zonedStartInput, zonedEndInput) {
		this.view.select(
			this.buildSelectFootprint.apply(this, arguments)
		);
	}


	unselect() { // safe to be called before renderView
		if (this.view) {
			this.view.unselect();
		}
	}


	// Given arguments to the select method in the API, returns a span (unzoned start/end and other info)
	buildSelectFootprint(zonedStartInput, zonedEndInput) {
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

		return new ComponentFootprint(
			new UnzonedRange(start, end),
			!start.hasTime()
		);
	}


	// Date Utils
	// -----------------------------------------------------------------------------------------------------------------


	initMomentInternals() {

		this.defaultAllDayEventDuration = moment.duration(this.opt('defaultAllDayEventDuration'));
		this.defaultTimedEventDuration = moment.duration(this.opt('defaultTimedEventDuration'));

		// Called immediately, and when any of the options change.
		// Happens before any internal objects rebuild or rerender, because this is very core.
		this.optionsManager.watch('buildingMomentLocale', [
			'?locale', '?monthNames', '?monthNamesShort', '?dayNames', '?dayNamesShort',
			'?firstDay', '?weekNumberCalculation'
		], (opts) => {
			var weekNumberCalculation = opts.weekNumberCalculation;
			var firstDay = opts.firstDay;
			var _week;

			// normalize
			if (weekNumberCalculation === 'iso') {
				weekNumberCalculation = 'ISO'; // normalize
			}

			var localeData = Object.create( // make a cheap copy
				getMomentLocaleData(opts.locale) // will fall back to en
			);

			if (opts.monthNames) {
				localeData._months = opts.monthNames;
			}
			if (opts.monthNamesShort) {
				localeData._monthsShort = opts.monthNamesShort;
			}
			if (opts.dayNames) {
				localeData._weekdays = opts.dayNames;
			}
			if (opts.dayNamesShort) {
				localeData._weekdaysShort = opts.dayNamesShort;
			}

			if (firstDay == null && weekNumberCalculation === 'ISO') {
				firstDay = 1;
			}
			if (firstDay != null) {
				_week = Object.create(localeData._week); // _week: { dow: # }
				_week.dow = firstDay;
				localeData._week = _week;
			}

			if ( // whitelist certain kinds of input
				weekNumberCalculation === 'ISO' ||
				weekNumberCalculation === 'local' ||
				typeof weekNumberCalculation === 'function'
			) {
				localeData._fullCalendar_weekCalc = weekNumberCalculation; // moment-ext will know what to do with it
			}

			this.localeData = localeData;

			// If the internal current date object already exists, move to new locale.
			// We do NOT need to do this technique for event dates, because this happens when converting to "segments".
			if (this.currentDate) {
				this.localizeMoment(this.currentDate); // sets to localeData
			}
		});
	}


	// Builds a moment using the settings of the current calendar: timezone and locale.
	// Accepts anything the vanilla moment() constructor accepts.
	moment(...args) {
		var mom;

		if (this.opt('timezone') === 'local') {
			mom = momentExt.apply(null, args);

			// Force the moment to be local, because momentExt doesn't guarantee it.
			if (mom.hasTime()) { // don't give ambiguously-timed moments a local zone
				mom.local();
			}
		}
		else if (this.opt('timezone') === 'UTC') {
			mom = momentExt.utc.apply(null, args); // process as UTC
		}
		else {
			mom = momentExt.parseZone.apply(null, args); // let the input decide the zone
		}

		this.localizeMoment(mom); // TODO

		return mom;
	}


	msToMoment(ms, forceAllDay) {
		var mom = momentExt.utc(ms); // TODO: optimize by using Date.UTC

		if (forceAllDay) {
			mom.stripTime();
		}
		else {
			mom = this.applyTimezone(mom); // may or may not apply locale
		}

		this.localizeMoment(mom);

		return mom;
	}


	msToUtcMoment(ms, forceAllDay) {
		var mom = momentExt.utc(ms); // TODO: optimize by using Date.UTC

		if (forceAllDay) {
			mom.stripTime();
		}

		this.localizeMoment(mom);

		return mom;
	}


	// Updates the given moment's locale settings to the current calendar locale settings.
	localizeMoment(mom) {
		mom._locale = this.localeData;
	}


	// Returns a boolean about whether or not the calendar knows how to calculate
	// the timezone offset of arbitrary dates in the current timezone.
	getIsAmbigTimezone() {
		return this.opt('timezone') !== 'local' && this.opt('timezone') !== 'UTC';
	}


	// Returns a copy of the given date in the current timezone. Has no effect on dates without times.
	applyTimezone(date) {
		if (!date.hasTime()) {
			return date.clone();
		}

		var zonedDate = this.moment(date.toArray());
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
	}


	/*
	Assumes the footprint is non-open-ended.
	*/
	footprintToDateProfile(componentFootprint, ignoreEnd) {
		var start = momentExt.utc(componentFootprint.unzonedRange.startMs);
		var end;

		if (!ignoreEnd) {
			end = momentExt.utc(componentFootprint.unzonedRange.endMs);
		}

		if (componentFootprint.isAllDay) {
			start.stripTime();

			if (end) {
				end.stripTime();
			}
		}
		else {
			start = this.applyTimezone(start);

			if (end) {
				end = this.applyTimezone(end);
			}
		}

		return new EventDateProfile(start, end, this);
	}


	// Returns a moment for the current date, as defined by the client's computer or from the `now` option.
	// Will return an moment with an ambiguous timezone.
	getNow() {
		var now = this.opt('now');
		if (typeof now === 'function') {
			now = now();
		}
		return this.moment(now).stripZone();
	}


	// Produces a human-readable string for the given duration.
	// Side-effect: changes the locale of the given duration.
	humanizeDuration(duration) {
		return duration.locale(this.opt('locale')).humanize();
	}


	// will return `null` if invalid range
	parseUnzonedRange(rangeInput) {
		var start = null;
		var end = null;

		if (rangeInput.start) {
			start = this.moment(rangeInput.start).stripZone();
		}

		if (rangeInput.end) {
			end = this.moment(rangeInput.end).stripZone();
		}

		if (!start && !end) {
			return null;
		}

		if (start && end && end.isBefore(start)) {
			return null;
		}

		return new UnzonedRange(start, end);
	}


	// Event-Date Utilities
	// -----------------------------------------------------------------------------------------------------------------


	initEventManager() {
		var eventManager = new EventManager(this);
		var rawSources = this.opt('eventSources') || [];
		var singleRawSource = this.opt('events');

		this.eventManager = eventManager;

		if (singleRawSource) {
			rawSources.unshift(singleRawSource);
		}

		eventManager.on('release', (eventsPayload) => {
			this.trigger('eventsReset', eventsPayload);
		});

		eventManager.freeze();

		rawSources.forEach((rawSource) => {
			var source = EventSourceParser.parse(rawSource, this);

			if (source) {
				eventManager.addSource(source);
			}
		});

		eventManager.thaw();
	}


	requestEvents(start, end) {
		return this.eventManager.requestEvents(
			start,
			end,
			this.opt('timezone'),
			!this.opt('lazyFetching')
		);
	}


	// Get an event's normalized end date. If not present, calculate it from the defaults.
	getEventEnd(event) {
		if (event.end) {
			return event.end.clone();
		}
		else {
			return this.getDefaultEventEnd(event.allDay, event.start);
		}
	}


	// Given an event's allDay status and start date, return what its fallback end date should be.
	// TODO: rename to computeDefaultEventEnd
	getDefaultEventEnd(allDay, zonedStart) {
		var end = zonedStart.clone();

		if (allDay) {
			end.stripTime().add(this.defaultAllDayEventDuration);
		}
		else {
			end.add(this.defaultTimedEventDuration);
		}

		if (this.getIsAmbigTimezone()) {
			end.stripZone(); // we don't know what the tzo should be
		}

		return end;
	}


	// Public Events API
	// -----------------------------------------------------------------------------------------------------------------


	rerenderEvents() { // API method. destroys old events if previously rendered.
		this.view.flash('displayingEvents');
	}


	refetchEvents() {
		this.eventManager.refetchAllSources();
	}


	renderEvents(eventInputs, isSticky) {
		this.eventManager.freeze();

		for (var i = 0; i < eventInputs.length; i++) {
			this.renderEvent(eventInputs[i], isSticky);
		}

		this.eventManager.thaw();
	}


	renderEvent(eventInput, isSticky) {
		var eventManager = this.eventManager;
		var eventDef = EventDefParser.parse(
			eventInput,
			eventInput.source || eventManager.stickySource
		);

		if (eventDef) {
			eventManager.addEventDef(eventDef, isSticky);
		}
	}


	// legacyQuery operates on legacy event instance objects
	removeEvents(legacyQuery) {
		var eventManager = this.eventManager;
		var legacyInstances = [];
		var idMap = {};
		var eventDef;
		var i;

		if (legacyQuery == null) { // shortcut for removing all
			eventManager.removeAllEventDefs(true); // persist=true
		}
		else {
			eventManager.getEventInstances().forEach(function(eventInstance) {
				legacyInstances.push(eventInstance.toLegacy());
			});

			legacyInstances = filterLegacyEventInstances(legacyInstances, legacyQuery);

			// compute unique IDs
			for (i = 0; i < legacyInstances.length; i++) {
				eventDef = this.eventManager.getEventDefByUid(legacyInstances[i]._id);
				idMap[eventDef.id] = true;
			}

			eventManager.freeze();

			for (i in idMap) { // reuse `i` as an "id"
				eventManager.removeEventDefsById(i, true); // persist=true
			}

			eventManager.thaw();
		}
	}


	// legacyQuery operates on legacy event instance objects
	clientEvents(legacyQuery) {
		var legacyEventInstances = [];

		this.eventManager.getEventInstances().forEach(function(eventInstance) {
			legacyEventInstances.push(eventInstance.toLegacy());
		});

		return filterLegacyEventInstances(legacyEventInstances, legacyQuery);
	}


	updateEvents(eventPropsArray) {
		this.eventManager.freeze();

		for (var i = 0; i < eventPropsArray.length; i++) {
			this.updateEvent(eventPropsArray[i]);
		}

		this.eventManager.thaw();
	}


	updateEvent(eventProps) {
		var eventDef = this.eventManager.getEventDefByUid(eventProps._id);
		var eventInstance;
		var eventDefMutation;

		if (eventDef instanceof SingleEventDef) {
			eventInstance = eventDef.buildInstance();

			eventDefMutation = EventDefMutation.createFromRawProps(
				eventInstance,
				eventProps, // raw props
				null // largeUnit -- who uses it?
			);

			this.eventManager.mutateEventsWithId(eventDef.id, eventDefMutation); // will release
		}
	}


	// Public Event Sources API
	// ------------------------------------------------------------------------------------


	getEventSources() {
		return this.eventManager.otherSources.slice(); // clone
	}


	getEventSourceById(id) {
		return this.eventManager.getSourceById(
			EventSource.normalizeId(id)
		);
	}


	addEventSource(sourceInput) {
		var source = EventSourceParser.parse(sourceInput, this);

		if (source) {
			this.eventManager.addSource(source);
		}
	}


	removeEventSources(sourceMultiQuery) {
		var eventManager = this.eventManager;
		var sources;
		var i;

		if (sourceMultiQuery == null) {
			this.eventManager.removeAllSources();
		}
		else {
			sources = eventManager.multiQuerySources(sourceMultiQuery);

			eventManager.freeze();

			for (i = 0; i < sources.length; i++) {
				eventManager.removeSource(sources[i]);
			}

			eventManager.thaw();
		}
	}


	removeEventSource(sourceQuery) {
		var eventManager = this.eventManager;
		var sources = eventManager.querySources(sourceQuery);
		var i;

		eventManager.freeze();

		for (i = 0; i < sources.length; i++) {
			eventManager.removeSource(sources[i]);
		}

		eventManager.thaw();
	}


	refetchEventSources(sourceMultiQuery) {
		var eventManager = this.eventManager;
		var sources = eventManager.multiQuerySources(sourceMultiQuery);
		var i;

		eventManager.freeze();

		for (i = 0; i < sources.length; i++) {
			eventManager.refetchSource(sources[i]);
		}

		eventManager.thaw();
	}


}

EmitterMixin.mixInto(Calendar)
ListenerMixin.mixInto(Calendar)


function filterLegacyEventInstances(legacyEventInstances, legacyQuery) {
	if (legacyQuery == null) {
		return legacyEventInstances;
	}
	else if ($.isFunction(legacyQuery)) {
		return legacyEventInstances.filter(legacyQuery);
	}
	else { // an event ID
		legacyQuery += ''; // normalize to string

		return legacyEventInstances.filter(function(legacyEventInstance) {
			// soft comparison because id not be normalized to string
			return legacyEventInstance.id == legacyQuery ||
				legacyEventInstance._id === legacyQuery; // can specify internal id, but must exactly match
		});
	}
}
