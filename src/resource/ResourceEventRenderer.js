
function ResourceEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.clearEvents = clearEvents;
	t.slotSegHtml = slotSegHtml;
	
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var eventElementHandlers = t.eventElementHandlers;
	var setHeight = t.setHeight;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getSlotSegmentContainer = t.getSlotSegmentContainer;
	var getHoverListener = t.getHoverListener;
	var computeDateTop = t.computeDateTop;
	var getIsCellAllDay = t.getIsCellAllDay;
	var colContentLeft = t.colContentLeft;
	var colContentRight = t.colContentRight;
	var cellToDate = t.cellToDate;
	var getColCnt = function() { return getResources().length; };
	var getColWidth = t.getColWidth;
	var getSnapHeight = t.getSnapHeight;
	var getSnapDuration = t.getSnapDuration;
	var getSlotHeight = t.getSlotHeight;
	var getSlotDuration = t.getSlotDuration;
	var getSlotContainer = t.getSlotContainer;
	var reportEventElement = t.reportEventElement;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventDrop = t.eventDrop;
	var eventResize = t.eventResize;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var renderDayEvents = t.renderDayEvents;
	var getMinTime = t.getMinTime;
	var getMaxTime = t.getMaxTime;
	var calendar = t.calendar;
	var formatDate = calendar.formatDate;
	var getEventEnd = calendar.getEventEnd;
	var getResources = t.getResources;
	

	// overrides
	t.draggableDayEvent = draggableDayEvent;

	
	
	/* Rendering
	----------------------------------------------------------------------------*/
	

	function renderEvents(events, modifiedEventId) {
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

		if (opt('allDaySlot')) {
			renderDayEvents(dayEvents, modifiedEventId);
			setHeight(); // no params means set to viewHeight
		}

		renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
	}
	
	
	function clearEvents() {
		getDaySegmentContainer().empty();
		getSlotSegmentContainer().empty();
	}

	
	function compileSlotSegs(events) {
		var colCnt = getColCnt(),
			minTime = getMinTime(),
			maxTime = getMaxTime(),
			cellDate,
			i,
			j, seg,
			colSegs,
			segs = [];

		for (i=0; i<colCnt; i++) {
			cellDate = cellToDate(0, 0);	// updated - should show same day for all
			var resourceEvents = eventsForResource(getResources()[i], events);
			colSegs = sliceSegs(
				resourceEvents,
				cellDate.clone().time(minTime),
				cellDate.clone().time(maxTime)
			);

			colSegs = placeSlotSegs(colSegs); // returns a new order

			for (j=0; j<colSegs.length; j++) {
				seg = colSegs[j];
				seg.col = i;
				segs.push(seg);
			}
		}

		return segs;
	}


	function sliceSegs(events, rangeStart, rangeEnd) {
		// normalize, because all dates will be compared w/o zones
		rangeStart = rangeStart.clone().stripZone();
		rangeEnd = rangeEnd.clone().stripZone();

		var segs = [],
			i, len=events.length, event,
			eventStart, eventEnd,
			segStart, segEnd,
			isStart, isEnd;
		for (i=0; i<len; i++) {

			event = events[i];

			// get dates, make copies, then strip zone to normalize
			eventStart = event.start.clone().stripZone();
			eventEnd = getEventEnd(event).stripZone();

			if (eventEnd > rangeStart && eventStart < rangeEnd) {

				if (eventStart < rangeStart) {
					segStart = rangeStart.clone();
					isStart = false;
				}
				else {
					segStart = eventStart;
					isStart = true;
				}

				if (eventEnd > rangeEnd) {
					segEnd = rangeEnd.clone();
					isEnd = false;
				}
				else {
					segEnd = eventEnd;
					isEnd = true;
				}

				segs.push({
					event: event,
					start: segStart,
					end: segEnd,
					isStart: isStart,
					isEnd: isEnd
				});
			}
		}

		return segs.sort(compareSlotSegs);
	}

	function eventsForResource(resource, events) {
		var resourceEvents = [];
		var hasResource = function(event) {
			return event.resources && $.grep(event.resources, function(id) {
				return id == resource.id;
			}).length;
		};

		for (var i = 0; i < events.length; i++) {
			if (hasResource(events[i])) {
				resourceEvents.push(events[i]);
			}
		}
		return resourceEvents;
	}
	
	
	// renders events in the 'time slots' at the bottom
	// TODO: when we refactor this, when user returns `false` eventRender, don't have empty space
	// TODO: refactor will include using pixels to detect collisions instead of dates (handy for seg cmp)
	
	function renderSlotSegs(segs, modifiedEventId) {
	
		var i, segCnt=segs.length, seg,
			event,
			top,
			bottom,
			columnLeft,
			columnRight,
			columnWidth,
			width,
			left,
			right,
			html = '',
			eventElements,
			eventElement,
			triggerRes,
			titleElement,
			height,
			slotSegmentContainer = getSlotSegmentContainer(),
			isRTL = opt('isRTL');
			
		// calculate position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			top = computeDateTop(seg.start, seg.start);
			bottom = computeDateTop(seg.end, seg.start);
			columnLeft = colContentLeft(seg.col);
			columnRight = colContentRight(seg.col);
			columnWidth = columnRight - columnLeft;

			// shave off space on right near scrollbars (2.5%)
			// TODO: move this to CSS somehow
			columnRight -= columnWidth * .025;
			columnWidth = columnRight - columnLeft;

			width = columnWidth * (seg.forwardCoord - seg.backwardCoord);

			if (opt('slotEventOverlap')) {
				// double the width while making sure resize handle is visible
				// (assumed to be 20px wide)
				width = Math.max(
					(width - (20/2)) * 2,
					width // narrow columns will want to make the segment smaller than
						// the natural width. don't allow it
				);
			}

			if (isRTL) {
				right = columnRight - seg.backwardCoord * columnWidth;
				left = right - width;
			}
			else {
				left = columnLeft + seg.backwardCoord * columnWidth;
				right = left + width;
			}

			// make sure horizontal coordinates are in bounds
			left = Math.max(left, columnLeft);
			right = Math.min(right, columnRight);
			width = right - left;

			seg.top = top;
			seg.left = left;
			seg.outerWidth = width;
			seg.outerHeight = bottom - top;
			html += slotSegHtml(event, seg);
		}

		slotSegmentContainer[0].innerHTML = html; // faster than html()
		eventElements = slotSegmentContainer.children();
		
		// retrieve elements, run through eventRender callback, bind event handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			eventElement = $(eventElements[i]); // faster than eq()
			triggerRes = trigger('eventRender', event, event, eventElement);
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
					bindSlotSeg(event, eventElement, seg);
				}else{
					eventElement[0]._fci = i; // for lazySegBind
				}
				reportEventElement(event, eventElement);
			}
		}
		
		lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
		
		// record event sides and title positions
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if ((eventElement = seg.element)) {
				seg.vsides = vsides(eventElement, true);
				seg.hsides = hsides(eventElement, true);
				titleElement = eventElement.find('.fc-event-title');
				if (titleElement.length) {
					seg.contentTop = titleElement[0].offsetTop;
				}
			}
		}
		
		// set all positions/dimensions at once
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if ((eventElement = seg.element)) {
				eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
				height = Math.max(0, seg.outerHeight - seg.vsides);
				eventElement[0].style.height = height + 'px';
				event = seg.event;
				if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
					// not enough room for title, put it in the time (TODO: maybe make both display:inline instead)
					eventElement.find('div.fc-event-time')
						.text(
							formatDate(event.start, opt('timeFormat')) + ' - ' + event.title
						);
					eventElement.find('div.fc-event-title')
						.remove();
				}
				trigger('eventAfterRender', event, event, eventElement);
			}
		}
					
	}
	
	
	function slotSegHtml(event, seg) {
		var html = "<";
		var url = event.url;
		var skinCss = getSkinCss(event, opt);
		var classes = ['fc-event', 'fc-event-vert'];
		if (isEventDraggable(event)) {
			classes.push('fc-event-draggable');
		}
		if (seg.isStart) {
			classes.push('fc-event-start');
		}
		if (seg.isEnd) {
			classes.push('fc-event-end');
		}
		classes = classes.concat(event.className);
		if (event.source) {
			classes = classes.concat(event.source.className || []);
		}
		if (url) {
			html += "a href='" + htmlEscape(event.url) + "'";
		}else{
			html += "div";
		}

		html +=
			" class='" + classes.join(' ') + "'" +
			" style=" +
				"'" +
				"position:absolute;" +
				"top:" + seg.top + "px;" +
				"left:" + seg.left + "px;" +
				skinCss +
				"'" +
			">" +
			"<div class='fc-event-inner'>" +
			"<div class='fc-event-time'>" +
			htmlEscape(t.getEventTimeText(event)) +
			"</div>" +
			"<div class='fc-event-title'>" +
			htmlEscape(event.title || '') +
			"</div>" +
			"</div>" +
			"<div class='fc-event-bg'></div>";

		if (seg.isEnd && isEventResizable(event)) {
			html +=
				"<div class='ui-resizable-handle ui-resizable-s'>=</div>";
		}
		html +=
			"</" + (url ? "a" : "div") + ">";
		return html;
	}
	
	
	function bindSlotSeg(event, eventElement, seg) {
		var timeElement = eventElement.find('div.fc-event-time');
		if (isEventDraggable(event)) {
			draggableSlotEvent(event, eventElement, timeElement);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableSlotEvent(event, eventElement, timeElement);
		}
		eventElementHandlers(event, eventElement);
	}
	
	
	
	/* Dragging
	-----------------------------------------------------------------------------------*/
	
	
	// when event starts out FULL-DAY
	// overrides DayEventRenderer's version because it needs to account for dragging elements
	// to and from the slot area.
	
	function draggableDayEvent(event, eventElement, seg) {
		var isStart = seg.isStart;
		var origWidth;
		var revert;
		var allDay = true;
		var dayDelta;
		var origCol;

		var hoverListener = getHoverListener();
		var colWidth = getColWidth();
		var minTime = getMinTime();
		var slotDuration = getSlotDuration();
		var slotHeight = getSlotHeight();
		var snapDuration = getSnapDuration();
		var snapHeight = getSnapHeight();

		eventElement.draggable({
			opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {

				trigger('eventDragStart', eventElement[0], event, ev, ui);
				hideEvents(event, eventElement);
				origWidth = eventElement.width();

				hoverListener.start(function(cell, origCell) {
					clearOverlays();
					if (cell) {
						revert = false;
						origCol = origCell.col;
						var origDate = cellToDate(0, origCell.col);
						var date = cellToDate(0, cell.col);
						dayDelta = date.diff(origDate, 'days');

						if (!cell.row) { // on full-days
							
							renderDayOverlay(
								event.start.clone().add(dayDelta, 'days'),
								getEventEnd(event).add(dayDelta, 'days'),
								true,
								1
							);

							resetElement();
						}
						else { // mouse is over bottom slots

							if (isStart) {
								if (allDay) {
									// convert event to temporary slot-event
									eventElement.width(colWidth - 10); // don't use entire width
									setOuterHeight(eventElement, calendar.defaultTimedEventDuration / slotDuration * slotHeight); // the default height
									eventElement.draggable('option', 'grid', [ colWidth, 1 ]);
									allDay = false;
								}
							}
							else {
								revert = true;
							}
						}

						revert = revert || (allDay && !dayDelta);
					}
					else {
						resetElement();
						revert = true;
					}

					eventElement.draggable('option', 'revert', revert);

				}, ev, 'drag');
			},
			stop: function(ev, ui) {
				hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement[0], event, ev, ui);

				if (revert) { // hasn't moved or is out of bounds (draggable has already reverted)
					
					resetElement();
					eventElement.css('filter', ''); // clear IE opacity side-effects
					showEvents(event, eventElement);
				}
				else { // changed!
					// calculate column delta
					var newCol = Math.round((eventElement.offset().left - getSlotContainer().offset().left) / colWidth);
					// if (newCol !== origCol){
					// 	event.resources = [ resources()[newCol].id ];
					// }
					var resources = event.resources;
					if (newCol !== origCol){
						resources = [ getResources()[newCol].id ];
					}

					var eventStart = event.start.clone(); // already assumed to have a stripped time
					var snapTime;
					var snapIndex;
					if (!allDay) {
						snapIndex = Math.round((eventElement.offset().top - getSlotContainer().offset().top) / snapHeight); // why not use ui.offset.top?
						snapTime = moment.duration(minTime + snapIndex * snapDuration);
						eventStart = calendar.rezoneDate(eventStart.clone().time(snapTime));
					}

					eventDrop(
						eventElement[0],
						event,
						resources,
						eventStart,
						ev,
						ui
					);
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
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		var coordinateGrid = t.getCoordinateGrid();
		var colCnt = getColCnt();
		var colWidth = getColWidth();
		var snapHeight = getSnapHeight();
		var snapDuration = getSnapDuration();

		// states
		var origPosition; // original position of the element, not the mouse
		var origCell;
		var isInBounds, prevIsInBounds;
		var isAllDay, prevIsAllDay;
		var colDelta, prevColDelta;
		var dayDelta; // derived from colDelta
		var resourceDelta; // derived from colDelta
		var snapDelta, prevSnapDelta; // the number of snaps away from the original position

		// newly computed
		var eventStart, eventEnd;

		eventElement.draggable({
			scroll: false,
			grid: [ colWidth, snapHeight ],
			axis: colCnt==1 ? 'y' : false,
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {

				trigger('eventDragStart', eventElement[0], event, ev, ui);
				hideEvents(event, eventElement);

				coordinateGrid.build();

				// initialize states
				origPosition = eventElement.position();
				origCell = coordinateGrid.cell(ev.pageX, ev.pageY);
				isInBounds = prevIsInBounds = true;
				isAllDay = prevIsAllDay = getIsCellAllDay(origCell);
				colDelta = prevColDelta = 0;
				dayDelta = 0;
				resourceDelta = 0;
				snapDelta = prevSnapDelta = 0;

				eventStart = null;
				eventEnd = null;
			},
			drag: function(ev, ui) {

				// NOTE: this `cell` value is only useful for determining in-bounds and all-day.
				// Bad for anything else due to the discrepancy between the mouse position and the
				// element position while snapping. (problem revealed in PR #55)
				//
				// PS- the problem exists for draggableDayEvent() when dragging an all-day event to a slot event.
				// We should overhaul the dragging system and stop relying on jQuery UI.
				var cell = coordinateGrid.cell(ev.pageX, ev.pageY);

				// update states
				isInBounds = !!cell;
				if (isInBounds) {
					isAllDay = getIsCellAllDay(cell);

					// calculate column delta
					colDelta = Math.round((ui.position.left - origPosition.left) / colWidth);
					if (colDelta != prevColDelta) {
						// calculate the day delta based off of the original clicked column and the column delta
						resourceDelta = colDelta;
					}

					// calculate minute delta (only if over slots)
					if (!isAllDay) {
						snapDelta = Math.round((ui.position.top - origPosition.top) / snapHeight);
					}
				}

				// any state changes?
				if (
					isInBounds != prevIsInBounds ||
					isAllDay != prevIsAllDay ||
					colDelta != prevColDelta ||
					snapDelta != prevSnapDelta
				) {

					// compute new dates
					if (isAllDay) {
						eventStart = event.start.clone().stripTime().add(dayDelta, 'days');
						eventEnd = eventStart.clone().add(calendar.defaultAllDayEventDuration);
					}
					else {
						eventStart = event.start.clone().add(snapDelta * snapDuration).add(dayDelta, 'days');
						eventEnd = getEventEnd(event).add(snapDelta * snapDuration).add(dayDelta, 'days');
					}

					updateUI();

					// update previous states for next time
					prevIsInBounds = isInBounds;
					prevIsAllDay = isAllDay;
					prevColDelta = colDelta;
					prevSnapDelta = snapDelta;
				}

				// if out-of-bounds, revert when done, and vice versa.
				eventElement.draggable('option', 'revert', !isInBounds);

			},
			stop: function(ev, ui) {

				clearOverlays();
				
				trigger('eventDragStop', eventElement[0], event, ev, ui);

				if (isInBounds && (isAllDay || resourceDelta || snapDelta)) { // changed!
					var targetResources = event.resources.slice(0);

					if (resourceDelta){
						// given we have r1/r3 
						// if we move r3 to r2, then we want to maintain r1/r2.
						// if we move r3 to r1, then we only want to maintain r1 - so we splice the array
						var resources = getResources();
						var newId = resources[origCell.col + resourceDelta].id;
						var oldId = resources[origCell.col].id;

						var oldIndex = event.resources.indexOf(oldId);
						var newIndex = event.resources.indexOf(newId);

						if (newIndex > -1) {
							targetResources.splice(oldIndex, 1);
						} else {
							targetResources[oldIndex] = newId;
						}
					}
					eventDrop(
						eventElement[0],
						event,
						targetResources,
						eventStart,
						ev,
						ui
					);
				}
				else { // either no change or out-of-bounds (draggable has already reverted)

					// reset states for next time, and for updateUI()
					isInBounds = true;
					isAllDay = false;
					colDelta = 0;
					dayDelta = 0;
					snapDelta = 0;

					updateUI();
					eventElement.css('filter', ''); // clear IE opacity side-effects

					// sometimes fast drags make event revert to wrong position, so reset.
					// also, if we dragged the element out of the area because of snapping,
					// but the *mouse* is still in bounds, we need to reset the position.
					eventElement.css(origPosition);

					showEvents(event, eventElement);
				}
			}
		});

		function updateUI() {
			clearOverlays();
			if (isInBounds) {
				if (isAllDay) {
					timeElement.hide();
					eventElement.draggable('option', 'grid', null); // disable grid snapping
					renderDayOverlay(eventStart, eventEnd, false, origCell.col + colDelta);
				}
				else {
					updateTimeText();
					timeElement.css('display', ''); // show() was causing display=inline
					eventElement.draggable('option', 'grid', [colWidth, snapHeight]); // re-enable grid snapping
				}
			}
		}

		function updateTimeText() {
			if (eventStart) { // must of had a state change
				timeElement.text(
					t.getEventTimeText(eventStart, event.end ? eventEnd : null)
					//
					// only display the new end if there was an old end
				);
			}
		}

	}
	
	
	
	/* Resizing
	--------------------------------------------------------------------------------------*/
	
	
	function resizableSlotEvent(event, eventElement, timeElement) {
		var snapDelta, prevSnapDelta;
		var snapHeight = getSnapHeight();
		var snapDuration = getSnapDuration();
		var eventEnd;

		eventElement.resizable({
			handles: {
				s: '.ui-resizable-handle'
			},
			grid: snapHeight,
			start: function(ev, ui) {
				snapDelta = prevSnapDelta = 0;
				hideEvents(event, eventElement);
				trigger('eventResizeStart', eventElement[0], event, ev, ui);
			},
			resize: function(ev, ui) {
				// don't rely on ui.size.height, doesn't take grid into account
				snapDelta = Math.round((Math.max(snapHeight, eventElement.height()) - ui.originalSize.height) / snapHeight);
				if (snapDelta != prevSnapDelta) {
					eventEnd = getEventEnd(event).add(snapDuration * snapDelta);
					var text;
					if (snapDelta) { // has there been a change?
						text = t.getEventTimeText(event.start, eventEnd);
					}
					else {
						text = t.getEventTimeText(event); // the original time text
					}
					timeElement.text(text);
					prevSnapDelta = snapDelta;
				}
			},
			stop: function(ev, ui) {
				trigger('eventResizeStop', eventElement[0], event, ev, ui);
				if (snapDelta) {
					eventResize(
						eventElement[0],
						event,
						eventEnd,
						ev,
						ui
					);
				}
				else {
					showEvents(event, eventElement);
					// BUG: if event was really short, need to put title back in span
				}
			}
		});
	}
	

}