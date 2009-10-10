
// todo: scrolling
// todo: check all other options
// cleanup CSS
// optimize moveEvent/resizeEvent, to return revert function


/* Agenda Views: agendaWeek/agendaDay
-----------------------------------------------------------------------------*/

setDefaults({
	allDayHeader: true,
	slotMinutes: 30,
	defaultEventMinutes: 120,
	axisFormat: 'htt',
	timeFormat: {
		agenda: 'h:mm{ - h:mm}'
	},
	dragOpacity: {
		agenda: .5
	}
});

views.agendaWeek = function(element, options) {
	return new Agenda(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta * 7);
			}
			this.title = formatDates(
				this.start = this.visStart = addDays(cloneDate(date), -((date.getDay() - options.firstDay + 7) % 7)),
				addDays(cloneDate(this.end = this.visEnd = addDays(cloneDate(this.start), 7)), -1),
				this.option('titleFormat'),
				options
			);
			this.renderAgenda(7, this.option('columnFormat'), fetchEvents);
		}
	});
};

views.agendaDay = function(element, options) {
	return new Agenda(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta);
			}
			this.title = formatDate(date, this.option('titleFormat'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderAgenda(1, this.option('columnFormat'), fetchEvents);
		}
	});
};

function Agenda(element, options, methods) {

	var head, body, bodyContent, bodyTable, bg,
		colCnt,
		timeWidth, colWidth, rowHeight, // todo: timeWidth -> axisWidth, rowHeight->slotHeight ?
		cachedDaySegs, cachedSlotSegs,
		tm, firstDay,
		rtl, dis, dit,  // day index sign / translate
		// ...
		
	view = $.extend(this, viewMethods, methods, {
		renderAgenda: renderAgenda,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		updateSize: updateSize,
		defaultEventEnd: function(event) {
			var start = cloneDate(event.start);
			if (event.allDay) {
				return start;
			}
			return addMinutes(start, options.defaultEventMinutes);
		},
		visEventEnd: function(event) {
			if (event.allDay) {
				if (event.end) {
					var end = cloneDate(event.end);
					return (event.allDay || end.getHours() || end.getMinutes()) ? addDays(end, 1) : end;
				}else{
					return addDays(cloneDate(event.start), 1);
				}
			}
			if (event.end) {
				return cloneDate(event.end);
			}else{
				return addMinutes(cloneDate(event.start), options.defaultEventMinutes);
			}
		}
	});
	view.init(element, options);
	
	
	
	/* Time-slot rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-agenda').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}
	
	function renderAgenda(c, colFormat, fetchEvents) {
		colCnt = c;
		
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
		
		var d0 = rtl ? addDays(cloneDate(view.visEnd), -1) : cloneDate(view.visStart),
			d = cloneDate(d0),
			today = clearTime(new Date());
		
		if (!head) { // first time rendering, build from scratch
		
			var i,
				minutes,
				slotNormal = options.slotMinutes % 15 == 0, //...
			
			// head
			s = "<div class='fc-agenda-head' style='position:relative;z-index:4'>" +
				"<table style='width:100%'>" +
				"<tr class='fc-first" + (options.allDayHeader ? '' : ' fc-last') + "'>" +
				"<th class='fc-leftmost " +
					tm + "-state-default'>&nbsp;</th>";
			for (i=0; i<colCnt; i++) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					"'>" + formatDate(d, colFormat, options) + "</th>";
				addDays(d, dis);
			}
			s+= "<th class='" + tm + "-state-default'>&nbsp;</th></tr>";
			if (options.allDayHeader) {
				s+= "<tr class='fc-all-day'>" +
						"<th class='fc-axis fc-leftmost " + tm + "-state-default'>all day</th>" +
						"<td colspan='" + colCnt + "' class='" + tm + "-state-default'>" +
							"<div class='fc-day-content'><div>&nbsp;</div></div></td>" +
						"<th class='" + tm + "-state-default'>&nbsp;</th>" +
					"</tr><tr class='fc-divider fc-last'><th colspan='" + (colCnt+2) + "' class='" +
						tm + "-state-default fc-leftmost'><div/></th></tr>";
			}
			s+= "</table></div>";
			head = $(s).appendTo(element);
			head.find('td').click(slotClick);
			
			// body
			d = new Date(1970, 0, 1);
			s = "<table>";
			for (i=0; d.getDate() != 2; i++) {
				minutes = d.getMinutes();
				s += "<tr class='" +
					(i==0 ? 'fc-first' : (minutes==0 ? '' : 'fc-minor')) +
					"'><th class='fc-axis fc-leftmost " + tm + "-state-default'>" +
					((!slotNormal || minutes==0) ? formatDate(d, options.axisFormat) : '&nbsp;') + 
					"</th><td class='fc-slot" + i + ' ' +
						tm + "-state-default'><div>&nbsp;</div></td></tr>";
				addMinutes(d, options.slotMinutes);
			}
			s += "</table>";
			body = $("<div class='fc-agenda-body' style='position:relative;z-index:2;overflow:auto'/>")
				.append(bodyContent = $("<div style='position:relative;overflow:hidden'>")
					.append(bodyTable = $(s)))
				.appendTo(element);
			body.find('td').click(slotClick);
			
			// background stripes
			d = cloneDate(d0);
			s = "<div class='fc-agenda-bg' style='position:absolute;z-index:1'>" +
				"<table style='width:100%;height:100%'><tr class='fc-first'>";
			for (i=0; i<colCnt; i++) {
				s += "<td class='fc-" +
					dayIDs[i] + ' ' + // needs to be first
					tm + '-state-default ' +
					(i==0 ? 'fc-leftmost ' : '') +
					(+d == +today ? tm + '-state-highlight fc-today' : 'fc-not-today') +
					"'><div class='fc-day-content'><div>&nbsp;</div></div></td>";
				addDays(d, dis);
			}
			s += "</tr></table></div>";
			bg = $(s).appendTo(element);
			
		}else{ // skeleton already built, just modify it
		
			view.clearEvents();
			
			// redo column header text and class
			head.find('tr:first th').slice(1, -1).each(function() {
				$(this).text(formatDate(d, colFormat, options));
				this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
				addDays(d, dis);
			});
			
			// change classes of background stripes
			d = cloneDate(d0);
			bg.find('td').each(function() {
				this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
				if (+d == +today) {
					$(this)
						.removeClass('fc-not-today')
						.addClass('fc-today')
						.addClass(tm + '-state-highlight');
				}else{
					$(this)
						.addClass('fc-not-today')
						.removeClass('fc-today')
						.removeClass(tm + '-state-highlight');
				}
				addDays(d, dis);
			});
		
		}
		
		updateSize();
		fetchEvents(renderEvents);
		
	};
	
	
	function updateSize() {
		
		bodyTable.width('');
		body.height(Math.round(body.width() / options.aspectRatio) - head.height());
		
		// need this for IE6/7. triggers clientWidth to be calculated for 
		// later user in this function. this is ridiculous
		body[0].clientWidth;
		
		var topTDs = head.find('tr:first th'),
			stripeTDs = bg.find('td'),
			contentWidth = body[0].clientWidth;
		bodyTable.width(contentWidth);
		
		// time-axis width
		timeWidth = 0;
		setOuterWidth(
			head.find('tr:lt(2) th:first').add(body.find('tr:first th'))
				.width('')
				.each(function() {
					timeWidth = Math.max(timeWidth, $(this).outerWidth());
				})
				.add(stripeTDs.eq(0)),
			timeWidth
		);
		
		// column width
		colWidth = Math.floor((contentWidth - timeWidth) / colCnt);
		setOuterWidth(stripeTDs.slice(0, -1), colWidth);
		setOuterWidth(topTDs.slice(1, -2), colWidth);
		setOuterWidth(topTDs.slice(-2, -1), contentWidth - timeWidth - colWidth*(colCnt-1));
		
		bg.css({
			top: head.find('tr').height(),
			left: timeWidth,
			width: contentWidth - timeWidth,
			height: element.height()
		});
		
		rowHeight = body.find('tr:eq(1)').height(); // use second, first prob doesn't have a border
	}
	
	function slotClick(ev) {
		var col = Math.floor((ev.pageX - bg.offset().left) / colWidth),
			date = addDays(cloneDate(view.visStart), dit + dis*col),
			rowMatch = this.className.match(/fc-slot(\d+)/);
		if (rowMatch) {
			var mins = parseInt(rowMatch[1]) * options.slotMinutes,
				hours = Math.floor(mins/60);
			date.setHours(hours);
			date.setMinutes(mins % 60);
			view.trigger('dayClick', this, date, false, ev);
		}else{
			view.trigger('dayClick', this, date, true, ev);
		}
	}
	
	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	
	function renderEvents(events) {
		view.reportEvents(events);
		
		var i, len=events.length,
			dayEvents=[],
			slotEvents=[];
		for (i=0; i<len; i++) {
			if (events[i].allDay) {
				dayEvents.push(events[i]);
			}else{
				slotEvents.push(events[i]);
			}
		}
		
		renderDaySegs(cachedDaySegs = stackSegs(view.sliceSegs(dayEvents, view.visStart, view.visEnd)));
		renderSlotSegs(cachedSlotSegs = compileSlotSegs(slotEvents));
	}
	
	
	function rerenderEvents(skipCompile) {
		view.clearEvents();
		if (skipCompile) {
			renderDaySegs(cachedDaySegs);
			renderSlotSegs(cachedSlotSegs);
		}else{
			renderEvents(view.cachedEvents);
		}
	}
	
	
	function compileSlotSegs(events) {
		var d1 = cloneDate(view.visStart),
			d2 = addDays(cloneDate(d1), 1),
			levels,
			segCols = [],
			i=0;
		for (; i<colCnt; i++) {
			levels = stackSegs(view.sliceSegs(events, d1, d2));
			countForwardSegs(levels);
			segCols.push(levels);
			addDays(d1, 1);
			addDays(d2, 1);
		}
		return segCols;
	}
	
	
	
	// renders 'all-day' events at the top
	
	function renderDaySegs(segRow) {
		if (options.allDayHeader) {
			var td = head.find('td'),
				tdInner = td.find('div div'),
				top = tdInner.position().top,
				rowHeight = 0,
				i, len=segRow.length, level,
				levelHeight,
				j, seg,
				event,
				eventClasses,
				leftDay, leftRounded,
				rightDay, rightRounded,
				left, right,
				eventElement, anchorElement;
			for (i=0; i<len; i++) {
				level = segRow[i];
				levelHeight = 0;
				for (j=0; j<level.length; j++) {
					seg = level[j];
					event = seg.event;
					eventClasses = ['fc-event', 'fc-event-hori'];
					if (rtl) {
						leftDay = seg.end.getDay() - 1;
						leftRounded = seg.isEnd;
						rightDay = seg.start.getDay();
						rightRounded = seg.isStart;
					}else{
						leftDay = seg.start.getDay();
						leftRounded = seg.isStart;
						rightDay = seg.end.getDay() - 1;
						rightRounded = seg.isEnd;
					}
					if (leftRounded) {
						eventClasses.push('fc-corner-left');
						left = bg.find('td:eq('+(((leftDay-firstDay+colCnt)%colCnt)*dis+dit)+') div div').position().left + timeWidth;
					}else{
						left = timeWidth;
					}
					if (rightRounded) {
						eventClasses.push('fc-corner-right');
						right = bg.find('td:eq('+(((rightDay-firstDay+colCnt)%colCnt)*dis+dit)+') div div');
						right = right.position().left + right.width() + timeWidth;
					}else{
						right = timeWidth + bg.width();
					}
					eventElement = $("<div class='" + eventClasses.join(' ') + "'/>")
						.append(anchorElement = $("<a/>")
							.append($("<span class='fc-event-title' />")
								.text(event.title)))
						.css({
							position: 'absolute',
							top: top,
							left: left,
							zIndex: 8
						})
						.appendTo(head);
					setOuterWidth(eventElement, right-left, true);
					if (seg.isEnd) {
						view.resizableDayEvent(event, eventElement, colWidth);
					}
					draggableDayEvent(event, eventElement, seg.isStart);
					view.reportEventElement(event, eventElement);
					levelHeight = Math.max(levelHeight, eventElement.outerHeight(true));
				}
				top += levelHeight;
				rowHeight += levelHeight;
			}
			tdInner.height(rowHeight);
			updateSize(); // tdInner might have pushed the body down, so resize
		}
	}
	
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segCols) {
		var colI, colLen=segCols.length, col,
			levelI, level,
			segI, seg,
			forward,
			event,
			top, bottom,
			tdInner,
			width, left,
			eventElement, anchorElement, timeElement, titleElement;
		for (colI=0; colI<colLen; colI++) {
			col = segCols[colI];
			for (levelI=0; levelI<col.length; levelI++) {
				level = col[levelI];
				for (segI=0; segI<level.length; segI++) {
					seg = level[segI];
					forward = seg.forward || 0;
					event = seg.event;
					top = timePosition(seg.start, seg.start);
					bottom = timePosition(seg.start, seg.end);
					tdInner = bg.find('td:eq(' + (colI*dis + dit) + ') div div');
					availWidth = tdInner.width();
					if (levelI) {
						// indented and thin
						width = availWidth / (levelI + forward + 1);
					}else{
						if (forward) {
							// moderately wide, aligned left still
							width = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
						}else{
							// can be entire width, aligned left
							width = availWidth * .96;
						}
					}
					left = timeWidth + tdInner.position().left +       // leftmost possible
						(availWidth / (levelI + forward + 1) * levelI) // indentation
						* dis + (rtl ? availWidth - width : 0);        // rtl
					eventElement = $("<div class='fc-event fc-event-vert' />")
						.append(anchorElement = $("<a><span class='fc-event-bg'/></a>")
							.append(titleElement = $("<span class='fc-event-title'/>")
								.text(event.title)))
						.css({
							position: 'absolute',
							zIndex: 8,
							top: top,
							left: left
						})
						.appendTo(bodyContent);
					if (event.url) {
						anchorElement.attr('href', event.url);
					}
					if (seg.isStart) {
						eventElement.addClass('fc-corner-top');
						// add the time header
						anchorElement
							.prepend(timeElement = $("<span class='fc-event-time'/>")
								.text(formatDates(event.start, event.end, view.option('timeFormat'))))
					}else{
						timeElement = null;
					}
					if (seg.isEnd) {
						eventElement.addClass('fc-corner-bottom');
						resizableSlotEvent(event, eventElement, timeElement);
					}
					setOuterWidth(eventElement, width, true);
					setOuterHeight(eventElement, bottom-top, true);
					if (timeElement && eventElement.height() - titleElement.position().top < 10) {
						// event title doesn't have enough room, put next to the time
						timeElement.text(formatDate(event.start, view.option('timeFormat')) + ' - ' + event.title);
						titleElement.remove();
					}
					draggableSlotEvent(event, eventElement, timeElement);
					view.reportEventElement(event, eventElement);
				}
			}
		}
	}

	
	
	
	/* Event Dragging
	-----------------------------------------------------------------------------*/
	
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement, isStart) {
		var origPosition, origWidth,
			resetElement,
			allDay=true,
			matrix;
		eventElement.draggable({
			zIndex: 9,
			opacity: view.option('month'), // use whatever the month view was using
			start: function(ev) {
				origPosition = eventElement.position();
				origWidth = eventElement.width();
				resetElement = function() {
					if (!allDay) {
						eventElement
							.width(origWidth)
							.height('')
							.draggable('option', 'grid', null);
						allDay = true;
					}
				};
				matrix = new HoverMatrix(function(cell) {
					eventElement.draggable('option', 'revert', !cell || !cell.rowDelta && !cell.colDelta);
					if (cell) {
						if (!cell.row) { // on full-days
							resetElement();
							view.showOverlay(cell);
						}else{ // mouse is over bottom slots
							if (isStart && allDay) {
								// convert event to temporary slot-event
								setOuterHeight(
									eventElement.width(colWidth - 10), // don't use entire width
									rowHeight * Math.round(
										(event.end ? ((event.end - event.start)/MINUTE_MS) : options.defaultEventMinutes)
										/options.slotMinutes)
								);
								eventElement.draggable('option', 'grid', [colWidth, 1]);
								allDay = false;
							}
							view.hideOverlay();
						}
					}else{ // mouse is outside of everything
						view.hideOverlay();
					}
				});
				view.hideEvents(event, eventElement);
				matrix.row(head.find('td'));
				bg.find('td').each(function() {
					matrix.col(this);
				});
				matrix.row(body);
				matrix.mouse(ev.pageX, ev.pageY);
			},
			drag: function(ev, ui) {
				matrix.mouse(ev.pageX, ev.pageY);
			},
			stop: function(ev, ui) {
				view.hideOverlay();
				var cell = matrix.cell,
					dayDelta = dis * (
						allDay ? // can't trust cell.colDelta when using slot grid
						(cell ? cell.colDelta : 0) :
						Math.floor((ui.position.left - origPosition.left) / colWidth)
					);
				if (!cell || !dayDelta && !cell.rowDelta) {
					// over nothing (has reverted)
					resetElement();
					view.showEvents(event, eventElement);
				}else{
					view.eventDrop(
						this, event, dayDelta,
						allDay ? 0 : // minute delta
							Math.round((eventElement.offset().top - bodyContent.offset().top) / rowHeight)
							* options.slotMinutes
							- (event.start.getHours() * 60 + event.start.getMinutes()),
						allDay, ev, ui
					);
				}
			}
		});
	}
	
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		var origPosition,
			resetElement,
			prevSlotDelta, slotDelta,
			allDay=false,
			matrix;
		eventElement.draggable({
			zIndex: 9,
			scroll: false,
			grid: [colWidth, rowHeight],
			axis: colCnt==1 ? 'y' : false,
			opacity: view.option('dragOpacity'),
			start: function(ev, ui) {
				if ($.browser.msie) {
					eventElement.find('span.fc-event-bg').hide(); // nested opacities mess up in IE, just hide
				}
				origPosition = eventElement.position();
				resetElement = function() {
					// convert back to original slot-event
					if (allDay) {
						if (timeElement) {
							timeElement.css('display', ''); // show() was causing display=inline
						}
						eventElement.draggable('option', 'grid', [colWidth, rowHeight]);
						allDay = false;
					}
				};
				prevSlotDelta = 0;
				matrix = new HoverMatrix(function(cell) {
					eventElement.draggable('option', 'revert', !cell);
					if (cell) {
						if (!cell.row && options.allDayHeader) { // over full days
							if (!allDay) {
								// convert to temporary all-day event
								allDay = true;
								if (timeElement) {
									timeElement.hide();
								}
								eventElement.draggable('option', 'grid', null);
							}
							view.showOverlay(cell);
						}else{ // on slots
							resetElement();
							view.hideOverlay();
						}
					}else{
						view.hideOverlay();
					}
				});
				if (options.allDayHeader) {
					matrix.row(head.find('td'));
				}
				bg.find('td').each(function() {
					matrix.col(this);
				});
				matrix.row(body);
				matrix.mouse(ev.pageX, ev.pageY);
				view.hideEvents(event, eventElement);
			},
			drag: function(ev, ui) {
				slotDelta = Math.round((ui.position.top - origPosition.top) / rowHeight);
				if (slotDelta != prevSlotDelta) {
					if (timeElement && !allDay) {
						// update time header
						var minuteDelta = slotDelta*options.slotMinutes,
							newStart = addMinutes(cloneDate(event.start), minuteDelta),
							newEnd;
						if (event.end) {
							newEnd = addMinutes(cloneDate(event.end), minuteDelta);
						}
						timeElement.text(formatDates(newStart, newEnd, view.option('timeFormat')));
					}
					prevSlotDelta = slotDelta;
				}
				matrix.mouse(ev.pageX, ev.pageY);
			},
			stop: function(ev, ui) {
				view.hideOverlay();
				var cell = matrix.cell,
					dayDelta = dis * (
						allDay ? // can't trust cell.colDelta when using slot grid
						(cell ? cell.colDelta : 0) : 
						Math.floor((ui.position.left - origPosition.left) / colWidth)
					);
				if (!cell || !slotDelta && !dayDelta) {
					resetElement();
					if ($.browser.msie) {
						eventElement
							.css('filter', '') // clear IE opacity side-effects
							.find('span.fc-event-bg').css('display', ''); // .show() made display=inline
					}
					eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
					view.showEvents(event, eventElement);
				}else{
					view.eventDrop(
						this, event, dayDelta,
						allDay ? 0 : slotDelta * options.slotMinutes, // minute delta
						allDay, ev, ui
					);
				}
			}
		});
		
	}
	
	
	
	
	/* Event Resizing
	-----------------------------------------------------------------------------*/
	
	// for TIMESLOT events

	function resizableSlotEvent(event, eventElement, timeElement) {
		var slotDelta, prevSlotDelta;
		eventElement
			.resizable({
				handles: 's',
				grid: rowHeight,
				start: function() {
					slotDelta = prevSlotDelta = 0;
					view.hideEvents(event, eventElement);
					if ($.browser.msie && $.browser.version == '6.0') {
						eventElement.css('overflow', 'hidden');
					}
					eventElement.css('z-index', 9);
				},
				resize: function(ev, ui) {
					// don't rely on ui.size.height, doesn't take grid into account
					slotDelta = Math.round((Math.max(rowHeight, eventElement.height()) - ui.originalSize.height) / rowHeight);
					if (slotDelta != prevSlotDelta) {
						if (timeElement) {
							timeElement.text(
								formatDates(
									event.start,
									(!slotDelta && !event.end) ? null : // no change, so don't display time range
										addMinutes(view.eventEnd(event), options.slotMinutes*slotDelta),
									view.option('timeFormat')
								)
							);
						}
						prevSlotDelta = slotDelta;
					}
				},
				stop: function(ev, ui) {
					if (slotDelta) {
						view.eventResize(this, event, 0, options.slotMinutes*slotDelta, ev, ui);
					}else{
						eventElement.css('z-index', 8);
						view.showEvents(event, eventElement);
						// BUG: if event was really short, need to put title back in span
					}
				}
			})
			.find('div.ui-resizable-s').text('=');
	}
	
	
	// ALL-DAY event resizing w/ 'view' methods...
	
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	
	// get the Y coordinate of the given time on the given day (both Date objects)
	
	function timePosition(day, time) {
		if (time > day && time.getDay() != day.getDay()) {
			return bodyContent.height();
		}
		var slotMinutes = options.slotMinutes,
			minutes = time.getHours()*60 + time.getMinutes(),
			slotI = Math.floor(minutes / slotMinutes),
			innerDiv = body.find('tr:eq(' + slotI + ') td div');
		return Math.max(0, Math.round(innerDiv.position().top - 1 + rowHeight * ((minutes % slotMinutes) / slotMinutes)));
	}

}


// count the number of colliding, higher-level segments (for event squishing)

function countForwardSegs(levels) {
	var i, j, k, level, segForward, segBack;
	for (i=levels.length-1; i>0; i--) {
		level = levels[i];
		for (j=0; j<level.length; j++) {
			segForward = level[j];
			for (k=0; k<levels[i-1].length; k++) {
				segBack = levels[i-1][k];
				if (segsCollide(segForward, segBack)) {
					segBack.forward = Math.max(segBack.forward||0, (segForward.forward||0)+1);
				}
			}
		}
	}
}

