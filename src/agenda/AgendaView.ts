import * as moment from 'moment'
import * as $ from 'jquery'
import {
	matchCellWidths,
	uncompensateScroll,
	compensateScroll,
	subtractInnerElHeight,
	htmlEscape
} from '../util'
import Scroller from '../common/Scroller'
import View from '../View'
import TimeGrid from './TimeGrid'
import DayGrid from '../basic/DayGrid'

const AGENDA_ALL_DAY_EVENT_LIMIT = 5;


/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default class AgendaView extends View {

	// initialized after class
	timeGridClass: any // class used to instantiate the timeGrid. subclasses can override
	dayGridClass: any // class used to instantiate the dayGrid. subclasses can override

	timeGrid: any // the main time-grid subcomponent of this view
	dayGrid: any // the "all-day" subcomponent. if all-day is turned off, this will be null

	scroller: any
	axisWidth: any // the width of the time axis running down the side
	usesMinMaxTime: boolean = true // indicates that minTime/maxTime affects rendering


	constructor(calendar, viewSpec) {
		super(calendar, viewSpec);

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
	}


	// Instantiates the TimeGrid object this view needs. Draws from this.timeGridClass
	instantiateTimeGrid() {
		var SubClass: any = makeTimeGridSubclass(this.timeGridClass);

		return new SubClass(this);
	}


	// Instantiates the DayGrid object this view might need. Draws from this.dayGridClass
	instantiateDayGrid() {
		var SubClass: any = makeDayGridSubclass(this.dayGridClass);

		return new SubClass(this);
	}


	/* Rendering
	------------------------------------------------------------------------------------------------------------------*/


	renderSkeleton() {
		var timeGridWrapEl;
		var timeGridEl;

		this.el.addClass('fc-agenda-view').html(this.renderSkeletonHtml());

		this.scroller.render();

		timeGridWrapEl = this.scroller.el.addClass('fc-time-grid-container');
		timeGridEl = $('<div class="fc-time-grid" />').appendTo(timeGridWrapEl);

		this.el.find('.fc-body > tr > td').append(timeGridWrapEl);

		this.timeGrid.headContainerEl = this.el.find('.fc-head-container');
		this.timeGrid.setElement(timeGridEl);

		if (this.dayGrid) {
			this.dayGrid.setElement(this.el.find('.fc-day-grid'));

			// have the day-grid extend it's coordinate area over the <hr> dividing the two grids
			this.dayGrid.bottomCoordPadding = this.dayGrid.el.next('hr').outerHeight();
		}
	}


	unrenderSkeleton() {
		this.timeGrid.removeElement();

		if (this.dayGrid) {
			this.dayGrid.removeElement();
		}

		this.scroller.destroy();
	}


	// Builds the HTML skeleton for the view.
	// The day-grid and time-grid components will render inside containers defined by this HTML.
	renderSkeletonHtml() {
		var theme = this.calendar.theme;

		return '' +
			'<table class="' + theme.getClass('tableGrid') + '">' +
				(this.opt('columnHeader') ?
					'<thead class="fc-head">' +
						'<tr>' +
							'<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
						'</tr>' +
					'</thead>' :
					''
					) +
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
	}


	// Generates an HTML attribute string for setting the width of the axis, if it is known
	axisStyleAttr() {
		if (this.axisWidth != null) {
			return 'style="width:' + this.axisWidth + 'px"';
		}
		return '';
	}


	/* Now Indicator
	------------------------------------------------------------------------------------------------------------------*/


	getNowIndicatorUnit() {
		return this.timeGrid.getNowIndicatorUnit();
	}


	/* Dimensions
	------------------------------------------------------------------------------------------------------------------*/


	// Adjusts the vertical dimensions of the view to the specified values
	updateSize(totalHeight, isAuto, isResize) {
		var eventLimit;
		var scrollerHeight;
		var scrollbarWidths;

		super.updateSize(totalHeight, isAuto, isResize);

		// make all axis cells line up, and record the width so newly created axis cells will have it
		this.axisWidth = matchCellWidths(this.el.find('.fc-axis'));

		// hack to give the view some height prior to timeGrid's columns being rendered
		// TODO: separate setting height from scroller VS timeGrid.
		if (!this.timeGrid.colEls) {
			if (!isAuto) {
				scrollerHeight = this.computeScrollerHeight(totalHeight);
				this.scroller.setHeight(scrollerHeight);
			}
			return;
		}

		// set of fake row elements that must compensate when scroller has scrollbars
		var noScrollRowEls = this.el.find('.fc-row:not(.fc-scroller *)');

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
	}


	// given a desired total height of the view, returns what the height of the scroller should be
	computeScrollerHeight(totalHeight) {
		return totalHeight -
			subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
	}


	/* Scroll
	------------------------------------------------------------------------------------------------------------------*/


	// Computes the initial pre-configured scroll state prior to allowing the user to change it
	computeInitialDateScroll() {
		var scrollTime = moment.duration(this.opt('scrollTime'));
		var top = this.timeGrid.computeTimeTop(scrollTime);

		// zoom can give weird floating-point values. rather scroll a little bit further
		top = Math.ceil(top);

		if (top) {
			top++; // to overcome top border that slots beyond the first have. looks better
		}

		return { top: top };
	}


	queryDateScroll() {
		return { top: this.scroller.getScrollTop() };
	}


	applyDateScroll(scroll) {
		if (scroll.top !== undefined) {
			this.scroller.setScrollTop(scroll.top);
		}
	}


	/* Hit Areas
	------------------------------------------------------------------------------------------------------------------*/
	// forward all hit-related method calls to the grids (dayGrid might not be defined)


	getHitFootprint(hit) {
		// TODO: hit.component is set as a hack to identify where the hit came from
		return hit.component.getHitFootprint(hit);
	}


	getHitEl(hit) {
		// TODO: hit.component is set as a hack to identify where the hit came from
		return hit.component.getHitEl(hit);
	}


	/* Event Rendering
	------------------------------------------------------------------------------------------------------------------*/


	executeEventRender(eventsPayload) {
		var dayEventsPayload = {};
		var timedEventsPayload = {};
		var id, eventInstanceGroup;

		// separate the events into all-day and timed
		for (id in eventsPayload) {
			eventInstanceGroup = eventsPayload[id];

			if (eventInstanceGroup.getEventDef().isAllDay()) {
				dayEventsPayload[id] = eventInstanceGroup;
			}
			else {
				timedEventsPayload[id] = eventInstanceGroup;
			}
		}

		this.timeGrid.executeEventRender(timedEventsPayload);

		if (this.dayGrid) {
			this.dayGrid.executeEventRender(dayEventsPayload);
		}
	}


	/* Dragging/Resizing Routing
	------------------------------------------------------------------------------------------------------------------*/


	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag(eventFootprints, seg, isTouch) {
		var groups = groupEventFootprintsByAllDay(eventFootprints);
		var renderedHelper = false;

		renderedHelper = this.timeGrid.renderDrag(groups.timed, seg, isTouch);

		if (this.dayGrid) {
			renderedHelper = this.dayGrid.renderDrag(groups.allDay, seg, isTouch) || renderedHelper;
		}

		return renderedHelper;
	}


	renderEventResize(eventFootprints, seg, isTouch) {
		var groups = groupEventFootprintsByAllDay(eventFootprints);

		this.timeGrid.renderEventResize(groups.timed, seg, isTouch);

		if (this.dayGrid) {
			this.dayGrid.renderEventResize(groups.allDay, seg, isTouch);
		}
	}


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection
	renderSelectionFootprint(componentFootprint) {
		if (!componentFootprint.isAllDay) {
			this.timeGrid.renderSelectionFootprint(componentFootprint);
		}
		else if (this.dayGrid) {
			this.dayGrid.renderSelectionFootprint(componentFootprint);
		}
	}

}


