function AgendaListEventRenderer() {
    var t = this;


    // exports
    t.renderEvents = renderEvents;
    t.compileDaySegs = compileSegs; // for DayEventRenderer
    t.clearEvents = clearEvents;
    t.bindDaySeg = bindDaySeg;


    // imports
    AgendaListViewEventRenderer.call(t);
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
    var renderDaySegs = t.renderDaySegs;
    var resizableDayEvent = t.resizableDayEvent;



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
            d1 = cloneDate(t.visStart),
            d2 = addDays(cloneDate(d1), colCnt),
            visEventsEnds = $.map(events, exclEndDay),
            i, row,
            j, level,
            k, seg,
            segs=[];

        var rowIndex = 0;
        for (i=0; i<rowCnt; i++) {

            row = stackSegs(sliceSegs(events, visEventsEnds, d1, d2));

            for (j=0; j<row.length; j++) {
                level = row[j];
                for (k=0; k<level.length; k++) {
                    seg = level[k];

                    seg.row = rowIndex; // old version i;
                    //seg.row = i;
                    seg.level = j; // not needed anymore
                    segs.push(seg);
                }
            }

            if (row.length > 0) { rowIndex++; }

            addDays(d1, 1);
            addDays(d2, 1);
        }
        return segs;
    }


    function bindDaySeg(event, eventElement, seg) {
        if (isEventDraggable(event)) {
            draggableDayEvent(event, eventElement);
        }
        if (seg.isEnd && isEventResizable(event)) {
            resizableDayEvent(event, eventElement, seg);
        }
        eventElementHandlers(event, eventElement);
        // needs to be after, because resizableDayEvent might stopImmediatePropagation on click
    }



    /* Dragging
     ----------------------------------------------------------------------------*/


    function draggableDayEvent(event, eventElement) {
        var hoverListener = getHoverListener();
        var dayDelta;
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
                        dayDelta = rowDelta*7 + colDelta * (opt('isRTL') ? -1 : 1);
                        renderDayOverlay(
                            addDays(cloneDate(event.start), dayDelta),
                            addDays(exclEndDay(event), dayDelta)
                        );
                    }else{
                        //setOverflowHidden(false);
                        dayDelta = 0;
                    }
                }, ev, 'drag');
            },
            stop: function(ev, ui) {
                hoverListener.stop();
                clearOverlays();
                trigger('eventDragStop', eventElement, event, ev, ui);
                if (dayDelta) {
                    eventDrop(this, event, dayDelta, 0, event.allDay, ev, ui);
                }else{
                    eventElement.css('filter', ''); // clear IE opacity side-effects
                    showEvents(event, eventElement);
                }
                //setOverflowHidden(false);
            }
        });
    }
}


