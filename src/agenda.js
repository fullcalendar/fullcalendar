
/********************************* week view ***********************************/

$.fullCalendar.views.week = function(element, options) {

	var agenda = new Agenda(element, options);
	
	safeExtend(options, {
		weekTitleFormat: 'M j Y{ - M j Y}' // TODO: shift around
	});
	
	agenda.render = function(date, delta, fetchEvents) {
	
		if (delta) {
			addDays(date, delta * 7);
		}
		
		this.start = addDays(cloneDate(date), -date.getDay());
		this.end = addDays(cloneDate(this.start), 7);
		this.title = formatDates(this.start, this.end, options.weekTitleFormat);
		
		this.renderAgenda(fetchEvents);
	
	};
	
	return agenda;
};

/******************************* day view *************************************/

$.fullCalendar.views.day = function(element, options) {

	var agenda = new Agenda(element, options);
	
	safeExtend(options, {
		dayTitleFormat: 'l F j Y' // TODO: shift around
	});
	
	agenda.render = function(date, delta, fetchEvents) {
	
		if (delta) {
			addDays(date, delta);
		}
		
		this.start = cloneDate(date, true);
		this.end = addDays(cloneDate(date), 1);
		this.title = formatDate(date, options.dayTitleFormat);
		
		this.renderAgenda(fetchEvents);
	
	};
	
	return agenda;
};

/*********************** shared by month and day views *************************/

