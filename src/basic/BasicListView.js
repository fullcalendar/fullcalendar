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
        this.intervalEnd = this.intervalStart.clone().add(this.opt('basicListDays'), 'days');

        this.start = this.skipHiddenDays(this.intervalStart);
        this.end = this.skipHiddenDays(this.intervalEnd, -1, true);

        this.title = this.calendar.formatRange(
            this.start,
            this.end.clone().subtract(1), // make inclusive by subtracting 1 ms
            this.opt('titleFormat'),
            ' \u2014 ' // emphasized dash
        );

        //this.el.addClass('fc-basic-view').html(this.renderHtml());

        this.scrollerEl = this.el.find('.fc-day-grid-container');

        this.trigger('viewRender', this, this, this.el);

        // attach handlers to document. do it here to allow for destroy/rerender
        $(document)
            .on('mousedown', this.documentMousedownProxy)
            .on('dragstart', this.documentDragStartProxy); // jqui drag

    },

    renderEvents: function renderBasicListEvents(events) {

        var eventsCopy = events.slice().reverse();

        var segs = []; //Needed later for fullcalendar calls

        var tbody = $('<tbody></tbody>');
        var table = $('<table></table>')
            .append(tbody);

        var periodEnd = this.end.clone(); //clone so as to not accidentally modify

        var currentDayStart = this.start.clone();
        while (currentDayStart.isBefore(periodEnd)) {

            var didAddDayHeader = false;
            var currentDayEnd = currentDayStart.clone().add('days', 1).subtract('ms', 1);

            //Assume events were ordered originally (notice we reversed them)
            for (var i = eventsCopy.length-1; i >= 0; --i) {
                var e = eventsCopy[i];

                if (currentDayStart.isAfter(e.end) || periodEnd.isBefore(e.start))
                    eventsCopy.splice(i, 1);
                else if(currentDayEnd.isAfter(e.start)){
                    //We found an event to display
                    
                    if (!didAddDayHeader) {
                        tbody.append('\
			                	<tr>\
			                		<th colspan="4">\
			                			<span class="fc-header-day">' + currentDayStart.format('dddd') + '</span>\
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

            currentDayStart.add('days', 1)
        }


        this.el.html(table);

        this.segs = segs; //used in call below
        View.prototype.renderEvents.call(this, events);

    },

    updateWidth: function() {
        // subclasses should implement
    },

    setHeight: function(height, isAuto) {
        // subclasses should implement
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
