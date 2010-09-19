
function DayEventRenderer() {
	var t = this;

	
	// exports
	t.renderDaySegs = renderDaySegs;
	t.resizableDayEvent = resizableDayEvent;
	
	
	// imports
	var opt = t.opt;
	var trigger = t.trigger;
	var reportEventElement = t.reportEventElement;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventResize = t.eventResize;
	var getRowCnt = t.getRowCnt;
	var getColCnt = t.getColCnt;
	var getColWidth = t.getColWidth;
	var allDayTR = t.allDayTR;
	var allDayBounds = t.allDayBounds;
	var colContentLeft = t.colContentLeft;
	var colContentRight = t.colContentRight;
	var dayOfWeekCol = t.dayOfWeekCol;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var bindDaySeg = t.bindDaySeg; //TODO: streamline this
	var formatDates = t.calendar.formatDates;
	
	
	
	/* Rendering
	-----------------------------------------------------------------------------*/


	function renderDaySegs(segs, modifiedEventId) {

		var rtl=opt('isRTL'),
			i, segCnt=segs.length, seg,
			event,
			className,
			left, right,
			html='',
			eventElements,
			eventElement,
			triggerRes,
			hsideCache={},
			vmarginCache={},
			key, val,
			rowI, top, levelI, levelHeight,
			rowDivs=[],
			rowDivTops=[],
			bounds = allDayBounds(),
			minLeft = bounds.left,
			maxLeft = bounds.right,
			rowCnt = getRowCnt(),
			colCnt = getColCnt(),
			segmentContainer = getDaySegmentContainer();
		
		// calculate desired position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			className = 'fc-event fc-event-hori ';
			if (rtl) {
				if (seg.isStart) {
					className += 'fc-corner-right ';
				}
				if (seg.isEnd) {
					className += 'fc-corner-left ';
				}
				left = seg.isEnd ? colContentLeft(dayOfWeekCol(seg.end.getDay()-1)) : minLeft;
				right = seg.isStart ? colContentRight(dayOfWeekCol(seg.start.getDay())) : maxLeft;
			}else{
				if (seg.isStart) {
					className += 'fc-corner-left ';
				}
				if (seg.isEnd) {
					className += 'fc-corner-right ';
				}
				left = seg.isStart ? colContentLeft(dayOfWeekCol(seg.start.getDay())) : minLeft;
				right = seg.isEnd ? colContentRight(dayOfWeekCol(seg.end.getDay()-1)) : maxLeft;
			}
			html +=
				"<div class='" + className + event.className.join(' ') + "' style='position:absolute;z-index:8;left:"+left+"px'>" +
					"<a" + (event.url ? " href='" + htmlEscape(event.url) + "'" : '') + ">" +
						(!event.allDay && seg.isStart ?
							"<span class='fc-event-time'>" +
								htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
							"</span>"
						:'') +
						"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
					"</a>" +
					((event.editable || event.editable === undefined && opt('editable')) && !opt('disableResizing') && $.fn.resizable ?
						"<div class='ui-resizable-handle ui-resizable-" + (rtl ? 'w' : 'e') + "'></div>"
						: '') +
				"</div>";
			seg.left = left;
			seg.outerWidth = right - left;
		}
		segmentContainer[0].innerHTML = html; // faster than html()
		eventElements = segmentContainer.children();
	
		// retrieve elements, run through eventRender callback, bind handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			eventElement = $(eventElements[i]); // faster than eq()
			event = seg.event;
			triggerRes = trigger('eventRender', event, event, eventElement);
			if (triggerRes === false) {
				eventElement.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					eventElement.remove();
					eventElement = $(triggerRes)
						.css({
							position: 'absolute',
							left: seg.left
						})
						.appendTo(segmentContainer);
				}
				seg.element = eventElement;
				if (event._id === modifiedEventId) {
					bindDaySeg(event, eventElement, seg);
				}else{
					eventElement[0]._fci = i; // for lazySegBind
				}
				reportEventElement(event, eventElement);
			}
		}
	
		lazySegBind(segmentContainer, segs, bindDaySeg);
	
		// record event horizontal sides
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				val = hsideCache[key = seg.key = cssKey(eventElement[0])];
				seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement[0], true)) : val;
			}
		}
	
		// set event widths
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				eventElement[0].style.width = seg.outerWidth - seg.hsides + 'px';
			}
		}
	
		// record event heights
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				val = vmarginCache[key = seg.key];
				seg.outerHeight = eventElement[0].offsetHeight + (
					val === undefined ? (vmarginCache[key] = vmargins(eventElement[0])) : val
				);
			}
		}
	
		// set row heights, calculate event tops (in relation to row top)
		for (i=0, rowI=0; rowI<rowCnt; rowI++) {
			top = levelI = levelHeight = 0;
			while (i<segCnt && (seg = segs[i]).row == rowI) {
				if (seg.level != levelI) {
					top += levelHeight;
					levelHeight = 0;
					levelI++;
				}
				levelHeight = Math.max(levelHeight, seg.outerHeight||0);
				seg.top = top;
				i++;
			}
			rowDivs[rowI] = allDayTR(rowI).find('td:first div.fc-day-content > div') // optimal selector?
				.height(top + levelHeight);
		}
	
		// calculate row tops
		for (rowI=0; rowI<rowCnt; rowI++) {
			rowDivTops[rowI] = rowDivs[rowI][0].offsetTop;
		}
	
		// set event tops
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				eventElement[0].style.top = rowDivTops[seg.row] + seg.top + 'px';
				event = seg.event;
				trigger('eventAfterRender', event, event, eventElement);
			}
		}
	
	}
	
	
	
	/* Resizing
	-----------------------------------------------------------------------------------*/
	
	
	function resizableDayEvent(event, eventElement) {
		if (!opt('disableResizing') && eventElement.resizable) {
			var colWidth = getColWidth();
			eventElement.resizable({
				handles: opt('isRTL') ? {w:'div.ui-resizable-w'} : {e:'div.ui-resizable-e'},
				grid: colWidth,
				minWidth: colWidth/2, // need this or else IE throws errors when too small
				containment: t.element.parent().parent(), // the main element...
				             // ... a fix. wouldn't allow extending to last column in agenda views (jq ui bug?)
				start: function(ev, ui) {
					eventElement.css('z-index', 9);
					hideEvents(event, eventElement);
					trigger('eventResizeStart', this, event, ev, ui);
				},
				stop: function(ev, ui) {
					trigger('eventResizeStop', this, event, ev, ui);
					// ui.size.width wasn't working with grid correctly, use .width()
					var dayDelta = Math.round((eventElement.width() - ui.originalSize.width) / colWidth);
					if (dayDelta) {
						eventResize(this, event, dayDelta, 0, ev, ui);
					}else{
						eventElement.css('z-index', 8);
						showEvents(event, eventElement);
					}
				}
			});
		}
	}
	

}
