describe('nowIndicatorRender', function () {
    it('is triggered upon initialization of a view, with correct parameters', function () {
        var options = {
            defaultView: 'timeGridWeek',
            fixedWeekCount: true,
            defaultDate: '2014-05-01',
            nowIndicator: true,
            nowIndicatorRender: function (arg) {
              expect(arg.view).toEqual(currentCalendar.view)
              expect(arg.els).toEqual(jasmine.any(Array));
            }
        };
        spyOn(options, 'nowIndicatorRender').and.callThrough();
        initCalendar(options);
        expect(options.nowIndicatorRender.calls.count()).toEqual(1);
    });

    it('is called when view is changed', function () {
        var options = {
            defaultView: 'dayGridWeek',
            fixedWeekCount: true,
            defaultDate: '2014-05-01',
            nowIndicator: true,
            nowIndicatorRender: function (arg) {}
        };
        spyOn(options, 'nowIndicatorRender').and.callThrough();
        initCalendar(options);
        options.nowIndicatorRender.calls.reset();
        currentCalendar.changeView('timeGridWeek');
        expect(options.nowIndicatorRender.calls.count()).toEqual(1);
    });
});
