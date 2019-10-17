describe('eventLimit', function() {

  pushOptions({
    defaultDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
    eventLimit: 3
  })

  describe('as a number', function() {

    describeOptions('defaultView', {
      'when in month view': 'dayGridMonth',
      'when in dayGridWeek view': 'dayGridWeek',
      'when in week view': 'timeGridWeek'
    }, function() {

      it('doesn\'t display a more link when limit is more than the # of events', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' }
          ]
        })
        expect($('.fc-more').length).toBe(0)
      })

      it('doesn\'t display a more link when limit equal to the # of events', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' }
          ]
        })
        expect($('.fc-more').length).toBe(0)
      })

      it('displays a more link when limit is less than the # of events', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' }
          ]
        })
        expect($('.fc-more').length).toBe(1)
        expect($('.fc-more')).toHaveText('+2 more')
      })

      it('displays one more per day, when a multi-day event is above', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' }
          ]
        })
        var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)')
        expect($('.fc-more').length).toBe(2)
        expect($('.fc-more').eq(0)).toHaveText('+2 more')
        expect($('.fc-more').eq(0)).toBeBoundedBy(cells.eq(2))
        expect($('.fc-more').eq(1)).toHaveText('+2 more')
        expect($('.fc-more').eq(1)).toBeBoundedBy(cells.eq(3))
      })

      it('will render a link in a multi-day event\'s second column ' +
        'if it has already been hidden in the first',
      function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29' }
          ]
        })
        var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)')
        expect($('.fc-more').length).toBe(2)
        expect($('.fc-more').eq(0)).toHaveText('+2 more')
        expect($('.fc-more').eq(0)).toBeBoundedBy(cells.eq(2))
        expect($('.fc-more').eq(1)).toHaveText('+1 more')
        expect($('.fc-more').eq(1)).toBeBoundedBy(cells.eq(3))
      })

      it('will render a link in a multi-day event\'s second column ' +
        'if it has already been hidden in the first even if he second column hardly has any events',
      function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' }
          ]
        })
        var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)')
        var link = $('.fc-more').eq(0) // will appear to be the third link, but will be in first row, so 0dom
        expect(link.length).toBe(1)
        expect(link).toHaveText('+1 more')
        expect(link).toBeBoundedBy(cells.eq(3))
      })

      it('will render a link in place of a hidden single day event, if covered by a multi-day', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28' },
            { title: 'event2', start: '2014-07-28' }
          ]
        })
        var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)')
        var link = $('.fc-more').eq(0)
        expect(link.length).toBe(1)
        expect(link).toHaveText('+2 more')
        expect(link).toBeBoundedBy(cells.eq(1))
      })

      it('will render a link in place of a hidden single day event, if covered by a multi-day ' +
        'and in its second column',
      function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' }
          ]
        })
        var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)')
        var link = $('.fc-more').eq(0)
        expect(link.length).toBe(1)
        expect(link).toHaveText('+2 more')
        expect(link).toBeBoundedBy(cells.eq(2))
      })
    })
  })

  describe('when auto', function() {

    pushOptions({
      eventLimit: true
    })

    describe('in month view', function() {

      pushOptions({
        defaultView: 'dayGridMonth',
        events: [
          { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' }
        ]
      })

      it('renders the heights of all the rows the same, regardless of # of events', function() {
        initCalendar()
        var rowEls = $('.fc-day-grid .fc-row').slice(0, -1) // remove last b/c it will be a different height
        expect(rowEls.length).toBeGreaterThan(0)

        var firstRowHeight = Math.round(rowEls[0].getBoundingClientRect().height)

        rowEls.each(function(i, node) {
          expect(
            Math.round(node.getBoundingClientRect().height)
          ).toBe(firstRowHeight)
        })
      })

      it('renders a more link when there are obviously too many events', function() {
        var $el = $('<div id="calendar">').appendTo('body').width(800)
        initCalendar({}, $el)
        expect($('.fc-more', currentCalendar.el).length).toBe(1)
      })
    })

    describeOptions('defaultView', {
      'when in month view': 'dayGridMonth',
      'when in dayGridWeek view': 'dayGridWeek'
    }, function() {

      it('doesn\'t render a more link where there should obviously not be a limit', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' }
          ]
        })
        expect($('.fc-more').length).toBe(0)
      })
    })

    describe('in week view', function() {

      pushOptions({
        defaultView: 'timeGridWeek'
      })

      it('behaves as if limit is 5', function() {
        initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' }
          ]
        })
        expect($('.fc-event:visible').length).toBe(4)
        expect($('.fc-more').length).toBe(1)
        expect($('.fc-more')).toHaveText('+3 more')
      })
    })
  })
})
