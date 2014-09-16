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
        var out = date.clone().stripTime().add(delta, 'days');
        out = this.skipHiddenDays(out, delta < 0 ? -1 : 1);
        return out;
    },


    render: function(date) {

        this.intervalStart = date.clone().stripTime();
        this.intervalEnd = this.intervalStart.clone().add(this.opt('basicListDays'), 'days');

        this.start = this.skipHiddenDays(this.intervalStart);
        this.end = this.skipHiddenDays(this.intervalEnd, -1, true);

        this.title = this.calendar.formatRange(
            this.start,
            this.end.clone().subtract(1), // make inclusive by subtracting 1 ms
            this.opt('titleFormat'),
            ' \u2014 ' // emphasized dash
        );

        BasicView.prototype.render.call(this, 1, 1, false); // call the super-method
    },

    renderEvents: function renderBasicListEvents(events) {

        //Assume "events" are only events we want to show

        var daysToDisplay = {}; //keys are dates (moments) and objects are events[]

        for (var i = 0; i < events.length; ++i) {
            var e = events[i];

            var currentDay = e.start.clone().startOf('day');
            var lastDay = e.end;

            while (currentDay.isBefore(lastDay)) {

                if (currentDay in daysToDisplay)
                    daysToDisplay[currentDay].push(e);
                else
                    daysToDisplay[currentDay] = [e];

                currentDay = currentDay.add('days', 1);

            }

        }

        var html = '\
        	<table>\
        		<tbody>';

        var current = this.start.clone().startOf('day');
        var end = this.end.clone();
        while (current.isBefore(end)) {

            if (current in daysToDisplay) {

                html += '\
                	<tr>\
                		<th colspan="4">\
                			<span class="fc-header-date">' + current.format() + '</span>\
                			<span class="fc-header-day">' + current.format() + '</span>\
                    	</th>\
                    </tr>';

                var events = daysToDisplay[current];
                for (var i = 0; i < events.length; ++i)
                    html += '\
                		<tr>\
                			<td class="fc-event-handle">\
                				<span class="fc-event"></span>\
                			</td>\
                			<td class="fc-event-time">' + 'TODO time' + '</td>\
                			<td class="fc-event-title">' + events[i].title + '</td>\
                			<td class="fc-event-location">' + events[i].location || '' + '</td>\
                		</tr>';



            }

            current.add('days', 1)
        }

        html += '\
        		</tbody>\
        	</table>';

        this.el.html(html);

        //View.prototype.renderEvents.call(this, events);

    }

});