AgendaView.prototype.timeGridClass = TimeGrid;
AgendaView.prototype.dayGridClass = DayGrid;


// Will customize the rendering behavior of the AgendaView's timeGrid
function makeTimeGridSubclass(SuperClass) {

	return class SubClass extends SuperClass {

		// Generates the HTML that will go before the day-of week header cells
		renderHeadIntroHtml() {
			var view = this.view;
			var calendar = view.calendar;
			var weekStart = calendar.msToUtcMoment(this.dateProfile.renderUnzonedRange.startMs, true);
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
		}


		// Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
		renderBgIntroHtml() {
			var view = this.view;

			return '<td class="fc-axis ' + view.calendar.theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '></td>';
		}


		// Generates the HTML that goes before all other types of cells.
		// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
		renderIntroHtml() {
			var view = this.view;

			return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
		}

	}
};


// Will customize the rendering behavior of the AgendaView's dayGrid
function makeDayGridSubclass(SuperClass) {

	return class SubClass extends SuperClass {

		// Generates the HTML that goes before the all-day cells
		renderBgIntroHtml() {
			var view = this.view;

			return '' +
				'<td class="fc-axis ' + view.calendar.theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '>' +
					'<span>' + // needed for matchCellWidths
						view.getAllDayHtml() +
					'</span>' +
				'</td>';
		}


		// Generates the HTML that goes before all other types of cells.
		// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
		renderIntroHtml() {
			var view = this.view;

			return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
		}

	}
};


function groupEventFootprintsByAllDay(eventFootprints) {
	var allDay = [];
	var timed = [];
	var i;

	for (i = 0; i < eventFootprints.length; i++) {
		if (eventFootprints[i].componentFootprint.isAllDay) {
			allDay.push(eventFootprints[i]);
		}
		else {
			timed.push(eventFootprints[i]);
		}
	}

	return { allDay: allDay, timed: timed };
}
