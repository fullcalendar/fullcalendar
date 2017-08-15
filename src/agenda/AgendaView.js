
/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

var AgendaView = FC.AgendaView = View.extend({

	scroller: null,

	timeGridClass: TimeGrid, // class used to instantiate the timeGrid. subclasses can override
	timeGrid: null, // the main time-grid subcomponent of this view

	dayGridClass: DayGrid, // class used to instantiate the dayGrid. subclasses can override
	dayGrid: null, // the "all-day" subcomponent. if all-day is turned off, this will be null

	axisWidth: null, // the width of the time axis running down the side

	headContainerEl: null, // div that hold's the timeGrid's rendered date header

	// indicates that minTime/maxTime affects rendering
	usesMinMaxTime: true,


	constructor: function() {
		View.apply(this, arguments);

		this.timeGrid = this.instantiateTimeGrid();
		this.addChild(this.timeGrid);

		if (this.opt('allDaySlot')) { // should we display the "all-day" area?
			this.dayGrid = this.instantiateDayGrid(); // the all-day subcomponent of this view
			this.addChild(this.dayGrid);
		}

		this.scroller = new Scroller({
			overflowX: 'hidden',
			overflowY: 'auto'
		});
	},


	// Instantiates the TimeGrid object this view needs. Draws from this.timeGridClass
	instantiateTimeGrid: function() {
		var subclass = this.timeGridClass.extend(agendaTimeGridMethods);

		return new subclass(this);
	},


	// Instantiates the DayGrid object this view might need. Draws from this.dayGridClass
	instantiateDayGrid: function() {
		var subclass = this.dayGridClass.extend(agendaDayGridMethods);

		return new subclass(this);
	},


	/* Rendering
	------------------------------------------------------------------------------------------------------------------*/


	renderSkeleton: function() {
		var timeGridWrapEl;
		var timeGridEl;

		this.el.addClass('fc-agenda-view').html(this.renderSkeletonHtml());

		this.scroller.render();

		timeGridWrapEl = this.scroller.el.addClass('fc-time-grid-container');
		timeGridEl = $('<div class="fc-time-grid" />').appendTo(timeGridWrapEl);

		this.el.find('.fc-body > tr > td').append(timeGridWrapEl);

		this.timeGrid.setElement(timeGridEl);

		if (this.dayGrid) {
			this.dayGrid.setElement(this.el.find('.fc-day-grid'));

			// have the day-grid extend it's coordinate area over the <hr> dividing the two grids
			this.dayGrid.bottomCoordPadding = this.dayGrid.el.next('hr').outerHeight();
		}
	},


	unrenderSkeleton: function() {
		this.timeGrid.removeElement();

		if (this.dayGrid) {
			this.dayGrid.removeElement();
		}

		this.scroller.destroy();
	},


	// Renders the view into `this.el`, which has already been assigned
	renderDates: function(dateProfile) {
		this.renderHead();
	},


	// render the day-of-week headers
	renderHead: function() {
		this.headContainerEl =
			this.el.find('.fc-head-container')
				.html(this.timeGrid.renderHeadHtml());
	},


	// Builds the HTML skeleton for the view.
	// The day-grid and time-grid components will render inside containers defined by this HTML.
	renderSkeletonHtml: function() {
		var theme = this.calendar.theme;

		return '' +
			'<table class="' + theme.getClass('tableGrid') + '">' +
				'<thead class="fc-head">' +
					'<tr>' +
						'<td class="fc-head-container ' + theme.getClass('widgetHeader') + '"></td>' +
					'</tr>' +
				'</thead>' +
				'<tbody class="fc-body">' +
					'<tr>' +
						'<td class="' + theme.getClass('widgetContent') + '">' +
							(this.dayGrid ?
								'<div class="fc-day-grid"/>' +
								'<hr class="fc-divider ' + theme.getClass('widgetHeader') + '"/>' :
								''
								) +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>';
	},


	// Generates an HTML attribute string for setting the width of the axis, if it is known
	axisStyleAttr: function() {
		if (this.axisWidth !== null) {
			 return 'style="width:' + this.axisWidth + 'px"';
		}
		return '';
	},


	/* Now Indicator
	------------------------------------------------------------------------------------------------------------------*/


	getNowIndicatorUnit: function() {
		return this.timeGrid.getNowIndicatorUnit();
	},


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/


	// Adjusts the vertical dimensions of the view to the specified values
	updateSize: function(totalHeight, isAuto, isResize) {
		View.prototype.updateSize.apply(this, arguments);

		// make all axis cells line up, and record the width so newly created axis cells will have it
		this.axisWidth = matchCellWidths(this.el.find('.fc-axis'));

		// set of fake row elements that must compensate when scroller has scrollbars
		var noScrollRowEls = this.el.find('.fc-row:not(.fc-scroller *)');

		var eventLimit;
		var scrollerHeight;
		var scrollbarWidths;

		// reset all dimensions back to the original state
		this.timeGrid.bottomRuleEl.hide(); // .show() will be called later if this <hr> is necessary
		this.scroller.clear(); // sets height to 'auto' and clears overflow
		uncompensateScroll(noScrollRowEls);

		// limit number of events in the all-day area
		if (this.dayGrid) {
			this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed

			eventLimit = this.opt('eventLimit');
			if (eventLimit && typeof eventLimit !== 'number') {
				eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
			}
			if (eventLimit) {
				this.dayGrid.limitRows(eventLimit);
			}
		}

		if (!isAuto) { // should we force dimensions of the scroll container?

			scrollerHeight = this.computeScrollerHeight(totalHeight);
			this.scroller.setHeight(scrollerHeight);
			scrollbarWidths = this.scroller.getScrollbarWidths();

			if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

				// make the all-day and header rows lines up
				compensateScroll(noScrollRowEls, scrollbarWidths);

				// the scrollbar compensation might have changed text flow, which might affect height, so recalculate
				// and reapply the desired height to the scroller.
				scrollerHeight = this.computeScrollerHeight(totalHeight);
				this.scroller.setHeight(scrollerHeight);
			}

			// guarantees the same scrollbar widths
			this.scroller.lockOverflow(scrollbarWidths);

			// if there's any space below the slats, show the horizontal rule.
			// this won't cause any new overflow, because lockOverflow already called.
			if (this.timeGrid.getTotalSlatHeight() < scrollerHeight) {
				this.timeGrid.bottomRuleEl.show();
			}
		}
	},


	// given a desired total height of the view, returns what the height of the scroller should be
	computeScrollerHeight: function(totalHeight) {
		return totalHeight -
			subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
	},


	/* Scroll
	------------------------------------------------------------------------------------------------------------------*/


	// Computes the initial pre-configured scroll state prior to allowing the user to change it
	computeInitialDateScroll: function() {
		var scrollTime = moment.duration(this.opt('scrollTime'));
		var top = this.timeGrid.computeTimeTop(scrollTime);

		// zoom can give weird floating-point values. rather scroll a little bit further
		top = Math.ceil(top);

		if (top) {
			top++; // to overcome top border that slots beyond the first have. looks better
		}

		return { top: top };
	},


	queryDateScroll: function() {
		return { top: this.scroller.getScrollTop() };
	},


	applyDateScroll: function(scroll) {
		if (scroll.top !== undefined) {
			this.scroller.setScrollTop(scroll.top);
		}
	},


	/* Hit Areas
	------------------------------------------------------------------------------------------------------------------*/
	// forward all hit-related method calls to the grids (dayGrid might not be defined)


	getHitFootprint: function(hit) {
		// TODO: hit.component is set as a hack to identify where the hit came from
		return hit.component.getHitFootprint(hit);
	},


	getHitEl: function(hit) {
		// TODO: hit.component is set as a hack to identify where the hit came from
		return hit.component.getHitEl(hit);
	},


	/* Events
	------------------------------------------------------------------------------------------------------------------*/


	handleEventChangeset: function(eventChangeset) {
		var allDayChangeset = new EventInstanceChangeset();
		var timedChangeset = new EventInstanceChangeset();

		eventChangeset.removals.forEach(function(instance) {
			if (instance.def.isAllDay()) {
				allDayChangeset.removals.push(instance);
			}
			else {
				timedChangeset.removals.push(instance);
			}
		});

		eventChangeset.iterEventInstances(function(instance) {
			if (instance.def.isAllDay()) {
				allDayChangeset.addEventInstance(instance);
			}
			else {
				timedChangeset.addEventInstance(instance);
			}
		});

		this.timeGrid.handleEventChangeset(timedChangeset);

		if (this.dayGrid) {
			this.dayGrid.handleEventChangeset(allDayChangeset);
		}
	},


	/* Dragging (for events and external elements) and Resizing
	------------------------------------------------------------------------------------------------------------------*/


	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(eventFootprints, seg, isTouch) {
		var allDayFootprints = [];
		var timedFootprints = [];
		var i;
		var renderedHelper = false;

		for (i = 0; i < eventFootprints.length; i++) {
			if (eventFootprints[i].componentFootprint.isAllDay) {
				allDayFootprints.push(eventFootprints[i]);
			}
			else {
				timedFootprints.push(eventFootprints[i]);
			}
		}

		renderedHelper = this.timeGrid.renderDrag(timedFootprints, seg, isTouch);

		if (this.dayGrid) {
			renderedHelper = this.dayGrid.renderDrag(allDayFootprints, seg, isTouch) || renderedHelper;
		}

		return renderedHelper;
	},


	renderEventResize: function(eventFootprints, seg, isTouch) {
		var allDayFootprints = [];
		var timedFootprints = [];
		var i;
		var renderedHelper = false;

		for (i = 0; i < eventFootprints.length; i++) {
			if (eventFootprints[i].componentFootprint.isAllDay) {
				allDayFootprints.push(eventFootprints[i]);
			}
			else {
				timedFootprints.push(eventFootprints[i]);
			}
		}

		renderedHelper = this.timeGrid.renderEventResize(timedFootprints, seg, isTouch);

		if (this.dayGrid) {
			renderedHelper = this.dayGrid.renderEventResize(allDayFootprints, seg, isTouch) || renderedHelper;
		}

		return renderedHelper;
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection
	renderSelectionFootprint: function(componentFootprint) {
		if (!componentFootprint.isAllDay) {
			this.timeGrid.renderSelectionFootprint(componentFootprint);
		}
		else if (this.dayGrid) {
			this.dayGrid.renderSelectionFootprint(componentFootprint);
		}
	}

});


