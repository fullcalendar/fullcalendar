	
function ResourceEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.clearEvents = clearEvents;
	t.bindDaySeg = bindDaySeg;
	t.resizableResourceEvent = resizableResourceEvent;
	
	
	// imports
	DayEventRenderer.call(t);
	var allDayBounds = t.allDayBounds;
	var colContentLeft = t.colContentLeft;
	var colContentRight = t.colContentRight;
	var allDayRow = t.allDayRow;
	var dayOfWeekCol = t.dayOfWeekCol;
	var opt = t.opt;
	var trigger = t.trigger;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var reportEventClear = t.reportEventClear;
	var eventElementHandlers = t.eventElementHandlers;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getHoverListener = t.getHoverListener;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var getRowCnt = t.getRowCnt;
	var getColCnt = t.getColCnt;
	var getViewName = t.getViewName;
	var dateCol = t.dateCol;
	var dateCell = t.dateCell;
	var clearSelection = t.clearSelection;
	var eventEnd = t.eventEnd;
	var eventResize = t.eventResize;
	var normalizeEvent = t.normalizeEvent; // in EventManager
	var timeOfDayCol = t.timeOfDayCol;
	var reportEventChange = t.reportEventChange;
	var reportEventElement = t.reportEventElement;
	var eventDrop = t.eventDrop;
	var getSnapWidth = t.getSnapWidth;
	var getSnapMinutes = t.getSnapMinutes;
	var datePositionLeft = t.datePositionLeft;
	var isResourceEditable = t.isResourceEditable;
	
	
	/* Rendering
	--------------------------------------------------------------------*/
	
	
	function renderEvents(events, modifiedEventId) {
		renderDaySegs(compileSegs(events), modifiedEventId);
	}
	
	
	function renderDaySegs(segs, modifiedEventId) {
		var segmentContainer = getDaySegmentContainer();
		var rowDivs;
		var rowCnt = getRowCnt();
		var colCnt = getColCnt();
		var i = 0;
		var rowI;
		var levelI;
		var colHeights;
		var j;
		var segCnt = segs.length;
		var seg;
		var top;
		var k;
		var snapMinutes = getSnapMinutes();
		segmentContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
		daySegElementResolve(segs, segmentContainer.children());
		daySegElementReport(segs);
		daySegHandlers(segs, segmentContainer, modifiedEventId);
		daySegCalcHSides(segs);
		daySegSetWidths(segs);
		daySegCalcHeights(segs);
		rowDivs = getRowDivs();
		// set row heights, calculate event tops (in relation to row top)
		for (rowI=0; rowI<rowCnt; rowI++) {
			levelI = 0;
			colHeights = [];
			for (j=0; j<colCnt*snapMinutes; j++) {
				colHeights[j] = 0;
			}
			while (i<segCnt && (seg = segs[i]).row == rowI) {
				// loop through segs in a row
				top = arrayMax(colHeights.slice(seg.startCol, seg.endCol));
				seg.top = top;
				top += seg.outerHeight;
				for (k=seg.startCol; k<seg.endCol; k++) {
					colHeights[k] = top;
				}
				i++;
			}
			rowDivs[rowI].height(arrayMax(colHeights));
		}
		daySegSetTops(segs, getRowTops(rowDivs));
	}
	

	function renderTempDaySegs(segs, adjustRow, adjustTop) {
		var tempContainer = $("<div/>");
		var elements;
		var segmentContainer = getDaySegmentContainer();
		var i;
		var segCnt = segs.length;
		var element;

		tempContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
		elements = tempContainer.children();
		segmentContainer.append(elements);
		daySegElementResolve(segs, elements);
		daySegCalcHSides(segs);
		daySegSetWidths(segs);
		daySegCalcHeights(segs);
		daySegSetTops(segs, getRowTops(getRowDivs()));
		elements = [];
		for (i=0; i<segCnt; i++) {
			element = segs[i].element;
			if (element) {
				if (segs[i].row === adjustRow) {
					element.css('top', adjustTop);
				}
				elements.push(element[0]);
			}
		}
		return $(elements);
	}
	
	function daySegElementResolve(segs, elements) { // sets seg.element
		var i;
		var segCnt = segs.length;
		var seg;
		var event;
		var element;
		var triggerRes;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			element = $(elements[i]); // faster than .eq()
			triggerRes = trigger('eventRender', event, event, element);
			if (triggerRes === false) {
				element.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					triggerRes = $(triggerRes)
						.css({
							position: 'absolute',
							left: seg.left
						});
					element.replaceWith(triggerRes);
					element = triggerRes;
				}
				seg.element = element;
			}
		}
	}
	
	
	function daySegElementReport(segs) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				reportEventElement(seg.event, element);
			}
		}
	}
	
	
	function daySegHandlers(segs, segmentContainer, modifiedEventId) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var event;
		// retrieve elements, run through eventRender callback, bind handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				event = seg.event;
				if (event._id === modifiedEventId) {
					bindDaySeg(event, element, seg);
				}else{
					element[0]._fci = i; // for lazySegBind
				}
			}
		}
		lazySegBind(segmentContainer, segs, bindDaySeg);
	}
	
	
	function daySegCalcHSides(segs) { // also sets seg.key
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var key, val;
		var hsideCache = {};
		// record event horizontal sides
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				seg.hsides = hsides(element, true);
			}
		}
	}
	
	
	function daySegSetWidths(segs) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				element[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
			}
		}
	}
	
	
	function daySegCalcHeights(segs) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var key, val;
		var vmarginCache = {};
		// record event heights
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				key = seg.key; // created in daySegCalcHSides
				val = vmarginCache[key];
				if (val === undefined) {
					val = vmarginCache[key] = vmargins(element);
				}
				seg.outerHeight = element[0].offsetHeight + val;
			}
		}
	}
	
	
	function getRowDivs() {
		var i;
		var rowCnt = getRowCnt();
		var rowDivs = [];
		for (i=0; i<rowCnt; i++) {
			rowDivs[i] = allDayRow(i)
				.find('td:not(.fc-resourceName):first div.fc-day-content > div'); // optimal selector?
		}
		return rowDivs;
	}
	
	
	function getRowTops(rowDivs) {
		var i;
		var rowCnt = rowDivs.length;
		var tops = [];
		for (i=0; i<rowCnt; i++) {
			tops[i] = rowDivs[i][0].offsetTop; // !!?? but this means the element needs position:relative if in a table cell!!!!
		}
		return tops;
	}
	
	
	function daySegSetTops(segs, rowTops) { // also triggers eventAfterRender
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var event;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				element[0].style.top = rowTops[seg.row] + (seg.top||0) + 'px';
				event = seg.event;
				trigger('eventAfterRender', event, event, element);
			}
		}
	}
	
	
	function clearEvents() {
		getDaySegmentContainer().empty();
	}
	
	
	function compileSegs(events) {
		var rowCnt = getRowCnt(),
			colCnt = getColCnt(),
			resources = t.getResources,
			d1 = cloneDate(t.visStart),
			d2 = cloneDate(t.visEnd),
			visEventsEnds,
			i, row,
			j, level,
			k, seg, currentResource, viewName = getViewName(),
			l, segs=[],
			weekends = opt('weekends'),
			startDay, endDay, startDate, endDate;
		
		// for resource day view exclEndDay returns next day, which is incorrect if there's no end time for event.
		if (viewName == 'resourceDay') {			
			visEventsEnds = $.map(events, function(event) {
				return event.end || addMinutes(cloneDate(event.start), opt('slotMinutes'));
			});
		}
		else {
			visEventsEnds = $.map(events, exclEndDay);
		}

		for (i=0; i<rowCnt; i++) {
			currentResource = resources[i].id;
			row = sliceSegs(events, visEventsEnds, d1, d2);

			for (j=0; j<row.length; j++) {
				seg = row[j];
				seg.row = i;
				// Let's be backwards compatitle. If event resource is not array, then we convert it.
				if (!$.isArray(seg.event.resource)) { 
					seg.event.resource = [seg.event.resource];
				}

				startDay = seg.event.start.getDay();
				startDate = seg.event.start.getDate();
				if (seg.event.end == null) {
					endDay = seg.event.start.getDay();
					endDate = cloneDate(seg.event.start, true).getDate();
				}
				else {
					endDay = seg.event.end.getDay();
					endDate = seg.event.end.getDate();
				}
				
				// skip if weekends is set to false and this event is on weekend skip this event. BAD BAD BAD.
				if(!weekends && 
					(startDay == 6 || startDay == 0) && 
					(endDay == 6 || endDay == 0) && 
					(startDate == endDate || addDays(cloneDate(seg.event.start),1).getDate() == endDate)
				) continue;

				// if event scheduled to current resource push this seg to segs
				if($.inArray(currentResource, seg.event.resource) != '-1') {
					segs.push(seg);
				}
			}
		}
		return segs;
	}
	
	
	function sliceSegs(events, visEventEnds, start, end) {
		var segs = [],
			i, len=events.length, event,
			eventStart, eventEnd,
			segStart, segEnd,
			isStart, isEnd;
		for (i=0; i<len; i++) {
			event = events[i];
			eventStart = event.start;
			eventEnd = visEventEnds[i];
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
		return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
	}

	
	function daySegHTML(segs) { // also sets seg.left and seg.outerWidth
		var rtl = opt('isRTL');
		var i;
		var segCnt=segs.length;
		var seg;
		var event;
		var url;
		var classes;
		var bounds = allDayBounds();
		var minLeft = bounds.left;
		var maxLeft = bounds.right;
		var leftCol;
		var rightCol;
		var left;
		var right;
		var skinCss;
		var html = '';
		var viewName = getViewName();
		var weekends = opt('weekends'), weekendTestDate, weekendSumColStart, weekendSumColEnd;
		// calculate desired position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			classes = ['fc-event', 'fc-event-hori'];
			if (isEventDraggable(event)) {
				classes.push('fc-event-draggable');
			}
			if (seg.isStart) {
				classes.push('fc-event-start');
			}
			if (seg.isEnd) {
				classes.push('fc-event-end');
			}
			
			// TODO: better implementation for this one.. 
			leftCol = dateCell(seg.start).col;
			rightCol = dateCell(seg.end).col-1;

			if (viewName == 'resourceDay') {
				// hack for resourceDay view
				if(((seg.end-seg.start)/1000/60) < opt('slotMinutes')) leftCol--;
			}
			else {
				if(!weekends) {
					leftCol = dateCell(seg.start).col;
					rightCol = dateCell(addDays(cloneDate(seg.end),-1)).col;
					if (seg.start.getDay() == 6 || seg.start.getDay() == 0) leftCol++;
				}
			}
			
			if (rtl) {
				left = seg.isEnd ? colContentLeft(leftCol) : minLeft;
				right = seg.isStart ? colContentRight(rightCol) : maxLeft;
			}else{
				left = seg.isStart ? colContentLeft(leftCol) : minLeft;
				right = seg.isEnd ? colContentRight(rightCol) : maxLeft;
			}
			
			classes = classes.concat(event.className);
			if (event.source) {
				classes = classes.concat(event.source.className || []);
			}
			url = event.url;
			skinCss = getSkinCss(event, opt);
			if (url) {
				html += "<a href='" + htmlEscape(url) + "'";
			}else{
				html += "<div";
			}
			html +=
				" class='" + classes.join(' ') + "'" +
				" style='position:absolute;z-index:8;left:"+left+"px;" + skinCss + "'" +
				">" +
				"<div class='fc-event-inner'" +
				(skinCss ? " style='" + skinCss + "'" : "") +
				">";
			if (!event.allDay && seg.isStart) {
				html +=
					"<span class='fc-event-time'>" +
					htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
					"</span>";
			}
			html +=
				"<span class='fc-event-title' " + (skinCss ? " style='" + skinCss + "'" : "") + ">" + htmlEscape(event.title) + "</span>" +
				"</div>";
			if (seg.isEnd && isEventResizable(event)) {
				html +=
					"<div class='ui-resizable-handle ui-resizable-" + (rtl ? 'w' : 'e') + "'>" +
					"&nbsp;&nbsp;&nbsp;" + // makes hit area a lot better for IE6/7
					"</div>";
			}
			
			html +=
				"</" + (url ? "a" : "div" ) + ">";
			seg.left = left;
			seg.outerWidth = right - left;
			seg.startCol = leftCol;
			seg.endCol = rightCol + 1; // needs to be exclusive
		}
		return html;
	}
	
	
	function bindDaySeg(event, eventElement, seg) {
		var timeElement = eventElement.find('div.fc-event-time');
		
		if (isEventDraggable(event) && isResourceEditable(event.resource)) {
			draggableResourceEvent(event, eventElement, timeElement);
		}
		if (seg.isEnd && isEventResizable(event) && isResourceEditable(event.resource)) {
			resizableResourceEvent(event, eventElement, timeElement);
		}
		eventElementHandlers(event, eventElement);
	}
	
	
	
	/* Dragging
	----------------------------------------------------------------------------*/
	
	
	function draggableResourceEvent(event, eventElement) {
		var hoverListener = getHoverListener();
		var dayDelta, minuteDelta, resourceDelta, newResourceId, resources = t.getResources, viewName = getViewName(), weekendTestDate, daysToAdd, daysToDel, dayDeltaStart, dayDeltaEnd, i;

		eventElement.draggable({
			zIndex: 9,
			delay: 50,
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta || resources[cell.row].readonly === true);

					clearOverlays();
					
					if (cell && !resources[cell.row].readonly) {
						//setOverflowHidden(true);
						resourceDelta = rowDelta;
						newResourceId = resources[cell.row].id; 
						
						if (viewName == 'resourceDay') {
							minuteDelta = colDelta * (opt('isRTL') ? -1 : 1) * opt('slotMinutes');
							var overlayEnd = event.end ? cloneDate(event.end) : addMinutes(cloneDate(event.start), (opt('isRTL') ? -1 : 1) * opt('slotMinutes'));
							renderDayOverlay(
								addMinutes(cloneDate(event.start), minuteDelta),
								addMinutes(overlayEnd, minuteDelta), 
								false,
								cell.row
							);
						}
						else {
							dayDelta = dayDeltaStart = dayDeltaEnd = colDelta * (opt('isRTL') ? -1 : 1);	

							// If weekends are not within, add or remove days from dayDelta. Is there a better way?
							if (!opt('weekends') && (dayDelta > 0 || dayDelta < 0)) {
								if (dayDelta > 0) {
									for(i=1; i<=dayDeltaStart; i++) {
										weekendTestDate = addDays(cloneDate(event.start), i);
										if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaStart++;
									}
									
									for(i=1; i<=dayDeltaEnd; i++) {
										weekendTestDate = addDays(cloneDate(event.end), i);
										if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaEnd++;
									}
								}
								else {
									for(i=-1; i>=dayDeltaStart; i--) {
										weekendTestDate = addDays(cloneDate(event.start), i);
										if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaStart--;
									}
									
									for(i=-1; i>=dayDeltaEnd; i--) {
										weekendTestDate = addDays(cloneDate(event.end), i);
										if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaEnd--;
									}
								}
							}	

							renderDayOverlay(
								addDays(cloneDate(event.start), dayDeltaStart),
								addDays(exclEndDay(event), dayDeltaEnd), 
								false,
								cell.row
							);
						}
					}else{
						//setOverflowHidden(false);
						minuteDelta = 0;
						dayDelta = 0;
						resourceDelta = 0;
					}
				}, ev, 'drag');
			},
			stop: function(ev, ui) {
				var cell = hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				
				if(!cell) {
					trigger('eventDropOutside', eventElement, event, ev, ui);
				}
				if (viewName == 'resourceDay' && (minuteDelta || resourceDelta)) {
					eventDrop(this, event, 0, minuteDelta, event.allDay, ev, ui, newResourceId);
				}
				else if (dayDelta || resourceDelta) {
					if (!opt('weekends')) {
						// We have to add or remove days from event.start and event.end. Is there a better way?
						if (dayDelta > 0) {
							daysToAdd = 0;
							for(i=1; i<=dayDelta+daysToAdd; i++) {
								weekendTestDate = addDays(cloneDate(event.start), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToAdd++;
							}
							if (daysToAdd > 0) event.start = addDays(cloneDate(event.start), daysToAdd, true);
							
							daysToAdd = 0;
							for(i=1; i<=dayDelta+daysToAdd; i++) {
								weekendTestDate = addDays(cloneDate(event.end), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToAdd++;
							}
							if (daysToAdd > 0) event.end = addDays(cloneDate(event.end), daysToAdd, true);
						}
						else {
							daysToDel = 0;
							for(i=-1; i>=dayDelta+daysToDel; i--) {
								weekendTestDate = addDays(cloneDate(event.start), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToDel--;
							}
							if (daysToDel < 0) event.start = addDays(cloneDate(event.start), daysToDel, true);

							daysToDel = 0;
							for(i=-1; i>=dayDelta+daysToDel; i--) {
								weekendTestDate = addDays(cloneDate(event.end), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToDel--;
							}
							if (daysToDel < 0) event.end = addDays(cloneDate(event.end), daysToDel, true);
						}
					}
					eventDrop(this, event, dayDelta, 0, event.allDay, ev, ui, newResourceId);
				} else{
					eventElement.css('filter', ''); // clear IE opacity side-effects
					showEvents(event, eventElement);
				}
				//setOverflowHidden(false);
			}
		});
	}
	
	
	/* Resizing
	(Same as in DayEventRenderer, but row is passed in renderDayOverlay function)
	-----------------------------------------------------------------------------------*/
	
	
	function resizableResourceEvent(event, element, seg) {
		var rtl = opt('isRTL');
		var direction = rtl ? 'w' : 'e';
		var handle = element.find('div.ui-resizable-' + direction);
		var isResizing = false;

		// TODO: look into using jquery-ui mouse widget for this stuff
		disableTextSelection(element); // prevent native <a> selection for IE
		element
			.mousedown(function(ev) { // prevent native <a> selection for others
				ev.preventDefault();
			})
			.click(function(ev) {
				if (isResizing) {
					ev.preventDefault(); // prevent link from being visited (only method that worked in IE6)
					ev.stopImmediatePropagation(); // prevent fullcalendar eventClick handler from being called
					                               // (eventElementHandlers needs to be bound after resizableDayEvent)
				}
			});
		
		handle.mousedown(function(ev) {
			if (ev.which != 1) {
				return; // needs to be left mouse button
			}
			isResizing = true;
			var hoverListener = t.getHoverListener();
			var rowCnt = getRowCnt();
			var colCnt = getColCnt();
			var viewName = getViewName();
			var dis = rtl ? -1 : 1;
			var dit = rtl ? colCnt-1 : 0;
			var elementTop = element.css('top');
			var dayDelta, dayDeltaStart, dayDeltaEnd;
			var minuteDelta;
			var helpers;
			var eventCopy = $.extend({}, event);
			var minCell = dateCell(event.start);
			var newEnd;
			var weekendTestDate;
			var visEnd;
			
			clearSelection();
			$('body')
				.css('cursor', direction + '-resize')
				.one('mouseup', mouseup);
			trigger('eventResizeStart', this, event, ev);
			hoverListener.start(function(cell, origCell) {
				if (cell) {
					var r = Math.max(minCell.row, cell.row);
					var c = cell.col;
					
					if (viewName == 'resourceDay') {
						minuteDelta = (opt('slotMinutes') * c*dis+dit) - (opt('slotMinutes') * origCell.col*dis+dit);
						visEnd = event.end || addMinutes(cloneDate(event.start), opt('slotMinutes'));
						var newEnd = addMinutes(cloneDate(visEnd), minuteDelta);
					}
					else {
						dayDelta = dayDeltaStart = dayDeltaEnd = (7 + c*dis+dit) - (7 + origCell.col*dis+dit);
						visEnd = event.end || cloneDate(event.start);
						// If weekends is set to false, add or remove days from dayDelta
						if (!opt('weekends') && (dayDelta > 0 || dayDelta < 0)) {
							if (dayDelta > 0) {
								for(var i=1; i<=dayDeltaEnd; i++) {
									weekendTestDate = addDays(cloneDate(visEnd), i);
									if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaEnd++;
								}
							}
							else {
								for(i=-1; i>=dayDeltaEnd; i--) {
									weekendTestDate = addDays(cloneDate(visEnd), i);
									if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaEnd--;
								}
							}
						}	
						newEnd = addDays(eventEnd(event), dayDeltaEnd, true);
					}
					
					if (dayDelta || minuteDelta) {
						eventCopy.end = newEnd;
						var oldHelpers = helpers;
						helpers = renderTempDaySegs(compileSegs([eventCopy]), origCell.row, elementTop);
						helpers.find('*').css('cursor', direction + '-resize');
						if (oldHelpers) {
							oldHelpers.remove();
						}
						hideEvents(event);
					}else{
						if (helpers) {
							showEvents(event);
							helpers.remove();
							helpers = null;
						}
					}
					clearOverlays();

					if (viewName == 'resourceDay') {
						renderDayOverlay(event.start, cloneDate(newEnd), 1, origCell.row); // coordinate grid already rebuild at hoverListener.start
					}
					else {
						renderDayOverlay(event.start, addDays(cloneDate(newEnd), 1), 1, origCell.row); // coordinate grid already rebuild at hoverListener.start
					}
				}
			}, ev);
			
			function mouseup(ev) {
				trigger('eventResizeStop', this, event, ev);
				$('body').css('cursor', '');
				hoverListener.stop();
				clearOverlays();

				if (dayDelta) {
					if (!opt('weekends')) {
						// We have to add or remove days from event.end. Is there a better way?
						visEnd = event.end || cloneDate(event.start);
						if (dayDelta > 0) {
							var daysToAdd = 0;
							for(var i=1; i<=dayDelta+daysToAdd; i++) {
								weekendTestDate = addDays(cloneDate(visEnd), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToAdd++;
							}
							if (daysToAdd > 0) event.end = addDays(cloneDate(visEnd), daysToAdd, true);
						}
						else {
							var daysToDel = 0;
							for(i=-1; i>=dayDelta+daysToDel; i--) {
								weekendTestDate = addDays(cloneDate(visEnd), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToDel--;
							}
							if (daysToDel < 0) event.end = addDays(cloneDate(visEnd), daysToDel, true);
						}
					}
				
					eventResize(this, event, dayDelta, 0, ev);
					// event redraw will clear helpers
				}
				else if (minuteDelta) {
					eventResize(this, event, 0, minuteDelta, ev);
				}
				// otherwise, the drag handler already restored the old events
				
				setTimeout(function() { // make this happen after the element's click event
					isResizing = false;
				},0);
			}
			
		});
	}
}
