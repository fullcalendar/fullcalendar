/*
 * FullCalendar
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
 * Date:
 * Revision:
 */
 
(function($) {

	$.fn.fullCalendar = function(options) {
		
		if (typeof options == 'string') {
			var args = Array.prototype.slice.call(arguments, 1);
			this.each(function() {
				$.data(this, 'fullCalendar')[options].apply(this, args);
			});
			return this;
		}
		
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
		
		var tdTopBug, trTopBug, tbodyTopBug, sniffBugs = true;
		
		
		var eventSources;
		var eo = options.events;
		if (eo) {
			if (typeof eo == 'string' || $.isFunction(eo)) {
				eventSources = [eo];
			}else{
				var item = eo[0];
				if (item) {
					if (typeof item == 'string' || $.isFunction(item))
						eventSources = eo;
					else {
						eventSources = [eo];
					}
				}
			}
		}
		else eventSources = [];
		
		
		this.each(function() {
		
			var date = options.year ? new Date(options.year, options.month || 0, 1) : new Date();
			var start, end, today, numWeeks;
			var ignoreResizes = false;
			var events;
		
			function updateMonth() {
				clearEvents();
				render();
			}
		
			function today() {
				date = new Date();
				updateMonth();
			}
		
			function prevMonth() {
				addMonths(date, -1);
				updateMonth();
			}
		
			function nextMonth() {
				addMonths(date, 1);
				updateMonth();
			}
		
			function gotoMonth(year, month) {
				date = new Date(year, month, 1);
				updateMonth();
			}
			
			/*function updateEvent(event) {
			}
			
			function removeEvent(event) {
				var eventId = typeof event == 'object' ? event.id : event;
				var newEvents = [];
				for (var i=0; i<events.length; i++) {
					if (events[i]) {
						newEvents.push(events[i]);
					}
				}
				events = newEvents;
				renderEvents();
			}
			
			function removeEventsNoId() {
				var newEvents = [];
				for (var i=0; i<events.length; i++) {
					if (events[i].id || typeof events[i].id == 'number') {
						newEvents.push(events[i]);
					}
				}
				events = newEvents;
				renderEvents();
			}*/
			
			$.data(this, 'fullCalendar', {
				today: today,
				prevMonth: prevMonth,
				nextMonth: nextMonth,
				gotoMonth: gotoMonth,
				refresh: updateMonth
				//updateEvent: updateEvent,
				//removeEvent: removeEvent,
				//removeUnsavedEvents: removeUnsavedEvents
			});
			
			
			
			
			
		
			var titleElement, todayButton, monthElement, monthElementWidth;
			var header = $("<div class='full-calendar-header'/>").appendTo(this);
			
			if (bo) {
				var buttons = $("<div class='full-calendar-buttons'/>").appendTo(header);
				var prevButton, nextButton;
				if (bo == true || bo.today != false) {
					todayButton = $("<input type='button' class='full-calendar-today' value='today'/>")
						.click(today);
					if (typeof bo.today == 'string') todayButton.val(bo.today);
					buttons.append(todayButton);
				}
				if (bo == true || bo.prev != false) {
					prevButton = $("<input type='button' class='full-calendar-prev' value='" + (r2l ? "&gt;" : "&lt;") + "'/>")
						.click(prevMonth);
					if (typeof bo.prev == 'string') prevButton.val(bo.prev);
					if (r2l) buttons.prepend(prevButton);
					else buttons.append(prevButton);
				}
				if (bo == true || bo.next != false) {
					nextButton = $("<input type='button' class='full-calendar-next' value='" + (r2l ? "&lt;" : "&gt;") + "'/>")
						.click(nextMonth);
					if (typeof bo.next == 'string') nextButton.val(bo.next);
					if (r2l) buttons.prepend(nextButton);
					else buttons.append(nextButton);
				}
			}
			
			if (options.title !== false)
				titleElement = $("<h2 class='full-calendar-title'/>").appendTo(header);
		
			monthElement = $("<div class='full-calendar-month' style='position:relative'/>")
				.appendTo($("<div class='full-calendar-month-wrap'/>").appendTo(this));

			
			
			
			
			
			
			var thead, tbody, glass, monthTitle;
			
			function render() {
		
				ignoreResizes = true;
				date.setDate(1);
				clearTime(date);
				var year = date.getFullYear();
				var month = date.getMonth();
				monthTitle = formatTitle(date);
				if (titleElement) titleElement.text(monthTitle);
			
				clearTime(date);
				start = cloneDate(date);
				addDays(start, -start.getDay() + weekStart);
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
			
				if (!tbody) {
				
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
			
					var diff = numWeeks - tbody.find('tr').length;
					if (diff < 0) {
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
			
				resizeTable();
				
				if (sniffBugs) {
					var tr = tbody.find('tr');
					var td = tr.find('td');
					var trTop = tr.position().top;
					var tdTop = td.position().top;
					tdTopBug = tdTop < 0;
					trTopBug = trTop != tdTop;
					tbodyTopBug = tbody.position().top != trTop;
					sniffBugs = false;
				}
				
				
				events = [];
				var completed = eventSources.length;
				var reportEvents = function(a) {
					events = events.concat(cleanEvents(a));
					if (--completed == 0) {
						if (options.loading) options.loading(false);
						renderEvents(events);
					}
				};
				if (options.loading) options.loading(true);
				for (var i=0; i<eventSources.length; i++) {
					var src = eventSources[i];
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
					else if (src) {
						reportEvents(src);
					}
				}
				
				
				
				
				ignoreResizes = false;
			
				if (options.monthDisplay)
					options.monthDisplay(date.getFullYear(), date.getMonth(), monthTitle);
			
			}
			
			
			
			
			
			
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
					segs.sort(segSort);
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
							var element = $("<table class='event' />")
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
							if (event.cssClass) element.addClass(event.cssClass);
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
								}
							}
							if (options.eventDrop)
								options.eventDrop.call(this, event, delta, ev, ui);
							clearEvents();
							renderEvents();
						}
						dayOverlay.hide();
						if (options.eventDragStop)
							options.eventDragStop.call(this, event, ev, ui);
					}
				});
			}
		
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
		
			function dayDate(node) {
				var i, tds = tbody.get(0).getElementsByTagName('td');
				for (i=0; i<tds.length; i++) {
					if (tds[i] == node) break;
				}
				var d = cloneDate(start);
				return addDays(d, i);
			}
		
			function dayDelta(node1, node2) {
				var i1, i2, trs = tbody.get(0).getElementsByTagName('tr');
				for (var i=0; i<trs.length; i++) {
					var tr = trs[i];
					for (var j=0; j<7; j++) {
						var td = tr.childNodes[j];
						if (td == node1) i1 = i*7 + j*dis + dit;
						if (td == node2) i2 = i*7 + j*dis + dit;
					}
				}
				return i2 - i1;
			}
		
		
		
		
		
		
			function resizeTable() {
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
		
			function clearEvents() {
				for (var i=0; i<eventElements.length; i++)
					eventElements[i][1].remove();
				eventElements = [];
			}
			
			
			
			
			
			function buildEventText(event, element) {
				$("<span class='event-title' />")
					.text(event.title)
					.appendTo(element);
				var st = typeof event.showTime == 'undefined' ? showTime : event.showTime;
				if (st != false) {
					var h = event.start.getHours();
					var m = event.start.getMinutes();
					if (st == true || st == 'guess' && (h || m || event.end.getHours() || event.end.getMinutes())) {
						var s = '';
						for (var i=0; i<timeFormat.length; i++) {
							var c = timeFormat.charAt(i);
							if (c == 'a') s += h<12 ? 'am' : 'pm';
							else if (c == 'A') s += h<12 ? 'AM' : 'PM';
							else if (c == 'x') s += h<12 ? 'a' : 'p';
							else if (c == 'X') s += h<12 ? 'A' : 'P';
							else if (c == 'g') s += h%12 || 12;
							else if (c == 'G') s += h;
							else if (c == 'h') s += zeroPad(h%12 || 12);
							else if (c == 'H') s += zeroPad(h);
							else if (c == 'i') s += zeroPad(m);
							else s += c;
						}
						var timeElement = $("<span class='event-time' />");
						if (r2l) element.append(timeElement.text(' ' + s));
						else element.prepend(timeElement.text(s + ' '));
					}
				}
			}
			
			function formatTitle(d) {
				var m = d.getMonth();
				var s = '';
				for (var i=0; i<titleFormat.length; i++) {
					var c = titleFormat.charAt(i);
					if (c == 'F') s += monthNames[m];
					else if (c == 'm') s += zeroPad(m);
					else if (c == 'M') s += monthAbbrevs[m];
					else if (c == 'n') s += m;
					else if (c == 'Y') s += d.getFullYear();
					else if (c == 'y') s += (d.getFullYear()+'').substring(2);
					else s += c;
				}
				return s;
			}
		
		
		
		
			var e = this;
			var resizeID = 0;
			$(window).resize(function() {
				if (!ignoreResizes) {
					var rid = ++resizeID;
					setTimeout(function() {
						if (rid == resizeID) {
							if (monthElement.width() != monthElementWidth) {
								clearEvents();
								resizeTable();
								_renderEvents();
								if (options.resize) options.resize.call(e);
							}
						}
					}, 200);
				}
			});
		
			render();
			
		});
		
		return this;
	};
	
	
	
	// string utilities
	
	function zeroPad(n) {
		return (n < 10 ? '0' : '') + n;
	}
	
	
	
	// event utils
	
	function cleanEvents(events) {
		$.each(events, function(i, event) {
			if (event.date) event.start = event.date;
			event.start = cleanDate(event.start);
			event.end = cleanDate(event.end);
			if (!event.end) event.end = addDays(cloneDate(event.start), 1);
		});
		return events;
	}
	
	function segSort(a, b) {
		return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
	}
	
	
	
	// date utils
	
	var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var monthAbbrevs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var dayAbbrevs = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	
	function addMonths(d, n, keepTime) {
		d.setMonth(d.getMonth() + n);
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
	
	function cleanDate(d) {
		if (typeof d == 'string')
			return $.parseISO8601(d, true) || Date.parse(d) || new Date(parseInt(d));
		if (typeof d == 'number')
			return new Date(d * 1000);
		return d;
	}
	
	$.parseISO8601 = function(s, ignoreTimezone) {
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
	};

	$.ISO8601String = function(date) {
		// derived from http://delete.me.uk/2005/03/iso8601.html
		return date.getUTCFullYear() +
			"-" + zeroPad(date.getUTCMonth() + 1) +
			"-" + zeroPad(date.getUTCDate()) +
			"T" + zeroPad(date.getUTCHours()) +
			":" + zeroPad(date.getUTCMinutes()) +
			":" + zeroPad(date.getUTCSeconds()) +
			"Z";
	};

})(jQuery);
