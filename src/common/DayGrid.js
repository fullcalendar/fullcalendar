
/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

var DayGrid = FC.DayGrid = ChronoComponent.extend(DayTableMixin, {

	fillRendererClass: DayGridFillRenderer,
	helperRendererClass: DayGridHelperRenderer,
	dateClickingClass: DateClicking,
	dateSelectingClass: DateSelecting,
	eventRendererClass: DayGridEventRenderer,
	eventPointingClass: EventPointing,
	eventDraggingClass: EventDragging,
	eventResizingClass: EventResizing,
	externalDroppingClass: ExternalDropping,

	view: null, // TODO: make more general and/or remove
	helperRenderer: null,

	numbersVisible: false, // should render a row for day/week numbers? set by outside view. TODO: make internal
	bottomCoordPadding: 0, // hack for extending the hit area for the last row of the coordinate grid

	rowEls: null, // set of fake row elements
	cellEls: null, // set of whole-day elements comprising the row's background

	rowCoordCache: null,
	colCoordCache: null,


	constructor: function(view) {
		this.view = view; // do first, for opt calls during initialization

		ChronoComponent.apply(this, arguments);
	},


	// Slices up the given span (unzoned start/end with other misc data) into an array of segments
	componentFootprintToSegs: function(componentFootprint) {
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
	},


	rangeUpdated: function() {
		this.updateDayTable();

		// needs to go after updateDayTable because computeEventTimeFormat/computeDisplayEventEnd depends on colCnt.
		// TODO: easy to forget. use listener.
		this.eventRenderer.rangeUpdated();
	},


	opt: function(name) {
		return this.view.opt(name);
	},


	/* Date Rendering
	------------------------------------------------------------------------------------------------------------------*/


	// Renders the rows and columns into the component's `this.el`, which should already be assigned.
	// isRigid determins whether the individual rows should ignore the contents and be a constant height.
	// Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
	renderDates: function(isRigid) {
		var view = this.view;
		var rowCnt = this.rowCnt;
		var colCnt = this.colCnt;
		var html = '';
		var row;
		var col;

		for (row = 0; row < rowCnt; row++) {
			html += this.renderDayRowHtml(row, isRigid);
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
	},


	unrenderDates: function() {
		this.removeSegPopover();
	},


	// Generates the HTML for a single row, which is a div that wraps a table.
	// `row` is the row number.
	renderDayRowHtml: function(row, isRigid) {
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
						(this.numbersVisible ?
							'<thead>' +
								this.renderNumberTrHtml(row) +
							'</thead>' :
							''
							) +
					'</table>' +
				'</div>' +
			'</div>';
	},


	/* Grid Number Rendering
	------------------------------------------------------------------------------------------------------------------*/


	renderNumberTrHtml: function(row) {
		return '' +
			'<tr>' +
				(this.isRTL ? '' : this.renderNumberIntroHtml(row)) +
				this.renderNumberCellsHtml(row) +
				(this.isRTL ? this.renderNumberIntroHtml(row) : '') +
			'</tr>';
	},


	renderNumberIntroHtml: function(row) {
		return this.renderIntroHtml();
	},


	renderNumberCellsHtml: function(row) {
		var htmls = [];
		var col, date;

		for (col = 0; col < this.colCnt; col++) {
			date = this.getCellDate(row, col);
			htmls.push(this.renderNumberCellHtml(date));
		}

		return htmls.join('');
	},


	// Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
	// The number row will only exist if either day numbers or week numbers are turned on.
	renderNumberCellHtml: function(date) {
		var view = this.view;
		var html = '';
		var isDateValid = view.activeUnzonedRange.containsDate(date); // TODO: called too frequently. cache somehow.
		var isDayNumberVisible = view.dayNumbersVisible && isDateValid;
		var classes;
		var weekCalcFirstDoW;

		if (!isDayNumberVisible && !view.cellWeekNumbersVisible) {
			// no numbers in day cell (week number must be along the side)
			return '<td/>'; //  will create an empty space above events :(
		}

		classes = this.getDayClasses(date);
		classes.unshift('fc-day-top');

		if (view.cellWeekNumbersVisible) {
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

		if (view.cellWeekNumbersVisible && (date.day() == weekCalcFirstDoW)) {
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
	},


	/* Hit System
	------------------------------------------------------------------------------------------------------------------*/


	prepareHits: function() {
		this.colCoordCache.build();
		this.rowCoordCache.build();
		this.rowCoordCache.bottoms[this.rowCnt - 1] += this.bottomCoordPadding; // hack
	},


	releaseHits: function() {
		this.colCoordCache.clear();
		this.rowCoordCache.clear();
	},


	queryHit: function(leftOffset, topOffset) {
		if (this.colCoordCache.isLeftInBounds(leftOffset) && this.rowCoordCache.isTopInBounds(topOffset)) {
			var col = this.colCoordCache.getHorizontalIndex(leftOffset);
			var row = this.rowCoordCache.getVerticalIndex(topOffset);

			if (row != null && col != null) {
				return this.getCellHit(row, col);
			}
		}
	},


	getHitFootprint: function(hit) {
		var range = this.getCellRange(hit.row, hit.col);

		return new ComponentFootprint(
			new UnzonedRange(range.start, range.end),
			true // all-day?
		);
	},


	getHitEl: function(hit) {
		return this.getCellEl(hit.row, hit.col);
	},


	/* Cell System
	------------------------------------------------------------------------------------------------------------------*/
	// FYI: the first column is the leftmost column, regardless of date


	getCellHit: function(row, col) {
		return {
			row: row,
			col: col,
			component: this, // needed unfortunately :(
			left: this.colCoordCache.getLeftOffset(col),
			right: this.colCoordCache.getRightOffset(col),
			top: this.rowCoordCache.getTopOffset(row),
			bottom: this.rowCoordCache.getBottomOffset(row)
		};
	},


	getCellEl: function(row, col) {
		return this.cellEls.eq(row * this.colCnt + col);
	},


	/* Event Rendering
	------------------------------------------------------------------------------------------------------------------*/


	renderBgEventFootprints: function(eventFootprints) {

		// don't render timed background events
		var allDayEventFootprints = $.grep(eventFootprints, function(eventFootprint) {
			return eventFootprint.componentFootprint.isAllDay;
		});

		return ChronoComponent.prototype.renderBgEventFootprints.call(this, allDayEventFootprints);
	},


	// Unrenders all events currently rendered on the grid
	unrenderEvents: function() {
		this.removeSegPopover(); // removes the "more.." events popover

		ChronoComponent.prototype.unrenderEvents.apply(this, arguments);
	},


	// Retrieves all rendered segment objects currently rendered on the grid
	getEventSegs: function() {
		return ChronoComponent.prototype.getEventSegs.call(this) // get the segments from the super-method
			.concat(this.popoverSegs || []); // append the segments from the "more..." popover
	},


	/* Event Drag Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event or external element being dragged.
	// `eventLocation` has zoned start and end (optional)
	renderDrag: function(eventFootprints, seg) {
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			this.renderHighlight(eventFootprints[i].componentFootprint);
		}

		// if a segment from the same calendar but another component is being dragged, render a helper event
		if (seg && seg.component !== this) {
			return this.helperRenderer.renderEventFootprints(eventFootprints, seg); // returns mock event elements
		}
	},


	// Unrenders any visual indication of a hovering event
	unrenderDrag: function() {
		this.unrenderHighlight();
		this.helperRenderer.unrender();
	},


	/* Event Resize Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being resized
	renderEventResize: function(eventFootprints, seg) {
		var i;

		for (i = 0; i < eventFootprints.length; i++) {
			this.renderHighlight(eventFootprints[i].componentFootprint);
		}

		return this.helperRenderer.renderEventFootprints(eventFootprints, seg); // returns mock event elements
	},


	// Unrenders a visual indication of an event being resized
	unrenderEventResize: function() {
		this.unrenderHighlight();
		this.helperRenderer.unrender();
	},


	/* Business Hours
	------------------------------------------------------------------------------------------------------------------*/


	businessHourRendererClass: BusinessHourRenderer.extend({
		isWholeDay: true // TODO: config param on component?
	})

});
