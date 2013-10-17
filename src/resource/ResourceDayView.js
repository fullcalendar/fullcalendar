fcViews.resource = ResourceDayView;

function ResourceDayView(element, calendar) {
    var t = this;


    // exports
    t.render = render;

    // imports
    ResourceView.call(t, element, calendar, 'resource');
    var opt = t.opt;
    var renderResource = t.renderResource;
    var formatDates = calendar.formatDates;

    function render(date, delta) {
        if (delta) {
            addDays(date, delta);
        }        
        t.title = formatDate(date, opt('titleFormat'));
        t.start = cloneDate(date, true);
        t.end = cloneDate(t.start, true);
        t.visStart = cloneDate(t.start, true);
        t.visEnd = cloneDate(t.start, true);
        renderResource(1);
    }
}
