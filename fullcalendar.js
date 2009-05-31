/*!
 * FullCalendar v1.2
 * http://arshaw.com/fullcalendar/
 *
 * use fullcalendar.css for basic styling
 * requires jQuery UI core and draggables ONLY if you plan to do drag & drop
 *
 * Copyright (c) 2009 Adam Shaw
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: 2009-05-31 15:56:02 -0500 (Sun, 31 May 2009)
 * Revision: 23
 */
 
(function($) {

	$.fn.fullCalendar = function(options) {
	
	
		//
		// Calls methods on a pre-existing instance
		//
		
		if (typeof options == 'string') {
			var args = Array.prototype.slice.call(arguments, 1);
			var res;
			this.each(function() {
				var r = $.data(this, 'fullCalendar')[options].apply(this, args);
				if (typeof res == 'undefined') res = r;
			});
			if (typeof res != 'undefined') {
				return res;
			}
			return this;
		}
		
		
		
		//
		// Process options
		//
		
		options = options || {};
		
		var r2l = options.rightToLeft;
		var dis, dit; // day index sign / translate
		if (r2l) {
			dis = -1;
			dit = 6;
			this.addClass('r2l');
		}else{
			dis = 1;
			dit = 0;
		}
		
		var showTime = typeof options.showTime == 'undefined' ? 'guess' : options.showTime;
		var bo = typeof options.buttons == 'undefined' ? true : options.buttons;
		var weekStart = (options.weekStart || 0) % 7;
		var timeFormat = options.timeFormat || 'gx';
		var titleFormat = options.titleFormat || (r2l ? 'Y F' : 'F Y');
		
		
		
		//
		// Rendering bug detection variables
		//
		
		var tdTopBug, trTopBug, tbodyTopBug, sniffBugs = true;
		
		
		
		this.each(function() {
		
		
			//
			// Instance variables
			//
			
			var date = options.year ? // holds the year & month of current month
				new Date(options.year, options.month || 0, 1) :
				new Date();
			var start, end; // first & last VISIBLE dates
			var today;
			var numWeeks;
			var ignoreResizes = false;
			
			var events = [];
			var eventSources = options.eventSources || [];
			if (options.events) eventSources.push(options.events);
			
			
			
			//
			// Month navigation functions
			//
		
			function refreshMonth() {
				clearEventElements();
				render();
			}
		
			function prevMonth() {
				addMonths(date, -1);
				refreshMonth();
			}
		
			function nextMonth() {
				addMonths(date, 1);
				refreshMonth();
			}
			
			function gotoToday() {
				date = new Date();
				refreshMonth();
			}
		
			function gotoMonth(year, month) {
				date = new Date(year, month, 1);
				refreshMonth();
			}
			
			function prevYear() {
				addYears(date, -1);
				refreshMonth();
			}
			
			function nextYear() {
				addYears(date, 1);
				refreshMonth();
			}
			
			
			
			//
			// Publicly accessible methods
			//
			
			$.data(this, 'fullCalendar', {
				refresh: refreshMonth,
				prevMonth: prevMonth,
				nextMonth: nextMonth,
				today: gotoToday,
				gotoMonth: gotoMonth,
				prevYear: prevYear,
				nextYear: nextYear,
				
				
				//
				// Event CRUD
				//
			
				addEvent: function(event) {
					events.push(normalizeEvent(event));
					clearEventElements();
					renderEvents();
				},
			
				updateEvent: function(event) {
					event.start = $.fullCalendar.parseDate(event.start);
					event.end = $.fullCalendar.parseDate(event.end);
					var startDelta = event.start - event._start;
					var msLength = event.end - event.start;
					event._start = cloneDate(event.start);
					for (var i=0; i<events.length; i++) {
						var e = events[i];
						if (e.id === event.id && e !== event) {
							e.start = new Date(e.start.getTime() + startDelta);
							e._start = cloneDate(e.start);
							e.end = new Date(e.start.getTime() + msLength);
							for (var k in event) {
								if (k && k != 'start' && k != 'end' && k.charAt(0) != '_') {
									e[k] = event[k];
								}
							}
						}
					}
					clearEventElements();
					renderEvents();
				},
			
				removeEvent: function(eventId) {
					if (typeof eventId == 'object') {
						eventId = eventId.id;
					}
					
					// remove from the 'events' array
					var newEvents = [];
					for (var i=0; i<events.length; i++) {
						if (events[i].id !== eventId) {
							newEvents.push(events[i]);
						}
					}
					events = newEvents;
					
					// remove from static event sources
					for (var i=0; i<eventSources.length; i++) {
						var src = eventSources[i];
						if (typeof src != 'string' && !$.isFunction(src)) {
							var newSrc = [];
							for (var j=0; j<src.length; j++) {
								if (src[j].id !== eventId) {
									newSrc.push(src[j]);
								}
							}
							eventSources[i] = newSrc;
						}
					}
					
					clearEventElements();
					renderEvents();
				},
			
				getEventsById: function(eventId) {
					var res = [];
					for (var i=0; i<events.length; i++) {
						if (events[i].id === eventId) {
							res.push(events[i]);
						}
					}
					return res;
				},
				
				
			
				//
				// Event Source CRUD
				//
			
				addEventSource: function(src) {
					eventSources.push(src);
					if (options.loading) {
						options.loading(true);
					}
					fetchEventSource(src, function() {
						if (options.loading) {
							options.loading(false);
						}
						clearEventElements();
						renderEvents();
					});
				},
			
				removeEventSource: function(src) {
			
					// remove from 'eventSources' array
					var newSources = [];
					for (var i=0; i<eventSources.length; i++) {
						if (src !== eventSources[i]) {
							newSources.push(eventSources[i]);
						}
					}
					eventSources = newSources;
				
					// remove events from 'events' array
					var newEvents = [];
					for (var i=0; i<events.length; i++) {
						if (events[i].source !== src) {
							newEvents.push(events[i]);
						}
					}
					events = newEvents;
				
					clearEventElements();
					renderEvents();
				}
				
			});
			
			
			
			
			
			/*******************************************************************/
			//
			//		Header & Table Rendering
			//
			/*******************************************************************/
			
			
			//
			// Build one-time DOM elements (header, month container)
			//
		
			var titleElement, todayButton, monthElement, monthElementWidth;
			var header = $("<div class='full-calendar-header'/>").appendTo(this);
			
			if (bo) { // "button options"
				var buttons = $("<div class='full-calendar-buttons'/>").appendTo(header);
				if (bo == true || bo.today !== false) {
					todayButton = $("<button class='today' />")
						.append($("<span />").html(
							typeof bo.today == 'string' ?
								bo.today : "today"))
						.click(gotoToday);
					buttons.append(todayButton);
				}
				if (bo.prevYear) {
					var b = $("<button class='prev-year' />")
						.append($("<span />")
							.html(typeof bo.prevYear == 'string' ?
								bo.prevYear : "&laquo;"))
						.click(prevYear);
					if (r2l) buttons.prepend(b);
					else buttons.append(b);
				}
				if (bo == true || bo.prevMonth !== false) {
					var b = $("<button class='prev-month' />")
						.append($("<span />")
							.html(typeof bo.prevMonth == 'string' ?
								bo.prevMonth : (r2l ? "&gt;" : "&lt;")))
						.click(prevMonth);
					if (r2l) buttons.prepend(b);
					else buttons.append(b);
				}
				if (bo == true || bo.nextMonth !== false) {
					var b = $("<button class='next-month' />")
						.append($("<span />").html(typeof bo.nextMonth == 'string' ?
							bo.nextMonth : (r2l ? "&lt;" : "&gt;")))
						.click(nextMonth);
					if (r2l) buttons.prepend(b);
					else buttons.append(b);
				}
				if (bo.nextYear) {
					var b = $("<button class='next-year' />")
						.append($("<span />").html(typeof bo.nextYear == 'string'
							? bo.nextYear : "&raquo;"))
						.click(nextYear);
					if (r2l) buttons.prepend(b);
					else buttons.append(b);
				}
			}
			
			if (options.title !== false) {
				titleElement = $("<h2 class='full-calendar-title'/>").appendTo(header);
			}
		
			monthElement = $("<div class='full-calendar-month' style='position:relative'/>")
				.appendTo($("<div class='full-calendar-month-wrap'/>").appendTo(this));
			
			
			//
			// Build the TABLE cells for the current month. (calls event fetching & rendering code)
			//
			
			var thead, tbody, glass;
			
			function render() {
		
				ignoreResizes = true;
				date.setDate(1);
				clearTime(date);
				var year = date.getFullYear();
				var month = date.getMonth();
				var monthTitle = $.fullCalendar.formatDate(date, titleFormat);
				if (titleElement) titleElement.text(monthTitle);
			
				clearTime(date);
				start = cloneDate(date);
				addDays(start, -((start.getDay() - weekStart + 7) % 7));
				end = cloneDate(date);
				addMonths(end, 1);
				addDays(end, (7 - end.getDay() + weekStart) % 7);
				numWeeks = Math.round((end.getTime() - start.getTime()) / 604800000);
				if (options.fixedWeeks != false) {
					addDays(end, (6 - numWeeks) * 7);
					numWeeks = 6;
				}
			
				today = clearTime(new Date());
				if (todayButton) {
					if (today.getFullYear() == year && today.getMonth() == month) {
						todayButton.css('visibility', 'hidden');
					}else{
						todayButton.css('visibility', 'visible');
					}
				}
				
				var dayNames = $.fullCalendar.dayNames;
				var dayAbbrevs = $.fullCalendar.dayAbbrevs;
			
				if (!tbody) {
				
					// first time, build all cells from scratch
				
					var table = $("<table style='width:100%'/>").appendTo(monthElement);
				
					thead = "<thead><tr>";
					for (var i=0; i<7; i++) {
						var j = (i * dis + dit + weekStart) % 7;
						thead +=
							"<th class='" + dayAbbrevs[j].toLowerCase() +
							(i==0 ? ' first' : '') + "'>" +
							(options.abbrevDayHeadings!=false ? dayAbbrevs[j] : dayNames[j]) +
							"</th>";
					}
					thead = $(thead + "</tr></thead>").appendTo(table);
					
					tbody = "<tbody>";
					var d = cloneDate(start);
					for (var i=0; i<numWeeks; i++) {
						tbody += "<tr class='week"+(i+1)+"'>";
						var tds = "";
						for (var j=0; j<7; j++) {
							var s =
								"<td class='day " + dayAbbrevs[(j + weekStart) % 7].toLowerCase() +
								(j==dit ? ' first' : '') +
								(d.getMonth() == month ? '' : ' other-month') +
								(d.getTime() == today.getTime() ? ' today' : '') +
								"'><div class='day-number'>" + d.getDate() + "</div>" +
								"<div class='day-content'><div/></div></td>";
							if (r2l) tds = s + tds;
							else tds += s;
							addDays(d, 1);
						}
						tbody += tds + "</tr>";
					}
					tbody = $(tbody + "</tbody>").appendTo(table);
						
					// a protective coating over the TABLE
					// intercepts mouse clicks and prevents text-selection
					glass = $("<div style='position:absolute;top:0;left:0;z-index:1;width:100%' />")
						.appendTo(monthElement)
						.click(function(ev, ui) {
							if (options.dayClick) {
								buildDayGrid();
								var td = dayTD(ev.pageX, ev.pageY);
								if (td) return options.dayClick.call(td, dayDate(td));
							}
						});
				
				}else{
				
					// NOT first time, reuse as many cells as possible
			
					var diff = numWeeks - tbody.find('tr').length;
					if (diff < 0) {
						// remove extra rows
						tbody.find('tr:gt(' + (numWeeks-1) + ')').remove();
					}
					else if (diff > 0) {
						var trs = "";
						for (var i=0; i<diff; i++) {
							trs += "<tr class='week"+(numWeeks+i)+"'>";
							for (var j=0; j<7; j++) {
								trs +=
									"<td class='day " +
									dayAbbrevs[(j * dis + dit + weekStart) % 7].toLowerCase() +
									(j==0 ? ' first' : '') + "'>" +
									"<div class='day-number'></div>" +
									"<div class='day-content'><div/></div>" +
									"</td>";
							}
							trs += "</tr>";
						}
						if (trs) tbody.append(trs);
					}
				
					// re-label and re-class existing cells
					var d = cloneDate(start);
					tbody.find('tr').each(function() {
						for (var i=0; i<7; i++) {
							var td = this.childNodes[i * dis + dit];
							if (d.getMonth() == month) {
								$(td).removeClass('other-month');
							}else{
								$(td).addClass('other-month');
							}
							if (d.getTime() == today.getTime()) {
								$(td).addClass('today');
							}else{
								$(td).removeClass('today');
							}
							$(td.childNodes[0]).text(d.getDate());
							addDays(d, 1);
						}
					});
			
				}
			
				setCellSizes();
				
				if (sniffBugs) {
					// nasty bugs in opera 9.25
					// position() returning relative to direct parent
					var tr = tbody.find('tr');
					var td = tr.find('td');
					var trTop = tr.position().top;
					var tdTop = td.position().top;
					tdTopBug = tdTop < 0;
					trTopBug = trTop != tdTop;
					tbodyTopBug = tbody.position().top != trTop;
					sniffBugs = false;
				}
				
				fetchEvents(renderEvents);
				
				ignoreResizes = false;
			
				if (options.monthDisplay)
					options.monthDisplay(date.getFullYear(), date.getMonth(), monthTitle);
			
			}
			
			
			//
			// Adjust dimensions of the cells, based on container's width
			//
			
			function setCellSizes() {
				var tbodyw = tbody.width();
				var cellw = Math.floor(tbodyw / 7);
				var cellh = Math.round(cellw * .85);
				thead.find('th')
					.filter(':lt(6)').width(cellw).end()
					.filter(':eq(6)').width(tbodyw - cellw*6);
				tbody.find('td').height(cellh);
				glass.height(monthElement.height());
				monthElementWidth = monthElement.width();
			}
			
			
			
			
			
			
			/*******************************************************************/
			//
			//		Event Rendering
			//
			/*******************************************************************/
			
			
			//
			// Render the 'events' array. First, break up into segments
			//
			
			var eventMatrix = [];
		
			function renderEvents() {
				eventMatrix = [];
				var i = 0;
				var ws = cloneDate(start);
				var we = addDays(cloneDate(ws), 7);
				while (ws.getTime() < end.getTime()) {
					var segs = [];
					$.each(events, function(j, event) {
						if (event.end.getTime() > ws.getTime() && event.start.getTime() < we.getTime()) {
							var ss, se, isStart, isEnd;
							if (event.start.getTime() < ws.getTime()) {
								ss = cloneDate(ws);
								isStart = false;
							}else{
								ss = cloneDate(event.start);
								isStart = true;
							}
							if (event.end.getTime() > we.getTime()) {
								se = cloneDate(we);
								isEnd = false;
							}else{
								se = cloneDate(event.end);
								isEnd = true;
							}
							ss = clearTime(ss);
							se = clearTime((se.getHours()==0 && se.getMinutes()==0) ? se : addDays(se, 1));
							segs.push({
								event: event, start: ss, end: se,
								isStart: isStart, isEnd: isEnd, msLength: se - ss
							});
						}
					});
					segs.sort(segCmp);
					var levels = [];
					$.each(segs, function(j, seg) {
						var l = 0; // level index
						while (true) {
							var collide = false;
							if (levels[l]) {
								for (var k=0; k<levels[l].length; k++) {
									if (seg.end.getTime() > levels[l][k].start.getTime() &&
										seg.start.getTime() < levels[l][k].end.getTime()) {
											collide = true;
											break;
										}
								}
							}
							if (collide) {
								l++;
								continue;
							}else{
								break;
							}
						}
						if (levels[l]) levels[l].push(seg);
						else levels[l] = [seg];
					});
					eventMatrix[i] = levels;
					addDays(ws, 7);
					addDays(we, 7);
					i++;
				}
				_renderEvents();
			}
		
		
			//
			// Do the REAL rendering of the segments
			//
		
			var eventElements = []; // [[event, element], ...]
		
			function _renderEvents() {
				for (var i=0; i<eventMatrix.length; i++) {
					var levels = eventMatrix[i];
					var tr = tbody.find('tr:eq('+i+')');
					var td = tr.find('td:first');
					var innerDiv = td.find('div.day-content div').css('position', 'relative');
					var top = innerDiv.position().top;
					if (tdTopBug) top -= td.position().top;
					if (trTopBug) top += tr.position().top;
					if (tbodyTopBug) top += tbody.position().top;
					var height = 0;
					for (var j=0; j<levels.length; j++) {
						var segs = levels[j];
						var maxh = 0;
						for (var k=0; k<segs.length; k++) {
							var seg = segs[k];
							var event = seg.event;
							var left1, left2, roundW, roundE;
							if (r2l) {
								left2 = seg.isStart ?
									tr.find('td:eq('+((seg.start.getDay()-weekStart+7)%7*dis+dit)+') div.day-content div') :
									tbody;
								left1 = seg.isEnd ?
									tr.find('td:eq('+((seg.end.getDay()+6-weekStart)%7*dis+dit)+') div.day-content div').position().left :
									tbody.position().left;
								roundW = seg.isEnd;
								roundE = seg.isStart;
							}else{
								left1 = seg.isStart ?
									tr.find('td:eq('+((seg.start.getDay()-weekStart+7)%7)+') div.day-content div').position().left :
									tbody.position().left;
								left2 = seg.isEnd ?
									tr.find('td:eq('+((seg.end.getDay()+6-weekStart)%7)+') div.day-content div') :
									tbody;
								roundW = seg.isStart;
								roundE = seg.isEnd;
							}
							left2 = left2.position().left + left2.width();
							var cl = event.className;
							if (typeof cl == 'string') {
								cl = ' ' + cl;
							}
							else if (typeof cl == 'object') {
								cl = ' ' + cl.join(' ');
							}
							var element = $("<table class='event" + (cl || '') + "' />")
								.append("<tr>" +
									(roundW ? "<td class='nw'/>" : '') +
									"<td class='n'/>" +
									(roundE ? "<td class='ne'/>" : '') + "</tr>")
								.append("<tr>" +
									(roundW ? "<td class='w'/>" : '') +
									"<td class='c'/>" +
									(roundE ? "<td class='e'/>" : '') + "</tr>")
								.append("<tr>" +
									(roundW ? "<td class='sw'/>" : '') +
									"<td class='s'/>" +
									(roundE ? "<td class='se'/>" : '') + "</tr>");
							buildEventText(event, element.find('td.c'));
							if (options.eventRender) {
								var res = options.eventRender(event, element);
								if (typeof res != 'undefined') {
									if (res === false) continue;
									if (res !== true) element = $(res);
								}
							}
							element
								.css({
									position: 'absolute',
									top: top,
									left: left1,
									width: left2 - left1,
									'z-index': 3
								})
								.appendTo(monthElement);
							initEventElement(event, element);
							var h = element.outerHeight({margin:true});
							if (h > maxh) maxh = h;
						}
						height += maxh;
						top += maxh;
					}
					innerDiv.height(height);
				}
			}
			
			
			//
			// create the text-contents of an event segment
			//
			
			function buildEventText(event, element) {
				$("<span class='event-title' />")
					.text(event.title)
					.appendTo(element);
				var st = typeof event.showTime == 'undefined' ? showTime : event.showTime;
				if (st != false) {
					if (st == true || st == 'guess' &&
						(event.start.getHours() || event.start.getMinutes() ||
						 event.end.getHours() || event.end.getMinutes())) {
							var timeStr = $.fullCalendar.formatDate(event.start, timeFormat);
							var timeElement = $("<span class='event-time' />");
							if (r2l) element.append(timeElement.text(' ' + timeStr));
							else element.prepend(timeElement.text(timeStr + ' '));
						}
				}
			}
		
		
			//
			// Attach event handlers to an event segment
			//
		
			function initEventElement(event, element) {
				element.click(function(ev) {
					if (!element.hasClass('ui-draggable-dragging')) {
						if (options.eventClick) {
							var res = options.eventClick.call(this, event, ev);
							if (res === false) return false;
						}
						if (event.url) window.location.href = event.url;
					}
				});
				if (options.eventMouseover)
					element.mouseover(function(ev) {
						options.eventMouseover.call(this, event, ev);
					});
				if (options.eventMouseout)
					element.mouseout(function(ev) {
						options.eventMouseout.call(this, event, ev);
					});
				if (typeof event.draggable != 'undefined') {
					if (event.draggable)
						draggableEvent(event, element);
				}
				else if (options.draggable) {
					draggableEvent(event, element);
				}
				eventElements.push([event, element]);
			}
			
			
			//
			// Remove all event segments from DOM
			//
			
			function clearEventElements() {
				for (var i=0; i<eventElements.length; i++)
					eventElements[i][1].remove();
				eventElements = [];
			}
		
		
		
		
		
		
		
			/*******************************************************************/
			//
			//		Drag & Drop		(and cell-coordinate stuff)
			//
			/*******************************************************************/
			
		
			//
			// Attach jQuery UI draggable
			//
		
			var dragStartTD, dragTD;
			var dayOverlay;
		
			function draggableEvent(event, element) {
				element.draggable({
					zIndex: 4,
					delay: 50,
					opacity: options.eventDragOpacity,
					revertDuration: options.eventRevertDuration,
					start: function(ev, ui) {
						// hide other elements with same event
						for (var i=0; i<eventElements.length; i++) {
							var x = eventElements[i];
							var xevent = x[0];
							if (x[1].get(0) != this && (xevent == event ||
								typeof xevent.id != 'undefined' && xevent.id == event.id))
									x[1].hide();
						}
						if (!dayOverlay)
							dayOverlay =
								$("<div class='over-day' style='position:absolute;z-index:2' />")
									.appendTo(monthElement);
						buildDayGrid();
						dragTD = dragStartTD = null;
						eventDrag(this, ev, ui);
						if (options.eventDragStart)
							options.eventDragStart.call(this, event, ev, ui);
					},
					drag: function(ev, ui) {
						eventDrag(this, ev, ui);
					},
					stop: function(ev, ui) {
						if (!dragTD || dragTD == dragStartTD) {
							// show all events
							for (var i=0; i<eventElements.length; i++)
								eventElements[i][1].show();
						}else{
							var delta = dayDelta(dragStartTD, dragTD);
							for (var i=0; i<events.length; i++) {
								if (event == events[i] || typeof event.id != 'undefined' && event.id == events[i].id) {
									addDays(events[i].start, delta, true);
									addDays(events[i].end, delta, true);
									events[i]._start = cloneDate(events[i].start);
								}
							}
							if (options.eventDrop) {
								options.eventDrop.call(this, event, delta, ev, ui);
							}
							clearEventElements();
							renderEvents();
						}
						dayOverlay.hide();
						if (options.eventDragStop) {
							options.eventDragStop.call(this, event, ev, ui);
						}
					}
				});
			}
			
			
			//
			// Called DURING dragging, on every mouse move
			//
		
			function eventDrag(node, ev, ui) {
				var oldTD = dragTD;
				dragTD = dayTD(ev.pageX, ev.pageY);
				if (!dragStartTD) dragStartTD = dragTD;
				if (dragTD != oldTD) {
					if (dragTD) {
						$(node).draggable('option', 'revert', dragTD==dragStartTD);
						dayOverlay.css({
							top: currTDY,
							left: currTDX,
							width: currTDW,
							height: currTDH,
							display: 'block'
						});
					}else{
						$(node).draggable('option', 'revert', true);
						dayOverlay.hide();
					}
				}
			}
		
		
			//
			// Record positions & dimensions of each TD
			//
		
			var dayX, dayY, dayX0, dayY0;
			var currTD, currR, currC;
			var currTDX, currTDY, currTDW, currTDH;
		
			function buildDayGrid() {
				var tr, td, o=monthElement.offset();
				dayX0 = o.left;
				dayY0 = o.top;
				dayY = [];
				tbody.find('tr').each(function() {
					tr = $(this);
					dayY.push(tr.position().top +
						(trTopBug ? tbody.position().top : 0));
				});
				dayY.push(dayY[dayY.length-1] + tr.height());
				dayX = [];
				tr.find('td').each(function() {
					td = $(this);
					dayX.push(td.position().left);
				});
				dayX.push(dayX[dayX.length-1] + td.width());
				currTD = null;
			}
			
			//
			// Returns TD underneath coordinate (optimized)
			//
		
			function dayTD(x, y) {
				var r=-1, c=-1;
				var rmax=dayY.length-1, cmax=dayX.length-1;
				while (r < rmax && y > dayY0 + dayY[r+1]) r++;
				while (c < cmax && x > dayX0 + dayX[c+1]) c++;
				if (r < 0 || r >= rmax || c < 0 || c >= cmax)
					return currTD = null;
				else if (!currTD || r != currR || c != currC) {
					currR = r;
					currC = c;
					currTD = tbody.find('tr:eq('+r+') td:eq('+c+')').get(0);
					currTDX = dayX[c];
					currTDY = dayY[r];
					currTDW = dayX[c+1] - currTDX;
					currTDH = dayY[r+1] - currTDY;
					return currTD;
				}
				return currTD;
			}
			
			//
			// Get a TD's date
			//
		
			function dayDate(td) {
				var i, trs = tbody.get(0).getElementsByTagName('tr');
				for (i=0; i<trs.length; i++) {
					var tr = trs[i];
					for (var j=0; j<7; j++) {
						if (tr.childNodes[j] == td) {
							var d = cloneDate(start);
							return addDays(d, i*7 + j*dis + dit);
						}
					}
				}
			}
			
			//
			// Return the # of days between 2 TD's
			//
		
			function dayDelta(td1, td2) {
				var i1, i2, trs = tbody.get(0).getElementsByTagName('tr');
				for (var i=0; i<trs.length; i++) {
					var tr = trs[i];
					for (var j=0; j<7; j++) {
						var td = tr.childNodes[j];
						if (td == td1) i1 = i*7 + j*dis + dit;
						if (td == td2) i2 = i*7 + j*dis + dit;
					}
				}
				return i2 - i1;
			}
			
			
			
			
			
			
			
			/*******************************************************************/
			//
			//		Event Sources & Fetching
			//
			/*******************************************************************/
			
			
			//
			// Fetch from ALL sources. Clear 'events' array and populate
			//
			
			function fetchEvents(callback) {
				events = [];
				if (eventSources.length > 0) {
					var queued = eventSources.length;
					var sourceDone = function() {
						if (--queued == 0) {
							if (options.loading) {
								options.loading(false);
							}
							if (callback) {
								callback(events);
							}
						}
					};
					if (options.loading) {
						options.loading(true);
					}
					for (var i=0; i<eventSources.length; i++) {
						fetchEventSource(eventSources[i], sourceDone);
					}
				}
			}
			
			
			//
			// Fetch from a particular source. Append to the 'events' array
			//
			
			function fetchEventSource(src, callback) {
				var y = date.getFullYear();
				var m = date.getMonth();
				var reportEvents = function(a) {
					if (date.getFullYear() == y && date.getMonth() == m) {
						for (var i=0; i<a.length; i++) {
							normalizeEvent(a[i]);
							a[i].source = src;
						}
						events = events.concat(a);
					}
					if (callback) {
						callback(a);
					}
				};
				if (typeof src == 'string') {
					var params = {};
					params[options.startParam || 'start'] = Math.round(start.getTime() / 1000);
					params[options.endParam || 'end'] = Math.round(end.getTime() / 1000);
					params[options.cacheParam || '_'] = (new Date()).getTime();
					$.getJSON(src, params, reportEvents);
				}
				else if ($.isFunction(src)) {
					src(start, end, reportEvents);
				}
				else {
					reportEvents(src);
				}
			}
			
			
			
			
			
			
			/*******************************************************************/
			//
			//		Begin "Main" Execution
			//
			/*******************************************************************/
		
			var e = this;
			var resizeID = 0;
			$(window).resize(function() {   // re-render table on window resize
				if (!ignoreResizes) {
					var rid = ++resizeID;   // add a delay
					setTimeout(function() {
						if (rid == resizeID) {
							// if the month width changed
							if (monthElement.width() != monthElementWidth) {
								clearEventElements();
								setCellSizes();
								_renderEvents();
								if (options.resize) options.resize.call(e);
							}
						}
					}, 200);
				}
			});
		
			render(); // let's begin...
			
			
			
			
		});
		
		return this;
	};
	
	
	
	
	/***************************************************************************/
	//
	//		Utilities
	//
	/***************************************************************************/
	
	
	//
	// event utils
	//
	
	function normalizeEvent(event) {
		if (event.date) {
			event.start = event.date;
			delete event.date;
		}
		event.start = $.fullCalendar.parseDate(event.start);
		event._start = cloneDate(event.start);
		event.end = $.fullCalendar.parseDate(event.end);
		if (!event.end) event.end = addDays(cloneDate(event.start), 1);
		return event;
	}
	
	function segCmp(a, b) {
		return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
	}
	
	
	//
	// string utils
	//
	
	function zeroPad(n) {
		return (n < 10 ? '0' : '') + n;
	}
	
	
	//
	// date utils
	//
	
	function addMonths(d, n, keepTime) {
		d.setMonth(d.getMonth() + n);
		if (keepTime) return d;
		return clearTime(d);
	}
	
	function addYears(d, n, keepTime) {
		d.setFullYear(d.getFullYear() + n);
		if (keepTime) return d;
		return clearTime(d);
	}
	
	function addDays(d, n, keepTime) {
		d.setDate(d.getDate() + n);
		if (keepTime) return d;
		return clearTime(d);
	}
	
	function clearTime(d) {
		d.setHours(0); 
		d.setMinutes(0);
		d.setSeconds(0); 
		d.setMilliseconds(0);
		return d;
	}
	
	function cloneDate(d) {
		return new Date(+d);
	}
	
	
	//
	// globally accessible date formatting & parsing
	//
	
	$.fullCalendar = {
	
		monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		monthAbbrevs: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		dayAbbrevs: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
	
		formatDate: function(d, format) {
			var f = $.fullCalendar.dateFormatters;
			var s = '';
			for (var i=0; i<format.length; i++) {
				var c = format.charAt(i);
				if (f[c]) {
					s += f[c](d);
				}else{
					s += c;
				}
			}
			return s;
		},
		
		dateFormatters: {
			'a': function(d) { return d.getHours() < 12 ? 'am' : 'pm' },
			'A': function(d) { return d.getHours() < 12 ? 'AM' : 'PM' },
			'x': function(d) { return d.getHours() < 12 ? 'a' : 'p' },
			'X': function(d) { return d.getHours() < 12 ? 'A' : 'P' },
			'g': function(d) { return d.getHours() % 12 || 12 },
			'G': function(d) { return d.getHours() },
			'h': function(d) { return zeroPad(d.getHours() %12 || 12) },
			'H': function(d) { return zeroPad(d.getHours()) },
			'i': function(d) { return zeroPad(d.getMinutes()) },
			'F': function(d) { return $.fullCalendar.monthNames[d.getMonth()] },
			'm': function(d) { return zeroPad(d.getMonth() + 1) },
			'M': function(d) { return $.fullCalendar.monthAbbrevs[d.getMonth()] },
			'n': function(d) { return d.getMonth() + 1 },
			'Y': function(d) { return d.getFullYear() },
			'y': function(d) { return (d.getFullYear()+'').substring(2) },
			'c': function(d) {
				// ISO8601. derived from http://delete.me.uk/2005/03/iso8601.html
				return d.getUTCFullYear() +
					"-" + zeroPad(d.getUTCMonth() + 1) +
					"-" + zeroPad(d.getUTCDate()) +
					"T" + zeroPad(d.getUTCHours()) +
					":" + zeroPad(d.getUTCMinutes()) +
					":" + zeroPad(d.getUTCSeconds()) +
					"Z";
			}
		},
		
		parseDate: function(s) {
			if (typeof s == 'object')
				return s; // already a Date object
			if (typeof s == 'undefined')
				return null;
			if (typeof s == 'number')
				return new Date(s * 1000);
			return $.fullCalendar.parseISO8601(s, true) ||
			       Date.parse(s) ||
			       new Date(parseInt(s) * 1000);
		},
		
		parseISO8601: function(s, ignoreTimezone) {
			// derived from http://delete.me.uk/2005/03/iso8601.html
			var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
				"(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
				"(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
			var d = s.match(new RegExp(regexp));
			if (!d) return null;
			var offset = 0;
			var date = new Date(d[1], 0, 1);
			if (d[3]) { date.setMonth(d[3] - 1); }
			if (d[5]) { date.setDate(d[5]); }
			if (d[7]) { date.setHours(d[7]); }
			if (d[8]) { date.setMinutes(d[8]); }
			if (d[10]) { date.setSeconds(d[10]); }
			if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
			if (!ignoreTimezone) {
				if (d[14]) {
					offset = (Number(d[16]) * 60) + Number(d[17]);
					offset *= ((d[15] == '-') ? 1 : -1);
				}
				offset -= date.getTimezoneOffset();
			}
			return new Date(Number(date) + (offset * 60 * 1000));
		}
	
	};
	
	// additional FullCalendar "extensions" should be attached to $.fullCalendar

})(jQuery);
