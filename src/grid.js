
setDefaults({
	weekMode: 'fixed'
});

views.month = function(element, options) {
	return new Grid(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addMonths(date, delta);
			}
			var start = this.start = cloneDate(date, true);
			start.setDate(1);
			this.title = formatDates(
				start,
				addDays(cloneDate(this.end = addMonths(cloneDate(start), 1)), -1),
				strProp(options.titleFormat, 'month'),
				options
			);
			addDays(this.visStart = cloneDate(start), -((start.getDay() - options.weekStart + 7) % 7));
			addDays(this.visEnd = cloneDate(this.end), (7 - this.visEnd.getDay() + options.weekStart) % 7);
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
				this.start = this.visStart = addDays(cloneDate(date), -((date.getDay() - options.weekStart + 7) % 7)),
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


// flags for [Opera] rendering bugs
var tdTopBug, trTopBug, tbodyTopBug, sniffBugs = true;

var tdHeightBug;

var sniffedEventLeftBug, eventLeftDiff=0;


function Grid(element, options, methods) {
	
	var tm, weekStart,
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
		defaultEventEnd: function(event) {
			return cloneDate(event.start);
		},
		visEventEnd: function(event) {
			if (event.end) {
				var end = cloneDate(event.end);
				return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
			}else{
				return addDays(cloneDate(event.start), 1);
			}
		}
	});
	view.init(element, options);
	
	
	
	/********************************* grid rendering *************************************/
	
	
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
		weekStart = options.weekStart;
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
					(i==dit ? ' fc-left' : '') +
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
						(j==dit ? ' fc-left' : '') +
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
							(j==dit ? ' fc-left' : '') + "'>" +
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
			
			if (rowCnt == 1) { // more likely changed (week or day view)
			
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
	
	
	function updateSize() {
		var width = element.width();
		var height = Math.round(width / options.aspectRatio);
		setOuterWidth(
			thead.find('th').slice(0, -1),
			colWidth = Math.floor(width / colCnt)
		);
		var leftTDs = tbody.find('tr td:first-child');
		var tbodyHeight = height - thead.height();
		var rowHeight1, rowHeight2;
		if (options.weekMode == 'variable') {
			rowHeight1 = rowHeight2 = Math.floor(tbodyHeight / (rowCnt==1 ? 2 : 6));
		}else{
			rowHeight1 = Math.floor(tbodyHeight / rowCnt);
			rowHeight2 = tbodyHeight - rowHeight1*(rowCnt-1);
		}

		if (sniffBugs) {
			// nasty bugs in opera 9.25
			// position() returning relative to direct parent
			var tr = tbody.find('tr:first');
			var td = tr.find('td:first');
			var trTop = tr.position().top;
			var tdTop = td.position().top;
			tdTopBug = tdTop < 0;
			trTopBug = trTop != tdTop;
			tbodyTopBug = tbody.position().top != trTop;
			sniffBugs = false;
			//
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
		
		//alert(tbodyHeight + ' === ' + tbody.height());
	}
	
	
	
	/******************************** event rendering *****************************/
	
	
	function renderEvents(events) {
		view.reportEvents(events);
		renderSegs(cachedSegs = compileSegs(events));
	}
	
	
	function rerenderEvents(skipCompile) {
		//console.log('rerender events');
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
			startE, endE,
			left1, left2,
			eventElement, eventAnchor,
			triggerRes;
		for (i=0; i<len; i++) {
			levels = segRows[i];
			tr = tbody.find('tr:eq('+i+')');
			td = tr.find('td:first');
			innerDiv = td.find('div.fc-day-content div').css('position', 'relative');
			top = innerDiv.position().top;
			if (tdTopBug) top -= td.position().top;
			if (trTopBug) top += tr.position().top;
			if (tbodyTopBug) top += tbody.position().top;
			weekHeight = 0;
			for (j=0; j<levels.length; j++) {
				segs = levels[j];
				levelHeight = 0;
				for (k=0; k<segs.length; k++) {
					seg = segs[k];
					event = seg.event;
					eventClasses = event.className || [];
					if (typeof eventClasses == 'string') {
						eventClasses = eventClasses.split(' ');
					}
					eventClasses.push('fc-event', 'fc-event-hori');
					startE = seg.isStart ?
						tr.find('td:eq('+((seg.start.getDay()-weekStart+colCnt)%colCnt)+') div.fc-day-content div') :
						tbody;
					endE = seg.isEnd ?
						tr.find('td:eq('+((seg.end.getDay()-weekStart+colCnt-1)%colCnt)+') div.fc-day-content div') :
						tbody;
					if (rtl) {
						left1 = endE.position().left;
						left2 = startE.position().left + startE.width();
						if (seg.isStart) {
							eventClasses.push('fc-corner-right');
						}
						if (seg.isEnd) {
							eventClasses.push('fc-corner-left');
						}
					}else{
						left1 = startE.position().left;
						left2 = endE.position().left + endE.width();
						if (seg.isStart) {
							eventClasses.push('fc-corner-left');
						}
						if (seg.isEnd) {
							eventClasses.push('fc-corner-right');
						}
					}
					eventElement = $("<div class='" + eventClasses.join(' ') + "'/>")
						.append(eventAnchor = $("<a/>")
							.append(event.allDay ? null :
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
								left: left1 + eventLeftDiff,
								zIndex: 3
							})
							.appendTo(element);
						setOuterWidth(eventElement, left2-left1, true);
						if (!sniffedEventLeftBug) {
							if (rtl) {
								eventLeftDiff = left1 - eventElement.position().left;
								if (eventLeftDiff) {
									eventElement.css('left', left1 + eventLeftDiff);
								}
							}
							sniffedEventLeftBug = true;
						}
						eventElementHandlers(event, eventElement);
						if (event.editable || typeof event.editable == 'undefined' && options.editable) {
							draggableEvent(event, eventElement);
							resizableEvent(event, eventElement);
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
					view.trigger('eventMouseover', this, event, ev);
				}
			);
	}
	
	
	
	/***************************** draggable *********************************/
	
	
	function draggableEvent(event, eventElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var matrix;
			eventElement.draggable({
				zIndex: 4,
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
						matrix.row(this);
					});
					var tds = tbody.find('tr:first td');
					if (rtl) {
						tds = $(tds.get().reverse());
					}
					tds.each(function() {
						matrix.col(this);
					});
					matrix.start();
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
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
						view.trigger('eventDrop', this, event, dayDelta, 0, ev, ui);
						rerenderEvents();
					}
				}
			});
		}
	}
	
	
	
	/******************************* resizable *****************************/
	
	
	function resizableEvent(event, eventElement) {
		if (!options.disableResizing && eventElement.resizable) {
			eventElement.resizable({
				handles: rtl ? 'w' : 'e',
				grid: [colWidth, 0],
				containment: element,
				start: function(ev, ui) {
					eventElement.css('z-index', 4);
					view.hideEvents(event, eventElement);
					view.trigger('eventResizeStart', this, event, ev, ui);
				},
				stop: function(ev, ui) {
					view.trigger('eventResizeStop', this, event, ev, ui);
					var dayDelta = Math.round((Math.max(colWidth, ui.size.width) - ui.originalSize.width) / colWidth);
					if (dayDelta) {
						view.resizeEvent(event, dayDelta);
						view.trigger('eventResize', this, event, dayDelta, 0, ev, ui);
						rerenderEvents();
					}else{
						view.showEvents(event, eventElement);
					}
					eventElement.css('z-index', 3);
				}
			});
		}
	}
	
	
	
	
	//
	
	function dayClick() {
		var dayIndex = parseInt(this.className.match(/fc\-day(\d+)/)[1]);
		var date = addDays(cloneDate(view.visStart), dayIndex);
		view.trigger('dayClick', this, date);
	}
	

};
