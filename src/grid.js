
/* Grid-based Views: month, basicWeek, basicDay
-----------------------------------------------------------------------------*/

setDefaults({
	weekMode: 'fixed'
});

views.month = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addMonths(date, delta);
				date.setDate(1);
			}
			// start/end
			var start = this.start = cloneDate(date, true);
			start.setDate(1);
			this.end = addMonths(cloneDate(start), 1);
			// visStart/visEnd
			var visStart = this.visStart = cloneDate(start),
				visEnd = this.visEnd = cloneDate(this.end),
				nwe = options.weekends ? 0 : 1;
			if (nwe) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			addDays(visStart, -((visStart.getDay() - Math.max(options.firstDay, nwe) + 7) % 7));
			addDays(visEnd, (7 - visEnd.getDay() + Math.max(options.firstDay, nwe)) % 7);
			// row count
			var rowCnt = Math.round((visEnd - visStart) / (DAY_MS * 7));
			if (options.weekMode == 'fixed') {
				addDays(visEnd, (6 - rowCnt) * 7);
				rowCnt = 6;
			}
			// title
			this.title = formatDate(
				start,
				this.option('titleFormat'),
				options
			);
			// render
			this.renderGrid(
				rowCnt, options.weekends ? 7 : 5,
				this.option('columnFormat'),
				true,
				width, height,
				fetchEvents
			);
		}
	});
}

views.basicWeek = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addDays(date, delta * 7);
			}
			var visStart = this.visStart = cloneDate(
					this.start = addDays(cloneDate(date), -((date.getDay() - options.firstDay + 7) % 7))
				),
				visEnd = this.visEnd = cloneDate(
					this.end = addDays(cloneDate(visStart), 7)
				);
			if (!options.weekends) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			this.title = formatDates(
				visStart,
				addDays(cloneDate(visEnd), -1),
				this.option('titleFormat'),
				options
			);
			this.renderGrid(
				1, options.weekends ? 7 : 5,
				this.option('columnFormat'),
				false,
				width, height,
				fetchEvents
			);
		}
	});
};

views.basicDay = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, width, height, fetchEvents) {
			if (delta) {
				addDays(date, delta);
				if (!options.weekends) {
					skipWeekend(date, delta < 0 ? -1 : 1);
				}
			}
			this.title = formatDate(date, this.option('titleFormat'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderGrid(
				1, 1,
				this.option('columnFormat'),
				false,
				width, height,
				fetchEvents
			);
		}
	});
}


// rendering bugs

var tdHeightBug, rtlLeftDiff;


