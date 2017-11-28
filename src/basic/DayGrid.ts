import * as $ from 'jquery'
import { htmlEscape } from '../util'
import CoordCache from '../common/CoordCache'
import Popover from '../common/Popover'
import UnzonedRange from '../models/UnzonedRange'
import ComponentFootprint from '../models/ComponentFootprint'
import EventFootprint from '../models/event/EventFootprint'
import BusinessHourRenderer from '../component/renderers/BusinessHourRenderer'
import StandardInteractionsMixin from '../component/interactions/StandardInteractionsMixin'
import InteractiveDateComponent from '../component/InteractiveDateComponent'
import { default as DayTableMixin, DayTableInterface } from '../component/DayTableMixin'
import DayGridEventRenderer from './DayGridEventRenderer'
import DayGridHelperRenderer from './DayGridHelperRenderer'
import DayGridFillRenderer from './DayGridFillRenderer'


/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

export default class DayGrid extends InteractiveDateComponent {

	rowCnt: DayTableInterface['rowCnt']
	colCnt: DayTableInterface['colCnt']
	daysPerRow: DayTableInterface['daysPerRow']
	sliceRangeByRow: DayTableInterface['sliceRangeByRow']
	updateDayTable: DayTableInterface['updateDayTable']
	renderHeadHtml: DayTableInterface['renderHeadHtml']
	getCellDate: DayTableInterface['getCellDate']
	renderBgTrHtml: DayTableInterface['renderBgTrHtml']
	renderIntroHtml: DayTableInterface['renderIntroHtml']
	getCellRange: DayTableInterface['getCellRange']
	sliceRangeByDay: DayTableInterface['sliceRangeByDay']

	view: any // TODO: make more general and/or remove
	helperRenderer: any

	cellWeekNumbersVisible: boolean = false // display week numbers in day cell?

	bottomCoordPadding: number = 0 // hack for extending the hit area for the last row of the coordinate grid

	headContainerEl: any // div that hold's the date header
	rowEls: any // set of fake row elements
	cellEls: any // set of whole-day elements comprising the row's background

	rowCoordCache: any
	colCoordCache: any

	// isRigid determines whether the individual rows should ignore the contents and be a constant height.
	// Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
	isRigid: boolean = false

	hasAllDayBusinessHours: boolean = true

	segPopover: any // the Popover that holds events that can't fit in a cell. null when not visible
	popoverSegs: any // an array of segment objects that the segPopover holds. null when not visible


	constructor(view) { // view is required, unlike superclass
		super(view)
	}


	// Slices up the given span (unzoned start/end with other misc data) into an array of segments
	componentFootprintToSegs(componentFootprint) {
		var segs = this.sliceRangeByRow(componentFootprint.unzonedRange);
		var i, seg;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];

