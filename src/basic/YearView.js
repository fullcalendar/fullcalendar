var YearDayGrid = DayGrid.extend({

	buildDaySelectListener: function() {
		return this.view.dragListener;
	},
	
	buildSegResizeListener: function(seg, isStart) {
		return this.view.buildSegResizeListener(seg, isStart);
	},

	getBoundBox: function() {
		var top = this.rowCoordCache.getTopOffset(0);
		var bottom = this.rowCoordCache.getBottomOffset(this.rowCnt-1);
		var left = this.colCoordCache.getLeftOffset(0);
		var right = this.colCoordCache.getRightOffset(this.colCnt-1);

		return { top: top, bottom: bottom, left: left, right: right };
	}
});

var YearView = FC.YearView = View.extend({

	segResizeListener: null,

	dayNumbersVisible: true, // display day numbers on each day cell?
	weekNumbersVisible: false, // display week numbers along the side?

	firstDay: null,
	firstMonth: null,
	lastMonth: null,
	yearColumns: 3,
	nbMonths: null,
	hiddenMonths: [],

	colCnt: null,
	rowCnt: null,

	dragListener: null,

	startGridId: -1,
	activeGridId: -1,

	tm: null,

	dayGrids: [], // the main sub components that does most of the heavy lifting
	otherMonthDays: [],
	
	// called once when the view is instantiated, when the user switches to the view.
	// initialize member variables or do other setup tasks.
	initialize: function() {
		this.updateOptions();

		var _this = this;
		var view = this;
		var selectionSpan; // null if invalid selection

		this.dragListener = new HitDragListener(this, {
			interactionStart: function(ev) {
				view.interactionStart(ev);
			},
			hitOver: function(hit, isOrig, origHit) {
				var origHitSpan;
				var hitSpan;

				if (origHit) { // click needs to have started on a hit

					origHitSpan = _this.getSafeOrigHitSpan(origHit);
					hitSpan = _this.getSafeHitSpan(hit);

					if (origHitSpan && hitSpan) {
						selectionSpan = _this.computeSelection(origHitSpan, hitSpan);
					}
					else {
						selectionSpan = null;
					}

					if (selectionSpan) {
						_this.renderSelection(selectionSpan);
					}
					else if (selectionSpan === false) {
						disableCursor();
					}
				}
			},
			hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
				//_this.unrenderSelection();
			},
			hitDone: function() { // called after a hitOut OR before a dragEnd
				enableCursor();
			},
			drag: function(dx, dy, ev) {
				view.drag(dx, dy, ev);
			},
			interactionEnd: function(ev, isCancelled) {
				if (!isCancelled) {
					// the selection will already have been rendered. just report it
					view.reportSelection(selectionSpan, ev);
				}
			}
		});
	},

	updateOptions: function() {
		this.rtl = this.opt('isRTL');
		if (this.rtl) {
			this.dis = -1;
			this.dit = this.colCnt - 1;
		} else {
			this.dis = 1;
			this.dit = 0;
		}

		this.currentRangeUnit = 'year';

		this.firstDay = parseInt(this.opt('firstDay'), 10) || 1;
		this.firstMonth = parseInt(this.opt('firstMonth'), 10) || 0;

		this.lastMonth = this.opt('lastMonth') || this.firstMonth+12;
		this.hiddenMonths = this.opt('hiddenMonths') || [];
		this.yearColumns = parseInt(this.opt('yearColumns'), 10) || this.yearColumns;  //ex: '2x6', '3x4', '4x3'
		this.weekNumbersVisible = this.opt('weekNumbers');
		this.tm = this.opt('theme') ? 'ui' : 'fc';
		this.nbMonths = this.lastMonth - this.firstMonth;
		this.lastMonth = this.lastMonth % 12;
		this.isBootstrap = this.opt('bootstrap');
	},

	handleSegMouseout:function(seg, ev) {
		if (this.activeGridId != -1) {
			return this.dayGrids[this.activeGridId].handleSegMouseout(seg, ev);
		}
	},

	segResizeStart: function(seg, ev) {
		if (this.activeGridId != -1) {
			return this.dayGrids[this.activeGridId].segResizeStart(seg, ev);
		}
	},
					
	segResizeStop: function(seg, ev) {
		for (var i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].segResizeStop(seg, ev);
		}
	},

	isEventLocationAllowed: function(resizeLocation, ev) {
		if (this.activeGridId != -1) {
			return this.dayGrids[this.activeGridId].isEventLocationAllowed(resizeLocation, ev);
		}
	},

	buildSegResizeListener: function(seg, isStart) {
		var _this = this;
		var view = this;
		var calendar = view.calendar;
		var el = seg.el;
		var event = seg.event;
		var eventEnd = calendar.getEventEnd(event);
		var isDragging;
		var resizeLocation; // zoned event date properties. falsy if invalid resize

		// Tracks mouse movement over the *grid's* coordinate map
		 this.segResizeListener = new HitDragListener(view, {
			scroll: view.opt('dragScroll'),
			subjectEl: el,
			interactionStart: function(ev) {
				view.interactionStart(ev);
				isDragging = false;
			},
			dragStart: function(ev) {
				isDragging = true;
				_this.handleSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
				_this.segResizeStart(seg, ev);
			},
			drag: function(dx, dy, ev) {
				view.drag(dx, dy, ev);
			},
			hitOver: function(hit, isOrig, origHit) {
				var isAllowed = true;
				var origHitSpan = _this.getSafeStartHitSpan(origHit);
				var hitSpan = _this.getSafeHitSpan(hit);

				if (origHitSpan && hitSpan) {
					resizeLocation = isStart ?
						_this.computeEventStartResize(origHitSpan, hitSpan, event) :
						_this.computeEventEndResize(origHitSpan, hitSpan, event);

					isAllowed = resizeLocation && _this.isEventLocationAllowed(resizeLocation, event);
				}
				else {
					isAllowed = false;
				}

				if (!isAllowed) {
					resizeLocation = null;
					disableCursor();
				}
				else {
					if (
						resizeLocation.start.isSame(event.start.clone().stripZone()) &&
						resizeLocation.end.isSame(eventEnd.clone().stripZone())
					) {
						// no change. (FYI, event dates might have zones)
						resizeLocation = null;
					}
				}

				if (resizeLocation) {
					view.hideEvent(event);
					_this.renderEventResize(resizeLocation, seg);
				}
			},
			hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
				//resizeLocation = null;
				view.showEvent(event); // for when out-of-bounds. show original
			},
			hitDone: function() { // resets the rendering to show the original event
				_this.unrenderEventResize();
				enableCursor();
			},
			interactionEnd: function(ev) {
				if (isDragging) {
					_this.segResizeStop(seg, ev);
				}

				if (resizeLocation) { // valid date to resize to?
					// no need to re-show original, will rerender all anyways. esp important if eventRenderWait
					view.reportSegResize(seg, resizeLocation, _this.largeUnit, el, ev);
				}
				else {
					view.showEvent(event);
				}
				_this.segResizeListener = null;
			}
		});

		return this.segResizeListener;
	},

	/* Dragging (for both events and external elements)
	------------------------------------------------------------------------------------------------------------------*/
	
	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(dropLocation, seg) {
		for (var i = 0; i < this.dayGrids.length; i++) {
			var dayGrid = this.dayGrids[i];
			dayGrid.renderSelection(dropLocation, seg);
		}
	},

	unrenderDrag: function() {
		for (var i = 0; i < this.dayGrids.length; i++) {
			var dayGrid = this.dayGrids[i];
			dayGrid.unrenderSelection();
		}
	},
	
	renderEventResize: function(range, seg) {
		for (var i = 0; i < this.dayGrids.length; i++) {
			var dayGrid = this.dayGrids[i];
			dayGrid.unrenderEventResize();
			dayGrid.renderEventResize(range, seg);
		}
	},

	unrenderEventResize: function() {
		for (var i = 0; i < this.dayGrids.length; i++) {
			var dayGrid = this.dayGrids[i];
			dayGrid.unrenderEventResize();
		}
	},
						
	computeEventEndResize: function(span0, span1, event) {
		var activeId = this.activeGridId;
		var activeRes = this.dayGrids[activeId].computeEventEndResize(span0, span1, event);
		return activeRes;
	},
	
	computeEventStartResize: function(span0, span1, event) {
		var activeId = this.activeGridId;
		var activeRes = this.dayGrids[activeId].computeEventStartResize(span0, span1, event);
		return activeRes;
	},

	daysInMonth: function(year, month) {
		return FC.moment([ year, month, 0 ]).date();
	},

	interactionStart: function(ev) {
		var x = getEvX(ev);
		var y = getEvY(ev);

		var gridId = this.getGridId(x, y);
		this.startGridId = gridId;
		this.activeGridId = gridId;
	},

	getGridId: function(x, y) {
		for (var i=0; i<this.dayGrids.length; i++) {
			var grid = this.dayGrids[i];
			var boundBox = grid.getBoundBox();

			if (x > boundBox.left && x < boundBox.right && y > boundBox.top && y < boundBox.bottom) {
				return i;
			}
		}

		return -1;
	},

	drag: function(dx, dy, ev) {
		var x = getEvX(ev);
		var y = getEvY(ev);
		var i;

		var gridId = this.getGridId(x, y);

		var activeId = this.activeGridId;

		if (gridId != -1 && gridId != activeId) {
			if (gridId > activeId) {
				for (i = activeId; i <= gridId; i++) {
					this.dayGrids[i].unrenderSelection();
				}
			}
			else {
				for (i = gridId; i <= activeId; i++) {
					this.dayGrids[i].unrenderSelection();
				}
			}
		}
	},

	tableByOffset: function(offset) {
		return $(this.subTables[offset]);
	},

	isFixedWeeks: function() {
		return this.opt('fixedWeekCount');
	},

	selectEvent: function(event) {
	},

	// Determines whether each row should have a constant height
	hasRigidRows: function() {
		var eventLimit = this.opt('eventLimit');
		return eventLimit && typeof eventLimit !== 'number';
	},

	dateInMonth: function(date, mi) {
		return (date.month() == (mi%12));
	},

	// Set css extra classes like fc-other-month and fill otherMonthDays
	updateCells: function() {
		var _this = this;

		this.subTables.find('.fc-week:first').addClass('fc-first');
		this.subTables.find('.fc-week:last').addClass('fc-last');
		this.subTables.find('.fc-bg').find('td .fc-day:last').addClass('fc-last');

		this.subTables.each(function(i, _sub) {
			if (!_this.curYear) { _this.curYear = _this.renderRange.start; }

			var d = _this.curYear.clone();
			var mi = (i + _this.renderRange.start.month()) % 12;

			d = _this.dayGrids[i].start;

			var lastDateShown = 0;

			$(_sub).find('.fc-bg').find('td .fc-day:first').addClass('fc-first');

			_this.otherMonthDays[mi] = [ 0, 0, 0, 0 ];
			$(_sub).find('.fc-content-skeleton tr').each(function(r, _tr) {

				if (r === 0 && _this.dateInMonth(d, mi)) {
					// in current month, but hidden (weekends) at start
					_this.otherMonthDays[mi][2] = d.date() - 1;
				}
				$(_tr).find('td').not('.fc-week-number').each(function(ii, _cell) {

					var cell = $(_cell);

					d = _this.dayGrids[i].dayDates[ii + r*_this.colCnt];

					if (!_this.dateInMonth(d, mi)) {
						cell.addClass('fc-other-month');
						if (d.month() == (mi+11)%12) {
							// prev month
							_this.otherMonthDays[mi][0]++;
							cell.addClass('fc-prev-month');
						} else {
							// next month
							_this.otherMonthDays[mi][1]++;
							cell.addClass('fc-next-month');
						}
					} else {
						cell.removeClass('fc-other-month');
						lastDateShown = d;
					}
				});
			});

			var endDaysHidden = _this.daysInMonth(_this.curYear.year(), mi+1) - lastDateShown;
			// in current month, but hidden (weekends) at end
			_this.otherMonthDays[mi][3] = endDaysHidden;
		});
	},

	setHeight: function(totalHeight, isAuto) {
		var eventLimit = this.opt('eventLimit');
		var scrollerHeight = totalHeight;
		var i;

		for (i = 0; i < this.dayGrids.length; i++) {
			var dayGrid = this.dayGrids[i];

			dayGrid.removeSegPopover(); // kill the "more" popover if displayed

			// is the event limit a constant level number?
			if (eventLimit && typeof eventLimit === 'number') {
				dayGrid.limitRows(eventLimit); // limit the levels first so the height can redistribute after
			}
			this.setGridHeight(dayGrid, scrollerHeight, isAuto);
			// is the event limit dynamically calculated?
			if (eventLimit && typeof eventLimit !== 'number') {
				dayGrid.limitRows(eventLimit); // limit the levels after the grid's row heights have been set
			}
		}
	},

	// Sets the height of just the DayGrid component in this view
	setGridHeight: function(grid, height, isAuto) {
		if (isAuto) {
			undistributeHeight(grid.rowEls); // let the rows be their natural height with no expanding
		}
		else {
			distributeHeight(grid.rowEls, height, true); // true = compensate for height-hogging rows
		}
	},

	/* Hit Areas
	------------------------------------------------------------------------------------------------------------------*/
	// forward all hit-related method calls to dayGrid
	hitsNeeded: function() {
		var i;
		for (i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].hitsNeeded();
		}
	},
	hitsNotNeeded: function() {
		var i;
		for (i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].hitsNotNeeded();
		}
	},
	prepareHits: function() {
		var i;
		for (i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].prepareHits();
		}
	},
	releaseHits: function() {
		var i;
		for (i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].releaseHits();
		}
	},
	queryHit: function(left, top) {
		var gridId = this.getGridId(left, top);

		if (gridId != -1) {
			this.activeGridId = gridId;
			return this.dayGrids[gridId].queryHit(left, top);
		}
	},
	getHitSpan: function(hit) {
		var hits = [], i;
		for (i = 0; i < this.dayGrids.length; i++) {
			var res = this.dayGrids[i].getHitSpan(hit);
			if (res) {
				hits = hits.concat(res);
			}
		}
		return hits;
	},
	getHitEl: function(hit) {
		var hits = [], i;
		for (i = 0; i < this.dayGrids.length; i++) {
			var res = this.dayGrids[i].getHitEl(hit);
			if (res) {
				hits = hits.concat(res);
			}
		}
		return hits;
	},
	//for resize event
	getSafeStartHitSpan: function(hit) {
		return this.dayGrids[this.startGridId].getSafeHitSpan(hit);
	},
	//for select
	getSafeOrigHitSpan: function(hit) {
		var startId = this.startGridId;
		var activeId = this.activeGridId;

		if (startId != -1) {
			if (startId == activeId) {
				return this.dayGrids[startId].getSafeHitSpan(hit);
			}
			else {
				if (activeId != -1) {
					var dayGrid = this.dayGrids[activeId];
					if (activeId > startId) {
						return dayGrid.getSafeHitSpan({ row:0, col: 0 });
					}
					else if (activeId < startId) {
						return dayGrid.getSafeHitSpan({ row: dayGrid.rowCnt-1, col: dayGrid.colCnt-1 });
					}
					return dayGrid.getSafeHitSpan(hit);
				}
				//draging outside of grids
			}
		}
	},
	getSafeHitSpan: function(hit) {
		var startId = this.startGridId;
		var activeId = this.activeGridId;

		if (startId != -1) {
			if (startId == activeId) {
				return this.dayGrids[startId].getSafeHitSpan(hit);
			}
			else {
				if (activeId != -1) {
					return this.dayGrids[activeId].getSafeHitSpan(hit);
				}
				//draging outside of grids
			}
		}
	},

	computeSelection: function(span0, span1) {
		var startId = this.startGridId;
		var activeId = this.activeGridId;
		var first, last, s0, s1, dayGrid;

		if (startId == activeId) {
			return this.dayGrids[startId].computeSelection(span0, span1);
		}
		else {
			if (startId > activeId) {
				first = this.dayGrids[activeId].computeSelection(span0, span1);

				dayGrid = this.dayGrids[startId];
				s0 = dayGrid.getSafeHitSpan(this.dragListener.origHit);
				s1 = dayGrid.getSafeHitSpan({ row: 0, col: 0 });
				last = dayGrid.computeSelection(s0, s1);

				first.end = last.end;
				return first;
			}
			else {
				//startId < activeId
				first = this.dayGrids[activeId].computeSelection(span0, span1);

				dayGrid = this.dayGrids[startId];
				s0 = dayGrid.getSafeHitSpan({ row: dayGrid.rowCnt-1, col: dayGrid.colCnt-1 });
				s1 = dayGrid.getSafeHitSpan(this.dragListener.origHit);
				last = dayGrid.computeSelection(s0, s1);
				first.start = last.start;
				return first;
			}
		}
	},


	/* Events
	------------------------------------------------------------------------------------------------------------------*/
	// Retrieves all segment objects that are rendered in the view
	getEventSegs: function() {
		var eventSeg = [], i;
		for (i = 0; i < this.dayGrids.length; i++) {
			var res = this.dayGrids[i].getEventSegs();
			if (res) {
				eventSeg = eventSeg.concat(res);
			}
		}
		return eventSeg;
	},

	// Renders the given events onto the view and populates the segments array
	renderEvents: function(events) {
		var i;
		for (i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].renderEvents(events);
		}

		this.updateHeight(); // must compensate for events that overflow the row
	},

	// Unrenders all event elements and clears internal segment data
	unrenderEvents: function() {
		var i;
		for (i = 0; i < this.dayGrids.length; i++) {
			this.dayGrids[i].unrenderEvents();
		}

		// we DON'T need to call updateHeight() because
		// a renderEvents() call always happens after this, which will eventually call updateHeight()
	},

	/* Selection
	------------------------------------------------------------------------------------------------------------------*/
	// Renders a visual indication of a selection
	renderSelection: function(span) {
		var startId = this.startGridId;
		var activeId = this.activeGridId;
		var i, dayGrid, span0, span1, hit, selectionSpan;

		if (startId != -1) {
			if (startId == activeId) {
				if (activeId != -1) {
					this.dayGrids[startId].unrenderSelection();
					this.dayGrids[startId].renderSelection(span);
				}
			}
			else {
				if (activeId != -1) {
					if (startId < activeId) {
						for (i = startId; i < activeId; i++) {
							dayGrid = this.dayGrids[i];

							if (i != startId) {
								span0 = dayGrid.getSafeHitSpan({ row: 0, col: 0 });
								span1 = dayGrid.getSafeHitSpan({ row: dayGrid.rowCnt-1, col: dayGrid.colCnt-1 });
							}
							else{
								span0 = dayGrid.getSafeHitSpan(this.dragListener.origHit);
								span1 = dayGrid.getSafeHitSpan({ row: dayGrid.rowCnt-1, col: dayGrid.colCnt-1 });
							}
							selectionSpan = dayGrid.computeSelection(span0, span1);

							dayGrid.unrenderSelection();
							dayGrid.renderSelection(selectionSpan);
						}
					}
					else {
						for (i = startId; i > activeId; i--) {
							dayGrid = this.dayGrids[i];
							hit = { row: 0, col: 0 };

							if (i != startId)  {
								span0 = dayGrid.getSafeHitSpan({ row: dayGrid.rowCnt-1, col: dayGrid.colCnt-1 });
								span1 = dayGrid.getSafeHitSpan({ row: 0, col: 0 });
							}
							else {
								span0 = dayGrid.getSafeHitSpan(this.dragListener.origHit);
								span1 = dayGrid.getSafeHitSpan({ row: 0, col: 0 });
							}

							selectionSpan = dayGrid.computeSelection(span0, span1);
							dayGrid.unrenderSelection();
							dayGrid.renderSelection(selectionSpan);
						}
					}
					this.dayGrids[activeId].unrenderSelection();
					this.dayGrids[activeId].renderSelection(span);
				}
			}
		}
	},

	unrenderSelection: function() {
		var startId = this.startGridId;
		var activeId = this.activeGridId;
		var i;

		if (activeId > startId) {
			for (i = startId; i <= activeId; i++) {
				this.dayGrids[i].unrenderSelection();
			}
		}
		else {
			for (i = activeId; i <= startId; i++) {
				this.dayGrids[i].unrenderSelection();
			}
		}
	},

	reportSelection: function(span, ev) {
		View.prototype.reportSelection.call(this, span, ev);
		this.unrenderSelection();
	},

	buildRenderRange: function() {
		var renderRange = View.prototype.buildRenderRange.apply(this, arguments);

		renderRange.start.startOf('year');
		renderRange.end.endOf('year');

		return this.trimHiddenDays(renderRange);
	},

	// responsible for displaying the skeleton of the view within the already-defined
	// this.el, a jQuery element.
	render: function() {
		var startMonth = Math.floor(this.renderRange.start.month() / this.nbMonths) * this.nbMonths;

		if (!startMonth && this.firstMonth > 0 && !this.opt('lastMonth')) {
			// school
			startMonth = (this.firstMonth + startMonth) % 12;
		}

		this.intervalStart = FC.moment([this.intervalStart.year(), startMonth, 1]);
		this.intervalEnd = this.intervalStart.clone().add(this.nbMonths, 'months').add(-15, 'minutes');

		this.start = this.intervalStart.clone();
		this.start = this.skipHiddenDays(this.start); // move past the first week if no visible days
		this.start.startOf('week');
		this.start = this.skipHiddenDays(this.start); // move past the first invisible days of the week

		this.end = this.intervalEnd.clone();
		this.end = this.skipHiddenDays(this.end, -1, true); // move in from the last week if no visible days
		this.end.add((7 - this.end.weekday()) % 7, 'days'); // move to end of week if not already
		this.end = this.skipHiddenDays(this.end, -1, true); // move in from the last invisible days of the week

		var monthsPerRow = parseInt(this.opt('yearColumns'), 10);

		var weekCols = this.opt('weekends') ? 7 : 5;

		this.renderYear(monthsPerRow, weekCols, true);
	},

	renderYear: function(yearColumns, colCnt, showNumbers) {
		this.colCnt = colCnt;
		var firstTime = !this.table;

		if (!firstTime) {
			this.unrenderEvents();
			this.table.remove();
		}
		this.buildSkeleton(this.yearColumns, showNumbers);

		this.buildDayGrids();
		this.updateCells();
	},

	isBootstrap: true,

	// Build the year layout
	buildSkeleton: function(monthsPerRow, showNumbers) {
		var i, n, y, h = 0, monthsRow = 0;
		var miYear = this.intervalStart.year();
		var s, headerClass = this.tm + "-widget-header";
		var weekNames = [];

		// init days based on 2013-12 (1st is Sunday)
		for (n=0; n<7; n++) {
			weekNames[n] = FC.moment([ 2013, 11, 1+n ]).format('ddd');
		}

		if (this.isBootstrap) {
			s = '<div class="row fc-year-main-table">';
		}
		else {
			s  =  '<table class="fc-year-main-table fc-border-separate"><tr>';
			s += '<td class="fc-year-month-border fc-first"></td>';
		}

		var colSize = 12/monthsPerRow;

		for (n=0; n<this.nbMonths; n++) {

			var m = (this.intervalStart.month() + n);
			var hiddenMonth = ($.inArray((m % 12), this.hiddenMonths) != -1);
			var display = (hiddenMonth ? 'display:none;' : '');
			var di = FC.moment([ miYear+(m / 12), (m % 12), 1 ]);
			var monthName = capitaliseFirstLetter(di.format('MMMM'));
			var monthID = di.format('YYYYMM');

			y = di.year();

			if (this.firstMonth + this.nbMonths > 12) {
				monthName = monthName + ' ' + y;
			}

			// new month line
			if ((n%monthsPerRow)===0 && n > 0 && !hiddenMonth) {
				monthsRow++;
				if (this.isBootstrap) {
					s += '</div>';
					s += '<div class="row">';
				}
				else {
					s+='<td class="fc-year-month-border fc-last"></td>'+
						'</tr><tr>'+
						'<td class="fc-year-month-border fc-first"></td>';
				}
			}

				if ((n%monthsPerRow) < monthsPerRow && (n%monthsPerRow) > 0 && !hiddenMonth) {
					if (this.isBootstrap) {
						s +='<div class="fc-year-month-separator"></div>';
					}
					else {
						s +='<td class="fc-year-month-separator"></td>';
					}
				}

			if (this.isBootstrap) {
				s +='<div class="col-sm-' + colSize + ' fc-month-view fc-year-monthly-td fc-widget-content" style="' + display + '">';
			}
			else {
				s +='<td class="fc-month-view fc-year-monthly-td fc-widget-content" style="' + display + '">';
			}

			s +='<div class="fc-year-monthly-name'+(monthsRow===0 ? ' fc-first' : '')+'">' +
				'<a name="'+monthID+'" data-year="'+y+'" data-month="'+m+'" href="#">' + htmlEscape(monthName) + '</a>' +
				'</div>';

			s +='<div class="fc-row '+headerClass+'">';

			s +='<table class="fc-year-month-header">';  //fc-year-month-header
			s +='<thead><tr class="fc-year-week-days">';

			s += this.headIntroHtml();

			for (i = this.firstDay; i < (this.colCnt+this.firstDay); i++) {
				s += '<th class="fc-day-header fc-year-weekly-head fc-'+dayIDs[i%7]+' '+headerClass+'">'+ // width="'+(Math.round(100/this.colCnt)||10)+'%"
					weekNames[i%7] + '</th>';
			}

			s += '</tr><tr>'; 
			s += '</tr></thead></table>'; // fc-year-month-header

			s += '</div>'; // fc-row

			s += '<div class="fc-scroller fc-day-grid-container"><div class="fc-day-grid fc-body">';
			s += '</div></div>'; // fc-day-grid fc-day-grid-container

			s += '<div class="fc-year-monthly-footer"></div>';

			if (this.isBootstrap) {
				s += '</div>'; // fc-year-monthly-td
			}
			else {
				s += '</td>';
			}

			if (hiddenMonth) {
				h++;
			}
		}

		if (this.isBootstrap) {
			s += '</div>';
		}
		else {
			s += '<td class="fc-year-month-border fc-last"></td>';
			s += '</tr></table>';
		}

		this.table = $(s).appendTo(this.el);

		this.bodyRows = this.table.find('.fc-day-grid .fc-week');
		this.bodyCells = this.bodyRows.find('td .fc-day');
		this.bodyFirstCells = this.bodyCells.filter(':first-child');

		this.subTables = this.table.find('.fc-year-monthly-td');


		this.head = this.table.find('thead');
		this.head.find('tr.fc-year-week-days th.fc-year-weekly-head:first').addClass('fc-first');
		this.head.find('tr.fc-year-week-days th.fc-year-weekly-head:last').addClass('fc-last');

		this.table.find('.fc-year-monthly-name a').click(this.calendar, function(ev) {
			ev.data.changeView('month');
			ev.data.gotoDate([$(this).attr('data-year'), $(this).attr('data-month'), 1]);
		});


		this.dayBind(this.bodyCells);
	},
	
	// Create month grids
	buildDayGrids: function() {
		var view = this;
		var nums = [];
		for (var i=0; i<this.nbMonths; i++) {
			nums.push(i + this.intervalStart.month());
		}

		var baseDate = view.intervalStart.clone().add(7, 'days'); // to be sure we are in month
		view.dayGrids = [];
		$.each(nums, function(offset, m) {
			var subclass = YearDayGrid.extend(basicDayGridMethods);
			var dayGrid  = new subclass(view);

			var subTable = view.tableByOffset(offset);
			var monthDate = baseDate.clone().add(offset, 'months');

			dayGrid.headRowEl = subTable.find('.fc-row:first');
			var dayGridEl = subTable.find('.fc-day-grid');


			dayGrid.setElement(dayGridEl);

			dayGrid.offset = offset;

			dayGrid.breakOnWeeks = true;

			var renderRange = {
				start: monthDate.clone().startOf('month').stripZone(),
				end: monthDate.clone().endOf('month').stripZone()
			};

			renderRange.start.startOf('week');

			// make end-of-week if not already
			renderRange.end.add(1, 'week').startOf('week'); // exclusively move backwards

			//ensure 6 weeks
			var rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
				renderRange.end.diff(renderRange.start, 'weeks', true) // dontRound=true
			);
			renderRange.end.add(6 - rowCnt, 'weeks');

			dayGrid.setRange(renderRange);

			view.dayNumbersVisible = true;
			dayGrid.numbersVisible = true;

			view.rowCnt = dayGrid.rowCnt;

			dayGrid.renderDates(view.hasRigidRows());

			view.dayBind(dayGrid.el.find(".fc-day"));
			view.dayGrids.push(dayGrid);
		});
	},

	// Generates the HTML that will go before the day-of week header cells.
	// Queried by the DayGrid subcomponent when generating rows. Ordering depends on isRTL.
	headIntroHtml: function() {
		if (this.weekNumbersVisible) {
			return '' +
				'<th class="fc-week-number-head ' + this.widgetHeaderClass + '">' +
				'<span>' + // needed for matchCellWidths
				htmlEscape(this.opt('weekNumberTitle')) +
				'</span>' +
				'</th>';
		} else {
			return '';
		}
	},

	// Day clicking and binding
	dayBind: function(days) {
		var _this = this;
		days.click(function(ev) {
			var self = _this;
			self.trigger('dayClick',
				self,
				FC.moment(this.getAttribute("data-date")),
				ev
			);

		});
		days.mousedown(this.daySelectionMousedown);
	}
});
