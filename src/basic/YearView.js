
/**
 *  Experimental year view
 */

fcViews.year = YearView;
function YearView( element, calendar )
{
    var t = this;

    //exports
    t.render = render;
    t.renderBasic = renderBasic;
    t.updateCells = updateCells;
    t.updateOptions = updateOptions;
    t.buildSkeleton = buildSkeleton;
    t.setHeight = setHeight;
    t.setWidth = setWidth;
    t.dayBind = dayBind;
    t.getRowCnt = function() { return rowCnt };
    t.getColCnt = function() { return colCnt };
    t.getColWidth = function() { return colWidth };
    t.getDaySegmentContainer = function() { return daySegmentContainer };
    t.getHoverListener = function() { return hoverListener };
    t.renderDayOverlay = renderDayOverlay;
    t.colLeft = colLeft;
    t.colRight = colRight;
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.getIsCellAllDay = function() { return true };
    t.allDayRow = allDayRow;
    t.clearSelection = clearSelection;
    t.defaultEventEnd = defaultEventEnd;

    // imports
    View.call(t, element, calendar, 'year');
    OverlayManager.call(t);
    SelectionManager.call(t);
    //We need to overwrite rangeToSegments
    t.rangeToSegments = rangeToSegments;
    BasicEventRenderer.call(t);

    var head;
    var headCells;
    var body;
    var bodyRows;
    var bodyCells;
    var bodyFirstCells;
    var bodyCellTopInners;
    var daySegmentContainer;
    var firstRowCellInners;

    var opt = t.opt;
    var trigger = t.trigger;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var daySelectionMousedown = t.daySelectionMousedown;
    var cellToDate = t.cellToDate;
    var dateToCell = t.dateToCell;
    var formatDate = calendar.formatDate;
    var clearEvents = t.clearEvents;
    var dateToDayOffset = t.dateToDayOffset;
    var dayOffsetToCellOffset = t.dayOffsetToCellOffset;
    var cellOffsetToDayOffset = t.cellOffsetToDayOffset;
    var isRTL = opt('isRTL');


    /**
     *  YearView > Render
     */
    function render( date, delta )
    {
        //      debug
        //console.log( "YearView > render" );
        
        if ( delta )
        {
            addYears( date, delta );
            date.setDate( 1 );
        }
        
        var start = cloneDate( date, true );
        start.setDate( 1 );
        start.setMonth( 0 );
        var end = addYears( cloneDate( start ), 1 );
        var visStart = cloneDate( start );
        var visEnd = cloneDate( end );
        var firstDay = opt( 'firstDay' );
        var nwe = 0;
        
        //      debug
        //console.log( visStart );
        //console.log( visEnd );
        
        t.title = formatDate( start, opt( 'titleFormat' ));
        t.start = start;
        t.end = end;
        t.visStart = visStart;
        t.visEnd = visEnd;
        
        //      Year view - vertical settings : 12 cols for months & 31 rows for dates
        renderBasic( 12, 12, 31, opt( 'showNumbers' ) );
    }



    /**
     *  YearView > renderBasic
     */
    function renderBasic( maxr, r, c, showNumbers )
    {
        //      debug
        //console.log( "YearView > renderBasic" );
        
        rowCnt = r;
        colCnt = c;
        updateOptions();
        
        var firstTime = !body;
        if ( firstTime )
            buildSkeleton( maxr, showNumbers );
        else
            clearEvents();
        
        updateCells( firstTime, showNumbers );
    }



    /**
     *  YearView > buildSkeleton
     */
    function buildSkeleton( maxRowCnt, showNumbers )
    {
        var s;
        var headerClass = tm + "-widget-header";
        var contentClass = tm + "-widget-content";
        var i, j, day_nb;
        var table;
        
        //      Extra counter
        //      @see    dayClick()
        day_nb = 0;
        
        s =
            "<table class='fc-border-separate fc-skeleton fc-skeleton-year-vertical' style='width:100%' cellspacing='0'>";
        
        //      Add colgroups for column hover effect
        //      @see    http://css-tricks.com/examples/RowColumnHighlighting/example-three.php
        for ( i = 0; i < colCnt; i++ )
            s += "<colgroup class='col" + i + "'></colgroup>";
        
        s +=
            "<thead>" +
            "<tr><th></th>";
        
        //      @todo - check classes
        for ( i = 0; i < colCnt; i++ )
            s +=
                "<th class='fc- " + headerClass + " day-" + ( i + 1 ) + "'/>";
        s +=
            "</tr>" +
            "</thead>" +
            "<tbody>";
        
        for ( i = 0; i < maxRowCnt; i++ )
        {
            s +=
                "<tr class='fc-date" + ( i + 1 ) + "'>";
            s += '<th class="fc-month-header"></th>';
            
            for ( j = 0; j < colCnt; j++ )
            {
                day_nb++;
                
                s +=
                    "<td class='fc- " + contentClass + " fc-month" + ( i + 1 ) + " fc-day" + ( j + 1 ) + " fc-num" + day_nb + "'>" +
                    "<div>" +
                    (showNumbers ?
                        "<div class='fc-day-number'/>" :
                        ''
                        ) +
                    "<div class='fc-day-content'>" +
                    "<div style='position:relative'>&nbsp;</div>" +
                    "</div>" +
                    "</div>" +
                    "</td>";
            }
            s +=
                "</tr>";
        }
        s +=
            "</tbody>" +
            "</table>";
        
        table = $(s).appendTo(element);
        
        head = table.find('thead');
        headCells = head.find('th');
        body = table.find('tbody');
        bodyRows = body.find('tr');
        bodyCells = body.find('td');
        bodyRowHeadCells = body.find('th');
        bodyFirstCells = bodyCells.filter(':first-child');
        bodyCellTopInners = bodyRows.eq(0).find('div.fc-day-content div');
        firstRowCellInners = bodyRows.eq(0).find('.fc-day > div');
        
        markFirstLast(head.add(head.find('tr'))); // marks first+last tr/th's
        markFirstLast(bodyRows); // marks first+last td's
        bodyRows.eq(0).addClass('fc-first'); // fc-last is done in updateCells
        bodyCells.each(function(i, _cell) {
            var index = parseInt( _cell.className.match( /fc\-num(\d+)/ )[ 1 ]);
            var date = indexDate( index - 1);
            if (date) {
                trigger('dayRender', t, date, $(_cell));
            }
        });
        
        //      Bind
        dayBind( bodyCells );
        
        daySegmentContainer =
            $("<div style='position:absolute;z-index:8;top:0;left:0'/>")
                .appendTo(element);
    }
    
    
    
    /**
     *  YearView > updateCells
     */
    function updateCells( firstTime, showNumbers )
    {
        var dowDirty = firstTime || rowCnt == 1;
        var month = t.start.getMonth();
        var today = clearTime(new Date());
        var cell;
        var date;
        var row;
    
        if (dowDirty)
        {
            headCells.each(function(i, _cell)
            {
                if (i > 0) {
                    cell = $(_cell);

                    //      debug
                    //console.log( "cell " + i );
                    //console.log( cell );

                    //     In YearView, each col is a month
                    //      @todo - optionally allow to start with another month
                    date = new Date( t.visStart.getFullYear(), i );

                    cell.html(i);
                    setDayID(cell, date);
                }
            });
        }
        
        bodyRowHeadCells.each( function( i, _cell ) {
            cell = $( _cell );
            date = new Date( t.visStart.getFullYear(), i );
            cell.html(formatDate(date, colFormat));
        });
        bodyCells.each( function( i, _cell )
        {
            cell = $( _cell );
            date = indexDate( i );
            
            //      When we hit a cell without a date (e.g. rows > 28 / 29 in february)
            if ( !date )
            {
                cell.find( 'div.fc-day-number' ).text( '' );
                cell.addClass( 'fc-empty' );
                
                //      detailed debug
                //var current_col = Math.floor( i % colCnt );
                //var current_row = Math.floor( i / colCnt );
                //var nb_days = daysInMonth( current_col + 1, t.visStart.getFullYear());
                //if ( current_row >= nb_days && current_col == 1 )
                //    console.log( "  Hide cell " + ( current_row + 1 ) + " / " + ( current_col + 1 ) + " / " + t.visStart.getFullYear() );
            }
            else
            {
                if ( +date == +today ) {
                    cell.addClass(tm + '-state-highlight fc-today');
                }else{
                    cell.removeClass(tm + '-state-highlight fc-today');
                }
                if (showNumbers) {
                    cell.find( 'div.fc-day-number' ).text( date.getDate());
                }
                
                if ( dowDirty ) {
                    setDayID( cell, date );
                }
            }
        });
        
        bodyRows.each(function(i, _row)
        {
            row = $(_row);
            if (i < rowCnt) {
                row.show();
                if (i == rowCnt-1) {
                    row.addClass('fc-last');
                }else{
                    row.removeClass('fc-last');
                }
            }else{
                row.hide();
            }
        });
        
    }
    
    
    
    /**
     *  Yearview > indexDate
     */
    function indexDate( index )
    {
        //      Get current month, starting with 0 (column number)
        var current_col = Math.floor( index % colCnt );
        
        //      Get current date, starting with 0 (row number)
        var current_row = Math.floor( index / colCnt );
        
        //      Nb days in current month
        //      @see    daysInMonth()
        var nb_days = daysInMonth( current_row + 1, t.visStart.getFullYear());
        
        //      Not a valid cell (e.g. rows > 28 or 29 in february)
        if ( current_col >= nb_days )
            return false;
        else
            return new Date( t.visStart.getFullYear(), current_row , current_col + 1);
    }
    
    
    
    /**
     *  Yearview > _cellDate
     *  Appears not to be needed anymore
     */
    function _cellDate( row, col ) {
        return addDays( cloneDate( t.visStart ), row * 7 + col * dis + dit );
    }
    
    
    
    /**
     *  Yearview > dayClick
     */
    function dayClick( ev )
    {
        if ( !opt( 'selectable' ))
        {
            var index = parseInt( this.className.match( /fc\-num(\d+)/ )[ 1 ]);
            var date = indexDate( index - 1);
            trigger( 'dayClick', this, date, true, ev );
        }
    }
    
    
    
    //============================================================================================================================================
    //      custom helper
    
    /**
     *  Get number of days per month
     *  @see    http://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
     */
    function daysInMonth( month, year ) {
        return new Date( year, month, 0 ).getDate();
    }
    
    
    
    //============================================================================================================================================
    //      Fix various ref errors - pasted all methods from basic view
    //      @todo - any other proper way to fix those ?
    
    function updateOptions() {
        rtl = opt('isRTL');
        if (rtl) {
            dis = -1;
            dit = colCnt - 1;
        }else{
            dis = 1;
            dit = 0;
        }
        firstDay = opt('firstDay');
        nwe = opt('weekends') ? 0 : 1;
        tm = opt('theme') ? 'ui' : 'fc';
        colFormat = opt('columnFormat');
    }
    
    
    function setHeight(height) {
        viewHeight = height;
        
        var bodyHeight = viewHeight - head.height();
        var rowHeight;
        var rowHeightLast;
        var cell;
            
        if (opt('weekMode') == 'variable') {
            rowHeight = rowHeightLast = Math.floor(bodyHeight / (rowCnt==1 ? 2 : 6));
        }else{
            rowHeight = Math.floor(bodyHeight / rowCnt);
            rowHeightLast = bodyHeight - rowHeight * (rowCnt-1);
        }
        
        bodyFirstCells.each(function(i, _cell) {
            if (i < rowCnt) {
                cell = $(_cell);
                cell.find('> div').css(
                    'min-height',
                    (i==rowCnt-1 ? rowHeightLast : rowHeight) - vsides(cell)
                );
            }
        });
        
    }
    
    function setWidth(width) {
        viewWidth = width;
        colContentPositions.clear();
        colWidth = Math.floor(viewWidth / colCnt);
        setOuterWidth(headCells.slice(0, -1), colWidth);
    }
    
    
    
    /* Day clicking and binding
    -----------------------------------------------------------*/
    
    
    function dayBind(days) {
        days.click(dayClick)
            .mousedown(daySelectionMousedown);
    }
    
    
    
    /* Semi-transparent Overlay Helpers
    ------------------------------------------------------*/
    
    
    function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) { // overlayEnd is exclusive
        if (refreshCoordinateGrid) {
            coordinateGrid.build();
        }
        var rowStart = cloneDate(t.visStart);
        var rowEnd = addDays(cloneDate(rowStart), colCnt);
        for (var i=0; i<rowCnt; i++) {
            var stretchStart = new Date(Math.max(rowStart, overlayStart));
            var stretchEnd = new Date(Math.min(rowEnd, overlayEnd));
            if (stretchStart < stretchEnd) {
                var colStart, colEnd;
                if (rtl) {
                    colStart = dayDiff(stretchEnd, rowStart)*dis+dit+1;
                    colEnd = dayDiff(stretchStart, rowStart)*dis+dit+1;
                }else{
                    colStart = dayDiff(stretchStart, rowStart);
                    colEnd = dayDiff(stretchEnd, rowStart);
                }
                dayBind(
                    renderCellOverlay(i, colStart, i, colEnd-1)
                );
            }
            addDays(rowStart, 31);
            addDays(rowEnd, 31);
        }
    }
    
    
    function renderCellOverlay(row0, col0, row1, col1) { // row1,col1 is inclusive
        var rect = coordinateGrid.rect(row0, col0, row1, col1, element);
        return renderOverlay(rect, element);
    }
    
    
    
    /* Selection
    -----------------------------------------------------------------------*/
    
    
    function defaultSelectionEnd(startDate, allDay) {
        return cloneDate(startDate);
    }
    
    
    function renderSelection(startDate, endDate, allDay) {
        renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true); // rebuild every time???
    }
    
    
    function clearSelection() {
        clearOverlays();
    }
    
    
    function reportDayClick(date, allDay, ev) {
        var cell = dateCell(date);
        var _element = bodyCells[cell.row*colCnt + cell.col];
        trigger('dayClick', _element, date, allDay, ev);
    }
    
    
    
    /* External Dragging
    -----------------------------------------------------------------------*/
    
    
    function dragStart(_dragElement, ev, ui) {
        hoverListener.start(function(cell) {
            clearOverlays();
            if (cell) {
                renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
            }
        }, ev);
    }
    
    
    function dragStop(_dragElement, ev, ui) {
        var cell = hoverListener.stop();
        clearOverlays();
        if (cell) {
            var d = cellDate(cell);
            trigger('drop', _dragElement, d, true, ev, ui);
        }
    }
    
    
    
    /* Utilities
    --------------------------------------------------------*/
    
    
    function defaultEventEnd(event) {
        return cloneDate(event.start);
    }
    
    
    coordinateGrid = new CoordinateGrid(function(rows, cols) {
        var e, n, p;
        headCells.each(function(i, _e) {
            e = $(_e);
            n = e.offset().left;
            if (i) {
                p[1] = n;
            }
            p = [n];
            cols[i - 1] = p;
        });
        p[1] = n + e.outerWidth();
        bodyRows.each(function(i, _e) {
            if (i < rowCnt) {
                e = $(_e);
                n = e.offset().top;
                if (i) {
                    p[1] = n;
                }
                p = [n];
                rows[i] = p;
            }
        });
        p[1] = n + e.outerHeight();
    });
    
    
    hoverListener = new HoverListener(coordinateGrid);
    
    colPositions = new HorizontalPositionCache(function(col) {
        return firstRowCellInners.eq(col);
    });
    
    colContentPositions = new HorizontalPositionCache(function(col) {
        return bodyCellTopInners.eq(col);
    });
    
    
    function colContentLeft(col) {
        return colContentPositions.left(col);
    }
    
    
    function colContentRight(col) {
        return colContentPositions.right(col);
    }
    
    
    
    
    function dateCell(date) {
        return {
            row: Math.floor(dayDiff(date, t.visStart) / 7),
            col: dayOfWeekCol(date.getDay())
        };
    }
    
    
    function cellDate(cell) {
        return _cellDate(cell.row, cell.col);
    }
    
    
    function dayOfWeekCol(dayOfWeek) {
        return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt) * dis + dit;
    }
    
    
    
    
    function allDayRow(i) {
        return bodyRows.eq(i);
    }
    
    
    function allDayBounds(i) {
        return {
            left: 0,
            right: viewWidth
        };
    }

    function colLeft(col) {
        return colPositions.left(col);
    }


    function colRight(col) {
        return colPositions.right(col);
    }
    
    //
    // Converts a date range into an array of segment objects.
    // "Segments" are horizontal stretches of time, sliced up by row.
    // A segment object has the following properties:
    // - row
    // - cols
    // - isStart
    // - isEnd
    //
    function rangeToSegments(startDate, endDate) {
        var rowCnt = t.getRowCnt();
        var colCnt = t.getColCnt();
        var segments = []; // array of segments to return

        // day offset for given date range
        var rangeDayOffsetStart = dateToDayOffset(startDate);
        var rangeDayOffsetEnd = dateToDayOffset(endDate); // exclusive

        // first and last cell offset for the given date range
        // "last" implies inclusivity
        var rangeCellOffsetFirst = dayOffsetToCellOffset(rangeDayOffsetStart);
        var rangeCellOffsetLast = dayOffsetToCellOffset(rangeDayOffsetEnd) - 1;

        // loop through all the rows in the view
        for (var row=0; row<rowCnt; row++) {
            var firstDay = (Math.ceil((new Date(startDate.getFullYear(), row, 1) - new Date(startDate.getFullYear(), 0, 1)) / 86400000));
            // first and last cell offset for the row
            var rowCellOffsetFirst = firstDay;
            var rowCellOffsetLast = firstDay + new Date(startDate.getFullYear(), row + 1, 0).getDate() - 1;

            // get the segment's cell offsets by constraining the range's cell offsets to the bounds of the row
            var segmentCellOffsetFirst = Math.max(rangeCellOffsetFirst, rowCellOffsetFirst);
            var segmentCellOffsetLast = Math.min(rangeCellOffsetLast, rowCellOffsetLast);
            // make sure segment's offsets are valid and in view
            if (segmentCellOffsetFirst <= segmentCellOffsetLast) {

                // translate to cells
                var segmentCellFirst = cellOffsetToCell(segmentCellOffsetFirst);
                var segmentCellLast = cellOffsetToCell(segmentCellOffsetLast);

                // view might be RTL, so order by leftmost column
                var cols = [ segmentCellFirst.col, segmentCellLast.col ].sort();

                // Determine if segment's first/last cell is the beginning/end of the date range.
                // We need to compare "day offset" because "cell offsets" are often ambiguous and
                // can translate to multiple days, and an edge case reveals itself when we the
                // range's first cell is hidden (we don't want isStart to be true).
                var isStart = cellOffsetToDayOffset(segmentCellOffsetFirst) == rangeDayOffsetStart;
                var isEnd = cellOffsetToDayOffset(segmentCellOffsetLast) + 1 == rangeDayOffsetEnd; // +1 for comparing exclusively

                /*console.log({
                    row: row,
                    leftCol: cols[0],
                    rightCol: cols[1],
                    isStart: isStart,
                    isEnd: isEnd
                });*/
                segments.push({
                    row: row,
                    leftCol: cols[0],
                    rightCol: cols[1],
                    isStart: isStart,
                    isEnd: isEnd
                });
            }
        }

        return segments;
    }
    function dayOffsetToCellOffset(dayOffset) {
        return dayOffset;
    }
    function cellOffsetToCell(cellOffset) {
        for (i = 0; i < 12; i +=1) {
            var firstDay = (Math.ceil((new Date(2014, i, 1) - new Date(2014, 0, 1)) / 86400000));
            if (firstDay - 1  < cellOffset) {
                cellOffset += (31 - new Date(2014, i, 0).getDate());
            }
        }
        var colCnt = t.getColCnt();

        // rtl variables. wish we could pre-populate these. but where?
        var dis = isRTL ? -1 : 1;
        var dit = isRTL ? colCnt - 1 : 0;

        var row = Math.floor(cellOffset / colCnt);
        var col = ((cellOffset % colCnt + colCnt) % colCnt) * dis + dit; // column, adjusted for RTL (dis & dit)
        /*console.log({
            row: row,
            col: col
        });*/
        return {
            row: row,
            col: col
        };
    }

}