function Agenda(element, options) {

	safeExtend(options, {
		slotMinutes: 30,
		defaultEventMinutes: 120,
		agendaEventTimeFormat: 'g:i{ - g:i}',
		agendaSideTimeFormat: 'ga',
		agendaEventDragOpacity: .5
	});

	var view = this,
		head, body, panel, bg,
		dayCnt,
		dayWidth, slotHeight,
		timeWidth,
		cachedEvents,
		cachedSlotSegs, cachedDaySegs,
		eventElements = [],
		eventElementsByID = {},
		eventsByID = {};
	
	element.addClass('fc-agenda').css('position', 'relative');
	
	
	
	/******************************** cell rendering ********************************/
	
	
	this.renderAgenda = function(fetchEvents) { // TODO: get z-indexes sorted out
		
		var start = view.start,
			end = view.end,
			today = getToday(),
			todayI = -1,
			tm = options.theme ? 'ui' : 'fc',
			slotNormal = options.slotMinutes % 15 == 0,
			dayAbbrevs = $.fullCalendar.dayAbbrevs;
		
		if (!head) { // first time rendering, build from scratch TODO: need all the nbsp's?
			
			// head
			var i, d, dDay, dMinutes,
				s = "<div class='fc-agenda-head' style='position:relative;z-index:3'>" +
					"<table style='width:100%' cellpadding='0' cellspacing='0'>" +
						"<tr class='fc-first'>" +
							"<th class='fc-first " + tm + "-state-default'>&nbsp;</th>";
			dayCnt = 0;
			for (d=cloneDate(start); d<end; addDays(d, 1)) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					"'>" + dayAbbrevs[d.getDay()] + "</th>";
				if (+d == +today) {
					todayI = dayCnt;
				}
				dayCnt++;
			}
			s += "<th class='fc-last " + tm + "-state-default'>&nbsp;</th></tr>" +
				"<tr class='fc-last'>" +
					"<th class='fc-first " + tm + "-state-default' style='font-weight:normal;text-align:right;padding:4px 2px'>all day</th>" +
					"<td colspan='" + dayCnt + "' class='" + tm + "-state-default'>" +
						"<div class='fc-day-content'><div/></div></td>" +
					"<th class='fc-last " + tm + "-state-default'>&nbsp;</th>" +
				"</tr></table></div>";
			head = $(s).appendTo(element);
			
			// body & event panel
			s = "<div style='position:relative;overflow:hidden'>" +
				"<table cellpadding='0' cellspacing='0'>";
			d = getToday();
			dDay = d.getDay();
			for (i=0; d.getDay()==dDay; i++, addMinutes(d, options.slotMinutes)) {
				dMinutes = d.getMinutes();
				s += "<tr class='" +
					(i==0 ? 'fc-first' : (dMinutes==0 ? '' : 'fc-minor')) +
					"'><th class='" + tm + "-state-default'>" +
						(!slotNormal || dMinutes==0 ? formatDate(d, options.agendaSideTimeFormat) : '&nbsp;') + 
						"</th><td class='fc-slot " + tm + "-state-default'>&nbsp;</td></tr>";
			}
			s += "</table></div>";
			body = $("<div class='fc-agenda-body' style='position:relative;z-index:2'/>")
				.append(panel = $(s))
				.appendTo(element);
			
			// background stripes
			s = "<div class='fc-agenda-bg' style='position:absolute;top:0;z-index:1'>" +
				"<table style='width:100%;height:100%' cellpadding='0' cellspacing='0'><tr>";
			for (i=0; i<dayCnt; i++) {
				s += "<td class='fc-" +
					dayIDs[i] + ' ' + // needs to be first
					tm + '-state-default ' + 
					(i==todayI ? tm + '-state-highlight fc-today' : 'fc-not-today') +
					"'><div class='fc-day-content'><div>&nbsp;</div></div></td>";
			}
			s += "</tr></table></div>";
			bg = $(s).appendTo(element);
			
		}else{ // skeleton already built, just modify it
		
			clearEvents();
			
			// change classes of background stripes
			todayI = Math.round((today - start) / msInDay);
			bg.find('td').each(function(i) {
				if (i == todayI) {
					$(this).removeClass('fc-not-today')
						.addClass('fc-today')
						.addClass(tm + '-state-highlight');
				}else{
					$(this).addClass('fc-not-today')
						.removeClass('fc-today')
						.removeClass(tm + '-state-highlight');
				}
			});
			
			// if 1-day view, change day-of-week class and header text
			if (dayCnt == 1) {
				var th = head.find('th:eq(1)').html(dayAbbrevs[start.getDay()])[0],
					td = bg.find('td')[0];
				th.className = th.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[start.getDay()]);
				td.className = td.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[start.getDay()]);
			}
		
		}
		
		updateSize();
		fetchEvents(renderEvents);
		
	};
	
	
	function updateSize() {
		
		// align first 'time' column
		timeWidth = body.find('th:first').outerWidth();
		head.find('th:first').width(timeWidth);
		
		// set table width (100% in css wasn't working in IE)
		var panelWidth = body[0].clientWidth || body.width(); // first time, there are no scrollbars!? for IE6?
		body.find('table').width(panelWidth);
		
		// align spacer column to scrollbar width
		setOuterWidth(head.find('th:last'), body.width() - panelWidth);
		
		// position background stripe container
		bg.css({
			left: timeWidth,
			width: panelWidth - timeWidth,
			height: element.height()
		});
		
		// align other columns
		dayWidth = Math.floor((panelWidth - timeWidth) / dayCnt);
		var topCells = head.find('tr:first th:gt(0)'),
			bgCells = bg.find('td');
		for (var i=0, len=bgCells.length-1; i<len; i++) { // TODO: use slice
			setOuterWidth(topCells.eq(i), dayWidth);
			setOuterWidth(bgCells.eq(i), dayWidth);
		}
		
		slotHeight = body.find('tr:eq(1)').height(); // use second, first prob doesn't have a border
		
		// body height
		body.height(Math.round(body.width() / contentAspectRatio) - head.height());
		// but this will add scrollbars...
		// TODO: bug, iE6 view heights dont match up
		// also, no scrollbars
		
	}
	
	
	
	/********************************** event rendering *********************************/
	
	
	function renderEvents(events) {
		
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
		clearEvents();
		if (skipCompile) {
			renderSlotSegs(cachedSlotSegs);
			renderDaySegs(cachedDaySegs);
		}else{
			renderEvents(cachedEvents);
		}
	}
	
	
	function clearEvents() {
		for (var i=0; i<eventElements.length; i++) {
			eventElements[i].remove();
		}
		eventElements = [];
		eventElementsByID = {};
		eventsByID = {};
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
	
	
	// hover effect when dragging events over top days
	
	var dayOverlay;
	
	function showDayOverlay(props) {
		if (!dayOverlay) {
			dayOverlay = $("<div class='fc-day-overlay' style='position:absolute;display:none'/>")
				.appendTo(element);
		}
		var o = element.offset();
		dayOverlay
			.css({
				top: props.top - o.top,
				left: props.left - o.left,
				width: props.width,
				height: props.height
			})
			.show();
	}
	
	function hideDayOverlay() {
		if (dayOverlay) {
			dayOverlay.hide();
		}
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
	
	
	function reportEventElement(event, eventElement) {
		eventElements.push(eventElement);
		if (eventElementsByID[event._id]) {
			eventElementsByID[event._id].push(eventElement);
		}else{
			eventElementsByID[event._id] = [eventElement];
		}
	}
	
	
	function hideSimilarEvents(event, eventElement) {
		var elements = eventElementsByID[event._id];
		for (var i=0; i<elements.length; i++) {
			if (elements[i] != eventElement) {
				elements[i].hide();
			}
		}
	}
	
	
	function reportEventMove(event, days, keepTime, minutes) {
		minutes = minutes || 0;
		var events = eventsByID[event._id];
		for (var i=0, event2; i<events.length; i++) {
			event2 = events[i];
			event2.hasTime = event.hasTime;
			addMinutes(addDays(event2.start, days, keepTime), minutes);
			if (event.end) {
				event2.end = addMinutes(addDays(event2.end || event2._end, days, keepTime), minutes);
			}else{
				event2.end = event2._end = null;
					// hopefully renderEvents() will always be called after this
					// to reset _end.... TODO?
			}
		}
	}
	
	
	function reportEventResize(event, days, keepTime, minutes) {
		minutes = minutes || 0;
		var events = eventsByID[event._id];
		for (var i=0, event2; i<events.length; i++) {
			event2 = events[i];
			event2.end = addMinutes(addDays(event2.end || event2._end, days, keepTime), minutes);
		}
	}
	
	
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


// TODO: move to month.js

function sliceSegs(events, start, end) {
	var segs = [],
		i, len=events.length, event,
		eventStart, eventEnd,
		segStart, segEnd,
		isStart, isEnd;
	for (i=0; i<len; i++) {
		event = events[i];
		eventStart = event.start;
		eventEnd = event._end;
		if (eventEnd > start && eventStart < end) {
			if (eventStart < start) {
				segStart = cloneDate(start);
				isStart = false;
			}else{
				segStart = eventStart;
				isStart = true;
			}
			if (eventEnd > end) {
				segEnd = cloneDate(end);
				isEnd = false;
			}else{
				segEnd = eventEnd;
				isEnd = true;
			}
			segs.push({
				event: event,
				start: segStart,
				end: segEnd,
				isStart: isStart,
				isEnd: isEnd,
				msLength: segEnd - segStart
			});
		}
	}
	return segs.sort(segCmp);
}


function segCmp(a, b) {
	return  (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
}
