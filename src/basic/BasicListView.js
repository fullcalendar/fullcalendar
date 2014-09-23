/* A view with a simple list
----------------------------------------------------------------------------------------------------------------------*/

fcViews.basicList = BasicListView; // register this view

function BasicListView(calendar) {
    BasicView.call(this, calendar); // call the super-constructor
}


BasicListView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(BasicListView.prototype, {

    name: 'basicList',


    incrementDate: function(date, delta) {
        var out = date.clone().startOf('day').add(delta, 'days');
        out = this.skipHiddenDays(out, delta < 0 ? -1 : 1);
        return out;
    },


    render: function(date) {

        this.intervalStart = date.clone().startOf('day');
        this.intervalEnd = this.intervalStart.clone().add(this.calendar.options.basicListInterval);

        this.start = this.skipHiddenDays(this.intervalStart);
        this.end = this.skipHiddenDays(this.intervalEnd, -1, true);

        this.title = this.calendar.formatRange(
            this.start,
            this.end.clone().subtract(1), // make inclusive by subtracting 1 ms? why?
            this.opt('titleFormat'),
            ' \u2014 ' // emphasized dash
        );

        //this.el.addClass('fc-basic-view').html(this.renderHtml());


        this.trigger('viewRender', this, this, this.el);

        // attach handlers to document. do it here to allow for destroy/rerender
        $(document)
            .on('mousedown', this.documentMousedownProxy)
            .on('dragstart', this.documentDragStartProxy); // jqui drag

    },

    renderEvents: function renderBasicListEvents(events) {

        //console.log(events);

        var eventsCopy = events.slice().reverse(); //copy and reverse so we can modify while looping

        var segs = []; //Needed later for fullcalendar calls

        var tbody = $('<tbody></tbody>');

        this.scrollerEl = $('<div class="fc-scroller"></div>');

        this.el.html('')
            .append(this.scrollerEl).children()
            .append('<table style="border: 0; width:100%"></table>').children()
            .append(tbody);
        
        var periodEnd = this.end.clone(); //clone so as to not accidentally modify

        //console.log('Period start: ' + this.start.format("YYYY MM DD HH:mm:ss") + ', and end: ' + this.end.format("YYYY MM DD HH:mm:ss"));

        var currentDayStart = this.start.clone();
        while (currentDayStart.isBefore(periodEnd)) {

            var didAddDayHeader = false;
            var currentDayEnd = currentDayStart.clone().add(1, 'days');

            //console.log('=== this day start: ' + currentDayStart.format("YYYY MM DD HH:mm:ss") + ', and end: ' + currentDayEnd.format("YYYY MM DD HH:mm:ss"));

            //Assume events were ordered descending originally (notice we reversed them)
            for (var i = eventsCopy.length-1; i >= 0; --i) {
                var e = eventsCopy[i];

                //console.log(e.title);
                //console.log('event index: ' + (events.length-i-1) + ', and in copy: ' + i);
                //console.log('event start: ' + e.start.format("YYYY MM DD HH:mm:ss"));
                //console.log('event end: ' + this.calendar.getEventEnd(e).format("YYYY MM DD HH:mm:ss"));
                //console.log('currentDayEnd: ' + currentDayEnd.format("YYYY MM DD HH:mm:ss"));
                //console.log(currentDayEnd.isAfter(e.start));
                
                var eventEnd = this.calendar.getEventEnd(e);
                if (currentDayStart.isAfter(eventEnd) || currentDayStart.isSame(eventEnd) || periodEnd.isBefore(e.start)) {
                    eventsCopy.splice(i, 1);
                    //console.log("--- Removed the above event");
                }
                else if(currentDayEnd.isAfter(e.start)) {
                    //We found an event to display
                    
                    //console.log("+++ We added the above event");
                    
                    if (!didAddDayHeader) {
                        tbody.append('\
			                	<tr>\
			                		<th colspan="4">\
			                			<span class="fc-header-day">' + this.calendar.formatDate(currentDayStart, 'dddd') + '</span>\
			                			<span class="fc-header-date">' + this.calendar.formatDate(currentDayStart, this.opt('columnFormat')) + '</span>\
			                    	</th>\
			                    </tr>');

                        didAddDayHeader = true;
                    }

                    var segEl = $('\
                		<tr class="fc-row fc-event-container fc-content">\
                			<td class="fc-event-handle">\
                				<span class="fc-event"></span>\
                			</td>\
                			<td class="fc-time">' + (e.allDay ? this.opt('allDayText') : this.getEventTimeText(e))  + '</td>\
                			<td class="fc-title">' + e.title + '</td>\
                			<td class="fc-location">' + e.location || '' + '</td>\
                		</tr>');
                    tbody.append(segEl);

                    var seg = {
                        'el': segEl,
                        'event': e
                    };

                    //Tried to use fullcalendar code for this stuff but to no avail
                    var _this = this;
                    segEl.on('click', function(ev) {
                        return _this.trigger('eventClick', segEl, e, ev);
                    });

                    segs.push(seg);

                }

            }

            currentDayStart.add(1, 'days');
        }



       	this.updateHeight();

        this.segs = segs; //used in call below
        View.prototype.renderEvents.call(this, events);

    },

    updateWidth: function() {
        this.scrollerEl.width(this.el.width());
    },

    setHeight: function(height, isAuto) {
        //only seems to happen at resize

        var diff = this.el.outerHeight()-this.scrollerEl.height();

        this.scrollerEl.height(height-diff);
        
        var contentHeight = 0;
        this.scrollerEl.children().each(function(index, child) {
            contentHeight += $(child).outerHeight();
        });

        
        if(height-diff > contentHeight)
            this.scrollerEl.css('overflow-y', 'hidden');
        else
            this.scrollerEl.css('overflow-y', 'scroll');
        
    },

    getSegs: function() {
        return this.segs || [];
    },

    renderDrag: function(start, end, seg) {
        // subclasses should implement
    },

    // Unrenders a visual indication of event hovering
    destroyDrag: function() {
        // subclasses should implement
    },

    // Renders a visual indication of the selection
    renderSelection: function(start, end) {
        // subclasses should implement
    },

    // Unrenders a visual indication of selection
    destroySelection: function() {
        // subclasses should implement
    }

});
