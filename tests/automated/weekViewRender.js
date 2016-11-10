describe('weekViewRender', function() {

    beforeEach(function() {
        affix('#cal');
    });

    describe('verify th class for today', function() {

        var dataNow = $.fullCalendar.moment(new Date()).format('YYYY-MM-DD');

        var weekView = { view: 'agendaWeek', expectedToday: 'fc-today', selector: 'th.fc-day-header' };

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: dataNow
            });
        });

        it('should have fc-today class only on "today"', function() {
            var cal = $('#cal');
            cal.fullCalendar('changeView', weekView.view);
            var allHeaders = cal.find(weekView.selector);
            for (var i = 0; i < allHeaders.length; ++i) {
                var jQueryHeader = $(allHeaders[i]);
                var today = jQueryHeader.data('date') == dataNow;
                var hasTodayClass = jQueryHeader.hasClass('fc-today');
                expect(today).toBe(hasTodayClass);
            }
        });
    });
});
