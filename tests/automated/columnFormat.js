describe('columnFormat', function() {

    beforeEach(function() {
        affix('#cal');
    });

    describe('when columnFormat is not set', function() {

        var viewWithFormat = [ { view: 'month', expected: 'Sun', selector: 'th.fc-day-header.fc-sun' },
            { view: 'basicWeek', expected: 'Sun 5/11', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaWeek', expected: 'Sun 5/11', selector: 'th.fc-widget-header.fc-sun' },
            { view: 'basicDay', expected: 'Sunday', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaDay', expected: 'Sunday', selector: 'th.fc-widget-header.fc-sun' } ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-05-11'
            });
        });

        it('should have default values', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(crtView.selector).text()).toBe(crtView.expected);
            };
        });
    });

    describe('when columnFormat is set on a per-view basis', function() {

        var viewWithFormat = [ { view: 'month', expected: 'Sunday', selector: 'th.fc-day-header.fc-sun' },
            { view: 'basicWeek', expected: 'Sunday 11 - 5', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaWeek', expected: 'Sunday 11 , 5', selector: 'th.fc-widget-header.fc-sun' },
            { view: 'basicDay', expected: 'Sunday 11 | 5', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaDay', expected: 'Sunday 5/11', selector: 'th.fc-widget-header.fc-sun' } ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-05-11',
                columnFormat: {
                    month: 'dddd',
                    agendaDay: 'dddd M/D',
                    agendaWeek: 'dddd D , M',
                    basicDay: 'dddd D | M',
                    basicWeek: 'dddd D - M'
                }
            });
        });

        it('should have the correct values', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(crtView.selector).text()).toBe(crtView.expected);
            };
        });
    });

    describe('when lang is French', function() {

        var viewWithFormat = [ { view: 'month', expected: 'dim.', selector: 'th.fc-day-header.fc-sun' },
            { view: 'basicWeek', expected: 'dim. 11/5', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaWeek', expected: 'dim. 11/5', selector: 'th.fc-widget-header.fc-sun' },
            { view: 'basicDay', expected: 'dimanche', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaDay', expected: 'dimanche', selector: 'th.fc-widget-header.fc-sun' } ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-05-11',
                lang: 'fr'
            });
        });

        it('should have the translated dates', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(crtView.selector).text()).toBe(crtView.expected);
            };
        });
    });

    describe('when lang is Korean', function() {

        var viewWithFormat = [ { view: 'month', expected: '일', selector: 'th.fc-day-header.fc-sun' },
            { view: 'basicWeek', expected: '일 5.11', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaWeek', expected: '일 5.11', selector: 'th.fc-widget-header.fc-sun' },
            { view: 'basicDay', expected: '일요일', selector: 'th.fc-day-header.fc-sun' },
            { view: 'agendaDay', expected: '일요일', selector: 'th.fc-widget-header.fc-sun' } ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-05-11',
                lang: 'ko'
            });
        });

        it('should have the translated dates and columnFormat should be computed differently', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(crtView.selector).text()).toBe(crtView.expected);
            };
        });
    });

    describe('using custom views', function() {

        it('multi-year default only displays day-of-week', function() {
            $('#cal').fullCalendar({
                views: {
                    multiYear: {
                        type: 'basic',
                        duration: { years: 2 }
                    }
                },
                defaultView: 'multiYear',
                defaultDate: '2014-12-25'
            });
            expect($('.fc-day-header:first')).toHaveText('Sun');
        });

        it('multi-month default only displays day-of-week', function() {
            $('#cal').fullCalendar({
                views: {
                    multiMonth: {
                        type: 'basic',
                        duration: { months: 2 }
                    }
                },
                defaultView: 'multiMonth',
                defaultDate: '2014-12-25'
            });
            expect($('.fc-day-header:first')).toHaveText('Sun');
        });

        it('multi-week default only displays day-of-week', function() {
            $('#cal').fullCalendar({
                views: {
                    multiWeek: {
                        type: 'basic',
                        duration: { weeks: 2 }
                    }
                },
                defaultView: 'multiWeek',
                defaultDate: '2014-12-25'
            });
            expect($('.fc-day-header:first')).toHaveText('Sun');
        });

        it('multi-day default displays short full date', function() {
            $('#cal').fullCalendar({
                views: {
                    multiDay: {
                        type: 'basic',
                        duration: { days: 2 }
                    }
                },
                defaultView: 'multiDay',
                defaultDate: '2014-12-25'
            });
            expect($('.fc-day-header:first')).toHaveText('Thu 12/25');
        });
    });
});
