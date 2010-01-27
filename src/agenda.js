
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

views.agendaWeek = function(element, options) {
	return new Agenda(element, options, {
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
			this.renderAgenda(
				options.weekends ? 7 : 5,
				this.option('columnFormat'),
				width, height,
				fetchEvents
			);
		}
	});
};

views.agendaDay = function(element, options) {
	return new Agenda(element, options, {
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
			this.renderAgenda(
				1,
				this.option('columnFormat'),
				width, height,
				fetchEvents
			);
		}
	});
};

function Agenda(element, options, methods) {

	var head, body, bodyContent, bodyTable, bg,
		colCnt,
		axisWidth, colWidth, slotHeight,
		viewWidth, viewHeight,
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
		// ...
		
	view = $.extend(this, viewMethods, methods, {
		renderAgenda: renderAgenda,
		renderEvents: renderEvents,
		rerenderEvents: rerenderEvents,
		clearEvents: clearEvents,
		updateSize: updateSize,
		shown: resetScroll,
		defaultEventEnd: function(event) {
			var start = cloneDate(event.start);
			if (event.allDay) {
				return start;
			}
			return addMinutes(start, options.defaultEventMinutes);
		}
	});
	view.init(element, options);
	
	
	
	/* Time-slot rendering
	-----------------------------------------------------------------------------*/
	
	
	element.addClass('fc-agenda').css('position', 'relative');
	if (element.disableSelection) {
		element.disableSelection();
	}
	
	function renderAgenda(c, colFormat, width, height, fetchEvents) {
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
							"<div class='fc-day-content'><div>&nbsp;</div></div></td>" +
						"<th class='" + tm + "-state-default'>&nbsp;</th>" +
					"</tr><tr class='fc-divider fc-last'><th colspan='" + (colCnt+2) + "' class='" +
						tm + "-state-default fc-leftmost'><div/></th></tr>";
			}
			s+= "</table></div>";
			head = $(s).appendTo(element);
			head.find('td').click(slotClick);
			
			// all-day event container
			daySegmentContainer = $("<div/>").appendTo(head);
			
			// body
			d = zeroDate();
			var maxd = addMinutes(cloneDate(d), maxMinute);
			addMinutes(d, minMinute);
			s = "<table>";
			for (i=0; d < maxd; i++) {
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
			
			// slot event container
			slotSegmentContainer = $("<div/>").appendTo(bodyContent);
			
			// background stripes
			d = cloneDate(d0);
			s = "<div class='fc-agenda-bg' style='position:absolute;z-index:1'>" +
				"<table style='width:100%;height:100%'><tr class='fc-first'>";
			for (i=0; i<colCnt; i++) {
				s += "<td class='fc-" +
					dayIDs[d.getDay()] + ' ' + // needs to be first
					tm + '-state-default ' +
					(i==0 ? 'fc-leftmost ' : '') +
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
		
		updateSize(width, height);
		resetScroll();
		fetchEvents(renderEvents);
		
	};
	
	
	function resetScroll() {
		var d0 = zeroDate(),
			scrollDate = cloneDate(d0);
		scrollDate.setHours(options.firstHour);
		var go = function() {
			body.scrollTop(timePosition(d0, scrollDate) + 1); // +1 for the border
				// TODO: +1 doesn't apply when firstHour=0
		}
		if ($.browser.opera) {
			setTimeout(go, 0); // opera 10 (and earlier?) needs this
		}else{
			go();
		}
	}
	
	
	function updateSize(width, height) {
		viewWidth = width;
		viewHeight = height;
		colContentPositions.clear();
		
		body.width(width);
		body.height(height - head.height());
		bodyTable.width('');
		
		var topTDs = head.find('tr:first th'),
			stripeTDs = bg.find('td'),
			contentWidth = slotSegmentContainer.width(); // body[0].clientWidth isn't reliable here in IE6
			
		bodyTable.width(contentWidth);
		
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
		colWidth = Math.floor((contentWidth - axisWidth) / colCnt);
		setOuterWidth(stripeTDs.slice(0, -1), colWidth);
		setOuterWidth(topTDs.slice(1, -2), colWidth);
		setOuterWidth(topTDs.slice(-2, -1), contentWidth - axisWidth - colWidth*(colCnt-1));
		
		bg.css({
			top: head.find('tr').height(),
			left: axisWidth,
			width: contentWidth - axisWidth,
			height: height
		});
		
		slotHeight = body.find('tr:first div').height() + 1;
	}
	
	function slotClick(ev) {
		var col = Math.floor((ev.pageX - bg.offset().left) / colWidth),
			date = addDays(cloneDate(view.visStart), dit + dis*col),
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
	
	
	
	/* Event Rendering
	-----------------------------------------------------------------------------*/
	
	function renderEvents(events) {
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
		renderDaySegs(stackSegs(view.sliceSegs(dayEvents, $.map(dayEvents, visEventEnd), view.visStart, view.visEnd)));
		renderSlotSegs(compileSlotSegs(slotEvents));
	}
	
	
	function rerenderEvents() {
		clearEvents();
		renderEvents(cachedEvents);
	}
	
	
	function clearEvents() {
		view._clearEvents(); // only clears the hashes
		daySegmentContainer.empty();
		slotSegmentContainer.empty();
	}
	
	
	function compileSlotSegs(events) {
		var d = addMinutes(cloneDate(view.visStart), minMinute),
			ends = $.map(events, visEventEnd),
			levels,
			segCols = [],
			i=0;
		for (; i<colCnt; i++) {
			levels = stackSegs(view.sliceSegs(events, ends, d, addMinutes(cloneDate(d), maxMinute-minMinute)));
			countForwardSegs(levels);
			segCols.push(levels);
			addDays(d, 1, true);
		}
		return segCols;
	}
	
	
	
	
	// renders 'all-day' events at the top
	
	function renderDaySegs(segRow) {
		if (options.allDaySlot) {
			_renderDaySegs(
				[segRow],
				view,
				axisWidth,
				viewWidth,
				function() {
					return head.find('tr.fc-all-day')
				},
				function(dayOfWeek) {
					return axisWidth + colContentPositions.left(day2col(dayOfWeek));
				},
				function(dayOfWeek) {
					return axisWidth + colContentPositions.right(day2col(dayOfWeek));
				},
				daySegmentContainer,
				bootstrapDayEventHandlers
			);
			updateSize(viewWidth, viewHeight); // might have pushed the body down, so resize
		}
	}
	
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segCols) {
			
		var event,
			className,
			top,
			bottom,
			leftmost,
			availWidth,
			forward,
			width,
			left,
			eventTops=[],
			eventLefts=[],
			eventOuterWidths=[],
			eventOuterHeights=[],
			html='',
			eventElements,
			eventElement,
			triggerRes,
			eventVSides=[],
			eventHSides=[],
			eventTitlePositions=[],
			height;
			
		// calculate desired position/dimensions, create html
		eachLeaf(segCols, function(l, seg, segI, levelI, colI) {
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
			leftmost = axisWidth + colContentPositions.left(colI*dis + dit);
			availWidth = axisWidth + colContentPositions.right(colI*dis + dit) - leftmost;
			availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
			forward = seg.forward || 0;
			if (levelI) {
				// indented and thin
				width = availWidth / (levelI + forward + 1);
			}else{
				if (forward) {
					// moderately wide, aligned left still
					width = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
				}else{
					// can be entire width, aligned left
					width = availWidth;
				}
			}
			left = leftmost +                                  // leftmost possible
				(availWidth / (levelI + forward + 1) * levelI) // indentation
				* dis + (rtl ? availWidth - width : 0);        // rtl
			eventTops[l] = top;
			eventLefts[l] = left;
			eventOuterWidths[l] = width;
			eventOuterHeights[l] = bottom - top;
			html +=
				"<div class='" + className + event.className.join(' ') + "' style='position:absolute;z-index:8;top:" + top + "px;left:" + left + "px'>" +
					"<a" + (event.url ? " href='" + htmlEscape(event.url) + "'" : '') + ">" +
						"<span class='fc-event-time'>" + htmlEscape(formatDates(event.start, event.end, view.option('timeFormat'))) + "</span>" +
						"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
						"<span class='fc-event-bg'/>" +
					"</a>" +
					((event.editable || event.editable == undefined && options.editable) && !options.disableResizing && $.fn.resizable ?
						"<div class='ui-resizable-handle ui-resizable-s'>=</div>"
						: '') +
				"</div>";
		});
		slotSegmentContainer.html(html);
		eventElements = slotSegmentContainer.children();
		
		// retrieve elements, run through eventRender callback, record outer-edge dimensions
		eachLeaf(segCols, function(l, seg) {
			event = seg.event;
			eventElement = eventElements.eq(l);
			triggerRes = view.trigger('eventRender', event, event, eventElement);
			if (triggerRes === false) {
				eventElement.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					eventElement.remove();
					eventElement = $(triggerRes)
						.css({
							position: 'absolute',
							top: eventTops[l],
							left: eventLefts[l]
						})
						.appendTo(slotSegmentContainer);
				}
				seg.element = eventElement;
				eventVSides[l] = vsides(eventElement, true);
				eventHSides[l] = hsides(eventElement, true);
				eventTitlePositions[l] = eventElement.find('span.fc-event-title').position();
				bootstrapSlotEventHandlers(event, seg, eventElement);
				view.reportEventElement(event, eventElement);
			}
		});
		
		// set all positions/dimensions at once
		eachLeaf(segCols, function(l, seg) {
			if (eventElement = seg.element) {
				eventElement
					.width(eventOuterWidths[l] - eventHSides[l])
					.height(height = eventOuterHeights[l] - eventVSides[l]);
				event = seg.event;
				if (eventTitlePositions[l] && height - eventTitlePositions[l].top < 10) {
					// not enough room for title, put it in the time header
					eventElement.find('span.fc-event-time')
						.text(formatDate(event.start, view.option('timeFormat')) + ' - ' + event.title);
					eventElement.find('span.fc-event-title')
						.remove();
				}
				view.trigger('eventAfterRender', event, event, eventElement);
			}
		});
					
	}
	
	
	
	
	
	function visEventEnd(event) { // returns exclusive 'visible' end, for rendering
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
	
	
	
	function bootstrapDayEventHandlers(event, seg, eventElement) {
		function mouseover(ev) {
			view.trigger('eventMouseover', this, event, ev);
			eventElement.unbind('mouseover', mouseover);
			setTimeout(function() { // because IE will immediately trigger eventElementHandlers's mouseover
				view.eventElementHandlers(event, eventElement);
				if (event.editable || event.editable == undefined && options.editable) {
					draggableDayEvent(event, eventElement, seg.isStart);
					if (seg.isEnd) {
						view.resizableDayEvent(event, eventElement, colWidth);
					}
				}
			},0);
		}
		eventElement.mouseover(mouseover);
	}
	
	
	
	function bootstrapSlotEventHandlers(event, seg, eventElement) {
		function mouseover(ev) {
			view.trigger('eventMouseover', this, event, ev);
			eventElement.unbind('mouseover', mouseover);
			setTimeout(function() { // because IE will immediately trigger eventElementHandlers's mouseover
				view.eventElementHandlers(event, eventElement);
				if (event.editable || event.editable == undefined && options.editable) {
					var timeElement = eventElement.find('span.fc-event-time');
					draggableSlotEvent(event, eventElement, timeElement);
					if (seg.isEnd) {
						resizableSlotEvent(event, eventElement, timeElement);
					}
				}
			},0);
		}
		eventElement.mouseover(mouseover);
	}

	
	
	
	/* Event Dragging
	-----------------------------------------------------------------------------*/
	
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement, isStart) {
		if (!options.disableDragging && eventElement.draggable) {
			var origPosition, origWidth,
				resetElement,
				allDay=true,
				matrix;
			eventElement.draggable({
				zIndex: 9,
				opacity: view.option('dragOpacity', 'month'), // use whatever the month view was using
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
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
										slotHeight * Math.round(
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
					view.trigger('eventDragStop', eventElement, event, ev, ui);
					var cell = matrix.cell,
						dayDelta = dis * (
							allDay ? // can't trust cell.colDelta when using slot grid
							(cell ? cell.colDelta : 0) :
							Math.floor((ui.position.left - origPosition.left) / colWidth)
						);
					if (!cell || !dayDelta && !cell.rowDelta) {
						// over nothing (has reverted)
						resetElement();
						if ($.browser.msie) {
							eventElement.css('filter', ''); // clear IE opacity side-effects
						}
						view.showEvents(event, eventElement);
					}else{
						eventElement.find('a').removeAttr('href'); // prevents safari from visiting the link
						view.eventDrop(
							this, event, dayDelta,
							allDay ? 0 : // minute delta
								Math.round((eventElement.offset().top - bodyContent.offset().top) / slotHeight)
								* options.slotMinutes
								+ minMinute
								- (event.start.getHours() * 60 + event.start.getMinutes()),
							allDay, ev, ui
						);
					}
				}
			});
		}
	}
	
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		if (!options.disableDragging && eventElement.draggable) {
			var origPosition,
				resetElement,
				prevSlotDelta, slotDelta,
				allDay=false,
				matrix;
			eventElement.draggable({
				zIndex: 9,
				scroll: false,
				grid: [colWidth, slotHeight],
				axis: colCnt==1 ? 'y' : false,
				opacity: view.option('dragOpacity'),
				revertDuration: options.dragRevertDuration,
				start: function(ev, ui) {
					view.hideEvents(event, eventElement);
					view.trigger('eventDragStart', eventElement, event, ev, ui);
					if ($.browser.msie) {
						eventElement.find('span.fc-event-bg').hide(); // nested opacities mess up in IE, just hide
					}
					origPosition = eventElement.position();
					resetElement = function() {
						// convert back to original slot-event
						if (allDay) {
							timeElement.css('display', ''); // show() was causing display=inline
							eventElement.draggable('option', 'grid', [colWidth, slotHeight]);
							allDay = false;
						}
					};
					prevSlotDelta = 0;
					matrix = new HoverMatrix(function(cell) {
						eventElement.draggable('option', 'revert', !cell);
						if (cell) {
							if (!cell.row && options.allDaySlot) { // over full days
								if (!allDay) {
									// convert to temporary all-day event
									allDay = true;
									timeElement.hide();
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
					if (options.allDaySlot) {
						matrix.row(head.find('td'));
					}
					bg.find('td').each(function() {
						matrix.col(this);
					});
					matrix.row(body);
					matrix.mouse(ev.pageX, ev.pageY);
				},
				drag: function(ev, ui) {
					slotDelta = Math.round((ui.position.top - origPosition.top) / slotHeight);
					if (slotDelta != prevSlotDelta) {
						if (!allDay) {
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
					view.trigger('eventDragStop', eventElement, event, ev, ui);
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
	
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	
	// get the Y coordinate of the given time on the given day (both Date objects)
	
	function timePosition(day, time) { // both date object. day holds 00:00 of current day
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
			td = body.find('tr:eq(' + slotI + ') td'),
			innerDiv = td.find('div');
		return Math.max(0, Math.round(
			innerDiv.position().top + topCorrect(td) - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
		));
	}
	
	
	
	function day2col(dayOfWeek) {
		return ((dayOfWeek - Math.max(firstDay,nwe)+colCnt) % colCnt)*dis+dit;
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

