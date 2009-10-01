
/* Grid-based Views: month, basicWeek, basicDay
-----------------------------------------------------------------------------*/

setDefaults({
	weekMode: 'fixed'
});

views.month = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addMonths(date, delta);
				date.setDate(1);
			}
			var start = this.start = cloneDate(date, true);
			start.setDate(1);
			this.title = formatDates(
				start,
				addDays(cloneDate(this.end = addMonths(cloneDate(start), 1)), -1),
				strProp(options.titleFormat, 'month'),
				options
			);
			addDays(this.visStart = cloneDate(start), -((start.getDay() - options.firstDay + 7) % 7));
			addDays(this.visEnd = cloneDate(this.end), (7 - this.visEnd.getDay() + options.firstDay) % 7);
			var rowCnt = Math.round((this.visEnd - this.visStart) / (DAY_MS * 7));
			if (options.weekMode == 'fixed') {
				addDays(this.visEnd, (6 - rowCnt) * 7);
				rowCnt = 6;
			}
			this.renderGrid(rowCnt, 7, strProp(options.columnFormat, 'month'), true, fetchEvents);
		}
	});
}

views.basicWeek = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta * 7);
			}
			this.title = formatDates(
				this.start = this.visStart = addDays(cloneDate(date), -((date.getDay() - options.firstDay + 7) % 7)),
				addDays(cloneDate(this.end = this.visEnd = addDays(cloneDate(this.start), 7)), -1),
				strProp(options.titleFormat, 'week'),
				options
			);
			this.renderGrid(1, 7, strProp(options.columnFormat, 'week'), false, fetchEvents);
		}
	});
};

views.basicDay = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta);
			}
			this.title = formatDate(date, strProp(options.titleFormat, 'day'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderGrid(1, 1, strProp(options.columnFormat, 'day'), false, fetchEvents);
		}
	});
}


// rendering bugs

var tdTopBug, trTopBug, tbodyTopBug,
	tdHeightBug,
	rtlLeftDiff;


