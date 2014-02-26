
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
    t.colLeft = colLeft;
    t.colRight = colRight;
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.getIsCellAllDay = function() { return true };
    t.allDayRow = allDayRow;

    // imports
    View.call(t, element, calendar, 'year');
    OverlayManager.call(t);
    SelectionManager.call(t);
    BasicEventRenderer.call(t);

    var head;
    var headCells;
    var body;
    var bodyRows;
    var bodyCells;
    var bodyFirstCells;
    var bodyCellTopInners;
    var daySegmentContainer;

    var opt = t.opt;
    var trigger = t.trigger;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var daySelectionMousedown = t.daySelectionMousedown;
    var cellToDate = t.cellToDate;
    var dateToCell = t.dateToCell;
    var rangeToSegments = t.rangeToSegments;
    var formatDate = calendar.formatDate;
    
    
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
        renderBasic( 31, 31, 12, true );
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
        
        updateCells( firstTime );
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
			"<tr>";
        
        //      @todo - check classes
		for ( i = 0; i < colCnt; i++ )
			s +=
				"<th class='fc- " + headerClass + " month-" + ( i + 1 ) + "'/>";
		s +=
			"</tr>" +
			"</thead>" +
			"<tbody>";
		
		//      In YearView, lines are days
		for ( i = 0; i < maxRowCnt; i++ )
		{
			s +=
				"<tr class='fc-date" + ( i + 1 ) + "'>";
			
			//      And columns are months
			for ( j = 0; j < colCnt; j++ )
			{
				day_nb++;
				
				s +=
					"<td class='fc- " + contentClass + " fc-month" + ( j + 1 ) + " fc-day" + day_nb + "'>" +
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
		bodyFirstCells = bodyCells.filter(':first-child');
		bodyCellTopInners = bodyRows.eq(0).find('div.fc-day-content div');
		
		markFirstLast(head.add(head.find('tr'))); // marks first+last tr/th's
		markFirstLast(bodyRows); // marks first+last td's
		bodyRows.eq(0).addClass('fc-first'); // fc-last is done in updateCells
		
		//      Bind
		dayBind( bodyCells );
		
		daySegmentContainer =
			$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
				.appendTo(element);
	}
	
	
    
    /**
     *  YearView > updateCells
     */
	function updateCells( firstTime )
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
				cell = $(_cell);
				
				//      debug
				//console.log( "cell " + i );
				//console.log( cell );
				
				//     In YearView, each col is a month
				//      @todo - optionally allow to start with another month
				date = new Date( t.visStart.getFullYear(), i );
				
				cell.html(formatDate(date, colFormat));
				setDayID(cell, date);
			});
		}
		
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
                if ( date.getMonth() == month ) {
                    cell.removeClass('fc-other-month');
                }else{
                    cell.addClass('fc-other-month');
                }
                if ( +date == +today ) {
                    cell.addClass(tm + '-state-highlight fc-today');
                }else{
                    cell.removeClass(tm + '-state-highlight fc-today');
                }
                
                cell.find( 'div.fc-day-number' ).text( date.getDate());
                
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
		var nb_days = daysInMonth( current_col + 1, t.visStart.getFullYear());
		
		//      Not a valid cell (e.g. rows > 28 or 29 in february)
		if ( current_row >= nb_days )
            return false;
        else
            return new Date( t.visStart.getFullYear(), current_col, current_row + 1 );
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
			var index = parseInt( this.className.match( /fc\-day(\d+)/ )[ 1 ]);
			var date = indexDate( index );
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
	
	function dayBind(days) {
		days.click(dayClick)
			.mousedown(daySelectionMousedown);
	}
	
	function dayClick(ev) {
		if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
			var index = parseInt(this.className.match(/fc\-day(\d+)/)[1]); // TODO: maybe use .data
			var date = indexDate(index);
			trigger('dayClick', this, date, true, ev);
		}
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
			addDays(rowStart, 7);
			addDays(rowEnd, 7);
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
			cols[i] = p;
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

}