			if (this.isRTL) {
				seg.leftCol = this.daysPerRow - 1 - seg.lastRowDayIndex;
				seg.rightCol = this.daysPerRow - 1 - seg.firstRowDayIndex;
			}
			else {
				seg.leftCol = seg.firstRowDayIndex;
				seg.rightCol = seg.lastRowDayIndex;
			}
		}

		return segs;
	}


	/* Date Rendering
	------------------------------------------------------------------------------------------------------------------*/


	renderDates(dateProfile) {
		this.dateProfile = dateProfile;
		this.updateDayTable();
		this.renderGrid();
	}


	unrenderDates() {
		this.removeSegPopover();
	}


	// Renders the rows and columns into the component's `this.el`, which should already be assigned.
	renderGrid() {
		var view = this.view;
		var rowCnt = this.rowCnt;
		var colCnt = this.colCnt;
		var html = '';
		var row;
		var col;

		if (this.headContainerEl) {
			this.headContainerEl.html(this.renderHeadHtml());
		}

		for (row = 0; row < rowCnt; row++) {
			html += this.renderDayRowHtml(row, this.isRigid);
		}
		this.el.html(html);

		this.rowEls = this.el.find('.fc-row');
		this.cellEls = this.el.find('.fc-day, .fc-disabled-day');

		this.rowCoordCache = new CoordCache({
			els: this.rowEls,
			isVertical: true
		});
		this.colCoordCache = new CoordCache({
			els: this.cellEls.slice(0, this.colCnt), // only the first row
			isHorizontal: true
		});

		// trigger dayRender with each cell's element
		for (row = 0; row < rowCnt; row++) {
			for (col = 0; col < colCnt; col++) {
				this.publiclyTrigger('dayRender', {
					context: view,
					args: [
						this.getCellDate(row, col),
						this.getCellEl(row, col),
						view
					]
				});
			}
		}
	}


	// Generates the HTML for a single row, which is a div that wraps a table.
	// `row` is the row number.
	renderDayRowHtml(row, isRigid) {
		var theme = this.view.calendar.theme;
		var classes = [ 'fc-row', 'fc-week', theme.getClass('dayRow') ];

		if (isRigid) {
			classes.push('fc-rigid');
		}

		return '' +
			'<div class="' + classes.join(' ') + '">' +
				'<div class="fc-bg">' +
					'<table class="' + theme.getClass('tableGrid') + '">' +
						this.renderBgTrHtml(row) +
					'</table>' +
				'</div>' +
				'<div class="fc-content-skeleton">' +
					'<table>' +
						(this.getIsNumbersVisible() ?
							'<thead>' +
								this.renderNumberTrHtml(row) +
							'</thead>' :
							''
							) +
					'</table>' +
				'</div>' +
			'</div>';
	}


	getIsNumbersVisible() {
		return this.getIsDayNumbersVisible() || this.cellWeekNumbersVisible;
	}


	getIsDayNumbersVisible() {
		return this.rowCnt > 1;
	}


	/* Grid Number Rendering
	------------------------------------------------------------------------------------------------------------------*/


	renderNumberTrHtml(row) {
		return '' +
			'<tr>' +
				(this.isRTL ? '' : this.renderNumberIntroHtml(row)) +
				this.renderNumberCellsHtml(row) +
				(this.isRTL ? this.renderNumberIntroHtml(row) : '') +
			'</tr>';
	}


	renderNumberIntroHtml(row) {
		return this.renderIntroHtml();
	}


	renderNumberCellsHtml(row) {
		var htmls = [];
		var col, date;

		for (col = 0; col < this.colCnt; col++) {
			date = this.getCellDate(row, col);
			htmls.push(this.renderNumberCellHtml(date));
		}

		return htmls.join('');
	}


	// Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
	// The number row will only exist if either day numbers or week numbers are turned on.
	renderNumberCellHtml(date) {
		var view = this.view;
		var html = '';
		var isDateValid = this.dateProfile.activeUnzonedRange.containsDate(date); // TODO: called too frequently. cache somehow.
		var isDayNumberVisible = this.getIsDayNumbersVisible() && isDateValid;
		var classes;
		var weekCalcFirstDoW;

		if (!isDayNumberVisible && !this.cellWeekNumbersVisible) {
			// no numbers in day cell (week number must be along the side)
			return '<td/>'; //  will create an empty space above events :(
		}

		classes = this.getDayClasses(date);
		classes.unshift('fc-day-top');

		if (this.cellWeekNumbersVisible) {
			// To determine the day of week number change under ISO, we cannot
			// rely on moment.js methods such as firstDayOfWeek() or weekday(),
			// because they rely on the locale's dow (possibly overridden by
			// our firstDay option), which may not be Monday. We cannot change
			// dow, because that would affect the calendar start day as well.
			if (date._locale._fullCalendar_weekCalc === 'ISO') {
				weekCalcFirstDoW = 1;  // Monday by ISO 8601 definition
			}
			else {
				weekCalcFirstDoW = date._locale.firstDayOfWeek();
			}
		}

		html += '<td class="' + classes.join(' ') + '"' +
			(isDateValid ?
				' data-date="' + date.format() + '"' :
				''
				) +
			'>';

		if (this.cellWeekNumbersVisible && (date.day() == weekCalcFirstDoW)) {
			html += view.buildGotoAnchorHtml(
				{ date: date, type: 'week' },
				{ 'class': 'fc-week-number' },
				date.format('w') // inner HTML
			);
		}

		if (isDayNumberVisible) {
			html += view.buildGotoAnchorHtml(
				date,
				{ 'class': 'fc-day-number' },
				date.date() // inner HTML
			);
		}

		html += '</td>';

		return html;
	}


	/* Hit System
	------------------------------------------------------------------------------------------------------------------*/


	prepareHits() {
		this.colCoordCache.build();
		this.rowCoordCache.build();
		this.rowCoordCache.bottoms[this.rowCnt - 1] += this.bottomCoordPadding; // hack
	}


	releaseHits() {
		this.colCoordCache.clear();
		this.rowCoordCache.clear();
	}


	queryHit(leftOffset, topOffset) {
		if (this.colCoordCache.isLeftInBounds(leftOffset) && this.rowCoordCache.isTopInBounds(topOffset)) {
			var col = this.colCoordCache.getHorizontalIndex(leftOffset);
			var row = this.rowCoordCache.getVerticalIndex(topOffset);

			if (row != null && col != null) {
				return this.getCellHit(row, col);
			}
		}
	}


	getHitFootprint(hit) {
		var range = this.getCellRange(hit.row, hit.col);

		return new ComponentFootprint(
			new UnzonedRange(range.start, range.end),
			true // all-day?
		);
	}


	getHitEl(hit) {
		return this.getCellEl(hit.row, hit.col);
	}


	/* Cell System
	------------------------------------------------------------------------------------------------------------------*/
	// FYI: the first column is the leftmost column, regardless of date


	getCellHit(row, col): any {
		return {
			row: row,
			col: col,
			component: this, // needed unfortunately :(
			left: this.colCoordCache.getLeftOffset(col),
			right: this.colCoordCache.getRightOffset(col),
			top: this.rowCoordCache.getTopOffset(row),
			bottom: this.rowCoordCache.getBottomOffset(row)
		};
	}


	getCellEl(row, col) {
		return this.cellEls.eq(row * this.colCnt + col);
	}


	/* Event Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Unrenders all events currently rendered on the grid
	executeEventUnrender() {
		this.removeSegPopover(); // removes the "more.." events popover
		super.executeEventUnrender();
	}


	// Retrieves all rendered segment objects currently rendered on the grid
	getOwnEventSegs() {
		// append the segments from the "more..." popover
		return super.getOwnEventSegs().concat(this.popoverSegs || []);
	}


	/* Event Drag Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event or external element being dragged.
	// `eventLocation` has zoned start and end (optional)
	renderDrag(eventFootprints, seg, isTouch) {
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			this.renderHighlight(eventFootprints[i].componentFootprint);
		}

		// render drags from OTHER components as helpers
		if (eventFootprints.length && seg && seg.component !== this) {
			this.helperRenderer.renderEventDraggingFootprints(eventFootprints, seg, isTouch);

			return true; // signal helpers rendered
		}
	}


	// Unrenders any visual indication of a hovering event
	unrenderDrag() {
		this.unrenderHighlight();
		this.helperRenderer.unrender();
	}


	/* Event Resize Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being resized
	renderEventResize(eventFootprints, seg, isTouch) {
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			this.renderHighlight(eventFootprints[i].componentFootprint);
		}

		this.helperRenderer.renderEventResizingFootprints(eventFootprints, seg, isTouch);
	}


	// Unrenders a visual indication of an event being resized
	unrenderEventResize() {
		this.unrenderHighlight();
		this.helperRenderer.unrender();
	}


	/* More+ Link Popover
	------------------------------------------------------------------------------------------------------------------*/


	removeSegPopover() {
		if (this.segPopover) {
			this.segPopover.hide(); // in handler, will call segPopover's removeElement
		}
	}


	// Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
	// `levelLimit` can be false (don't limit), a number, or true (should be computed).
	limitRows(levelLimit) {
		var rowStructs = this.eventRenderer.rowStructs || [];
		var row; // row #
		var rowLevelLimit;

		for (row = 0; row < rowStructs.length; row++) {
			this.unlimitRow(row);

			if (!levelLimit) {
				rowLevelLimit = false;
			}
			else if (typeof levelLimit === 'number') {
				rowLevelLimit = levelLimit;
			}
			else {
				rowLevelLimit = this.computeRowLevelLimit(row);
			}

			if (rowLevelLimit !== false) {
				this.limitRow(row, rowLevelLimit);
			}
		}
	}


	// Computes the number of levels a row will accomodate without going outside its bounds.
	// Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
	// `row` is the row number.
	computeRowLevelLimit(row): (number | false) {
		var rowEl = this.rowEls.eq(row); // the containing "fake" row div
		var rowHeight = rowEl.height(); // TODO: cache somehow?
		var trEls = this.eventRenderer.rowStructs[row].tbodyEl.children();
		var i, trEl;
		var trHeight;

		function iterInnerHeights(i, childNode) {
			trHeight = Math.max(trHeight, $(childNode).outerHeight());
		}

		// Reveal one level <tr> at a time and stop when we find one out of bounds
		for (i = 0; i < trEls.length; i++) {
			trEl = trEls.eq(i).removeClass('fc-limited'); // reset to original state (reveal)

			// with rowspans>1 and IE8, trEl.outerHeight() would return the height of the largest cell,
			// so instead, find the tallest inner content element.
			trHeight = 0;
			trEl.find('> td > :first-child').each(iterInnerHeights);

			if (trEl.position().top + trHeight > rowHeight) {
				return i;
			}
		}

		return false; // should not limit at all
	}


	// Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
	// `row` is the row number.
	// `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
	limitRow(row, levelLimit) {
		var rowStruct = this.eventRenderer.rowStructs[row];
		var moreNodes = []; // array of "more" <a> links and <td> DOM nodes
		var col = 0; // col #, left-to-right (not chronologically)
		var levelSegs; // array of segment objects in the last allowable level, ordered left-to-right
		var cellMatrix; // a matrix (by level, then column) of all <td> jQuery elements in the row
		var limitedNodes; // array of temporarily hidden level <tr> and segment <td> DOM nodes
		var i, seg;
		var segsBelow; // array of segment objects below `seg` in the current `col`
		var totalSegsBelow; // total number of segments below `seg` in any of the columns `seg` occupies
		var colSegsBelow; // array of segment arrays, below seg, one for each column (offset from segs's first column)
		var td, rowspan;
		var segMoreNodes; // array of "more" <td> cells that will stand-in for the current seg's cell
		var j;
		var moreTd, moreWrap, moreLink;

		// Iterates through empty level cells and places "more" links inside if need be
		var emptyCellsUntil = (endCol) => { // goes from current `col` to `endCol`
			while (col < endCol) {
				segsBelow = this.getCellSegs(row, col, levelLimit);
				if (segsBelow.length) {
					td = cellMatrix[levelLimit - 1][col];
					moreLink = this.renderMoreLink(row, col, segsBelow);
					moreWrap = $('<div/>').append(moreLink);
					td.append(moreWrap);
					moreNodes.push(moreWrap[0]);
				}
				col++;
			}
		}

		if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
			levelSegs = rowStruct.segLevels[levelLimit - 1];
			cellMatrix = rowStruct.cellMatrix;

			limitedNodes = rowStruct.tbodyEl.children().slice(levelLimit) // get level <tr> elements past the limit
				.addClass('fc-limited').get(); // hide elements and get a simple DOM-nodes array

			// iterate though segments in the last allowable level
			for (i = 0; i < levelSegs.length; i++) {
				seg = levelSegs[i];
				emptyCellsUntil(seg.leftCol); // process empty cells before the segment

				// determine *all* segments below `seg` that occupy the same columns
				colSegsBelow = [];
				totalSegsBelow = 0;
				while (col <= seg.rightCol) {
					segsBelow = this.getCellSegs(row, col, levelLimit);
					colSegsBelow.push(segsBelow);
					totalSegsBelow += segsBelow.length;
					col++;
				}

				if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
					td = cellMatrix[levelLimit - 1][seg.leftCol]; // the segment's parent cell
					rowspan = td.attr('rowspan') || 1;
					segMoreNodes = [];

					// make a replacement <td> for each column the segment occupies. will be one for each colspan
					for (j = 0; j < colSegsBelow.length; j++) {
						moreTd = $('<td class="fc-more-cell"/>').attr('rowspan', rowspan);
						segsBelow = colSegsBelow[j];
						moreLink = this.renderMoreLink(
							row,
							seg.leftCol + j,
							[ seg ].concat(segsBelow) // count seg as hidden too
						);
						moreWrap = $('<div/>').append(moreLink);
						moreTd.append(moreWrap);
						segMoreNodes.push(moreTd[0]);
						moreNodes.push(moreTd[0]);
					}

					td.addClass('fc-limited').after($(segMoreNodes)); // hide original <td> and inject replacements
					limitedNodes.push(td[0]);
				}
			}

			emptyCellsUntil(this.colCnt); // finish off the level
			rowStruct.moreEls = $(moreNodes); // for easy undoing later
			rowStruct.limitedEls = $(limitedNodes); // for easy undoing later
		}
	}


	// Reveals all levels and removes all "more"-related elements for a grid's row.
	// `row` is a row number.
	unlimitRow(row) {
		var rowStruct = this.eventRenderer.rowStructs[row];

		if (rowStruct.moreEls) {
			rowStruct.moreEls.remove();
			rowStruct.moreEls = null;
		}

		if (rowStruct.limitedEls) {
			rowStruct.limitedEls.removeClass('fc-limited');
			rowStruct.limitedEls = null;
		}
	}


	// Renders an <a> element that represents hidden event element for a cell.
	// Responsible for attaching click handler as well.
	renderMoreLink(row, col, hiddenSegs) {
		var view = this.view;

		return $('<a class="fc-more"/>')
			.text(
				this.getMoreLinkText(hiddenSegs.length)
			)
			.on('click', (ev) => {
				var clickOption = this.opt('eventLimitClick');
				var date = this.getCellDate(row, col);
				var moreEl = $(ev.currentTarget);
				var dayEl = this.getCellEl(row, col);
				var allSegs = this.getCellSegs(row, col);

				// rescope the segments to be within the cell's date
				var reslicedAllSegs = this.resliceDaySegs(allSegs, date);
				var reslicedHiddenSegs = this.resliceDaySegs(hiddenSegs, date);

				if (typeof clickOption === 'function') {
					// the returned value can be an atomic option
					clickOption = this.publiclyTrigger('eventLimitClick', {
						context: view,
						args: [
							{
								date: date.clone(),
								dayEl: dayEl,
								moreEl: moreEl,
								segs: reslicedAllSegs,
								hiddenSegs: reslicedHiddenSegs
							},
							ev,
							view
						]
					});
				}

				if (clickOption === 'popover') {
					this.showSegPopover(row, col, moreEl, reslicedAllSegs);
				}
				else if (typeof clickOption === 'string') { // a view name
					view.calendar.zoomTo(date, clickOption);
				}
			});
	}


	// Reveals the popover that displays all events within a cell
	showSegPopover(row, col, moreLink, segs) {
		var view = this.view;
		var moreWrap = moreLink.parent(); // the <div> wrapper around the <a>
		var topEl; // the element we want to match the top coordinate of
		var options;

		if (this.rowCnt == 1) {
			topEl = view.el; // will cause the popover to cover any sort of header
		}
		else {
			topEl = this.rowEls.eq(row); // will align with top of row
		}

		options = {
			className: 'fc-more-popover ' + view.calendar.theme.getClass('popover'),
			content: this.renderSegPopoverContent(row, col, segs),
			parentEl: view.el, // attach to root of view. guarantees outside of scrollbars.
			top: topEl.offset().top,
			autoHide: true, // when the user clicks elsewhere, hide the popover
			viewportConstrain: this.opt('popoverViewportConstrain'),
			hide: () => {
				// kill everything when the popover is hidden
				// notify events to be removed
				if (this.popoverSegs) {
					this.triggerBeforeEventSegsDestroyed(this.popoverSegs);
				}
				this.segPopover.removeElement();
				this.segPopover = null;
				this.popoverSegs = null;
			}
		};

		// Determine horizontal coordinate.
		// We use the moreWrap instead of the <td> to avoid border confusion.
		if (this.isRTL) {
			options.right = moreWrap.offset().left + moreWrap.outerWidth() + 1; // +1 to be over cell border
		}
		else {
			options.left = moreWrap.offset().left - 1; // -1 to be over cell border
		}

		this.segPopover = new Popover(options);
		this.segPopover.show();

		// the popover doesn't live within the grid's container element, and thus won't get the event
		// delegated-handlers for free. attach event-related handlers to the popover.
		this.bindAllSegHandlersToEl(this.segPopover.el);

		this.triggerAfterEventSegsRendered(segs);
	}


	// Builds the inner DOM contents of the segment popover
	renderSegPopoverContent(row, col, segs) {
		var view = this.view;
		var theme = view.calendar.theme;
		var title = this.getCellDate(row, col).format(this.opt('dayPopoverFormat'));
		var content = $(
			'<div class="fc-header ' + theme.getClass('popoverHeader') + '">' +
				'<span class="fc-close ' + theme.getIconClass('close') + '"></span>' +
				'<span class="fc-title">' +
					htmlEscape(title) +
				'</span>' +
				'<div class="fc-clear"/>' +
			'</div>' +
			'<div class="fc-body ' + theme.getClass('popoverContent') + '">' +
				'<div class="fc-event-container"></div>' +
			'</div>'
		);
		var segContainer = content.find('.fc-event-container');
		var i;

		// render each seg's `el` and only return the visible segs
		segs = this.eventRenderer.renderFgSegEls(segs, true); // disableResizing=true
		this.popoverSegs = segs;

		for (i = 0; i < segs.length; i++) {

			// because segments in the popover are not part of a grid coordinate system, provide a hint to any
			// grids that want to do drag-n-drop about which cell it came from
			this.hitsNeeded();
			segs[i].hit = this.getCellHit(row, col);
			this.hitsNotNeeded();

			segContainer.append(segs[i].el);
		}

		return content;
	}


	// Given the events within an array of segment objects, reslice them to be in a single day
	resliceDaySegs(segs, dayDate) {
		var dayStart = dayDate.clone();
		var dayEnd = dayStart.clone().add(1, 'days');
		var dayRange = new UnzonedRange(dayStart, dayEnd);
		var newSegs = [];
		var i, seg;
		var slicedRange;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			slicedRange = seg.footprint.componentFootprint.unzonedRange.intersect(dayRange);

			if (slicedRange) {
				newSegs.push(
					$.extend({}, seg, {
						footprint: new EventFootprint(
							new ComponentFootprint(
								slicedRange,
								seg.footprint.componentFootprint.isAllDay
							),
							seg.footprint.eventDef,
							seg.footprint.eventInstance
						),
						isStart: seg.isStart && slicedRange.isStart,
						isEnd: seg.isEnd && slicedRange.isEnd
					})
				);
			}
		}

		// force an order because eventsToSegs doesn't guarantee one
		// TODO: research if still needed
		this.eventRenderer.sortEventSegs(newSegs);

		return newSegs;
	}


	// Generates the text that should be inside a "more" link, given the number of events it represents
	getMoreLinkText(num) {
		var opt = this.opt('eventLimitText');

		if (typeof opt === 'function') {
			return opt(num);
		}
		else {
			return '+' + num + ' ' + opt;
		}
	}


	// Returns segments within a given cell.
	// If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
	getCellSegs(row, col, startLevel?) {
		var segMatrix = this.eventRenderer.rowStructs[row].segMatrix;
		var level = startLevel || 0;
		var segs = [];
		var seg;

		while (level < segMatrix.length) {
			seg = segMatrix[level][col];
			if (seg) {
				segs.push(seg);
			}
			level++;
		}

		return segs;
	}

}

DayGrid.prototype.eventRendererClass = DayGridEventRenderer;
DayGrid.prototype.businessHourRendererClass = BusinessHourRenderer;
DayGrid.prototype.helperRendererClass = DayGridHelperRenderer;
DayGrid.prototype.fillRendererClass = DayGridFillRenderer;

StandardInteractionsMixin.mixInto(DayGrid)
DayTableMixin.mixInto(DayGrid)
