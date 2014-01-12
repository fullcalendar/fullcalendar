
setDefaults({
	weekMode: 'fixed',
	titleFormat: {
		resourceMonth: 'MMMM yyyy',
		resourceWeek: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
		resourceNextWeeks: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
		resourceDay: 'dddd, MMM d, yyyy'
	},
	columnFormat: {
		resourceDay: 'H:mm',
		resourceMonth: 'M/d',
		resourceWeek: 'ddd M/d',
		resourceNextWeeks: 'ddd M/d'
	},
	buttonText: {
		largePrev: "<span class='fc-text-arrow'>&laquo;</span>",
		largeNext: "<span class='fc-text-arrow'>&raquo;</span>",
		resourceDay: 'resource day',
		resourceWeek: 'resource week',
		resourceNextWeeks: 'resource next weeks',
		resourceMonth: 'resource month'
	},
	// resource ajax. Do we refetch resources on every view change?
	refetchResources: false,
	
	// ResourceNextWeeks week count
	numberOfWeeks: 4,
	
	// resource views default paginate
	paginateResourceWeek: 7,
	paginateResourceNextWeeks: 7,
	paginateResourceMonth: 'month'
});


function ResourceView(element, calendar, viewName) {
	var t = this;
	
	
	// exports
	t.renderBasic = renderBasic;
	t.setHeight = setHeight;
	t.setWidth = setWidth;
	t.renderDayOverlay = renderDayOverlay;
	t.defaultSelectionEnd = defaultSelectionEnd;
	t.renderSelection = renderSelection;
	t.clearSelection = clearSelection;
	t.reportDayClick = reportDayClick; // for selection (kinda hacky)
	t.dragStart = dragStart;
	t.dragStop = dragStop;
	t.defaultEventEnd = defaultEventEnd;
	t.getHoverListener = function() { return hoverListener };
	t.colContentLeft = colContentLeft;
	t.colContentRight = colContentRight;
	t.dateCol = dateCol;
	t.dateCell = dateCell;
	t.dayOfWeekCol = dayOfWeekCol;
	t.timeOfDayCol = timeOfDayCol;
	t.cellDate = cellDate;
	t.cellIsAllDay = function() { return true };
	t.allDayRow = allDayRow;
	t.allDayBounds = allDayBounds;
	t.getRowCnt = function() { return rowCnt };
	t.getColCnt = function() { return colCnt };
	t.getSnapWidth = function() { return snapWidth };
	t.getSnapMinutes = function() { return snapMinutes };
	t.getResources = calendar.fetchResources(!calendar.options['refetchResources']);
	t.getColWidth = function() { return colWidth };
	t.getViewName = function() { return viewName };
	t.getDaySegmentContainer = function() { return daySegmentContainer };
	t.datePositionLeft = datePositionLeft;
	t.isResourceEditable = isResourceEditable;

	
	// imports
	View.call(t, element, calendar, viewName);
	OverlayManager.call(t);
	SelectionManager.call(t);
	ResourceEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	var clearEvents = t.clearEvents;
	var renderOverlay = t.renderOverlay;
	var clearOverlays = t.clearOverlays;
	var formatDate = calendar.formatDate;
	var getResources = t.getResources;
	
	// locals
	var table;
	var head;
	var headCells;
	var body;
	var bodyRows;
	var bodyCells;
	var bodyFirstCells;
	var bodyCellTopInners;
	var daySegmentContainer;
	
	var viewWidth;
	var viewHeight;
	var colWidth;
	
	var rowCnt, colCnt, getResources;
	var coordinateGrid;
	var hoverListener;
	var colPositions;
	var colContentPositions;
	
	var rtl, dis, dit;
	var firstDay;
	var nwe;
	var tm;
	var colFormat;
	
	var snapMinutes;
	var snapRatio; // ratio of number of "selection" slots to normal slots. (ex: 1, 2, 4)
	var snapWidth; // holds the pixel width of a snap
	
	/* Rendering
	------------------------------------------------------------*/
	
	
	disableTextSelection(element.addClass('fc-grid'));
	
	
	function renderBasic(_rowCnt, _colCnt, _showNumbers) {
		rowCnt = _rowCnt;
		colCnt = _colCnt;
		showNumbers = _showNumbers;
		updateOptions();

		if (!body) {
			buildEventContainer();
		}

		buildTable();
	}
	
	
	function updateOptions() {
		tm = opt('theme') ? 'ui' : 'fc';
		colFormat = opt('columnFormat');

		// week # options. (TODO: bad, logic also in other views)
		showWeekNumbers = opt('weekNumbers');
		weekNumberTitle = opt('weekNumberTitle');
		if (opt('weekNumberCalculation') != 'iso') {
			weekNumberFormat = "w";
		}
		else {
			weekNumberFormat = "W";
		}
		
		if (rtl) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		firstDay = opt('firstDay');
		nwe = opt('weekends') ? 0 : 1;

		snapMinutes = opt('snapMinutes') || opt('slotMinutes');
	}
	
	
	function buildEventContainer() {
		daySegmentContainer =
			$("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>")
				.appendTo(element);
	}
	
	
	function buildTable() {
		var html = buildTableHTML();
		var date;
		var resources = t.getResources;

		if (table) {
			table.remove();
		}
		table = $(html).appendTo(element);

		head = table.find('thead');
		headCells = head.find('th:not(th.fc-resourceName)');
		body = table.find('tbody');
		bodyRows = body.find('tr');
		bodyCells = body.find('td:not(td.fc-resourceName)');
		bodyFirstCells = bodyRows.find('td:first-child:not("fc-resourceName")');
		
		// trigger resourceRender callback now when the skeleton is ready
		body.find('td.fc-resourceName').each(function(i, resourceElement) {
			trigger('resourceRender', resources[i], resourceElement, viewName);
		});
		
		firstRowCellInners = bodyRows.eq(0).find('.fc-day > div');
		firstRowCellContentInners = bodyRows.eq(0).find('.fc-day-content > div');

		// marks first+last tr/th's
		head.add(head.find('tr')).children()
			.removeClass('fc-first fc-last')
			.filter(':not(".fc-resourceName"):first')
				.addClass('fc-first')
			.end()
			.filter(':last-child')
			.addClass('fc-last');
		
		// marks first+last td's
		bodyRows.children()
			.removeClass('fc-first fc-last')
			.filter(':not(".fc-resourceName"):first')
				.addClass('fc-first')
			.end()
			.filter(':last-child')
			.addClass('fc-last');
			
		bodyRows.eq(0).addClass('fc-first');
		bodyRows.filter(':last').addClass('fc-last');

		bodyCells.each(function(i, _cell) {
			date = indexDate(i);
			trigger('dayRender', t, date, $(_cell));
		});

		dayBind(bodyCells);
	}
	
	
	/* HTML Building
	-----------------------------------------------------------*/


	function buildTableHTML() {
		var html =
			"<table class='fc-border-separate' style='width:100%' cellspacing='0'>" +
			buildHeadHTML() +
			buildBodyHTML() +
			"</table>";

		return html;
	}


	function buildHeadHTML() {
		var headerClass = tm + "-widget-header";
		var html = '';
		var col;
		var date;
		var weekTitle;
		
		if (rtl) {
			weekTitle = formatDate(indexDate(0), weekNumberFormat) + weekNumberTitle;
		} else {
			weekTitle = weekNumberTitle + formatDate(indexDate(0), weekNumberFormat);
		}
		
		html +=
			"<thead>" +
			"<tr><th class='fc-resourceName'>" +
			(showWeekNumbers && (viewName === 'resourceDay' || viewName === 'resourceWeek') ? weekTitle : "&nbsp;") + 
			"</th>";
		for (col=0; col<colCnt; col++) {
			date = indexDate(col);
			html +=
				"<th class='" + headerClass + " fc-id " + date.getTime() + 
					(date.getDay() === 0 || date.getDay() === 6 ? 'fc-weekend' : '') +
				"'>" +
				(showWeekNumbers && (viewName === 'resourceNextWeeks' || viewName === 'resourceMonth') && 
					date.getDay() === 1 ? "#" + formatDate(date, weekNumberFormat) + "<br>" : "") + 
				htmlEscape(formatDate(date, colFormat)) +
				"</th>";
		}

		html += "</tr></thead>";

		return html;
	}


	function buildBodyHTML() {
		var contentClass = tm + "-widget-content";
		var html = '';
		var row;
		var col;
		var date;
		var resources = t.getResources;
		var id;

		html += "<tbody>";

		for (row=0; row<rowCnt; row++) {
			id = resources[row]['id'];
			resourceName = resources[row]['name'];
			
			html += "<tr class='fc-resourcerow-" + id + "'>" + 
			"<td class='fc-resourceName'>" + resourceName + "</td>";

			for (col=0; col<colCnt; col++) {
				date = indexDate(col);
				html += buildCellHTML(date);
			}

			html += "</tr>";
		}

		html += "</tbody>";

		return html;
	}


	function buildCellHTML(date) {
		var contentClass = tm + "-widget-content";
		var month = t.start.getMonth();
		var today = clearTime(new Date());
		var html = '';
		var classNames = [
			'fc-day fc-id' + date.getTime(),
			contentClass
		];

		if (date.getMonth() != month) {
			classNames.push('fc-other-month');
		}
		if (+date == +today) {
			classNames.push(
				'fc-today',
				tm + '-state-highlight'
			);
		}
		else if (date < today) {
			classNames.push('fc-past');
		}
		else {
			classNames.push('fc-future');
		}

		if (date.getDay() == 0 || date.getDay() == 6) {
			classNames.push('fc-weekend-column');	
		}
		
		html +=
			"<td" +
			" class='" + classNames.join(' ') + "'" +
			" data-date='" + formatDate(date, 'yyyy-MM-dd') + "'" +
			">" +
			"<div>";

		html +=
			"<div class='fc-day-content'>" +
			"<div style='position:relative'>&nbsp;</div>" +
			"</div>" +
			"</div>" +
			"</td>";

		return html;
	}
	
	
	/* Dimensions
	-----------------------------------------------------------*/
	
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
		// minus resourceName width
		viewWidth -= $('td.fc-resourceName').width();
		colContentPositions.clear();
		colWidth = Math.floor(viewWidth / colCnt);
		setOuterWidth(headCells, colWidth);
		
		snapRatio = 1;
		if(viewName === 'resourceDay') {
			snapRatio = opt('slotMinutes') / snapMinutes;
		}
		
		snapWidth = colWidth / snapRatio;
	}
	
	
	
	/* Day clicking and binding
	-----------------------------------------------------------*/
	
	
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
	
	
	
	/* Semi-transparent Overlay Helpers
	------------------------------------------------------*/
	
	
	function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid, overlayRow) { // overlayEnd is exclusive
		if (refreshCoordinateGrid) {
			coordinateGrid.build();
		}
		var rowStart = cloneDate(t.visStart);
		var rowEnd = addDays(cloneDate(rowStart), colCnt);

		if (viewName == 'resourceDay') {
			rowEnd = addMinutes(cloneDate(rowStart), opt('slotMinutes')*colCnt);
		}
		else if (!opt('weekends')) {
			rowEnd = cloneDate(t.visEnd);
		}

		var stretchStart = new Date(Math.max(rowStart, overlayStart));
		var stretchEnd = new Date(Math.min(rowEnd, overlayEnd));

		if (stretchStart < stretchEnd) {
			var colStart, colEnd;
			if (viewName == 'resourceDay') {
				colStart = (stretchStart-rowStart)/1000/60/opt('slotMinutes');
				colEnd = (stretchEnd-rowStart)/1000/60/opt('slotMinutes');
			}
			else {
				if (rtl) {
					colStart = dayDiff(stretchEnd, rowStart)*dis+dit+1;
					colEnd = dayDiff(stretchStart, rowStart)*dis+dit+1;
				}else{
					colStart = dayDiff(stretchStart, rowStart);
					colEnd = dayDiff(stretchEnd, rowStart);
				}
				
				if(!opt('weekends')) {
					// Drop weekends off
					var weekendSumColStart=0, weekendTestDate;				
					for(var i=0; i<=colStart; i++) {
						weekendTestDate = addDays(cloneDate(t.visStart), i);
						
						if(weekendTestDate.getDay() == 0 || weekendTestDate.getDay() == 6) {
							weekendSumColStart++;
						}
					}
					colStart -= weekendSumColStart;
					
					var weekendSumColEnd=0
					for(i=0; i<=colEnd-1; i++) {
						weekendTestDate = addDays(cloneDate(t.visStart), i);
						
						if(weekendTestDate.getDay() == 0 || weekendTestDate.getDay() == 6) {
							weekendSumColEnd++;
						}
					}
					colEnd -= weekendSumColEnd;
				}
			}
			
			dayBind(
				renderCellOverlay(overlayRow, colStart, overlayRow, colEnd-1)
			);
		}
	}
	
	
	function renderCellOverlay(row0, col0, row1, col1) { // row1,col1 is inclusive
		var rect = coordinateGrid.rect(row0, Math.round(col0), row1, Math.round(col1), element);
		return renderOverlay(rect, element);
	}
	
	
	
	/* Selection
	-----------------------------------------------------------------------*/
	
	
	function defaultSelectionEnd(startDate, allDay) {
		return cloneDate(startDate);
	}
	
	
	function renderSelection(startDate, endDate, allDay, overlayRow) {
		if (viewName == 'resourceDay') {
			renderDayOverlay(startDate, addMinutes(cloneDate(endDate), opt('slotMinutes')), true, overlayRow); // rebuild every time???
		}
		else {
			renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true, overlayRow); // rebuild every time???
		}
	}
	
	
	function clearSelection() {
		clearOverlays();
	}
	
	
	function reportDayClick(date, allDay, ev, resource) {
		var col = dateCol(date);
		var _element = bodyCells[col];
		trigger('dayClick', _element, date, allDay, ev, resource);
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
			var resources = t.getResources, newResource = resources[cell.row];
			var d = cellDate(cell);
			trigger('drop', _dragElement, d, true, ev, ui, newResource);
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
	
	colPositions = new HorizontalPositionCache(function(col) {
		return firstRowCellInners.eq(col);
	});
	
	colContentPositions = new HorizontalPositionCache(function(col) {
		return firstRowCellContentInners.eq(col);
	});
	
	function colContentLeft(col) {
		return colContentPositions.left(col);
	}
	
	
	function colContentRight(col) {
		return colContentPositions.right(col);
	}
	
	function dateCell(date) {
		var col,year,month,day,cmpDate,cmpYear,cmpMonth,cmpDay, weekends = opt('weekends');
		if (viewName == 'resourceDay') {
			col = timeOfDayCol(date);
		}
		else {
			col = Math.round((cloneDate(date, true)-t.visStart)/1000/60/60/24); //  TODO: handle weekends: false
		}
		return { col: col };
	}

	function colLeft(col) {
		return colPositions.left(col);
	}

	function colRight(col) {
		return colPositions.right(col);
	}
	
	// Left of the date (x pos)
	function datePositionLeft(eventDate) {
		var positionFunc = (viewName === 'resourceDay') ? _timePositionLeft : _dayPositionLeft;
		return positionFunc(eventDate);
	}
	
	function _timePositionLeft(eventDate) {
		var date = roundToClosestSnapMinute(cloneDate(eventDate));
		
		// get left offset
		var bounds = allDayBounds();
		var minLeft = bounds.left;
		var firstDayMs = t.visStart.getTime();
		var dateMs = date.getTime();
		var snapCnt = (dateMs - firstDayMs) / 1000 / 60 / snapMinutes;
		var left = Math.round(minLeft + snapCnt * snapWidth);

		return left;
	}
	
	
	function _dayPositionLeft(eventDate) {
		var date = clearTime(cloneDate(eventDate)); // set time to midnight
		
		// get left offset
		var bounds = allDayBounds();
		var minLeft = bounds.left;
		var firstDayMs = t.visStart.getTime();
		var dateMs = date.getTime();
		var colCnt = (dateMs - firstDayMs) / 1000 / 60 / 60 / 24;
		var left = Math.round(minLeft + colCnt * snapWidth);

		return left;
	}
	
	
	function dateCol(date) {
		var col;
		if (viewName === 'resourceDay') {
			col = timeOfDayCol(date);
		}
		else {
			col = Math.round((cloneDate(date, true)-t.visStart)/1000/60/60/24); //  TODO: handle weekends: false
		}
		return col;
	}
	
	
	function cellDate(cell) {
		return _cellDate(cell.col);
	}
	
	
	function _cellDate(col) {
		if (viewName == 'resourceDay') {
			return addMinutes(cloneDate(t.visStart), col*opt('slotMinutes'));
		}
		else {	
			if (!opt('weekends')) {
				// no weekends
				var dateTest, i;

				for (i=0; i <= col; i++) {
					dateTest = addDays(cloneDate(t.visStart), i);
					
					if (dateTest.getDay() == 6 || dateTest.getDay() == 0) {
						// this sunday or saturday
						col++;
					}
				}
			}

			return addDays(cloneDate(t.visStart), col, true);
		}
	}
	
	
	function roundToClosestSnapMinute(date) {
		var rounded = cloneDate(date);
		var hours = rounded.getHours();
		var minutes = rounded.getMinutes();
		var slot, diff, minDiff, closestMinute;
		
		// round minutes to closest snapminute
		for ( var i = 0 ; i <= 60/snapRatio; i++) {
			slot = i*snapMinutes;

			diff = Math.abs(slot-minutes);
			
			if (diff <= minDiff || i == 0) {
				minDiff = diff;
				closestMinute = slot;
			}
			
			if(closestMinute == 60) {
				hours++;
				closestMinute = 0;
			}
		}		
		minutes = closestMinute;
		rounded.setMinutes(minutes);
		rounded.setHours(hours);
		return rounded;
	}
	
	function roundToClosestMidnight(date) {
		var rounded = cloneDate(date);
		var hours = rounded.getHours();
		
		if (hours > 11) {
			// round to next midnight
			addDays(rounded, 1, false);
		}
		else {
			// round to today midnight
			addDays(rounded, 0, false);
		}
		
		return rounded;
	}
	
	function indexDate(index) {
		return _cellDate(index%colCnt);
	}
	
	function dayOfWeekCol(dayOfWeek) {
		return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt) * dis + dit;
	}
	
	function timeOfDayCol(datetime) {
		var hours = datetime.getHours();
		var minutes = datetime.getMinutes();
		var slotMinutes = opt('slotMinutes');
		var slot, diff, minDiff, closestMinute;
		
		// round minutes to closest minuteslot
		for ( var i = 0 ; i <= 60/slotMinutes; i++) {
			slot = i*slotMinutes;

			diff = Math.abs(slot-minutes);
			
			if (diff <= minDiff || i == 0) {
				minDiff = diff;
				closestMinute = slot;
			}
			
			if(closestMinute == 60) {
				hours++;
				closestMinute = 0;
			}
		}		
		minutes = closestMinute;

		for ( var i = 0; i < colCnt; i++) {
			if (indexDate(i).getHours() == hours && indexDate(i).getMinutes() == minutes) {
				return i;
			}
		}

		// not in range, return max
		return colCnt;
	}
	
	
	function allDayRow(i) {
		return bodyRows.eq(i);
	}
	
	
	function allDayBounds() {
		return {
			left: $(head).find('th.fc-resourceName').width(),
			right: $(head).width()
		};
	}
	
	function reportSelection(startDate, endDate, allDay, ev, resource) {
		if (typeof resource == 'object' && resource.readonly === true) {
			return false;
		}

		selected = true;
		trigger('select', null, startDate, endDate, allDay, ev, '', resource);
	}
	
	function isResourceEditable(resourceId) {		
		var resources = getResources; // this caches resources, so don't worry about loading times...
		$(resources).each(function(i, resource) {
			if (resource.id == resourceId && resource.readonly) {
				return false;
			} 
		});
		return true;
	}
	
	
	// Some changes from selectionManager daySelectionMousedown. Mainly because resourceDay view and resource readonly setting
	function daySelectionMousedown(ev) {
		var cellDate = t.cellDate;
		var cellIsAllDay = t.cellIsAllDay;
		var hoverListener = t.getHoverListener();
		var unselect = t.unselect;
		var reportDayClick = t.reportDayClick; // this is hacky and sort of weird
		var row;
		var resources = t.getResources || [];
		var resourceRO;
		
		if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
			unselect(ev);
			var _mousedownElement = this;
			var dates;
			hoverListener.start(function(cell, origCell) { // TODO: maybe put cellDate/cellIsAllDay info in cell
				clearSelection();
				if (cell) {
					resourceRO = typeof resources[cell.row] == 'object' ? resources[cell.row].readonly : false;
				}

				if (cell && cellIsAllDay(cell) && resourceRO !== true) {
					dates = [ cellDate(origCell), cellDate(cell) ].sort();
					renderSelection(dates[0], dates[1], (viewName == 'resourceDay' ? false : true), cell.row);
					row = cell.row;
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						reportDayClick(dates[0],(viewName == 'resourceDay' ? false : true), ev, resources[row]);
					}
					reportSelection(dates[0], (viewName == 'resourceDay' ? addMinutes(dates[1], opt('slotMinutes')) : dates[1]), (viewName == 'resourceDay' ? false : true), ev, resources[row]);
				}
			});
		}
	}
}
