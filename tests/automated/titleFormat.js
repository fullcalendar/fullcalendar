describe('titleFormat', function() {

    var SELECTOR = '.fc-toolbar h2';

    beforeEach(function() {
        affix('#cal');
    });

    describe('when default', function() {

        var viewWithFormat = [
            { view: 'month', expected: 'June 2014' },
            { view: 'basicWeek', expected: /Jun 8 - 14,? 2014/ },  // moment changed LL defaults after 2.8
            { view: 'agendaWeek', expected: /Jun 8 - 14,? 2014/ }, // "
            { view: 'basicDay', expected: /June 12,? 2014/ },      // "
            { view: 'agendaDay', expected: /June 12,? 2014/ }      // "
        ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-06-12',
                titleRangeSeparator: ' - '
            });
        });

        it('should have default values', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(SELECTOR).text()).toMatch(crtView.expected);
            };
        });
    });

    describe('when set on a per-view basis', function() {

        var viewWithFormat = [
            { view: 'month', expected: '2014, June' },
            { view: 'basicWeek', expected: '8 - 14 6 2014' },
            { view: 'agendaWeek', expected: '8 - 14, 6, 2014' },
            { view: 'basicDay', expected: 'Thursday June 12 2014' },
            { view: 'agendaDay', expected: 'Thursday, June, 12, 2014' }
        ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-06-12',
                titleRangeSeparator: ' - ',
                titleFormat: {
                    month: 'YYYY, MMMM',
                    basicWeek: 'D M YYYY',
                    agendaWeek: 'D, M, YYYY',
                    basicDay: 'dddd MMMM D YYYY',
                    agendaDay: 'dddd, MMMM, D, YYYY'
                }
            });
        });

        it('should have the correct values', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(SELECTOR).text()).toBe(crtView.expected);
            };
        });
    });

    describe('when default and language is French', function() {

        var viewWithFormat = [
            { view: 'month', expected: 'juin 2014' },
            { view: 'basicWeek', expected: '9 - 15 juin 2014' },
            { view: 'agendaWeek', expected: '9 - 15 juin 2014' },
            { view: 'basicDay', expected: '12 juin 2014' },
            { view: 'agendaDay', expected: '12 juin 2014' }
        ];

        beforeEach(function() {
            $('#cal').fullCalendar({
                defaultDate: '2014-06-12',
                titleRangeSeparator: ' - ',
                lang: 'fr'
            });
        });

        it('should have the translated dates', function() {
            var cal = $('#cal');

            for (var i = 0; i <  viewWithFormat.length; i++) {
                var crtView = viewWithFormat[i];
                cal.fullCalendar('changeView', crtView.view);
                expect(cal.find(SELECTOR).text()).toBe(crtView.expected);
            };
        });
    });

    describe('using custom views', function() {

        it('multi-year default only displays year', function() {
            $('#cal').fullCalendar({
                views: {
                    multiYear: {
                        type: 'basic',
                        duration: { years: 2 }
                    }
                },
                defaultView: 'multiYear',
                defaultDate: '2014-12-25',
                titleRangeSeparator: ' - '
            });
            expect($('h2')).toHaveText('2014 - 2015');
        });

        it('multi-month default only displays month/year', function() {
            $('#cal').fullCalendar({
                views: {
                    multiMonth: {
                        type: 'basic',
                        duration: { months: 2 }
                    }
                },
                defaultView: 'multiMonth',
                defaultDate: '2014-12-25',
                titleRangeSeparator: ' - '
            });
            expect($('h2')).toHaveText('December 2014 - January 2015');
        });

        it('multi-week default displays short full date', function() {
            $('#cal').fullCalendar({
                views: {
                    multiWeek: {
                        type: 'basic',
                        duration: { weeks: 2 }
                    }
                },
                defaultView: 'multiWeek',
                defaultDate: '2014-12-25',
                titleRangeSeparator: ' - '
            });
            expect($('h2').text()).toMatch(/Dec 21\,? 2014 \- Jan 3\,? 2015/);
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
                defaultDate: '2014-12-25',
                titleRangeSeparator: ' - '
            });
            expect($('h2').text()).toMatch(/Dec 25 \- 26\,? 2014/);
        });
    });
});