function Grid(element, options, methods) {
	
	var tm, firstDay,
		rtl, dis, dit,  // day index sign / translate
		rowCnt, colCnt,
		colWidth,
		thead, tbody,
		cachedSegs, //...
		
	// initialize superclass
	view = $.extend(this, viewMethods, methods, {
		renderGrid: renderGrid,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		updateSize: updateSize,
		defaultEventEnd: function(event) { // calculates an end if event doesnt have one, mostly for resizing
			return cloneDate(event.start);
		},
		visEventEnd: function(event) { // returns exclusive 'visible' end, for rendering
			if (event.end) {
				var end = cloneDate(event.end);
				return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
			}else{
				return addDays(cloneDate(event.start), 1);
			}
		}
	});
	view.init(element, options);
	
	
	
	/* Grid Rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-grid').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}

	function renderGrid(r, c, colFormat, showNumbers, fetchEvents) {
		rowCnt = r;
		colCnt = c;
		
		var month = view.start.getMonth(),
			today = clearTime(new Date()),
			s, i, j, d = cloneDate(view.visStart);
		
		// update option-derived variables
		tm = options.theme ? 'ui' : 'fc'; 
		firstDay = options.firstDay;
		if (rtl = options.isRTL) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		
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
				}
				s += "</tr>";
			}
			tbody = $(s + "</tbody>").appendTo(table);
			tbody.find('td').click(dayClick);
		
		}else{ // NOT first time, reuse as many cells as possible
		
			view.clearEvents();
		
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
			});
			
			if (rowCnt == 1) { // more changes likely (week or day view)
			
				// redo column header text and class
				d = cloneDate(view.visStart);
				thead.find('th').each(function() {
					$(this).text(formatDate(d, colFormat, options));
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
				});
				
				// redo cell day-of-weeks
				d = cloneDate(view.visStart);
				tbody.find('td').each(function() {
					this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
					addDays(d, 1);
				});
				
			}
		
		}
		
		updateSize();
		fetchEvents(renderEvents);
	
	};
	
	
	function dayClick() {
		var date = addDays(
			cloneDate(view.visStart),
			parseInt(this.className.match(/fc\-day(\d+)/)[1])
		);
		view.trigger('dayClick', this, date);
	}
	
	
	function updateSize() {
	
		var height = Math.round(element.width() / options.aspectRatio),
			leftTDs = tbody.find('tr td:first-child'),
			tbodyHeight = height - thead.height(),
			rowHeight1, rowHeight2;
		
		if (options.weekMode == 'variable') {
			rowHeight1 = rowHeight2 = Math.floor(tbodyHeight / (rowCnt==1 ? 2 : 6));
		}else{
			rowHeight1 = Math.floor(tbodyHeight / rowCnt);
			rowHeight2 = tbodyHeight - rowHeight1*(rowCnt-1);
		}

		if (tdTopBug == undefined) {
			// nasty bugs in opera 9.25
			// position() returning relative to direct parent
			var tr = tbody.find('tr:first'),
				td = tr.find('td:first'),
				trTop = tr.position().top,
				tdTop = td.position().top;
			tdTopBug = tdTop < 0;
			trTopBug = trTop != tdTop;
			tbodyTopBug = tbody.position().top != trTop;
		}
		
		if (tdHeightBug == undefined) {
			// bug in firefox where cell height includes padding
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
			colWidth = Math.floor(element.width() / colCnt)
		);
		
	}
	
	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	
	function renderEvents(events) {
		view.reportEvents(events);
		renderSegs(cachedSegs = compileSegs(events));
	}
	
	
	function rerenderEvents(skipCompile) {
		view.clearEvents();
		if (skipCompile) {
			renderSegs(cachedSegs);
		}else{
			renderEvents(view.cachedEvents);
		}
	}
	
	
	function compileSegs(events) {
		var d1 = cloneDate(view.visStart);
		var d2 = addDays(cloneDate(d1), colCnt);
		var rows = [];
		for (var i=0; i<rowCnt; i++) {
			rows.push(stackSegs(view.sliceSegs(events, d1, d2)));
			addDays(d1, 7);
			addDays(d2, 7);
		}
		return rows;
	}
	
	
	function renderSegs(segRows) {
		var i, len = segRows.length, levels,
			tr, td,
			innerDiv,
			top,
			weekHeight,
			j, segs,
			levelHeight,
			k, seg,
			event,
			eventClasses,
			startElm, endElm,
			left1, left2,
			eventElement, eventAnchor,
			triggerRes;
		for (i=0; i<len; i++) {
			levels = segRows[i];
			tr = tbody.find('tr:eq('+i+')');
			td = tr.find('td:first');
			innerDiv = td.find('div.fc-day-content div').css('position', 'relative');
			top = innerDiv.position().top;
			if (tdTopBug) {
				top -= td.position().top;
			}
			if (trTopBug) {
				top += tr.position().top;
			}
			if (tbodyTopBug) {
				top += tbody.position().top;
			}
			weekHeight = 0;
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				levelHeight = 0;
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					event = seg.event;
					eventClasses = event.className;
					if (typeof eventClasses == 'object') { // an array
						eventClasses = eventClasses.slice(0);
					}
					else if (typeof eventClasses == 'string') {
						eventClasses = eventClasses.split(' ');
					}
					else {
						eventClasses = [];
					}
					eventClasses.push('fc-event', 'fc-event-hori');
					startElm = seg.isStart ?
						tr.find('td:eq('+((seg.start.getDay()-firstDay+colCnt)%colCnt)+') div.fc-day-content div') :
						tbody;
					endElm = seg.isEnd ?
						tr.find('td:eq('+((seg.end.getDay()-firstDay+colCnt-1)%colCnt)+') div.fc-day-content div') :
						tbody;
					if (rtl) {
						left1 = endElm.position().left;
						left2 = startElm.position().left + startElm.width();
						if (seg.isStart) {
							eventClasses.push('fc-corner-right');
						}
						if (seg.isEnd) {
							eventClasses.push('fc-corner-left');
						}
					}else{
						left1 = startElm.position().left;
						left2 = endElm.position().left + endElm.width();
						if (seg.isStart) {
							eventClasses.push('fc-corner-left');
						}
						if (seg.isEnd) {
							eventClasses.push('fc-corner-right');
						}
					}
					eventElement = $("<div class='" + eventClasses.join(' ') + "'/>")
						.append(eventAnchor = $("<a/>")
							.append(event.allDay || !seg.isStart ? null :
								$("<span class='fc-event-time'/>")
									.html(formatDates(event.start, event.end, options.timeFormat, options)))
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
								left: left1 + (rtlLeftDiff||0),
								zIndex: 2
							})
							.appendTo(element);
						setOuterWidth(eventElement, left2-left1, true);
						if (rtl && rtlLeftDiff == undefined) {
							// bug in IE6 where offsets are miscalculated with direction:rtl
							rtlLeftDiff = left1 - eventElement.position().left;
							if (rtlLeftDiff) {
								eventElement.css('left', left1 + rtlLeftDiff);
							}
						}
						eventElementHandlers(event, eventElement);
						if (event.editable || event.editable == undefined && options.editable) {
							draggableEvent(event, eventElement);
							if (seg.isEnd) {
								resizableEvent(event, eventElement);
							}
						}
						view.reportEventElement(event, eventElement);
						levelHeight = Math.max(levelHeight, eventElement.outerHeight(true));
					}
				}
				weekHeight += levelHeight;
				top += levelHeight;
			}
			innerDiv.height(weekHeight);
		}
	}
	
	function eventElementHandlers(event, eventElement) {
		eventElement
			.click(function(ev) {
				if (!eventElement.hasClass('ui-draggable-dragging')) {
					return view.trigger('eventClick', this, event, ev);
				}
			})
			.hover(
				function(ev) {
					view.trigger('eventMouseover', this, event, ev);
				},
				function(ev) {
					view.trigger('eventMouseout', this, event, ev);
				}
			);
	}
	
	
	
	/* Draggable
	-----------------------------------------------------------------------------*/
	
	
	function draggableEvent(event, eventElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var matrix;
			eventElement.draggable({
				zIndex: 3,
				delay: 50,
				opacity: options.dragOpacity,
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell || !cell.rowDelta && !cell.colDelta);
						if (cell) {
							view.showOverlay(cell);
						}else{
							view.hideOverlay();
						}
					});
					tbody.find('tr').each(function() {
						matrix.row(this, tbodyTopBug);
					});
					var tds = tbody.find('tr:first td');
					if (rtl) {
						tds = $(tds.get().reverse());
					}
					tds.each(function() {
						matrix.col(this);
					});
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
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
						view.showEvents(event, eventElement);
					}else{
						var dayDelta = cell.rowDelta*7 + cell.colDelta*dis;
						view.moveEvent(event, dayDelta);
						view.trigger('eventDrop', this, event, dayDelta, 0, function() {
							view.moveEvent(event, -dayDelta);
							rerenderEvents();
						}, ev, ui);
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						rerenderEvents();
					}
				}
			});
		}
	}
	
	
	
	/* Resizable
	-----------------------------------------------------------------------------*/
	
	
	function resizableEvent(event, eventElement) {
		if (!options.disableResizing && eventElement.resizable) {
			eventElement.resizable({
				handles: rtl ? 'w' : 'e',
				grid: colWidth,
				minWidth: colWidth/2, // need this or else IE throws errors when too small
				containment: element,
				start: function(ev, ui) {
					eventElement.css('z-index', 3);
					view.hideEvents(event, eventElement);
					view.trigger('eventResizeStart', this, event, ev, ui);
				},
				stop: function(ev, ui) {
					view.trigger('eventResizeStop', this, event, ev, ui);
					// ui.size.width wasn't working with grid correctly, use .width()
					var dayDelta = Math.round((eventElement.width() - ui.originalSize.width) / colWidth);
					if (dayDelta) {
						view.resizeEvent(event, dayDelta);
						view.trigger('eventResize', this, event, dayDelta, 0, function() {
							view.resizeEvent(event, -dayDelta);
							rerenderEvents();
						}, ev, ui);
						rerenderEvents();
					}else{
						view.showEvents(event, eventElement);
					}
					eventElement.css('z-index', 2);
				}
			});
		}
	}

};

