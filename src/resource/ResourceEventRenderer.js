
function ResourceEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.compileDaySegs = compileSegs; // for DayEventRenderer
	t.clearEvents = clearEvents;
	t.bindDaySeg = bindDaySeg;
	t.resizableResourceEvent = resizableResourceEvent;
	
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	//var setOverflowHidden = t.setOverflowHidden;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var eventElementHandlers = t.eventElementHandlers;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventDrop = t.eventDrop;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getHoverListener = t.getHoverListener;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var getRowCnt = t.getRowCnt;
	var getColCnt = t.getColCnt;
	var getViewName = t.getViewName;
	var renderDaySegs = t.renderDaySegs;
	var dateCell = t.dateCell;
	var clearSelection = t.clearSelection;
	var eventEnd = t.eventEnd;
	var renderTempDaySegs = t.renderTempDaySegs;
	var compileDaySegs = t.compileDaySegs;
	var eventResize = t.eventResize;
	
	
	
	/* Rendering
	--------------------------------------------------------------------*/
	
	
	function renderEvents(events, modifiedEventId) {
		reportEvents(events);
		renderDaySegs(compileSegs(events), modifiedEventId);
	}
	
	
	function clearEvents() {
		reportEventClear();
		getDaySegmentContainer().empty();
	}
	
	
	function compileSegs(events) {
		var rowCnt = getRowCnt(),
			colCnt = getColCnt(),
			resources = t.getResources,
			d1 = cloneDate(t.visStart),
			d2 = cloneDate(t.visEnd),
			visEventsEnds = $.map(events, exclEndDay),
			i, row,
			j, level,
			k, seg, currentResource, viewName = getViewName(),
			l, segs=[];
		
		if (viewName == 'resourceDay') {			
			visEventsEnds = $.map(events, function(event) {
				return event.end || addDays(event.start, 1);
			});
		}

		for (i=0; i<rowCnt; i++) {
			currentResource = resources[i].id;
			row = stackSegs(sliceSegs(events, visEventsEnds, d1, d2));

			for (j=0; j<row.length; j++) {
				level = row[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.row = i;
					seg.level = j; // not needed anymore
					
					// Let's be backwards compatitle. If event resource is not array, then we convert it.
					if (!$.isArray(seg.event.resource)) { 
						seg.event.resource = [seg.event.resource];
					}
					
					for (l=0; l<seg.event.resource.length; l++) {
						if(currentResource == seg.event.resource[l]) {
							segs.push(seg);
						}
					}	
				}
			}
		}
		return segs;
	}
	
	
	function bindDaySeg(event, eventElement, seg) {
		if (isEventDraggable(event)) {
			draggableResourceEvent(event, eventElement);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableResourceEvent(event, eventElement, seg);
		}
		eventElementHandlers(event, eventElement);
			// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
	}
	
	
	
	/* Dragging
	----------------------------------------------------------------------------*/
	
	
	function draggableResourceEvent(event, eventElement) {
		var hoverListener = getHoverListener();
		var dayDelta, minuteDelta, resourceDelta, newResourceId, resources, viewName = getViewName(), weekendTestDate, daysToAdd, daysToDel, dayDeltaStart, dayDeltaEnd, i;
		eventElement.draggable({
			zIndex: 9,
			delay: 50,
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
					clearOverlays();
					if (cell) {
						//setOverflowHidden(true);
						resourceDelta = rowDelta;
						resources = t.getResources;
						newResourceId = resources[cell.row].id; 
						
						if (viewName == 'resourceDay') {
							minuteDelta = colDelta * (opt('isRTL') ? -1 : 1) * opt('slotMinutes');
							renderDayOverlay(
								addMinutes(cloneDate(event.start), minuteDelta),
								addMinutes(cloneDate(event.end), minuteDelta), 
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
				hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
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
						var newEnd = addMinutes(eventEnd(event), minuteDelta, true);
					}
					else {
						dayDelta = dayDeltaStart = dayDeltaEnd = (7 + c*dis+dit) - (7 + origCell.col*dis+dit);
						
						// If weekends is set to false, add or remove days from dayDelta
						if (!opt('weekends') && (dayDelta > 0 || dayDelta < 0)) {
							if (dayDelta > 0) {
								for(var i=1; i<=dayDeltaEnd; i++) {
									weekendTestDate = addDays(cloneDate(event.end), i);
									if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaEnd++;
								}
							}
							else {
								for(i=-1; i>=dayDeltaEnd; i--) {
									weekendTestDate = addDays(cloneDate(event.end), i);
									if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) dayDeltaEnd--;
								}
							}
						}	
						newEnd = addDays(eventEnd(event), dayDeltaEnd, true);
						
					}
					
					if (dayDelta || minuteDelta) {
						eventCopy.end = newEnd;
						var oldHelpers = helpers;
						helpers = renderTempDaySegs(compileDaySegs([eventCopy]), seg.row, elementTop);
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
						renderDayOverlay(event.start, addMinutes(cloneDate(newEnd), 0), 1, origCell.row); // coordinate grid already rebuild at hoverListener.start
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
						if (dayDelta > 0) {
							var daysToAdd = 0;
							for(var i=1; i<=dayDelta+daysToAdd; i++) {
								weekendTestDate = addDays(cloneDate(event.end), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToAdd++;
							}
							if (daysToAdd > 0) event.end = addDays(cloneDate(event.end), daysToAdd, true);
						}
						else {
							var daysToDel = 0;
							for(i=-1; i>=dayDelta+daysToDel; i--) {
								weekendTestDate = addDays(cloneDate(event.end), i);
								if (weekendTestDate.getDay() == 6 || weekendTestDate.getDay() == 0) daysToDel--;
							}
							if (daysToDel < 0) event.end = addDays(cloneDate(event.end), daysToDel, true);
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