function AgendaListViewEventRenderer() {
    var t = this;


    // exports
    t.renderDaySegs = renderDaySegs;
    t.resizableDayEvent = resizableDayEvent;


    // imports
    var opt = t.opt;
    var trigger = t.trigger;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var eventEnd = t.eventEnd;
    var reportEventElement = t.reportEventElement;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventResize = t.eventResize;
    var getRowCnt = t.getRowCnt;
    var getColCnt = t.getColCnt;
    var getColWidth = t.getColWidth;
    var allDayRow = t.allDayRow;
    var allDayBounds = t.allDayBounds;
    var colContentLeft = t.colContentLeft;
    var colContentRight = t.colContentRight;
    var dayOfWeekCol = t.dayOfWeekCol;
    var dateCell = t.dateCell;
    var compileDaySegs = t.compileDaySegs;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var bindDaySeg = t.bindDaySeg; //TODO: streamline this
    var formatDates = t.calendar.formatDates;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var clearSelection = t.clearSelection;



    /* Rendering
     -----------------------------------------------------------------------------*/


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
            for (j=0; j<colCnt; j++) {
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


    function daySegHTML(segs) { // also sets seg.left and seg.outerWidth
        //TODO#2
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

        // calculate desired position/dimensions, create html
        for (i=0; i<segCnt; i++) {
            seg = segs[i];

            event = seg.event;
            classes = ['fc-event', 'fc-event-skin', 'fc-event-hori'];
            if (isEventDraggable(event)) {
                classes.push('fc-event-draggable');
            }
            if (rtl) {
                if (seg.isStart) {
                    classes.push('fc-corner-right');
                }
                if (seg.isEnd) {
                    classes.push('fc-corner-left');
                }
                leftCol = dayOfWeekCol(seg.end.getDay()-1);
                rightCol = dayOfWeekCol(seg.start.getDay());
                left = seg.isEnd ? colContentLeft(leftCol) : minLeft;
                right = seg.isStart ? colContentRight(rightCol) : maxLeft;
            }else{
                if (seg.isStart) {
                    classes.push('fc-corner-left');
                }
                if (seg.isEnd) {
                    classes.push('fc-corner-right');
                }
                leftCol = dayOfWeekCol(seg.start.getDay());
                rightCol = dayOfWeekCol(seg.end.getDay()-1);
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
                    "<div" +
                    " class='fc-event-inner fc-event-skin'" +
                    (skinCss ? " style='" + skinCss + "'" : '') +
                    ">";
            if (!event.allDay && seg.isStart) {
                html +=
                    "<span class='fc-event-time'>" +
                        htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
                        "</span>";
            }

            var eventDay = clearTime(seg.start);
            var today = clearTime(new Date());
            var todayText = (+today == +eventDay) ? "Today - " : ""; //fc-state-highlight fc-today

            html +=
                "<span class='fc-event-title'> " + todayText + seg.row + " ) " + seg.start + " - " + htmlEscape(event.title) + "</span>" +
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

        //console.log(html);
        return html;
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
                key = seg.key = cssKey(element[0]);
                val = hsideCache[key];
                if (val === undefined) {
                    val = hsideCache[key] = hsides(element, true);
                }
                seg.hsides = val;
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
                .find('td:first div.fc-day-content > div'); // optimal selector?
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



    /* Resizing
     -----------------------------------------------------------------------------------*/


    function resizableDayEvent(event, element, seg) {
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
            var dis = rtl ? -1 : 1;
            var dit = rtl ? colCnt-1 : 0;
            var elementTop = element.css('top');
            var dayDelta;
            var helpers;
            var eventCopy = $.extend({}, event);
            var minCell = dateCell(event.start);
            clearSelection();
            $('body')
                .css('cursor', direction + '-resize')
                .one('mouseup', mouseup);
            trigger('eventResizeStart', this, event, ev);
            hoverListener.start(function(cell, origCell) {
                if (cell) {
                    var r = Math.max(minCell.row, cell.row);
                    var c = cell.col;
                    if (rowCnt == 1) {
                        r = 0; // hack for all-day area in agenda views
                    }
                    if (r == minCell.row) {
                        if (rtl) {
                            c = Math.min(minCell.col, c);
                        }else{
                            c = Math.max(minCell.col, c);
                        }
                    }
                    dayDelta = (r*7 + c*dis+dit) - (origCell.row*7 + origCell.col*dis+dit);
                    var newEnd = addDays(eventEnd(event), dayDelta, true);
                    if (dayDelta) {
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
                    renderDayOverlay(event.start, addDays(cloneDate(newEnd), 1)); // coordinate grid already rebuild at hoverListener.start
                }
            }, ev);

            function mouseup(ev) {
                trigger('eventResizeStop', this, event, ev);
                $('body').css('cursor', '');
                hoverListener.stop();
                clearOverlays();
                if (dayDelta) {
                    eventResize(this, event, dayDelta, 0, ev);
                    // event redraw will clear helpers
                }
                // otherwise, the drag handler already restored the old events

                setTimeout(function() { // make this happen after the element's click event
                    isResizing = false;
                },0);
            }

        });
    }
}