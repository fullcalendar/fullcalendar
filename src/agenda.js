
/* Agenda Views: agendaWeek/agendaDay
-----------------------------------------------------------------------------*/

setDefaults({
	allDaySlot: true,
	allDayText: 'all-day',
	firstHour: 6,
	slotMinutes: 30,
	defaultEventMinutes: 120,
	axisFormat: 'h(:mm)tt',
	timeFormat: {
		agenda: 'h:mm{ - h:mm}'
	},
	dragOpacity: {
		agenda: .5
	},
	minTime: 0,
	maxTime: 24
});

views.agendaWeek = function(element, options, viewName) {
	return new Agenda(element, options, {
		render: function(date, delta) {
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
			this.renderAgenda(
				options.weekends ? 7 : 5,
				this.option('columnFormat')
			);
		}
	}, viewName);
};

views.agendaDay = function(element, options, viewName) {
	return new Agenda(element, options, {
		render: function(date, delta) {
			if (delta) {
				addDays(date, delta);
				if (!options.weekends) {
					skipWeekend(date, delta < 0 ? -1 : 1);
				}
			}
			this.title = formatDate(date, this.option('titleFormat'), options);
			this.start = this.visStart = cloneDate(date, true);
			this.end = this.visEnd = addDays(cloneDate(this.start), 1);
			this.renderAgenda(
				1,
				this.option('columnFormat')
			);
		}
	}, viewName);
};

