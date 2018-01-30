describe('defaultAllDayEventDuration', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'month'
  })

  describe('when forceEventDuration is on', function() {

    pushOptions({
      forceEventDuration: true
    })

    it('correctly calculates an unspecified end when using a Duration object input', function() {

      initCalendar({
        defaultAllDayEventDuration: { days: 2 },
        events: [
          {
            allDay: true,
            start: '2014-05-05'
          }
        ]
      })

      var event = currentCalendar.clientEvents()[0]
      expect(event.end).toEqualMoment('2014-05-07')
    })

    it('correctly calculates an unspecified end when using a string Duration input', function() {

      initCalendar({
        defaultAllDayEventDuration: '3.00:00:00',
        events: [
          {
            allDay: true,
            start: '2014-05-05'
          }
        ]
      })

      var event = currentCalendar.clientEvents()[0]
      expect(event.end).toEqualMoment('2014-05-08')
    })
  })

  describe('when forceEventDuration is off', function() {

    pushOptions({
      forceEventDuration: false
    })

    describeOptions('defaultView', {
      'with basicWeek view': 'basicWeek',
      'with agendaWeek view': 'agendaWeek'
    }, function() {
      it('renders an all-day event with no `end` to appear to have the default duration', function(done) {
        initCalendar({
          defaultAllDayEventDuration: { days: 2 },
          events: [
            {
              // a control. so we know how wide it should be
              title: 'control event',
              allDay: true,
              start: '2014-04-28',
              end: '2014-04-30'
            },
            {
              // one day after the control. no specified end
              title: 'test event',
              allDay: true,
              start: '2014-04-28'
            }
          ],
          eventAfterAllRender: function() {
            var eventElms = $('.fc-event', currentCalendar.el)
            var width0 = eventElms.eq(0).outerWidth()
            var width1 = eventElms.eq(1).outerWidth()
            expect(width0).toBeGreaterThan(0)
            expect(width0).toEqual(width1)
            done()
          }
        })
      })
    })
  })
})