// Methods that will customize the rendering behavior of the AgendaView's timeGrid
// TODO: move into TimeGrid
var agendaTimeGridMethods = {


	// Generates the HTML that will go before the day-of week header cells
	renderHeadIntroHtml: function() {
		var view = this.view;
		var calendar = view.calendar;
		var dateProfile = this.get('dateProfile');
		var weekStart = calendar.msToUtcMoment(dateProfile.renderUnzonedRange.startMs, true);
		var weekText;

		if (this.opt('weekNumbers')) {
			weekText = weekStart.format(this.opt('smallWeekFormat'));

			return '' +
				'<th class="fc-axis fc-week-number ' + calendar.theme.getClass('widgetHeader') + '" ' + view.axisStyleAttr() + '>' +
					view.buildGotoAnchorHtml( // aside from link, important for matchCellWidths
						{ date: weekStart, type: 'week', forceOff: this.colCnt > 1 },
						htmlEscape(weekText) // inner HTML
					) +
				'</th>';
		}
		else {
			return '<th class="fc-axis ' + calendar.theme.getClass('widgetHeader') + '" ' + view.axisStyleAttr() + '></th>';
		}
	},


	// Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
	renderBgIntroHtml: function() {
		var view = this.view;

		return '<td class="fc-axis ' + view.calendar.theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '></td>';
	},


	// Generates the HTML that goes before all other types of cells.
	// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
	renderIntroHtml: function() {
		var view = this.view;

		return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
	}

};


// Methods that will customize the rendering behavior of the AgendaView's dayGrid
var agendaDayGridMethods = {


	// Generates the HTML that goes before the all-day cells
	renderBgIntroHtml: function() {
		var view = this.view;

		return '' +
			'<td class="fc-axis ' + view.calendar.theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '>' +
				'<span>' + // needed for matchCellWidths
					view.getAllDayHtml() +
				'</span>' +
			'</td>';
	},


	// Generates the HTML that goes before all other types of cells.
	// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
	renderIntroHtml: function() {
		var view = this.view;

		return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
	}

};