function Agenda(element, options, methods, viewName) {

	var head, body, bodyContent, bodyTable, bg,
		colCnt,
		slotCnt=0, // spanning all the way across
		axisWidth, colWidth, slotHeight,
		viewWidth, viewHeight,
		savedScrollTop,
		cachedEvents=[],
		daySegmentContainer,
		slotSegmentContainer,
		tm, firstDay,
		nwe,            // no weekends (int)
		rtl, dis, dit,  // day index sign / translate
		minMinute, maxMinute,
		colContentPositions = new HorizontalPositionCache(function(col) {
			return bg.find('td:eq(' + col + ') div div');
		}),
		slotTopCache = {},
		// ...
		
	view = $.extend(this, viewMethods, methods, {
		renderAgenda: renderAgenda,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		clearEvents: clearEvents,
		setHeight: setHeight,
		setWidth: setWidth,
		beforeHide: function() {
			savedScrollTop = body.scrollTop();
		},
		afterShow: function() {
			body.scrollTop(savedScrollTop);
		},
		defaultEventEnd: function(event) {
			var start = cloneDate(event.start);
			if (event.allDay) {
				return start;
			}
			return addMinutes(start, options.defaultEventMinutes);
		}
	});
	view.name = viewName;
	view.init(element, options);
	
	
	
	/* Time-slot rendering
	-----------------------------------------------------------------------------*/
	
	
	disableTextSelection(element.addClass('fc-agenda'));
	
	
	function renderAgenda(c, colFormat) {
	
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
		minMinute = parseTime(options.minTime);
		maxMinute = parseTime(options.maxTime);
		
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
				"<tr class='fc-first" + (options.allDaySlot ? '' : ' fc-last') + "'>" +
				"<th class='fc-leftmost " +
					tm + "-state-default'>&nbsp;</th>";
			for (i=0; i<colCnt; i++) {
				s += "<th class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default' +
					"'>" + formatDate(d, colFormat, options) + "</th>";
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
			}
			s += "<th class='" + tm + "-state-default'>&nbsp;</th></tr>";
			if (options.allDaySlot) {
				s += "<tr class='fc-all-day'>" +
						"<th class='fc-axis fc-leftmost " + tm + "-state-default'>" + options.allDayText + "</th>" +
						"<td colspan='" + colCnt + "' class='" + tm + "-state-default'>" +
							"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></td>" +
						"<th class='" + tm + "-state-default'>&nbsp;</th>" +
					"</tr><tr class='fc-divider fc-last'><th colspan='" + (colCnt+2) + "' class='" +
						tm + "-state-default fc-leftmost'><div/></th></tr>";
			}
			s+= "</table></div>";
			head = $(s).appendTo(element);
			dayBind(head.find('td'));
			
			// all-day event container
			daySegmentContainer = $("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(head);
			
			// body
			d = zeroDate();
			var maxd = addMinutes(cloneDate(d), maxMinute);
			addMinutes(d, minMinute);
			s = "<table>";
			for (i=0; d < maxd; i++) {
				minutes = d.getMinutes();
				s += "<tr class='" +
					(!i ? 'fc-first' : (!minutes ? '' : 'fc-minor')) +
					"'><th class='fc-axis fc-leftmost " + tm + "-state-default'>" +
					((!slotNormal || !minutes) ? formatDate(d, options.axisFormat) : '&nbsp;') + 
					"</th><td class='fc-slot" + i + ' ' +
						tm + "-state-default'><div style='position:relative'>&nbsp;</div></td></tr>";
				addMinutes(d, options.slotMinutes);
				slotCnt++;
			}
			s += "</table>";
			body = $("<div class='fc-agenda-body' style='position:relative;z-index:2;overflow:auto'/>")
				.append(bodyContent = $("<div style='position:relative;overflow:hidden'>")
					.append(bodyTable = $(s)))
				.appendTo(element);
			slotBind(body.find('td'));
			
			// slot event container
			slotSegmentContainer = $("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(bodyContent);
			
			// background stripes
			d = cloneDate(d0);
			s = "<div class='fc-agenda-bg' style='position:absolute;z-index:1'>" +
				"<table style='width:100%;height:100%'><tr class='fc-first'>";
			for (i=0; i<colCnt; i++) {
				s += "<td class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default ' +
					(!i ? 'fc-leftmost ' : '') +
					(+d == +today ? tm + '-state-highlight fc-today' : 'fc-not-today') +
					"'><div class='fc-day-content'><div>&nbsp;</div></div></td>";
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
			}
			s += "</tr></table></div>";
			bg = $(s).appendTo(element);
			
		}else{ // skeleton already built, just modify it
		
			clearEvents();
			
			// redo column header text and class
			head.find('tr:first th').slice(1, -1).each(function() {
				$(this).text(formatDate(d, colFormat, options));
				this.className = this.className.replace(/^fc-\w+(?= )/, 'fc-' + dayIDs[d.getDay()]);
				addDays(d, dis);
				if (nwe) {
					skipWeekend(d, dis);
				}
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
				if (nwe) {
					skipWeekend(d, dis);
				}
			});
		
		}
		
	}
	
	
	function resetScroll() {
		var d0 = zeroDate(),
			scrollDate = cloneDate(d0);
		scrollDate.setHours(options.firstHour);
		var top = timePosition(d0, scrollDate) + 1, // +1 for the border
			scroll = function() {
				body.scrollTop(top);
			};
		scroll();
		setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
	}
	
	
	function setHeight(height, dateChanged) {
		viewHeight = height;
		slotTopCache = {};
		
		body.height(height - head.height());
		
		slotHeight = body.find('tr:first div').height() + 1;
		
		bg.css({
			top: head.find('tr').height(),
			height: height
		});
		
		if (dateChanged) {
			resetScroll();
		}
	}
	
	
	function setWidth(width) {
		viewWidth = width;
		colContentPositions.clear();
		
		body.width(width);
		bodyTable.width('');
		
		var topTDs = head.find('tr:first th'),
			stripeTDs = bg.find('td'),
			clientWidth = body[0].clientWidth;
			
		bodyTable.width(clientWidth);
		
		// time-axis width
		axisWidth = 0;
		setOuterWidth(
			head.find('tr:lt(2) th:first').add(body.find('tr:first th'))
				.width('')
				.each(function() {
					axisWidth = Math.max(axisWidth, $(this).outerWidth());
				}),
			axisWidth
		);
		
		// column width
		colWidth = Math.floor((clientWidth - axisWidth) / colCnt);
		setOuterWidth(stripeTDs.slice(0, -1), colWidth);
		setOuterWidth(topTDs.slice(1, -2), colWidth);
		
		var scrollbar=body.get().scrollHeight!=body.get().clientHeight;

		if (scrollbar) {
			setOuterWidth(topTDs.slice(-2, -1), clientWidth - axisWidth - colWidth*(colCnt-1));
		} else {
			topTDs.slice(-1).hide();
			$('tr.fc-all-day th').slice(-1).hide();
		}
		bg.css({
			left: axisWidth,
			width: clientWidth - axisWidth
		});
	}
	
	
	
	/* Slot/Day clicking and binding
	-----------------------------------------------------------------------*/
	

	function dayBind(tds) {
		tds.click(slotClick)
			.mousedown(daySelectionMousedown);
	}


	function slotBind(tds) {
		tds.click(slotClick)
			.mousedown(slotSelectionMousedown);
	}
	
	
	function slotClick(ev) {
		if (!view.option('selectable')) { // SelectionManager will worry about dayClick
			var col = Math.min(colCnt-1, Math.floor((ev.pageX - bg.offset().left) / colWidth)),
				date = addDays(cloneDate(view.visStart), col*dis+dit),
				rowMatch = this.className.match(/fc-slot(\d+)/);
			if (rowMatch) {
				var mins = parseInt(rowMatch[1]) * options.slotMinutes,
					hours = Math.floor(mins/60);
				date.setHours(hours);
				date.setMinutes(mins%60 + minMinute);
				view.trigger('dayClick', this, date, false, ev);
			}else{
				view.trigger('dayClick', this, date, true, ev);
			}
		}
	}
	
	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	function renderEvents(events, modifiedEventId) {
		view.reportEvents(cachedEvents = events);
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
		renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
		renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
	}
	
	
	function rerenderEvents(modifiedEventId) {
		clearEvents();
		renderEvents(cachedEvents, modifiedEventId);
	}
	
	
	function clearEvents() {
		view._clearEvents(); // only clears the hashes
		daySegmentContainer.empty();
		slotSegmentContainer.empty();
	}
	
	
	
	
	
	function compileDaySegs(events) {
		var levels = stackSegs(view.sliceSegs(events, $.map(events, exclEndDay), view.visStart, view.visEnd)),
			i, levelCnt=levels.length, level,
			j, seg,
			segs=[];
		for (i=0; i<levelCnt; i++) {
			level = levels[i];
			for (j=0; j<level.length; j++) {
				seg = level[j];
				seg.row = 0;
				seg.level = i;
				segs.push(seg);
			}
		}
		return segs;
	}
	
	
	function compileSlotSegs(events) {
		var d = addMinutes(cloneDate(view.visStart), minMinute),
			visEventEnds = $.map(events, slotEventEnd),
			i, col,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<colCnt; i++) {
			col = stackSegs(view.sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute-minMinute)));
			countForwardSegs(col);
			for (j=0; j<col.length; j++) {
				level = col[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.col = i;
					seg.level = j;
					segs.push(seg);
				}
			}
			addDays(d, 1, true);
		}
		return segs;
	}
	
	
	
	
	// renders 'all-day' events at the top
	
	function renderDaySegs(segs, modifiedEventId) {
		if (options.allDaySlot) {
			_renderDaySegs(
				segs,
				1,
				view,
				axisWidth,
				viewWidth,
				function() {
					return head.find('tr.fc-all-day');
				},
				function(dayOfWeek) {
					return axisWidth + colContentPositions.left(dayOfWeekCol(dayOfWeek));
				},
				function(dayOfWeek) {
					return axisWidth + colContentPositions.right(dayOfWeekCol(dayOfWeek));
				},
				daySegmentContainer,
				daySegBind,
				modifiedEventId
			);
			setHeight(viewHeight); // might have pushed the body down, so resize
		}
	}
	
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segs, modifiedEventId) {
	
		var i, segCnt=segs.length, seg,
			event,
			className,
			top, bottom,
			colI, levelI, forward,
			leftmost,
			availWidth,
			outerWidth,
			left,
			html='',
			eventElements,
			eventElement,
			triggerRes,
			vsideCache={},
			hsideCache={},
			key, val,
			titleSpan,
			height;
			
		// calculate position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			className = 'fc-event fc-event-vert ';
			if (seg.isStart) {
				className += 'fc-corner-top ';
			}
			if (seg.isEnd) {
				className += 'fc-corner-bottom ';
			}
			top = timePosition(seg.start, seg.start);
			bottom = timePosition(seg.start, seg.end);
			colI = seg.col;
			levelI = seg.level;
			forward = seg.forward || 0;
			leftmost = axisWidth + colContentPositions.left(colI*dis + dit);
			availWidth = axisWidth + colContentPositions.right(colI*dis + dit) - leftmost;
			availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
			if (levelI) {
				// indented and thin
				outerWidth = availWidth / (levelI + forward + 1);
			}else{
				if (forward) {
					// moderately wide, aligned left still
					outerWidth = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
				}else{
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
			html += slotSegHtml(event, seg, className);
		}
		slotSegmentContainer[0].innerHTML = html; // faster than html()
		eventElements = slotSegmentContainer.children();
		
		// retrieve elements, run through eventRender callback, bind event handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			eventElement = $(eventElements[i]); // faster than eq()
			triggerRes = view.trigger('eventRender', event, event, eventElement);
			if (triggerRes === false) {
				eventElement.remove();
			}else{
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
					slotSegBind(event, eventElement, seg);
				}else{
					eventElement[0]._fci = i; // for lazySegBind
				}
				view.reportEventElement(event, eventElement);
			}
		}
		
		lazySegBind(slotSegmentContainer, segs, slotSegBind);
		
		// record event sides and title positions
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				val = vsideCache[key = seg.key = cssKey(eventElement[0])];
				seg.vsides = val === undefined ? (vsideCache[key] = vsides(eventElement[0], true)) : val;
				val = hsideCache[key];
				seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement[0], true)) : val;
				titleSpan = eventElement.find('span.fc-event-title');
				if (titleSpan.length) {
					seg.titleTop = titleSpan[0].offsetTop;
				}
			}
		}
		
		// set all positions/dimensions at once
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				eventElement[0].style.width = seg.outerWidth - seg.hsides + 'px';
				eventElement[0].style.height = (height = seg.outerHeight - seg.vsides) + 'px';
				event = seg.event;
				if (seg.titleTop !== undefined && height - seg.titleTop < 10) {
					// not enough room for title, put it in the time header
					eventElement.find('span.fc-event-time')
						.text(formatDate(event.start, view.option('timeFormat')) + ' - ' + event.title);
					eventElement.find('span.fc-event-title')
						.remove();
				}
				view.trigger('eventAfterRender', event, event, eventElement);
			}
		}
					
	}
	
	function slotSegHtml(event, seg, className) {
		return "<div class='" + className + event.className.join(' ') + "' style='position:absolute;z-index:8;top:" + seg.top + "px;left:" + seg.left + "px'>" +
			"<a" + (event.url ? " href='" + htmlEscape(event.url) + "'" : '') + ">" +
				"<span class='fc-event-bg'></span>" +
				"<span class='fc-event-time'>" + htmlEscape(formatDates(event.start, event.end, view.option('timeFormat'))) + "</span>" +
				"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
			"</a>" +
			((event.editable || event.editable === undefined && options.editable) && !options.disableResizing && $.fn.resizable ?
				"<div class='ui-resizable-handle ui-resizable-s'>=</div>"
				: '') +
		"</div>";
	}
	
	
	
	function daySegBind(event, eventElement, seg) {
		view.eventElementHandlers(event, eventElement);
		if (event.editable || event.editable === undefined && options.editable) {
			draggableDayEvent(event, eventElement, seg.isStart);
			if (seg.isEnd) {
				view.resizableDayEvent(event, eventElement, colWidth);
			}
		}
	}
	
	
	
	function slotSegBind(event, eventElement, seg) {
		view.eventElementHandlers(event, eventElement);
		if (event.editable || event.editable === undefined && options.editable) {
			var timeElement = eventElement.find('span.fc-event-time');
			draggableSlotEvent(event, eventElement, timeElement);
			if (seg.isEnd) {
				resizableSlotEvent(event, eventElement, timeElement);
			}
		}
	}

	
	
	
	/* Event Dragging
	-----------------------------------------------------------------------------*/
	
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement, isStart) {
		if (!options.disableDragging && eventElement.draggable) {
			var origWidth;
			var allDay=true;
			var dayDelta;
			eventElement.draggable({
				zIndex: 9,
				opacity: view.option('dragOpacity', 'month'), // use whatever the month view was using
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					view.hideEvents(event, eventElement);
					origWidth = eventElement.width();
					hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
						eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
						clearOverlay();
						if (cell) {
							dayDelta = colDelta * dis;
							if (!cell.row) {
								// on full-days
								renderDayOverlay(
									addDays(cloneDate(event.start), dayDelta),
									addDays(exclEndDay(event), dayDelta)
								);
								resetElement();
							}else{
								// mouse is over bottom slots
								if (isStart && allDay) {
									// convert event to temporary slot-event
									setOuterHeight(
										eventElement.width(colWidth - 10), // don't use entire width
										slotHeight * Math.round(
											(event.end ? ((event.end - event.start) / MINUTE_MS) : options.defaultEventMinutes)
											/ options.slotMinutes
										)
									);
									eventElement.draggable('option', 'grid', [colWidth, 1]);
									allDay = false;
								}
							}
						}
					}, ev, 'drag');
				},
				stop: function(ev, ui) {
					var cell = hoverListener.stop();
					clearOverlay();
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					if (cell && (!allDay || dayDelta)) {
						// changed!
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						var minuteDelta = 0;
						if (!allDay) {
							minuteDelta = Math.round((eventElement.offset().top - bodyContent.offset().top) / slotHeight)
								* options.slotMinutes
								+ minMinute
								- (event.start.getHours() * 60 + event.start.getMinutes());
						}
						view.eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
					}else{
						// hasn't moved or is out of bounds (draggable has already reverted)
						resetElement();
						if ($.browser.msie) {
							eventElement.css('filter', ''); // clear IE opacity side-effects
						}
						view.showEvents(event, eventElement);
					}
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
	}
	
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var origPosition;
			var allDay=false;
			var dayDelta;
			var minuteDelta;
			var prevMinuteDelta;
			eventElement.draggable({
				zIndex: 9,
				scroll: false,
				grid: [colWidth, slotHeight],
				axis: colCnt==1 ? 'y' : false,
				opacity: view.option('dragOpacity'),
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					view.hideEvents(event, eventElement);
					if ($.browser.msie) {
						eventElement.find('span.fc-event-bg').hide(); // nested opacities mess up in IE, just hide
					}
					origPosition = eventElement.position();
					minuteDelta = prevMinuteDelta = 0;
					hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
						eventElement.draggable('option', 'revert', !cell);
						clearOverlay();
						if (cell) {
							dayDelta = colDelta * dis;
							if (options.allDaySlot && !cell.row) {
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
							}else{
								// on slots
								resetElement();
							}
						}
					}, ev, 'drag');
				},
				drag: function(ev, ui) {
					minuteDelta = Math.round((ui.position.top - origPosition.top) / slotHeight) * options.slotMinutes;
					if (minuteDelta != prevMinuteDelta) {
						if (!allDay) {
							updateTimeText(minuteDelta);
						}
						prevMinuteDelta = minuteDelta;
					}
				},
				stop: function(ev, ui) {
					var cell = hoverListener.stop();
					clearOverlay();
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					if (cell && (dayDelta || minuteDelta || allDay)) {
						// changed!
						view.eventDrop(this, event, dayDelta, allDay ? 0 : minuteDelta, allDay, ev, ui);
					}else{
						// either no change or out-of-bounds (draggable has already reverted)
						resetElement();
						eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
						updateTimeText(0);
						if ($.browser.msie) {
							eventElement
								.css('filter', '') // clear IE opacity side-effects
								.find('span.fc-event-bg')
									.css('display', ''); // .show() made display=inline
						}
						view.showEvents(event, eventElement);
					}
				}
			});
			function updateTimeText(minuteDelta) {
				var newStart = addMinutes(cloneDate(event.start), minuteDelta);
				var newEnd;
				if (event.end) {
					newEnd = addMinutes(cloneDate(event.end), minuteDelta);
				}
				timeElement.text(formatDates(newStart, newEnd, view.option('timeFormat')));
			}
			function resetElement() {
				// convert back to original slot-event
				if (allDay) {
					timeElement.css('display', ''); // show() was causing display=inline
					eventElement.draggable('option', 'grid', [colWidth, slotHeight]);
					allDay = false;
				}
			}
		}
	}
	
	
	
	
	/* Event Resizing
	-----------------------------------------------------------------------------*/
	
	// for TIMESLOT events

	function resizableSlotEvent(event, eventElement, timeElement) {
		if (!options.disableResizing && eventElement.resizable) {
			var slotDelta, prevSlotDelta;
			eventElement.resizable({
				handles: {
					s: 'div.ui-resizable-s'
				},
				grid: slotHeight,
				start: function(ev, ui) {
					slotDelta = prevSlotDelta = 0;
					view.hideEvents(event, eventElement);
					if ($.browser.msie && $.browser.version == '6.0') {
						eventElement.css('overflow', 'hidden');
					}
					eventElement.css('z-index', 9);
					view.trigger('eventResizeStart', this, event, ev, ui);
				},
				resize: function(ev, ui) {
					// don't rely on ui.size.height, doesn't take grid into account
					slotDelta = Math.round((Math.max(slotHeight, eventElement.height()) - ui.originalSize.height) / slotHeight);
					if (slotDelta != prevSlotDelta) {
						timeElement.text(
							formatDates(
								event.start,
								(!slotDelta && !event.end) ? null : // no change, so don't display time range
									addMinutes(view.eventEnd(event), options.slotMinutes*slotDelta),
								view.option('timeFormat')
							)
						);
						prevSlotDelta = slotDelta;
					}
				},
				stop: function(ev, ui) {
					view.trigger('eventResizeStop', this, event, ev, ui);
					if (slotDelta) {
						view.eventResize(this, event, 0, options.slotMinutes*slotDelta, ev, ui);
					}else{
						eventElement.css('z-index', 8);
						view.showEvents(event, eventElement);
						// BUG: if event was really short, need to put title back in span
					}
				}
			});
		}
	}
	
	
	
	
	/* Coordinate Utilities
	-----------------------------------------------------------------------------*/
	
	var coordinateGrid = new CoordinateGrid(function(rows, cols) {
		var e, n, p;
		bg.find('td').each(function(i, _e) {
			e = $(_e);
			n = e.offset().left;
			if (i) {
				p[1] = n;
			}
			p = [n];
			cols[i] = p;
		});
		p[1] = n + e.outerWidth();
		if (options.allDaySlot) {
			e = head.find('td');
			n = e.offset().top;
			rows[0] = [n, n+e.outerHeight()];
		}
		var bodyContentTop = bodyContent.offset().top;
		var bodyTop = body.offset().top;
		var bodyBottom = bodyTop + body.outerHeight();
		function constrain(n) {
			return Math.max(bodyTop, Math.min(bodyBottom, n));
		}
		for (var i=0; i<slotCnt; i++) {
			rows.push([
				constrain(bodyContentTop + slotHeight*i),
				constrain(bodyContentTop + slotHeight*(i+1))
			]);
		}
	});
	
	var hoverListener = new HoverListener(coordinateGrid);
	
	// get the Y coordinate of the given time on the given day (both Date objects)
	function timePosition(day, time) { // both date objects. day holds 00:00 of current day
		day = cloneDate(day, true);
		if (time < addMinutes(cloneDate(day), minMinute)) {
			return 0;
		}
		if (time >= addMinutes(cloneDate(day), maxMinute)) {
			return bodyContent.height();
		}
		var slotMinutes = options.slotMinutes,
			minutes = time.getHours()*60 + time.getMinutes() - minMinute,
			slotI = Math.floor(minutes / slotMinutes),
			slotTop = slotTopCache[slotI];
		if (slotTop === undefined) {
			slotTop = slotTopCache[slotI] = body.find('tr:eq(' + slotI + ') td div')[0].offsetTop;
		}
		return Math.max(0, Math.round(
			slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
		));
	}
	
	
	
	
	/* Selecting
	-----------------------------------------------------------------------------*/
	
	var selected = false;
	var daySelectionMousedown = selection_dayMousedown(
		view, hoverListener, cellDate, cellIsAllDay, renderDayOverlay, clearOverlay, reportSelection, unselect
	);
	
	function slotSelectionMousedown(ev) {
		if (view.option('selectable')) {
			unselect(ev);
			var _mousedownElement = this;
			var dates;
			hoverListener.start(function(cell, origCell) {
				clearSelection();
				if (cell && cell.col == origCell.col && !cellIsAllDay(cell)) {
					var d1 = cellDate(origCell);
					var d2 = cellDate(cell);
					dates = [
						d1,
						addMinutes(cloneDate(d1), options.slotMinutes),
						d2,
						addMinutes(cloneDate(d2), options.slotMinutes)
					].sort(cmp);
					renderSlotSelection(dates[0], dates[3]);
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						view.trigger('dayClick', _mousedownElement, dates[0], false, ev);
						// BUG: _mousedownElement will sometimes be the overlay
					}
					reportSelection(dates[0], dates[3], false, ev);
				}
			});
		}
	}
	
	view.select = function(startDate, endDate, allDay) {
		coordinateGrid.build();
		unselect();
		if (allDay) {
			if (options.allDaySlot) {
				if (!endDate) {
					endDate = cloneDate(startDate);
				}
				renderDayOverlay(startDate, addDays(cloneDate(endDate), 1));
			}
		}else{
			if (!endDate) {
				endDate = addMinutes(cloneDate(startDate), options.slotMinutes);
			}
			renderSlotSelection(startDate, endDate);
		}
		reportSelection(startDate, endDate, allDay);
	};
	
	function reportSelection(startDate, endDate, allDay, ev) {
		selected = true;
		view.trigger('select', view, startDate, endDate, allDay, ev);
	}
	
	function unselect(ev) {
		if (selected) {
			clearSelection();
			selected = false;
			view.trigger('unselect', view, ev);
		}
	}
	view.unselect = unselect;
	
	selection_unselectAuto(view, unselect);
	
	
	
	
	/* Selecting drawing utils
	-----------------------------------------------------------------------------*/
	
	var selectionHelper;
	
	function renderSlotSelection(startDate, endDate) {
		var helperOption = view.option('selectHelper');
		if (helperOption) {
			var col = dayDiff(startDate, view.visStart) * dis + dit;
			if (col >= 0 && col < colCnt) { // only works when times are on same day
				var rect = coordinateGrid.rect(0, col, 0, col, bodyContent); // only for horizontal coords
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
								.appendTo(bodyContent);
						}
					}else{
						selectionHelper = $(slotSegHtml(
							{
								title: '',
								start: startDate,
								end: endDate,
								className: [],
								editable: false
							},
							rect,
							'fc-event fc-event-vert fc-corner-top fc-corner-bottom '
						));
						if ($.browser.msie) {
							selectionHelper.find('span.fc-event-bg').hide(); // nested opacities mess up in IE, just hide
						}
						selectionHelper.css('opacity', view.option('dragOpacity'));
					}
					if (selectionHelper) {
						slotBind(selectionHelper);
						bodyContent.append(selectionHelper);
						setOuterWidth(selectionHelper, rect.width, true); // needs to be after appended
						setOuterHeight(selectionHelper, rect.height, true);
					}
				}
			}
		}else{
			renderSlotOverlay(startDate, endDate);
		}
	}
	
	function clearSelection() {
		clearOverlay();
		if (selectionHelper) {
			selectionHelper.remove();
			selectionHelper = null;
		}
	}
	
	
	
	
	/* Semi-transparent Overlay Helpers
	-----------------------------------------------------*/

	function renderDayOverlay(startDate, endDate) {
		var startCol, endCol;
		if (rtl) {
			startCol = dayDiff(endDate, view.visStart)*dis+dit+1;
			endCol = dayDiff(startDate, view.visStart)*dis+dit+1;
		}else{
			startCol = dayDiff(startDate, view.visStart);
			endCol = dayDiff(endDate, view.visStart);
		}
		startCol = Math.max(0, startCol);
		endCol = Math.min(colCnt, endCol);
		if (startCol < endCol) {
			dayBind(
				_renderDayOverlay(0, startCol, 0, endCol-1)
			);
		}
	}
	
	function _renderDayOverlay(col0, row0, col1, row1) {
		var rect = coordinateGrid.rect(col0, row0, col1, row1, head);
		return view.renderOverlay(rect, head);
	}

	function renderSlotOverlay(overlayStart, overlayEnd) {
		var dayStart = cloneDate(view.visStart);
		var dayEnd = addDays(cloneDate(dayStart), 1);
		for (var i=0; i<colCnt; i++) {
			var stretchStart = new Date(Math.max(dayStart, overlayStart));
			var stretchEnd = new Date(Math.min(dayEnd, overlayEnd));
			if (stretchStart < stretchEnd) {
				var col = i*dis+dit;
				var rect = coordinateGrid.rect(0, col, 0, col, bodyContent); // only use it for horizontal coords
				var top = timePosition(dayStart, stretchStart);
				var bottom = timePosition(dayStart, stretchEnd);
				rect.top = top;
				rect.height = bottom - top;
				slotBind(
					view.renderOverlay(rect, bodyContent)
				);
			}
			addDays(dayStart, 1);
			addDays(dayEnd, 1);
		}
	}
	
	function clearOverlay() {
		view.clearOverlays();
	}
	
	
	
	
	/* External dragging
	-----------------------------------------------------*/
	
	view.dragStart = function(_dragElement, ev, ui) {
		hoverListener.start(function(cell) {
			clearOverlay();
			if (cell) {
				if (cellIsAllDay(cell)) {
					_renderDayOverlay(cell.row, cell.col, cell.row, cell.col);
				}else{
					var d1 = cellDate(cell);
					var d2 = addMinutes(cloneDate(d1), options.defaultEventMinutes);
					renderSlotOverlay(d1, d2);
				}
			}
		}, ev);
	};
	
	view.dragStop = function(_dragElement, ev, ui) {
		var cell = hoverListener.stop();
		clearOverlay();
		if (cell) {
			view.trigger('drop', _dragElement, cellDate(cell), cellIsAllDay(cell), ev, ui);
		}
	};
	
	
	
	
	/* Date Utilities
	----------------------------------------------------*/
	
	function slotEventEnd(event) {
		if (event.end) {
			return cloneDate(event.end);
		}else{
			return addMinutes(cloneDate(event.start), options.defaultEventMinutes);
		}
	}
	
	function dayOfWeekCol(dayOfWeek) {
		return ((dayOfWeek - Math.max(firstDay,nwe)+colCnt) % colCnt)*dis+dit;
	}
	
	function cellDate(cell) {
		var d = addDays(cloneDate(view.visStart), cell.col*dis+dit);
		var slotIndex = cell.row;
		if (options.allDaySlot) {
			slotIndex--;
		}
		if (slotIndex >= 0) {
			addMinutes(d, minMinute + slotIndex*options.slotMinutes);
		}
		return d;
	}
	
	function cellIsAllDay(cell) {
		return options.allDaySlot && !cell.row;
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

