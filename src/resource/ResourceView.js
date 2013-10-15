function ResourceView(element, calendar, viewName) {
    var t = this;


    // exports
    t.renderResource = renderResource;
    t.setWidth = setWidth;
    t.setHeight = setHeight;
    t.beforeHide = beforeHide;
    t.afterShow = afterShow;
    t.defaultEventEnd = defaultEventEnd;
    t.timePosition = timePosition;
    t.dayOfWeekCol = dayOfWeekCol;
    t.dateCell = dateCell;
    t.cellDate = cellDate;
    t.cellIsAllDay = cellIsAllDay;
    t.allDayRow = getAllDayRow;
    t.allDayBounds = allDayBounds;
    t.getHoverListener = function () { return hoverListener };
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.getDaySegmentContainer = function () { return daySegmentContainer };
    t.getSlotSegmentContainer = function () { return slotSegmentContainer };
    t.getMinMinute = function () { return minMinute };
    t.getMaxMinute = function () { return maxMinute };
    t.getBodyContent = function () { return slotContent }; // !!??
    t.getRowCnt = function () { return 1 };
    t.getColWidth = function () { return colWidth };
    t.getSnapHeight = function () { return snapHeight };
    t.getSnapMinutes = function () { return snapMinutes };
    t.defaultSelectionEnd = defaultSelectionEnd;
    t.renderDayOverlay = renderDayOverlay;
    t.renderSelection = renderSelection;
    t.clearSelection = clearSelection;
    t.reportDayClick = reportDayClick; // selection mousedown hack
    t.dragStart = dragStart;
    t.dragStop = dragStop;

    // get resources list in form of array { id: , title: }
    t.getResources = function () {
        var result = [];

        if (calendar.options.resources) {
            if (typeof (calendar.options.resources) == "function")
                result = calendar.options.resources();
            else
                result = calendar.options.resources;
            if (!result) result = [];
        }

        return result;
    },

    // column count equals to resources length
    t.getColCnt = function () { return t.getResources().length; },
    
    // get resource by index
    t.getResource = function (index) {
        if (index >= 0 && index < t.getColCnt())
            return t.getResources()[index];
        else
            return null;         
    }

    // imports
    View.call(t, element, calendar, viewName);
    OverlayManager.call(t);
    ResourceSelectionManager.call(t);
    ResourceEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    var clearEvents = t.clearEvents;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var reportSelection = t.reportSelection;
    var unselect = t.unselect;
    var daySelectionMousedown = t.daySelectionMousedown;
    var slotSegHtml = t.slotSegHtml;
    var formatDate = calendar.formatDate;


    // locals

    var dayTable;
    var dayHead;
    var dayHeadCells;
    var dayBody;
    var dayBodyCells;
    var dayBodyCellInners;
    var dayBodyFirstCell;
    var dayBodyFirstCellStretcher;
    var slotLayer;
    var daySegmentContainer;
    var allDayTable;
    var allDayRow;
    var slotScroller;
    var slotContent;
    var slotSegmentContainer;
    var slotTable;
    var slotTableFirstInner;
    var axisFirstCells;
    var gutterCells;
    var selectionHelper;

    var viewWidth;
    var viewHeight;
    var axisWidth;
    var colWidth;
    var gutterWidth;
    var slotHeight; // TODO: what if slotHeight changes? (see issue 650)

    var snapMinutes;
    var snapRatio; // ratio of number of "selection" slots to normal slots. (ex: 1, 2, 4)
    var snapHeight; // holds the pixel hight of a "selection" slot

    var colCnt;
    var slotCnt;
    var coordinateGrid;
    var hoverListener;
    var colContentPositions;
    var slotTopCache = {};
    var savedScrollTop;

    var tm;
    var firstDay;
//    var nwe;            // no weekends (int)
    var rtl, dis, dit;  // day index sign / translate
    var minMinute, maxMinute;
    var colFormat;
    var showWeekNumbers;
    var weekNumberTitle;
    var weekNumberFormat;


    /* Rendering
	-----------------------------------------------------------------------------*/


    disableTextSelection(element.addClass('fc-agenda'));


    function renderResource() {
        updateOptions();
        if (!dayTable) {
            buildSkeleton();
        } else {
            clearEvents();
        }
        updateCells();
    }


    function updateOptions() {
        rtl = opt('isRTL');
        if (rtl) {
            dis = -1;
            dit = colCnt - 1;
        } else {
            dis = 1;
            dit = 0;
        }
        tm = opt('theme') ? 'ui' : 'fc';
        minMinute = parseTime(opt('minTime'));
        maxMinute = parseTime(opt('maxTime'));
        colFormat = opt('columnFormat');
        snapMinutes = opt('snapMinutes') || opt('slotMinutes');
        if (colCnt && t.getColCnt() != colCnt) {
            alert('changing resources');
            element.html('');
            buildSkeleton();
        }
        colCnt = t.getColCnt();
    }

    function buildSkeleton() {
        var headerClass = tm + "-widget-header";
        var contentClass = tm + "-widget-content";
        var s;
        var i;
        var d;
        var maxd;
        var minutes;
        var slotNormal = opt('slotMinutes') % 15 == 0;
        var colCnt = t.getColCnt();
        var tbl_style = "";

        if (colCnt == 0) // if no resources, render one column and hide it
        {
            colCnt = 1;
            tbl_style = ";style='display: none;'";
        }

        s =
			"<table style='width:100%" + tbl_style + "' class='fc-agenda-days fc-border-separate' cellspacing='0'>" +
			"<thead>" +
			"<tr>";

        s += "<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";

        for (i = 0; i < colCnt; i++) {
            s +=
				"<th class='fc- fc-col" + i + ' ' + headerClass + "'/>"; // fc- needed for setDayID
        }
        s +=
			"<th class='fc-agenda-gutter " + headerClass + "'>&nbsp;</th>" +
			"</tr>" +
			"</thead>" +
			"<tbody>" +
			"<tr>" +
			"<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
        for (i = 0; i < colCnt; i++) {
            s +=
				"<td class='fc- fc-col" + i + ' ' + contentClass + "'>" + // fc- needed for setDayID
				"<div>" +
				"<div class='fc-day-content'>" +
				"<div style='position:relative'>&nbsp;</div>" +
				"</div>" +
				"</div>" +
				"</td>";
        }
        s +=
			"<td class='fc-agenda-gutter " + contentClass + "'>&nbsp;</td>" +
			"</tr>" +
			"</tbody>" +
			"</table>";
        dayTable = $(s).appendTo(element);
        dayHead = dayTable.find('thead');
        dayHeadCells = dayHead.find('th').slice(1, -1);
        dayBody = dayTable.find('tbody');
        dayBodyCells = dayBody.find('td').slice(0, -1);
        dayBodyCellInners = dayBodyCells.find('div.fc-day-content div');
        dayBodyFirstCell = dayBodyCells.eq(0);
        dayBodyFirstCellStretcher = dayBodyFirstCell.find('> div');

        markFirstLast(dayHead.add(dayHead.find('tr')));
        markFirstLast(dayBody.add(dayBody.find('tr')));

        axisFirstCells = dayHead.find('th:first');
        gutterCells = dayTable.find('.fc-agenda-gutter');

        slotLayer =
			$("<div style='position:absolute;z-index:2;left:0;width:100%'/>")
				.appendTo(element);

        if (opt('allDaySlot')) {

            daySegmentContainer =
				$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
					.appendTo(slotLayer);

            s =
				"<table style='width:100%' class='fc-agenda-allday' cellspacing='0'>" +
				"<tr>" +
				"<th class='" + headerClass + " fc-agenda-axis'>" + opt('allDayText') + "</th>" +
				"<td>" +
				"<div class='fc-day-content'><div style='position:relative'/></div>" +
				"</td>" +
				"<th class='" + headerClass + " fc-agenda-gutter'>&nbsp;</th>" +
				"</tr>" +
				"</table>";
            allDayTable = $(s).appendTo(slotLayer);
            allDayRow = allDayTable.find('tr');

            dayBind(allDayRow.find('td'));

            axisFirstCells = axisFirstCells.add(allDayTable.find('th:first'));
            gutterCells = gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));

            slotLayer.append(
				"<div class='fc-agenda-divider " + headerClass + "'>" +
				"<div class='fc-agenda-divider-inner'/>" +
				"</div>"
			);

        } else {

            daySegmentContainer = $([]); // in jQuery 1.4, we can just do $()

        }

        slotScroller =
			$("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>")
				.appendTo(slotLayer);

        slotContent =
			$("<div style='position:relative;width:100%;overflow:hidden'/>")
				.appendTo(slotScroller);

        slotSegmentContainer =
			$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
				.appendTo(slotContent);

        s =
			"<table class='fc-agenda-slots' style='width:100%' cellspacing='0'>" +
			"<tbody>";
        d = zeroDate();
        maxd = addMinutes(cloneDate(d), maxMinute);
        addMinutes(d, minMinute);
        slotCnt = 0;
        for (i = 0; d < maxd; i++) {
            minutes = d.getMinutes();
            s +=
				"<tr class='fc-slot" + i + ' ' + (!minutes ? '' : 'fc-minor') + "'>" +
				"<th class='fc-agenda-axis " + headerClass + "'>" +
				((!slotNormal || !minutes) ? formatDate(d, opt('axisFormat')) : '&nbsp;') +
				"</th>" +
				"<td class='" + contentClass + "'>" +
				"<div style='position:relative'>&nbsp;</div>" +
				"</td>" +
				"</tr>";
            addMinutes(d, opt('slotMinutes'));
            slotCnt++;
        }
        s +=
			"</tbody>" +
			"</table>";
        slotTable = $(s).appendTo(slotContent);
        slotTableFirstInner = slotTable.find('div:first');

        slotBind(slotTable.find('td'));

        axisFirstCells = axisFirstCells.add(slotTable.find('th:first'));
    }

    function updateCells() {
        var i;
        var headCell;
        var bodyCell;
        var date;
        var today = clearTime(new Date());

        for (i = 0; i < colCnt; i++) {
            date = colDate(i);
            headCell = dayHeadCells.eq(i);
            bodyCell = dayBodyCells.eq(i);
            var res = t.getResource(i)
            headCell.html(res ? res.title : '');
            setDayID(headCell.add(bodyCell), date);
        }
    }


    function setHeight(height, dateChanged) {
        if (height === undefined) {
            height = viewHeight;
        }
        viewHeight = height;
        slotTopCache = {};

        var headHeight = dayBody.position().top;
        var allDayHeight = slotScroller.position().top; // including divider
        var bodyHeight = Math.min( // total body height, including borders
			height - headHeight,   // when scrollbars
			slotTable.height() + allDayHeight + 1 // when no scrollbars. +1 for bottom border
		);

        dayBodyFirstCellStretcher
			.height(bodyHeight - vsides(dayBodyFirstCell));

        slotLayer.css('top', headHeight);

        slotScroller.height(bodyHeight - allDayHeight - 1);

        slotHeight = slotTableFirstInner.height() + 1; // +1 for border

        snapRatio = opt('slotMinutes') / snapMinutes;
        snapHeight = slotHeight / snapRatio;

        if (dateChanged) {
            resetScroll();
        }
    }



    function setWidth(width) {
        viewWidth = width;
        colContentPositions.clear();

        axisWidth = 0;
        setOuterWidth(
			axisFirstCells
				.width('')
				.each(function (i, _cell) {
				    axisWidth = Math.max(axisWidth, $(_cell).outerWidth());
				}),
			axisWidth
		);

        var slotTableWidth = slotScroller[0].clientWidth; // needs to be done after axisWidth (for IE7)
        //slotTable.width(slotTableWidth);

        gutterWidth = slotScroller.width() - slotTableWidth;
        if (gutterWidth) {
            setOuterWidth(gutterCells, gutterWidth);
            gutterCells
				.show()
				.prev()
				.removeClass('fc-last');
        } else {
            gutterCells
				.hide()
				.prev()
				.addClass('fc-last');
        }

        colWidth = Math.floor((slotTableWidth - axisWidth) / t.getColCnt());
        setOuterWidth(dayHeadCells.slice(0, -1), colWidth);
    }



    function resetScroll() {
        var d0 = zeroDate();
        var scrollDate = cloneDate(d0);
        scrollDate.setHours(opt('firstHour'));
        var top = timePosition(d0, scrollDate) + 1; // +1 for the border
        function scroll() {
            slotScroller.scrollTop(top);
        }
        scroll();
        setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
    }


    function beforeHide() {
        savedScrollTop = slotScroller.scrollTop();
    }


    function afterShow() {
        slotScroller.scrollTop(savedScrollTop);
    }



    /* Slot/Day clicking and binding
	-----------------------------------------------------------------------*/


    function dayBind(cells) {
        cells.click(slotClick)
			.mousedown(daySelectionMousedown);
    }


    function slotBind(cells) {
        cells.click(slotClick)
			.mousedown(slotSelectionMousedown);
    }


    function slotClick(ev) {
        if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
            var col = Math.min(t.getColCnt() - 1, Math.floor((ev.pageX - dayTable.offset().left - axisWidth) / colWidth));
            var date = colDate(col);
            var rowMatch = this.parentNode.className.match(/fc-slot(\d+)/); // TODO: maybe use data
            if (rowMatch) {
                var mins = parseInt(rowMatch[1]) * opt('slotMinutes');
                var hours = Math.floor(mins / 60);
                date.setHours(hours);
                date.setMinutes(mins % 60 + minMinute);
                trigger('dayClick', dayBodyCells[col], date, false, ev);
            } else {
                trigger('dayClick', dayBodyCells[col], date, true, ev);
            }
        }
    }



    /* Semi-transparent Overlay Helpers
	-----------------------------------------------------*/


    function renderDayOverlay(startDate, endDate, refreshCoordinateGrid) { // endDate is exclusive
        if (refreshCoordinateGrid) {
            coordinateGrid.build();
        }
        var visStart = cloneDate(t.visStart);
        var startCol, endCol;
        if (rtl) {
            startCol = dayDiff(endDate, visStart) * dis + dit + 1;
            endCol = dayDiff(startDate, visStart) * dis + dit + 1;
        } else {
            startCol = dayDiff(startDate, visStart);
            endCol = dayDiff(endDate, visStart);
        }
        startCol = Math.max(0, startCol);
        endCol = Math.min(t.getColCnt(), endCol);
        if (startCol < endCol) {
            dayBind(
				renderCellOverlay(0, startCol, 0, endCol - 1)
			);
        }
    }


    function renderCellOverlay(row0, col0, row1, col1) { // only for all-day?
        var rect = coordinateGrid.rect(row0, col0, row1, col1, slotLayer);
        return renderOverlay(rect, slotLayer);
    }


    function renderSlotOverlay(overlayStart, overlayEnd) {
        var dayStart = cloneDate(t.visStart);
        var dayEnd = addDays(cloneDate(dayStart), 1);
        for (var i = 0; i < t.getColCnt(); i++) {
            var stretchStart = new Date(Math.max(dayStart, overlayStart));
            var stretchEnd = new Date(Math.min(dayEnd, overlayEnd));
            if (stretchStart < stretchEnd) {
                var col = i * dis + dit;
                var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only use it for horizontal coords
                var top = timePosition(dayStart, stretchStart);
                var bottom = timePosition(dayStart, stretchEnd);
                rect.top = top;
                rect.height = bottom - top;
                slotBind(
					renderOverlay(rect, slotContent)
				);
            }
            addDays(dayStart, 1);
            addDays(dayEnd, 1);
        }
    }



    /* Coordinate Utilities
	-----------------------------------------------------------------------------*/


    coordinateGrid = new CoordinateGrid(function (rows, cols) {
        var e, n, p;
        dayHeadCells.each(function (i, _e) {
            e = $(_e);
            n = e.offset().left;
            if (i) {
                p[1] = n;
            }
            p = [n];
            cols[i] = p;
        });
        p[1] = n + e.outerWidth();
        if (opt('allDaySlot')) {
            e = allDayRow;
            n = e.offset().top;
            rows[0] = [n, n + e.outerHeight()];
        }
        var slotTableTop = slotContent.offset().top;
        var slotScrollerTop = slotScroller.offset().top;
        var slotScrollerBottom = slotScrollerTop + slotScroller.outerHeight();
        function constrain(n) {
            return Math.max(slotScrollerTop, Math.min(slotScrollerBottom, n));
        }
        for (var i = 0; i < slotCnt * snapRatio; i++) { // adapt slot count to increased/decreased selection slot count
            rows.push([
				constrain(slotTableTop + snapHeight * i),
				constrain(slotTableTop + snapHeight * (i + 1))
            ]);
        }
    });


    hoverListener = new HoverListener(coordinateGrid);


    colContentPositions = new HorizontalPositionCache(function (col) {
        return dayBodyCellInners.eq(col);
    });


    function colContentLeft(col) {
        return colContentPositions.left(col);
    }


    function colContentRight(col) {
        return colContentPositions.right(col);
    }




    function dateCell(date) { // "cell" terminology is now confusing
        return {
            row: Math.floor(dayDiff(date, t.visStart) / 7),
            col: dayOfWeekCol(date.getDay())
        };
    }


    function cellDate(cell) {
        var d = colDate(cell.col);
        var slotIndex = cell.row;
        if (opt('allDaySlot')) {
            slotIndex--;
        }
        if (slotIndex >= 0) {
            addMinutes(d, minMinute + slotIndex * snapMinutes);
        }
        return d;
    }


    function colDate(col) { // returns dates with 00:00:00
        return addDays(cloneDate(t.visStart), col * dis + dit);
    }


    function cellIsAllDay(cell) {
        return opt('allDaySlot') && !cell.row;
    }


    function dayOfWeekCol(dayOfWeek) {
        return ((dayOfWeek - Math.max(firstDay, nwe) + t.getColCnt()) % t.getColCnt()) * dis + dit;
    }




    // get the Y coordinate of the given time on the given day (both Date objects)
    function timePosition(day, time) { // both date objects. day holds 00:00 of current day
        day = cloneDate(day, true);
        if (time < addMinutes(cloneDate(day), minMinute)) {
            return 0;
        }
        if (time >= addMinutes(cloneDate(day), maxMinute)) {
            return slotTable.height();
        }
        var slotMinutes = opt('slotMinutes'),
			minutes = time.getHours() * 60 + time.getMinutes() - minMinute,
			slotI = Math.floor(minutes / slotMinutes),
			slotTop = slotTopCache[slotI];
        if (slotTop === undefined) {
            slotTop = slotTopCache[slotI] = slotTable.find('tr:eq(' + slotI + ') td div')[0].offsetTop; //.position().top; // need this optimization???
        }
        return Math.max(0, Math.round(
			slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
		));
    }


    function allDayBounds() {
        return {
            left: axisWidth,
            right: viewWidth - gutterWidth
        }
    }


    function getAllDayRow(index) {
        return allDayRow;
    }


    function defaultEventEnd(event) {
        var start = cloneDate(event.start);
        if (event.allDay) {
            return start;
        }
        return addMinutes(start, opt('defaultEventMinutes'));
    }



    /* Selection
	---------------------------------------------------------------------------------*/


    function defaultSelectionEnd(startDate, allDay) {
        if (allDay) {
            return cloneDate(startDate);
        }
        return addMinutes(cloneDate(startDate), opt('slotMinutes'));
    }


    function renderSelection(startDate, endDate, allDay) { // only for all-day
        if (allDay) {
            if (opt('allDaySlot')) {
                renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true);
            }
        } else {
            renderSlotSelection(startDate, endDate);
        }
    }


    function renderSlotSelection(startDate, endDate) {
        var helperOption = opt('selectHelper');
        coordinateGrid.build();
        if (helperOption) {
            var col = dayDiff(startDate, t.visStart) * dis + dit;
            if (col >= 0 && col < t.getColCnt()) { // only works when times are on same day
                var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only for horizontal coords
                var top = timePosition(startDate, startDate);
                var bottom = timePosition(startDate, endDate);
                if (bottom > top) { // protect against selections that are entirely before or after visible range
                    rect.top = top;
                    rect.height = bottom - top;
                    rect.left += 2;
                    rect.width -= 5;
                    if ($.isFunction(helperOption)) {
                        var helperRes = helperOption(startDate, endDate);
                        if (helperRes) {
                            rect.position = 'absolute';
                            rect.zIndex = 8;
                            selectionHelper = $(helperRes)
								.css(rect)
								.appendTo(slotContent);
                        }
                    } else {
                        rect.isStart = true; // conside rect a "seg" now
                        rect.isEnd = true;   //
                        selectionHelper = $(slotSegHtml(
							{
							    title: '',
							    start: startDate,
							    end: endDate,
							    className: ['fc-select-helper'],
							    editable: false
							},
							rect
						));
                        selectionHelper.css('opacity', opt('dragOpacity'));
                    }
                    if (selectionHelper) {
                        slotBind(selectionHelper);
                        slotContent.append(selectionHelper);
                        setOuterWidth(selectionHelper, rect.width, true); // needs to be after appended
                        setOuterHeight(selectionHelper, rect.height, true);
                    }
                }
            }
        } else {
            renderSlotOverlay(startDate, endDate);
        }
    }


    function clearSelection() {
        clearOverlays();
        if (selectionHelper) {
            selectionHelper.remove();
            selectionHelper = null;
        }
    }


    function slotSelectionMousedown(ev) {
        if (ev.which == 1 && opt('selectable')) { // ev.which==1 means left mouse button
            unselect(ev);
            var dates;
            hoverListener.start(function (cell, origCell) {
                clearSelection();
                if (cell && cell.col == origCell.col && !cellIsAllDay(cell)) {
                    var d1 = cellDate(origCell);
                    var d2 = cellDate(cell);
                    dates = [
						d1,
						addMinutes(cloneDate(d1), snapMinutes), // calculate minutes depending on selection slot minutes 
						d2,
						addMinutes(cloneDate(d2), snapMinutes)
                    ].sort(cmp);
                    renderSlotSelection(dates[0], dates[3]);
                } else {
                    dates = null;
                }
            }, ev);
            $(document).one('mouseup', function (ev) {
                hoverListener.stop();
                if (dates) {
                    if (+dates[0] == +dates[1]) {
                        reportDayClick(dates[0], false, ev);
                    }
                    reportSelection(dates[0], dates[3], false, ev);
                }
            });
        }
    }


    function reportDayClick(date, allDay, ev) {
        trigger('dayClick', null, date, allDay, ev);
    }



    /* External Dragging
	--------------------------------------------------------------------------------*/


    function dragStart(_dragElement, ev, ui) {
        hoverListener.start(function (cell) {
            clearOverlays();
            if (cell) {
                if (cellIsAllDay(cell)) {
                    renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
                } else {
                    var d1 = cellDate(cell);
                    var d2 = addMinutes(cloneDate(d1), opt('defaultEventMinutes'));
                    renderSlotOverlay(d1, d2);
                }
            }
        }, ev);
    }


    function dragStop(_dragElement, ev, ui) {
        var cell = hoverListener.stop();
        clearOverlays();
        if (cell) {
            trigger('drop', _dragElement, cellDate(cell), cellIsAllDay(cell), ev, ui);
        }
    }


}

    ;;

