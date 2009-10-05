
/* Agenda Views: agendaWeek/agendaDay
-----------------------------------------------------------------------------*/

setDefaults({
	slotMinutes: 30,
	defaultEventMinutes: 120,
	agendaTimeFormat: 'g:i{ - g:i}', // todo: merge into object w/ timeFormat
	axisFormat: 'htt',
	agendaDragOpacity: .5 // maybe merge into object
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
				strProp(options.titleFormat, 'week'),
				options
			);
			this.renderAgenda(7, strProp(options.columnFormat, 'week'), fetchEvents);
		}
	});
};

views.agendaDay = function(element, options) {
	return new Agenda(element, options, {
		render: function(date, delta, fetchEvents) {
			if (delta) {
				addDays(date, delta);
			}
			this.title = formatDate(date, strProp(options.titleFormat, 'day'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderAgenda(1, strProp(options.columnFormat, 'day'), fetchEvents);
		}
	});
};

function Agenda(element, options, methods) {

	var head, body, bodyContent, bodyTable, bg,
		colCnt,
		timeWidth, colWidth, rowHeight,
		cachedSlotSegs, cachedDaySegs,
		tm, firstDay,
		rtl, dis, dit,  // day index sign / translate
		// ...
		
	view = $.extend(this, viewMethods, methods, {
		renderAgenda: renderAgenda,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		updateSize: updateSize,
		defaultEventEnd: function(event) {
			return addMinutes(cloneDate(event.start), options.defaultEventMinutes);
		},
		visEventEnd: function(event) {
			return addMinutes(cloneDate(event.start), options.defaultEventMinutes);
		}
	});
	view.init(element, options);
	
	
	
	/* Time-slot rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-agenda').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}
	
	function renderAgenda(c, colFormat, fetchEvents) { // TODO: get z-indexes sorted out
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
			s = "<div class='fc-agenda-head' style='position:relative;z-index:3'>" +
				"<table style='width:100%'>" +
				"<tr class='fc-first'>" +
				"<th class='fc-leftmost " +
					tm + "-state-default'>&nbsp;</th>";
			for (i=0; i<colCnt; i++) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					"'>" + formatDate(d, colFormat, options) + "</th>";
				addDays(d, dis);
			}
			s+= "<th class='" + tm + "-state-default'>&nbsp;</th></tr>" +
				"<tr class='fc-all-day'>" +
					"<th class='fc-axis fc-leftmost " + tm + "-state-default'>all day</th>" +
					"<td colspan='" + colCnt + "' class='" + tm + "-state-default'>" +
						"<div class='fc-day-content'><div>&nbsp;</div></div></td>" +
					"<th class='" + tm + "-state-default'>&nbsp;</th>" +
				"</tr><tr class='fc-divider'><th colspan='" + (colCnt+2) + "' class='" +
					tm + "-state-default fc-leftmost'></th></tr></table></div>";
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
						tm + "-state-default'><div class='fc-day-content'><div>&nbsp;</div></div></td></tr>";
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
			head.find('th.fc-axis').add(body.find('th.fc-axis:first'))
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
	
	
	
	
	
	
	
	
	
	/********************************** event rendering *********************************/
	
	
	function renderEvents(events) {
		return;
		
		var i, len=events.length, event,
			fakeID=0, nextDay,
			slotEvents=[], dayEvents=[];
			
		for (i=0; i<len; i++) {
			event = events[i];
			event._id = typeof event.id == 'undefined' ? '_fc' + fakeID++ : event.id + '';
			if (eventsByID[event._id]) {
				eventsByID[event._id].push(event);
			}else{
				eventsByID[event._id] = [event];
			}
			if (event.hasTime) {
				event._end = event.end || addMinutes(cloneDate(event.start), options.defaultEventMinutes);
			}else{
				event._end = addDays(cloneDate(event.end || event.start), 1);
			}
			if (event.start < view.end && event._end > view.start) {
				if (event.hasTime) {
					event._end = event.end || addMinutes(cloneDate(event.start), options.defaultEventMinutes);
					slotEvents.push(event);
				}else{
					event._end = addDays(cloneDate(event.end || event.start), 1);
					dayEvents.push(event);
				}
			}
		}
		
		cachedEvents = events;
		cachedSlotSegs = compileSlotSegs(slotEvents, view.start, view.end);
		cachedDaySegs = levelizeSegs(sliceSegs(dayEvents, view.start, view.end));
		
		renderSlotSegs(cachedSlotSegs);
		renderDaySegs(cachedDaySegs);
		
	}
	
	
	function rerenderEvents(skipCompile) {
		return;
		clearEvents();
		if (skipCompile) {
			renderSlotSegs(cachedSlotSegs);
			renderDaySegs(cachedDaySegs);
		}else{
			renderEvents(cachedEvents);
		}
	}
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segCols) {
		var colI, colLen=segCols.length, col,
			levelI, level,
			segI, seg,
			event, start, end,
			top, bottom,
			tdInner, left, width,
			eventElement, anchorElement, timeElement, titleElement;
		for (colI=0; colI<colLen; colI++) {
			col = segCols[colI];
			for (levelI=0; levelI<col.length; levelI++) {
				level = col[levelI];
				for (segI=0; segI<level.length; segI++) {
					seg = level[segI];
					event = seg.event;
					top = timeCoord(seg.start, seg.start);
					bottom = timeCoord(seg.start, seg.end);
					tdInner = bg.find('td:eq('+colI+') div div');
					availWidth = tdInner.width();
					left = timeWidth + tdInner.position().left + // leftmost possible
						(availWidth / (levelI + seg.right + 1) * levelI); // indentation
					if (levelI == 0) {
						if (seg.right == 0) {
							// can be entire width, aligned left
							width = availWidth * .96;
						}else{
							// moderately wide, aligned left still
							width = ((availWidth / (seg.right + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
						}
					}else{
						// indented and thinner
						width = availWidth / (levelI + seg.right + 1);
					}
					eventElement = $("<div class='fc-event fc-event-vert' />")
						.append(anchorElement = $("<a><span class='fc-event-bg'/></a>")
							.append(titleElement = $("<span class='fc-event-title'/>")
								.text(event.title)))
						.css({
							position: 'absolute',
							zIndex: 1000,
							top: top,
							left: left
						});
					if (event.url) {
						anchorElement.attr('href', event.url);
					}
					if (seg.isStart) {
						eventElement.addClass('fc-corner-top');
						// add the time header
						anchorElement
							.prepend(timeElement = $("<span class='fc-event-time'/>")
								.text(formatDates(event.start, event.end, options.agendaEventTimeFormat)))
					}else{
						timeElement = null;
					}
					if (seg.isEnd) {
						eventElement.addClass('fc-corner-bottom');
						resizableSlotEvent(event, eventElement, timeElement);
					}
					eventElement.appendTo(panel);
					setOuterWidth(eventElement, width, true);
					setOuterHeight(eventElement, bottom-top, true);
					if (timeElement && eventElement.height() - titleElement.position().top < 10) {
						// event title doesn't have enough room, but next to the time
						timeElement.text(formatDate(event.start, options.agendaEventTimeFormat) + ' - ' + event.title);
						titleElement.remove();
					}
					draggableSlotEvent(event, eventElement, timeElement);
					reportEventElement(event, eventElement);
				}
			}
		}
	}
	
	
	// renders 'all-day' events at the top
	
	function renderDaySegs(segRow) {
		var td = head.find('td');
		var tdInner = td.find('div div');
		var top = tdInner.position().top,
			rowHeight = 0,
			i, len=segRow.length, level,
			levelHeight,
			j, seg,
			event, left, right,
			eventElement, anchorElement;
		for (i=0; i<len; i++) {
			level = segRow[i];
			levelHeight = 0;
			for (j=0; j<level.length; j++) {
				seg = level[j];
				event = seg.event;
				left = seg.isStart ?
					bg.find('td:eq('+((seg.start.getDay()+dayCnt)%dayCnt)+') div div') :
					bg.find('td:eq('+((seg.start.getDay()+dayCnt)%dayCnt)+')');
				left = left.position().left;
				right = seg.isEnd ?
					bg.find('td:eq('+((seg.end.getDay()-1+dayCnt)%dayCnt)+') div div') :
					bg.find('td:eq('+((seg.end.getDay()-1+dayCnt)%dayCnt)+')');
				right = right.position().left + right.outerWidth();
				eventElement = $("<div class='fc-event fc-event-hori' />")
					.append(anchorElement = $("<a/>")
						.append($("<span class='fc-event-title' />")
							.text(event.title)))
					.css({
						position: 'absolute',
						top: top,
						left: timeWidth + left
					});
				if (seg.isStart) {
					eventElement.addClass('fc-corner-left');
				}
				if (seg.isEnd) {
					eventElement.addClass('fc-corner-right');
				}
				if (event.url) {
					anchorElement.attr('href', event.url);
				}
				eventElement.appendTo(head);
				setOuterWidth(eventElement, right-left, true);
				draggableDayEvent(event, eventElement);
				//resizableDayEvent(event, eventElement);
				reportEventElement(event, eventElement);
				levelHeight = Math.max(levelHeight, eventElement.outerHeight(true));
			}
			top += levelHeight;
			rowHeight += levelHeight;
		}
		tdInner.height(rowHeight);
		//bg.height(element.height()); // tdInner might have pushed the body down, so resize
		//updateSize();
	}
	
	
	
	/******************************************* draggable *****************************************/
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		var origPosition, origMarginTop,
			prevSlotDelta, slotDelta,
			matrix;
		eventElement.draggable({
			zIndex: 1001,
			scroll: false,
			grid: [dayWidth, slotHeight],
			axis: dayCnt==1 ? 'y' : false,
			cancel: '.ui-resizable-handle',
			opacity: .5,
			start: function(ev, ui) {
				if ($.browser.msie) {
					eventElement.find('span.fc-event-bg').hide();
				}
				origPosition = eventElement.position();
				origMarginTop = parseInt(eventElement.css('margin-top')) || 0;
				prevSlotDelta = 0;
				matrix = new HoverMatrix(function(cell) {
					if (event.hasTime) {
						// event is an original slot-event
						if (cell && cell.row == 0) {
							// but needs to convert to temporary full-day-event
							var topDiff = panel.offset().top - head.offset().top;
							eventElement.css('margin-top', origMarginTop + topDiff)
								.appendTo(head);
							// TODO: bug in IE8 w/ above technique, draggable ends immediately
							event.hasTime = false;
							if (timeElement) {
								timeElement.hide();
							}
							eventElement.draggable('option', 'grid', null);
						}
					}else{
						// event is a temporary full-day-event
						if (cell && cell.row == 1) {
							// but needs to convert to original slot-event
							eventElement.css('margin-top', origMarginTop)
								.appendTo(panel);
							event.hasTime = true;
							if (timeElement) {
								timeElement.css('display', ''); // show() was causing display=inline
							}
							eventElement.draggable('option', 'grid', [dayWidth, slotHeight]);
						}
					}
					if (cell && cell.row == 0) {
						showDayOverlay(cell);
					}else{
						hideDayOverlay();
					}
				});
				matrix.row(head.find('td'));
				bg.find('td').each(function() {
					matrix.col(this);
				});
				matrix.row(body);
				matrix.start();
				hideSimilarEvents(event, eventElement);
			},
			drag: function(ev, ui) {
				slotDelta = Math.round((ui.position.top - origPosition.top) / slotHeight);
				if (slotDelta != prevSlotDelta) {
					if (timeElement && event.hasTime) {
						// update time header
						var newStart = addMinutes(cloneDate(event.start), slotDelta * options.slotMinutes),
							newEnd;
						if (event.end) {
							newEnd = addMinutes(cloneDate(event.end), slotDelta * options.slotMinutes);
						}
						timeElement.text(formatDates(newStart, newEnd, options.agendaEventTimeFormat));
					}
					prevSlotDelta = slotDelta;
				}
				matrix.mouse(ev.pageX, ev.pageY);
			},
			stop: function(ev, ui) {
				if (event.hasTime) {
					if (matrix.cell) {
						// over slots
						var dayDelta = Math.round((ui.position.left - origPosition.left) / dayWidth);
						reportEventMove(event, dayDelta, true, slotDelta * options.slotMinutes);
					}
				}else{
					// over full-days
					if (!matrix.cell) {
						// was being dragged over full-days, but finished over nothing, reset
						event.hasTime = true;
					}else{
						event.end = null;
						reportEventMove(event, matrix.cell.colDelta);
					}
				}
				hideDayOverlay();
				rerenderEvents();
			}
		});
		
	}
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement) {
		var origWidth, matrix;
		eventElement.draggable({
			zIndex: 1001,
			start: function() {
				origWidth = eventElement.width();
				matrix = new HoverMatrix(function(cell) {
					if (!cell) {
						// mouse is outside of everything
						hideDayOverlay();
					}else{
						if (cell.row == 0) {
							// on full-days
							if (event.hasTime) {
								// and needs to be original full-day event
								eventElement
									.width(origWidth)
									.height('')
									.draggable('option', 'grid', null);
								event.hasTime = false;
							}
							showDayOverlay(cell);
						}else{
							// mouse is over bottom slots
							if (!event.hasTime) {
								// convert event to temporary slot-event
								//if (+cloneDate(event.start, true) == +cloneDate(event._end, true)) {
									// only change styles if a 1-day event
									eventElement
										.width(dayWidth - 10) // don't use entire width
										.height(slotHeight * Math.round(options.defaultEventMinutes/options.slotMinutes) - 2);
								//}
								eventElement.draggable('option', 'grid', [dayWidth, 1]);
								event.hasTime = true;
							}
							hideDayOverlay();
						}
					}
				});
				matrix.row(head.find('td'));
				bg.find('td').each(function() {
					matrix.col(this);
				});
				matrix.row(body);
				matrix.start();
				hideSimilarEvents(event, eventElement);
			},
			drag: function(ev, ui) {
				matrix.mouse(ev.pageX, ev.pageY);
			},
			stop: function() {
				var cell = matrix.cell;
				if (!cell) {
					// over nothing
					if (event.hasTime) {
						// event was on the slots before going out, convert back
						event.hasTime = false;
					}
				}else{
					if (!event.hasTime) {
						// event has been dropped on a full-day
						reportEventMove(event, cell.colDelta);
					}else{
						// event has been dropped on the slots
						var slots = Math.floor((eventElement.offset().top - panel.offset().top) / slotHeight);
						event.end = null;
						reportEventMove(event, cell.colDelta, false, slots * options.slotMinutes);
					}
				}
				hideDayOverlay();
				rerenderEvents();
			}
		});
	}
	
	
	
	/************************************* resizable **************************************/
	

	function resizableSlotEvent(event, eventElement, timeElement) {
		var prevSlotDelta, slotDelta, newEnd;
		eventElement
			.resizable({
				handles: 's',
				grid: [0, slotHeight],
				start: function() {
					prevSlotDelta = 0;
					hideSimilarEvents(event, eventElement);
					if ($.browser.msie && $.browser.version == '6.0') {
						eventElement.css('overflow', 'hidden');
					}
				},
				resize: function(ev, ui) {
					slotDelta = Math.round((Math.max(slotHeight, ui.size.height) - ui.originalSize.height) / slotHeight);
					if (slotDelta != prevSlotDelta) {
						newEnd = addMinutes(cloneDate(event._end), options.slotMinutes * slotDelta);
						if (timeElement) {
							timeElement.text(formatDates(event.start, newEnd, options.agendaEventTimeFormat));
						}
						prevSlotDelta = slotDelta;
					}
				},
				stop: function(ev, ui) {
					reportEventResize(event, 0, true, options.slotMinutes * slotDelta);
					rerenderEvents();
				}
			})
			.find('div.ui-resizable-s').text('=');
	}
	
	
	function resizableDayEvent(event, eventElement) {
		eventElement.resizable({
			handles: 'e',
			grid: [dayWidth, 0],
			start: function() {
				hideSimilarEvents(event, eventElement);
			},
			stop: function(ev, ui) {
				var dayDelta = Math.round((Math.max(dayWidth, ui.size.width) - ui.originalSize.width) / dayWidth);
				reportEventResize(event, dayDelta);
				rerenderEvents();
			}
		});
	}
	
	
	
	/**************************************** misc **************************************/
	
	// get the Y coordinate of the given time on the given day
	
	function timeCoord(day, time) {
		var nextDay = addDays(cloneDate(day), 1);
		if (time < nextDay) {
			var slotMinutes = options.slotMinutes;
			var minutes = time.getHours()*60 + time.getMinutes();
			var slotI = Math.floor(minutes / slotMinutes);
			var td = body.find('tr:eq(' + slotI + ') td');
			return Math.round(td.position().top + slotHeight * ((minutes % slotMinutes) / slotMinutes));
		}else{
			return panel.height();
		}
	}

}


function compileSlotSegs(events, start, end) {

	// slice by day
	var segCols = [],
		d1 = cloneDate(start),
		d2 = addDays(cloneDate(start), 1);
	for (; d1<end; addDays(d1, 1), addDays(d2, 1)) {
		segCols.push(sliceSegs(events, d1, d2));
	}
	
	var segLevelCols = [],
		segLevels,
		segs,
		segI, seg,
		levelI, level,
		collide,
		segI2, seg2;
		
	for (var i=0; i<segCols.length; i++) {
	
		// divide segments into levels
		segLevels = segLevelCols[i] = [];
		segs = segCols[i];
		for (segI=0; segI<segs.length; segI++) {
			seg = segs[segI];
			for (levelI=0; true; levelI++) {
				level = segLevels[levelI];
				if (!level) {
					segLevels[levelI] = [seg];
					break;
				}else{
					collide = false;
					for (segI2=0; segI2<level.length; segI2++) {
						if (segsCollide(level[segI2], seg)) {
							collide = true;
							break;
						}
					}
					if (!collide) {
						level.push(seg);
						break;
					}
				}
			}
			seg.right = 0;
		}
		
		// determine # of segments to the 'right' of each segment
		for (levelI=segLevels.length-1; levelI>0; levelI--) {
			level = segLevels[levelI];
			for (segI=0; segI<level.length; segI++) {
				seg = level[segI];
				for (segI2=0; segI2<segLevels[levelI-1].length; segI2++) {
					seg2 = segLevels[levelI-1][segI2];
					if (segsCollide(seg, seg2)) {
						seg2.right = Math.max(seg2.right, seg.right+1);
					}
				}
			}
		}
		
	}
	
	return segLevelCols;
	
}


function segAfters(levels) { // TODO: put in agenda.js
	var i, j, k, level, seg, seg2;
	for (i=levels.length-1; i>0; i--) {
		level = levels[i];
		for (j=0; j<level.length; j++) {
			seg = level[j];
			for (k=0; k<segLevels[i-1].length; k++) {
				seg2 = segLevels[i-1][k];
				if (segsCollide(seg, seg2)) {
					seg2.after = Math.max(seg2.after, seg.after+1);
				}
			}
		}
	}
}
