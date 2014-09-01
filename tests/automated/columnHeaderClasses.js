describe('columnHeaderClasses', function() {
    beforeEach(function() {
        affix('#cal');
    });

    describe('some description', function() {
        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-08-27',
                now: '2014-08-27',
                defaultView: 'agendaWeek',
            });
        });
        it('should have css-class `fc-today` on 2014-08-27', function() {
            var cal = $('#cal');
            expect(cal.find('th.fc-widget-header.fc-tue').hasClass('fc-today')).toBe(false);
            expect(cal.find('th.fc-widget-header.fc-wed').hasClass('fc-today')).toBe(true);
            expect(cal.find('th.fc-widget-header.fc-thu').hasClass('fc-today')).toBe(false);
        });
    });
});