function ResourceEventRenderer() {
    var t = this;


    // exports
    t.renderEvents = renderEvents;
    t.compileDaySegs = compileDaySegs; // for DayEventRenderer
    t.clearEvents = clearEvents;
    t.slotSegHtml = slotSegHtml;
    t.bindDaySeg = bindDaySeg;

    // imports
    DayEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    //var setOverflowHidden = t.setOverflowHidden;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var eventEnd = t.eventEnd;
    var reportEvents = t.reportEvents;
    var reportEventClear = t.reportEventClear;
    var eventElementHandlers = t.eventElementHandlers;
    var setHeight = t.setHeight;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var getSlotSegmentContainer = t.getSlotSegmentContainer;
    var getHoverListener = t.getHoverListener;
    var getMaxMinute = t.getMaxMinute;
    var getMinMinute = t.getMinMinute;
    var timePosition = t.timePosition;
    var colContentLeft = t.colContentLeft;
    var colContentRight = t.colContentRight;
    var renderDaySegs = t.renderDaySegs;
    var resizableDayEvent = t.resizableDayEvent; // TODO: streamline binding architecture
    var getColCnt = t.getColCnt;
    var getColWidth = t.getColWidth;
    var getSnapHeight = t.getSnapHeight;
    var getSnapMinutes = t.getSnapMinutes;
    var getBodyContent = t.getBodyContent;
    var reportEventElement = t.reportEventElement;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventDrop = t.eventDrop;
    var eventResize = t.eventResize;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var calendar = t.calendar;
    var formatDate = calendar.formatDate;
    var formatDates = calendar.formatDates;
    var getResources = t.getResources;
    var getResource = t.getResource;


    /* Rendering
	----------------------------------------------------------------------------*/

    // event rendering utilities
    function sliceResSegs(events, res) {
        var segs = [],
            i, len = events.length, event;
        if (res)
        for (i = 0; i < len; i++) {
            event = events[i];
            if (event.resource_id && event.resource_id == res.id)
                segs.push({
                    event: event,
                    resource: res,
                    start: 0,
                    //end: segEnd,
                    //isStart: isStart,
                    //isEnd: isEnd,
                    msLength: 0
                });
        }
        return segs.sort(segCmp);
    }


    function renderEvents(events, modifiedEventId) {
        reportEvents(events);
        var i, len = events.length,
			dayEvents = [],
			slotEvents = [];
        for (i = 0; i < len; i++) {
            if (events[i].allDay) {
                dayEvents.push(events[i]);
            } else {
                slotEvents.push(events[i]);
            }
        }
        if (opt('allDaySlot')) {
            renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
            setHeight(); // no params means set to viewHeight
        }
        var segs = compileSlotSegs(slotEvents);
        renderSlotSegs(segs, modifiedEventId);
        trigger('eventAfterAllRender');
    }


    function clearEvents() {
        reportEventClear();
        getDaySegmentContainer().empty();
        getSlotSegmentContainer().empty();
    }


    function compileDaySegs(events) {
        var levels = stackSegs(sliceSegs(events, $.map(events, exclEndDay), t.visStart, t.visEnd)),
			i, levelCnt = levels.length, level,
			j, seg,
			segs = [];
        for (i = 0; i < levelCnt; i++) {
            level = levels[i];
            for (j = 0; j < level.length; j++) {
                seg = level[j];
                seg.row = 0;
                seg.level = i; // not needed anymore
                segs.push(seg);
            }
        }
        return segs;
    }


    function compileSlotSegs(events) {
        var colCnt = getColCnt(),
			minMinute = getMinMinute(),
			maxMinute = getMaxMinute(),
			d = addMinutes(cloneDate(t.visStart), minMinute),
			visEventEnds = $.map(events, slotEventEnd),
			i, col,
			j, level,
			k, seg,
			segs = [];
        col = stackResSegs(sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute - minMinute)));
        countResForwardSegs(col);
        for (i = 0; i < colCnt; i++) {
            var res = getResource(i);
            if (res) {
                for (j = 0; j < col.length; j++) {
                    level = col[j];
                    for (k = 0; k < level.length; k++) {
                        seg = level[k];
                        if (seg.event.resource_id == res.id) {
                            seg.col = i;
                            seg.level = j;
                            segs.push(seg);
                        }
                    }
                }
            }
            addDays(d, 1, true);
        }
        return segs;
    }

    function stackResSegs(segs) {
        var levels = [],
            i, len = segs.length, seg,
            j, collide, k;
        for (i = 0; i < len; i++) {
            seg = segs[i];
            j = 0; // the level index where seg should belong
            while (true) {
                collide = false;
                if (levels[j]) {
                    for (k = 0; k < levels[j].length; k++) {
                        if (segsResCollide(levels[j][k], seg)) {
                            collide = true;
                            break;
                        }
                    }
                }
                if (collide) {
                    j++;
                } else {
                    break;
                }
            }
            if (levels[j]) {
                levels[j].push(seg);
            } else {
                levels[j] = [seg];
            }
        }
        return levels;
    }

    function segsResCollide(seg1, seg2) {
        return seg1.end > seg2.start && seg1.start < seg2.end && seg1.event.resource_id == seg2.event.resource_id;
    }

    function countResForwardSegs(levels) {
        var i, j, k, level, segForward, segBack;
        for (i = levels.length - 1; i > 0; i--) {
            level = levels[i];
            for (j = 0; j < level.length; j++) {
                segForward = level[j];
                for (k = 0; k < levels[i - 1].length; k++) {
                    segBack = levels[i - 1][k];
                    if (segsResCollide(segForward, segBack)) {
                        segBack.forward = Math.max(segBack.forward || 0, (segForward.forward || 0) + 1);
                    }
                }
            }
        }
    }

    function slotEventEnd(event) {
        if (event.end) {
            return cloneDate(event.end);
        } else {
            return addMinutes(cloneDate(event.start), opt('defaultEventMinutes'));
        }
    }


    // renders events in the 'time slots' at the bottom

    function renderSlotSegs(segs, modifiedEventId) {

        var i, segCnt = segs.length, seg,
			event,
			classes,
			top, bottom,
			colI, levelI, forward,
			leftmost,
			availWidth,
			outerWidth,
			left,
			html = '',
			eventElements,
			eventElement,
			triggerRes,
			vsideCache = {},
			hsideCache = {},
			key, val,
			titleElement,
			height,
			slotSegmentContainer = getSlotSegmentContainer(),
			rtl, dis, dit,
			colCnt = getColCnt();

        if (rtl = opt('isRTL')) {
            dis = -1;
            dit = colCnt - 1;
        } else {
            dis = 1;
            dit = 0;
        }

        // calculate position/dimensions, create html
        for (i = 0; i < segCnt; i++) {
            seg = segs[i];
            event = seg.event;
            top = timePosition(seg.start, seg.start);
            bottom = timePosition(seg.start, seg.end);
            colI = seg.col;
            levelI = seg.level;
            forward = seg.forward || 0;
            leftmost = colContentLeft(colI * dis + dit);
            availWidth = colContentRight(colI * dis + dit) - leftmost;
            availWidth = Math.min(availWidth - 6, availWidth * .95); // TODO: move this to CSS
            if (levelI) {
                // indented and thin
                outerWidth = availWidth / (levelI + forward + 1);
            } else {
                if (forward) {
                    // moderately wide, aligned left still
                    outerWidth = ((availWidth / (forward + 1)) - (12 / 2)) * 2; // 12 is the predicted width of resizer =
                } else {
                    // can be entire width, aligned left
                    outerWidth = availWidth;
                }
            }
            left = leftmost +                                  // leftmost possible
				(availWidth / (levelI + forward + 1) * levelI) // indentation
				* dis + (rtl ? availWidth - outerWidth : 0);   // rtl
            seg.top = top;
            seg.left = left;
            seg.outerWidth = outerWidth;
            seg.outerHeight = bottom - top;
            html += slotSegHtml(event, seg);
        }
        slotSegmentContainer[0].innerHTML = html; // faster than html()
        eventElements = slotSegmentContainer.children();

        // retrieve elements, run through eventRender callback, bind event handlers
        for (i = 0; i < segCnt; i++) {
            seg = segs[i];
            event = seg.event;
            eventElement = $(eventElements[i]); // faster than eq()
            triggerRes = trigger('eventRender', event, event, eventElement);
            if (triggerRes === false) {
                eventElement.remove();
            } else {
                if (triggerRes && triggerRes !== true) {
                    eventElement.remove();
                    eventElement = $(triggerRes)
						.css({
						    position: 'absolute',
						    top: seg.top,
						    left: seg.left
						})
						.appendTo(slotSegmentContainer);
                }
                seg.element = eventElement;
                if (event._id === modifiedEventId) {
                    bindSlotSeg(event, eventElement, seg);
                } else {
                    eventElement[0]._fci = i; // for lazySegBind
                }
                reportEventElement(event, eventElement);
            }
        }

        lazySegBind(slotSegmentContainer, segs, bindSlotSeg);

        // record event sides and title positions
        for (i = 0; i < segCnt; i++) {
            seg = segs[i];
            if (eventElement = seg.element) {
                val = vsideCache[key = seg.key = cssKey(eventElement[0])];
                seg.vsides = val === undefined ? (vsideCache[key] = vsides(eventElement, true)) : val;
                val = hsideCache[key];
                seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement, true)) : val;
                titleElement = eventElement.find('.fc-event-title');
                if (titleElement.length) {
                    seg.contentTop = titleElement[0].offsetTop;
                }
            }
        }

        // set all positions/dimensions at once
        for (i = 0; i < segCnt; i++) {
            seg = segs[i];
            if (eventElement = seg.element) {
                eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
                height = Math.max(0, seg.outerHeight - seg.vsides);
                eventElement[0].style.height = height + 'px';
                event = seg.event;
                if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
                    // not enough room for title, put it in the time (TODO: maybe make both display:inline instead)
                    eventElement.find('div.fc-event-time')
						.text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
                    eventElement.find('div.fc-event-title')
						.remove();
                }
                trigger('eventAfterRender', event, event, eventElement);
            }
        }

    }


    function slotSegHtml(event, seg) {
        var html = "<";
        var url = event.url;
        var skinCss = getSkinCss(event, opt);
        var classes = ['fc-event', 'fc-event-vert'];
        if (isEventDraggable(event)) {
            classes.push('fc-event-draggable');
        }
        if (seg.isStart) {
            classes.push('fc-event-start');
        }
        if (seg.isEnd) {
            classes.push('fc-event-end');
        }
        classes = classes.concat(event.className);
        if (event.source) {
            classes = classes.concat(event.source.className || []);
        }
        if (url) {
            html += "a href='" + htmlEscape(event.url) + "'";
        } else {
            html += "div";
        }
        html +=
			" class='" + classes.join(' ') + "'" +
			" style='position:absolute;z-index:8;top:" + seg.top + "px;left:" + seg.left + "px;" + skinCss + "'" +
			">" +
			"<div class='fc-event-inner'>" +
			"<div class='fc-event-time'>" +
			htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
			"</div>" +
			"<div class='fc-event-title'>" +
			htmlEscape(event.title) +
			"</div>" +
			"</div>" +
			"<div class='fc-event-bg'></div>";
        if (seg.isEnd && isEventResizable(event)) {
            html +=
				"<div class='ui-resizable-handle ui-resizable-s'>=</div>";
        }
        html +=
			"</" + (url ? "a" : "div") + ">";
        return html;
    }


    function bindDaySeg(event, eventElement, seg) {
        if (isEventDraggable(event)) {
            draggableDayEvent(event, eventElement, seg.isStart);
        }
        if (seg.isEnd && isEventResizable(event)) {
            resizableDayEvent(event, eventElement, seg);
        }
        eventElementHandlers(event, eventElement);
        // needs to be after, because resizableDayEvent might stopImmediatePropagation on click
    }


    function bindSlotSeg(event, eventElement, seg) {
        var timeElement = eventElement.find('div.fc-event-time');
        if (isEventDraggable(event)) {
            draggableSlotEvent(event, eventElement, timeElement);
        }
        if (seg.isEnd && isEventResizable(event)) {
            resizableSlotEvent(event, eventElement, timeElement);
        }
        eventElementHandlers(event, eventElement);
    }



    /* Dragging
	-----------------------------------------------------------------------------------*/


    // when event starts out FULL-DAY

    function draggableDayEvent(event, eventElement, isStart) {
        var origWidth;
        var revert;
        var allDay = true;
        var dayDelta;
        var dis = opt('isRTL') ? -1 : 1;
        var hoverListener = getHoverListener();
        var colWidth = getColWidth();
        var snapHeight = getSnapHeight();
        var snapMinutes = getSnapMinutes();
        var minMinute = getMinMinute();
        eventElement.draggable({
            zIndex: 9,
            opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
            revertDuration: opt('dragRevertDuration'),
            start: function (ev, ui) {
                trigger('eventDragStart', eventElement, event, ev, ui);
                hideEvents(event, eventElement);
                origWidth = eventElement.width();
                hoverListener.start(function (cell, origCell, rowDelta, colDelta) {
                    clearOverlays();
                    if (cell) {
                        //setOverflowHidden(true);
                        revert = false;
                        dayDelta = colDelta * dis;
                        if (!cell.row) {
                            // on full-days
                            renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
                            resetElement();
                        } else {
                            // mouse is over bottom slots
                            if (isStart) {
                                if (allDay) {
                                    // convert event to temporary slot-event
                                    eventElement.width(colWidth - 10); // don't use entire width
                                    setOuterHeight(
										eventElement,
										snapHeight * Math.round(
											(event.end ? ((event.end - event.start) / MINUTE_MS) : opt('defaultEventMinutes')) /
												snapMinutes
										)
									);
                                    eventElement.draggable('option', 'grid', [colWidth, 1]);
                                    allDay = false;
                                }
                            } else {
                                revert = true;
                            }
                        }
                        revert = revert || (allDay && !dayDelta);
                    } else {
                        resetElement();
                        //setOverflowHidden(false);
                        revert = true;
                    }
                    eventElement.draggable('option', 'revert', revert);
                }, ev, 'drag');
            },
            stop: function (ev, ui) {
                hoverListener.stop();
                clearOverlays();
                trigger('eventDragStop', eventElement, event, ev, ui);
                if (revert) {
                    // hasn't moved or is out of bounds (draggable has already reverted)
                    resetElement();
                    eventElement.css('filter', ''); // clear IE opacity side-effects
                    showEvents(event, eventElement);
                } else {
                    // changed!
                    var minuteDelta = 0;
                    if (!allDay) {
                        minuteDelta = Math.round((eventElement.offset().top - getBodyContent().offset().top) / snapHeight)
							* snapMinutes
							+ minMinute
							- (event.start.getHours() * 60 + event.start.getMinutes());
                    }
                    eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
                }
                //setOverflowHidden(false);
            }
        });
        function resetElement() {
            if (!allDay) {
                eventElement
					.width(origWidth)
					.height('')
					.draggable('option', 'grid', null);
                allDay = true;
            }
        }
    }


    // when event starts out IN TIMESLOTS

    function draggableSlotEvent(event, eventElement, timeElement) {
        var origPosition;
        var allDay = false;
        var dayDelta;
        var minuteDelta;
        var prevMinuteDelta;
        var dis = opt('isRTL') ? -1 : 1;
        var hoverListener = getHoverListener();
        var colCnt = getColCnt();
        var colWidth = getColWidth();
        var snapHeight = getSnapHeight();
        var snapMinutes = getSnapMinutes();
        eventElement.draggable({
            zIndex: 9,
            scroll: false,
            grid: [colWidth, snapHeight],
            axis: colCnt == 1 ? 'y' : false,
            opacity: opt('dragOpacity'),
            revertDuration: opt('dragRevertDuration'),
            start: function (ev, ui) {
                trigger('eventDragStart', eventElement, event, ev, ui);
                hideEvents(event, eventElement);
                origPosition = eventElement.position();
                minuteDelta = prevMinuteDelta = 0;
                hoverListener.start(function (cell, origCell, rowDelta, colDelta) {
                    eventElement.draggable('option', 'revert', !cell);
                    clearOverlays();
                    if (cell) {
                        dayDelta = colDelta * dis;
                        if (opt('allDaySlot') && !cell.row) {
                            // over full days
                            if (!allDay) {
                                // convert to temporary all-day event
                                allDay = true;
                                timeElement.hide();
                                eventElement.draggable('option', 'grid', null);
                            }
                            renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
                        } else {
                            // on slots
                            resetElement();
                        }
                    }
                }, ev, 'drag');
            },
            drag: function (ev, ui) {
                minuteDelta = Math.round((ui.position.top - origPosition.top) / snapHeight) * snapMinutes;
                if (minuteDelta != prevMinuteDelta) {
                    if (!allDay) {
                        updateTimeText(minuteDelta);
                    }
                    prevMinuteDelta = minuteDelta;
                }
            },
            stop: function (ev, ui) {
                var cell = hoverListener.stop();
                clearOverlays();
                trigger('eventDragStop', eventElement, event, ev, ui);
                if (cell && (dayDelta || minuteDelta || allDay)) {
                    // changed!
                    eventDrop(this, event, dayDelta, allDay ? 0 : minuteDelta, allDay, ev, ui);
                } else {
                    // either no change or out-of-bounds (draggable has already reverted)
                    resetElement();
                    eventElement.css('filter', ''); // clear IE opacity side-effects
                    eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
                    updateTimeText(0);
                    showEvents(event, eventElement);
                }
            }
        });
        function updateTimeText(minuteDelta) {
            var newStart = addMinutes(cloneDate(event.start), minuteDelta);
            var newEnd;
            if (event.end) {
                newEnd = addMinutes(cloneDate(event.end), minuteDelta);
            }
            timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
        }
        function resetElement() {
            // convert back to original slot-event
            if (allDay) {
                timeElement.css('display', ''); // show() was causing display=inline
                eventElement.draggable('option', 'grid', [colWidth, snapHeight]);
                allDay = false;
            }
        }
    }



    /* Resizing
	--------------------------------------------------------------------------------------*/


    function resizableSlotEvent(event, eventElement, timeElement) {
        var snapDelta, prevSnapDelta;
        var snapHeight = getSnapHeight();
        var snapMinutes = getSnapMinutes();
        eventElement.resizable({
            handles: {
                s: '.ui-resizable-handle'
            },
            grid: snapHeight,
            start: function (ev, ui) {
                snapDelta = prevSnapDelta = 0;
                hideEvents(event, eventElement);
                eventElement.css('z-index', 9);
                trigger('eventResizeStart', this, event, ev, ui);
            },
            resize: function (ev, ui) {
                // don't rely on ui.size.height, doesn't take grid into account
                snapDelta = Math.round((Math.max(snapHeight, eventElement.height()) - ui.originalSize.height) / snapHeight);
                if (snapDelta != prevSnapDelta) {
                    timeElement.text(
						formatDates(
							event.start,
							(!snapDelta && !event.end) ? null : // no change, so don't display time range
								addMinutes(eventEnd(event), snapMinutes * snapDelta),
							opt('timeFormat')
						)
					);
                    prevSnapDelta = snapDelta;
                }
            },
            stop: function (ev, ui) {
                trigger('eventResizeStop', this, event, ev, ui);
                if (snapDelta) {
                    eventResize(this, event, 0, snapMinutes * snapDelta, ev, ui);
                } else {
                    eventElement.css('z-index', 8);
                    showEvents(event, eventElement);
                    // BUG: if event was really short, need to put title back in span
                }
            }
        });
    }


}

function ResourceSelectionManager(t) {
    var t = this;
    var trigger = t.trigger;
    var getResource = t.getResource;
    var sm = SelectionManager.call(t);
    t.sm_reportSelection = t.reportSelection;
    t.reportSelection = resourceReportSelection;
    t.sm_reportDayClick = t.reportDayClick;
    t.reportDayClick = resourceReportDayClick;

    function resourceReportSelection(startDate, endDate, allDay, ev) {
        var col = Math.round((startDate - t.start) / 1000 / 60 / 60 / 24);
        ev.resource_id = getResource(col).id;
        t.sm_reportSelection(startDate, endDate, allDay, ev);
    }

    function resourceReportDayClick(date, allDay, ev) {
        var col = Math.round((date - t.start) / 1000 / 60 / 60 / 24);
        ev.resource_id = getResource(col).id;
        t.sm_reportDayClick(date, allDay, ev);
    }
}