function Grid(element, options, methods) {
	
	var tm, firstDay,
		nwe,            // no weekends (int)
		rtl, dis, dit,  // day index sign / translate
		viewWidth, viewHeight,
		rowCnt, colCnt,
		colWidth,
		thead, tbody,
		cachedEvents=[],
		segments=[],
		segmentContainer,
		dayContentElements=[],
		dayContentLefts=[],
		dayContentRights=[], // ...
		
	// initialize superclass
	view = $.extend(this, viewMethods, methods, {
		renderGrid: renderGrid,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		updateSize: updateSize,
		defaultEventEnd: function(event) { // calculates an end if event doesnt have one, mostly for resizing
			return cloneDate(event.start);
		}
	});
	view.init(element, options);
	
	
	
	/* Grid Rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-grid').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}

	function renderGrid(r, c, colFormat, showNumbers, width, height, fetchEvents) {
		rowCnt = r;
		colCnt = c;
		
		// update option-derived variables
		tm = options.theme ? 'ui' : 'fc';
		nwe = options.weekends ? 0 : 1;
		firstDay = options.firstDay;
		if (rtl = options.isRTL) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		
		var month = view.start.getMonth(),
			today = clearTime(new Date()),
			s, i, j, d = cloneDate(view.visStart);
		
		if (!tbody) { // first time, build all cells from scratch
		
			var table = $("<table/>").appendTo(element);
			
			s = "<thead><tr>";
			for (i=0; i<colCnt; i++) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					(i==dit ? ' fc-leftmost' : '') +
					"'>" + formatDate(d, colFormat, options) + "</th>";
				addDays(d, 1);
				if (nwe) {
					skipWeekend(d);
				}
			}
			thead = $(s + "</tr></thead>").appendTo(table);
			
			s = "<tbody>";
			d = cloneDate(view.visStart);
			for (i=0; i<rowCnt; i++) {
				s += "<tr class='fc-week" + i + "'>";
				for (j=0; j<colCnt; j++) {
					s += "<td class='fc-" +
						dayIDs[d.getDay()] + ' ' + // needs to be first
						tm + '-state-default fc-day' + (i*colCnt+j) +
						(j==dit ? ' fc-leftmost' : '') +
						(rowCnt>1 && d.getMonth() != month ? ' fc-other-month' : '') +
						(+d == +today ?
						' fc-today '+tm+'-state-highlight' :
						' fc-not-today') + "'>" +
						(showNumbers ? "<div class='fc-day-number'>" + d.getDate() + "</div>" : '') +
						"<div class='fc-day-content'><div>&nbsp;</div></div></td>";
					addDays(d, 1);
					if (nwe) {
						skipWeekend(d);
					}
				}
				s += "</tr>";
			}
			tbody = $(s + "</tbody>").appendTo(table);
			tbody.find('td').click(dayClick);
			
			segmentContainer = $("<div/>").appendTo(element);
		
		}else{ // NOT first time, reuse as many cells as possible
		
			clearEvents();
		
			var prevRowCnt = tbody.find('tr').length;
			if (rowCnt < prevRowCnt) {
				tbody.find('tr:gt(' + (rowCnt-1) + ')').remove(); // remove extra rows
			}
			else if (rowCnt > prevRowCnt) { // needs to create new rows...
				s = '';
				for (i=prevRowCnt; i<rowCnt; i++) {
					s += "<tr class='fc-week" + i + "'>";
					for (j=0; j<colCnt; j++) {
						s += "<td class='fc-" +
							dayIDs[d.getDay()] + ' ' + // needs to be first
							tm + '-state-default fc-new fc-day' + (i*colCnt+j) +
							(j==dit ? ' fc-leftmost' : '') + "'>" +
							(showNumbers ? "<div class='fc-day-number'></div>" : '') +
							"<div class='fc-day-content'><div>&nbsp;</div></div>" +
							"</td>";
						addDays(d, 1);
						if (nwe) {
							skipWeekend(d);
						}
					}
					s += "</tr>";
				}
				tbody.append(s);
			}
			tbody.find('td.fc-new').removeClass('fc-new').click(dayClick);
			
			// re-label and re-class existing cells
			d = cloneDate(view.visStart);
			tbody.find('td').each(function() {
				var td = $(this);
				if (rowCnt > 1) {
					if (d.getMonth() == month) {
						td.removeClass('fc-other-month');
					}else{
						td.addClass('fc-other-month');
					}
				}
				if (+d == +today) {
					td.removeClass('fc-not-today')
						.addClass('fc-today')
						.addClass(tm + '-state-highlight');
				}else{
					td.addClass('fc-not-today')
						.removeClass('fc-today')
						.removeClass(tm + '-state-highlight');
				}
				td.find('div.fc-day-number').text(d.getDate());
				addDays(d, 1);
				if (nwe) {
					skipWeekend(d);
				}
			});
			
			if (rowCnt == 1) { // more changes likely (week or day view)
			
				// redo column header text and class
				d = cloneDate(view.visStart);
				thead.find('th').each(function() {
					$(this).text(formatDate(d, colFormat, options));
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
					if (nwe) {
						skipWeekend(d);
					}
				});
				
				// redo cell day-of-weeks
				d = cloneDate(view.visStart);
				tbody.find('td').each(function() {
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
					if (nwe) {
						skipWeekend(d);
					}
				});
				
			}
		
		}
		
		updateSize(width, height);
		fetchEvents(renderEvents);
	
	};
	
	
	function dayClick(ev) {
		var n = parseInt(this.className.match(/fc\-day(\d+)/)[1]),
			date = addDays(
				cloneDate(view.visStart),
				Math.floor(n/colCnt) * 7 + n % colCnt
			);
		view.trigger('dayClick', this, date, true, ev);
	}
	
	
	function updateSize(width, height) { // does not render/position the events
		viewWidth = width;
		viewHeight = height;
		dayContentLefts = [];
		dayContentRights = [];
		
		var leftTDs = tbody.find('tr td:first-child'),
			tbodyHeight = viewHeight - thead.height(),
			rowHeight1, rowHeight2;
		
		if (options.weekMode == 'variable') {
			rowHeight1 = rowHeight2 = Math.floor(tbodyHeight / (rowCnt==1 ? 2 : 6));
		}else{
			rowHeight1 = Math.floor(tbodyHeight / rowCnt);
			rowHeight2 = tbodyHeight - rowHeight1*(rowCnt-1);
		}
		
		reportTBody(tbody);
		
		if (tdHeightBug == undefined) {
			// bug in firefox where cell height includes padding
			var tr = tbody.find('tr:first'),
				td = tr.find('td:first');
			td.height(rowHeight1);
			tdHeightBug = rowHeight1 != td.height();
		}
		
		if (tdHeightBug) {
			leftTDs.slice(0, -1).height(rowHeight1);
			leftTDs.slice(-1).height(rowHeight2);
		}else{
			setOuterHeight(leftTDs.slice(0, -1), rowHeight1);
			setOuterHeight(leftTDs.slice(-1), rowHeight2);
		}
		
		setOuterWidth(
			thead.find('th').slice(0, -1),
			colWidth = Math.floor(viewWidth / colCnt)
		);
		
	}



	/* cell/cell-content positioning calculating/caching
	-----------------------------------------------------------------------------*/
	
	
	
	function dayContentElement(dayOfWeek) {
		if (dayContentElements[dayOfWeek] == undefined) {
			dayContentElements[dayOfWeek] = tbody.find('td:eq(' + ((dayOfWeek - Math.max(firstDay,nwe)+colCnt) % colCnt) + ') div div');
		}
		return dayContentElements[dayOfWeek];
	}
	
	
	function dayContentLeft(dayOfWeek) {
		if (dayContentLefts[dayOfWeek] == undefined) {
			dayContentLefts[dayOfWeek] = dayContentElement(dayOfWeek).position().left;
		}
		return dayContentLefts[dayOfWeek];
	}
	
	
	function dayContentRight(dayOfWeek) {
		if (dayContentRights[dayOfWeek] == undefined) {
			dayContentRights[dayOfWeek] = dayContentLeft(dayOfWeek) + dayContentElement(dayOfWeek).width();
		}
		return dayContentRights[dayOfWeek];
	}

	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	
	function renderEvents(events) {
		view.reportEvents(cachedEvents = events);
		renderSegs(segments = compileSegs(events));
	}
	
	
	function rerenderEvents() {
		clearEvents();
		renderSegs(segments = compileSegs(cachedEvents));
	}
	
	
	function clearEvents() {
		view._clearEvents(); // only clears the hashes
		segmentContainer.empty();
	}
	
	
	function compileSegs(events) {
		var d1 = cloneDate(view.visStart),
			d2 = addDays(cloneDate(d1), colCnt),
			rows = [],
			i=0;
		for (; i<rowCnt; i++) {
			rows.push(stackSegs(view.sliceSegs(events, $.map(events, visEventEnd), d1, d2)));
			addDays(d1, 7);
			addDays(d2, 7);
		}
		return rows;
	}
	
	
	
	function renderSegs(segRows) {
		//renderSegs2(segRows);
		//return;
		var html='',
			i, len = segRows.length, levels,
			tr, td,
			innerDiv,
			top,
			rowContentHeight,
			j, segs,
			levelHeight,
			k, seg,
			event,
			className,
			left, right,
			eventElement,
			triggerRes,
			l=0,
			_eventElements,
			eventLefts=[], eventRights=[],
			eventHSides=[],
			eventOuterHeights=[];
		for (i=0; i<len; i++) {
			levels = segRows[i];
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					event = seg.event;
					className = 'fc-event fc-event-hori ';
					if (rtl) {
						if (seg.isStart) {
							className += 'fc-corner-right ';
						}
						if (seg.isEnd) {
							className += 'fc-corner-left ';
						}
						left = seg.isEnd ? 0 : dayContentLeft(seg.end.getDay()-1);
						right = seg.isStart ? viewWidth : dayContentRight(seg.start.getDay());
					}else{
						if (seg.isStart) {
							className += 'fc-corner-left ';
						}
						if (seg.isEnd) {
							className += 'fc-corner-right ';
						}
						left = seg.isStart ? dayContentLeft(seg.start.getDay()) : 0;
						right = seg.isEnd ? dayContentRight(seg.end.getDay()-1) : viewWidth;
					}
					eventLefts[l] = left;
					eventRights[l] = right;
					html +=
						"<div class='" + className + event.className.join(' ') + "' style='position:absolute;z-index:8;left:"+left+"px'>" +
							"<a" + (event.url ? " href='" + htmlEscape(event.url) + "'" : '') + ">" +
								(!event.allDay && seg.isStart ?
									"<span class='fc-event-time'>" +
										htmlEscape(formatDates(event.start, event.end, view.option('timeFormat'), options)) +
									"</span>"
								:'') +
								"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
							"</a>" +
						"</div>";
					l++;
				}
			}
		}
		segmentContainer.html(html);
		_eventElements = segmentContainer[0].childNodes;
		l = 0;
		for (i=0; i<len; i++) {
			levels = segRows[i];
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					event = seg.event;
					eventElement = $(_eventElements[l]);
					triggerRes = view.trigger('eventRender', event, event, eventElement);
					if (triggerRes !== false) {
						if (triggerRes && typeof triggerRes != 'boolean') {
							eventElement = $(triggerRes).appendTo(segmentContainer);
						}
						eventOuterHeights[l] = eventElement.outerHeight(true);
						eventHSides[l] = hsides(eventElement, true);
						seg.element = eventElement;
						bootstrapEventHandlers(event, seg, eventElement);
						view.reportEventElement(event, eventElement);
					}
					l++;
				}
			}
		}
		l = 0;
		for (i=0; i<len; i++) {
			levels = segRows[i];
			tr = tbody.find('tr:eq('+i+')');
			td = tr.find('td:first');
			innerDiv = td.find('div.fc-day-content div').css('position', 'relative');
			top = safePosition(innerDiv, td, tr, tbody).top;
			rowContentHeight = 0;
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				levelHeight = 0;
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					if (eventElement = seg.element) {
						eventElement.css('top', top);
						if (rtl && rtlLeftDiff == undefined) {
							// bug in IE6 where offsets are miscalculated with direction:rtl
							rtlLeftDiff = eventLefts[l] - eventElement.position().left;
							if (rtlLeftDiff) {
								eventElement.css('left', eventLefts[l] + rtlLeftDiff);
							}
						}
						eventElement.width(eventRights[l] - eventLefts[l] - eventHSides[l]);
						view.trigger('eventAfterRender', event, event, eventElement);
						levelHeight = Math.max(levelHeight, eventOuterHeights[l]);
					}
					l++;
				}
				rowContentHeight += levelHeight;
				top += levelHeight;
			}
			innerDiv.height(rowContentHeight);
		}
	}
	
	
	/*
	// the original function
	function renderSegs2(segRows) {
		var i, len = segRows.length, levels,
			tr, td,
			innerDiv,
			top,
			rowContentHeight,
			j, segs,
			levelHeight,
			k, seg,
			event,
			className,
			left, right,
			eventElement, eventAnchor,
			triggerRes;
		for (i=0; i<len; i++) {
			levels = segRows[i];
			tr = tbody.find('tr:eq('+i+')');
			td = tr.find('td:first');
			innerDiv = td.find('div.fc-day-content div').css('position', 'relative');
			top = safePosition(innerDiv, td, tr, tbody).top;
			rowContentHeight = 0;
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				levelHeight = 0;
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					event = seg.event;
					className = 'fc-event fc-event-hori ';
					if (rtl) {
						left = seg.isEnd ? 0 : dayContentLeft(seg.end.getDay()-1);
						right = seg.isStart ? viewWidth : dayContentRight(seg.start.getDay());
						if (seg.isStart) {
							className += 'fc-corner-right ';
						}
						if (seg.isEnd) {
							className += 'fc-corner-left ';
						}
					}else{
						left = seg.isStart ? dayContentLeft(seg.start.getDay()) : 0;
						right = seg.isEnd ? dayContentRight(seg.end.getDay()-1) : viewWidth;
						if (seg.isStart) {
							className += 'fc-corner-left ';
						}
						if (seg.isEnd) {
							className += 'fc-corner-right ';
						}
					}
					eventElement = $("<div class='" + className + event.className.join(' ') + "'/>")
						.append(eventAnchor = $("<a/>")
							.append(event.allDay || !seg.isStart ? null :
								$("<span class='fc-event-time'/>")
									.html(formatDates(event.start, event.end, view.option('timeFormat'), options)))
							.append($("<span class='fc-event-title'/>")
								.text(event.title)));
					if (event.url) {
						eventAnchor.attr('href', event.url);
					}
					triggerRes = view.trigger('eventRender', event, event, eventElement);
					if (triggerRes !== false) {
						if (triggerRes && typeof triggerRes != 'boolean') {
							eventElement = $(triggerRes);
						}
						eventElement
							.css({
								position: 'absolute',
								top: top,
								left: left + (rtlLeftDiff||0),
								zIndex: 8
							})
							.appendTo(element);
						setOuterWidth(eventElement, right-left, true);
						if (rtl && rtlLeftDiff == undefined) {
							// bug in IE6 where offsets are miscalculated with direction:rtl
							rtlLeftDiff = left - eventElement.position().left;
							if (rtlLeftDiff) {
								eventElement.css('left', left + rtlLeftDiff);
							}
						}
						view.eventElementHandlers(event, eventElement);
						if (event.editable || event.editable == undefined && options.editable) {
							draggableEvent(event, eventElement);
							if (seg.isEnd) {
								view.resizableDayEvent(event, eventElement, colWidth);
							}
						}
						view.reportEventElement(event, eventElement);
						view.trigger('eventAfterRender', event, event, eventElement);
						levelHeight = Math.max(levelHeight, eventElement.outerHeight(true));
					}
				}
				rowContentHeight += levelHeight;
				top += levelHeight;
			}
			innerDiv.height(rowContentHeight);
		}
	}
	*/
	
	
	
	function visEventEnd(event) { // returns exclusive 'visible' end, for rendering
		if (event.end) {
			var end = cloneDate(event.end);
			return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
		}else{
			return addDays(cloneDate(event.start), 1);
		}
	}
	
	
	
	function bootstrapEventHandlers(event, seg, eventElement) {
		var attached = false;
		eventElement.mouseover(function(ev) {
			if (!attached) {
				view.eventElementHandlers(event, eventElement);
				if (event.editable || event.editable == undefined && options.editable) {
					draggableEvent(event, eventElement);
					if (seg.isEnd) {
						view.resizableDayEvent(event, eventElement, colWidth);
					}
				}
				attached = true;
				view.trigger('eventMouseover', this, event, ev);
			}
		});
	}
	
	
	
	/* Event Dragging
	-----------------------------------------------------------------------------*/
	
	
	function draggableEvent(event, eventElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var matrix;
			eventElement.draggable({
				zIndex: 9,
				delay: 50,
				opacity: view.option('dragOpacity'),
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell || !cell.rowDelta && !cell.colDelta);
						if (cell) {
							view.showOverlay(cell);
						}else{
							view.hideOverlay();
						}
					});
					tbody.find('tr').each(function() {
						matrix.row(this);
					});
					var tds = tbody.find('tr:first td');
					if (rtl) {
						tds = $(tds.get().reverse());
					}
					tds.each(function() {
						matrix.col(this);
					});
					matrix.mouse(ev.pageX, ev.pageY);
				},
				drag: function(ev) {
					matrix.mouse(ev.pageX, ev.pageY);
				},
				stop: function(ev, ui) {
					view.hideOverlay();
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					var cell = matrix.cell;
					if (!cell || !cell.rowDelta && !cell.colDelta) {
						if ($.browser.msie) {
							eventElement.css('filter', ''); // clear IE opacity side-effects
						}
						view.showEvents(event, eventElement);
					}else{
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						view.eventDrop(this, event, cell.rowDelta*7+cell.colDelta*dis, 0, event.allDay, ev, ui);
					}
				}
			});
		}
	}
	
	
	// event resizing w/ 'view' methods...

};

