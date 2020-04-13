import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('defaultTimedEventDuration', function() {

  pushOptions({
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
    timeZone: 'UTC'
  })

  describe('when forceEventDuration is on', function() {

    pushOptions({
      forceEventDuration: true
    })

    it('correctly calculates an unspecified end when using a Duration object input', function() {
      initCalendar({
        defaultTimedEventDuration: { hours: 2, minutes: 30 },
        events: [
          {
            allDay: false,
            start: '2014-05-05T04:00:00'
          }
        ]
      })
      var event = currentCalendar.getEvents()[0]
      expect(event.end).toEqualDate('2014-05-05T06:30:00Z')
    })

    it('correctly calculates an unspecified end when using a string Duration input', function() {
      initCalendar({
        defaultTimedEventDuration: '03:15:00',
        events: [
          {
            allDay: false,
            start: '2014-05-05T04:00:00'
          }
        ]
      })
      var event = currentCalendar.getEvents()[0]
      expect(event.end).toEqualDate('2014-05-05T07:15:00Z')
    })
  })

  describe('when forceEventDuration is off', function() {

    pushOptions({
      forceEventDuration: false
    })

    describe('with week view', function() {

      pushOptions({
        initialView: 'timeGridWeek'
      })

      it('renders a timed event with no `end` to appear to have the default duration', function() {
        let calendar = initCalendar({
          defaultTimedEventDuration: '01:15:00',
          events: [
            {
              // a control. so we know how tall it should be
              title: 'control event',
              allDay: false,
              start: '2014-05-01T04:00:00',
              end: '2014-05-01T05:15:00'
            },
            {
              // one day after the control. no specified end
              title: 'test event',
              allDay: false,
              start: '2014-05-02T04:00:00'
            }
          ]
        })

        let calendarWrapper = new CalendarWrapper(calendar)
        var eventElms = calendarWrapper.getEventEls()

        var height0 = eventElms[0].offsetHeight
        var height1 = eventElms[1].offsetHeight
        expect(height0).toBeGreaterThan(0)
        expect(height0).toEqual(height1)
      })
    })

    describe('with dayGridWeek view', function() {

      pushOptions({
        initialView: 'dayGridWeek'
      })

      it('renders a timed event with no `end` to appear to have the default duration', function() {
        let calendar = initCalendar({
          defaultTimedEventDuration: { days: 2 },
          events: [
            {
              // a control. so we know how wide it should be
              title: 'control event',
              allDay: false,
              start: '2014-04-28T04:00:00',
              end: '2014-04-30T04:00:00'
            },
            {
              // one day after the control. no specified end
              title: 'test event',
              allDay: false,
              start: '2014-04-28T04:00:00'
            }
          ]
        })

        let calendarWrapper = new CalendarWrapper(calendar)
        var eventElms = calendarWrapper.getEventEls()

        var width0 = eventElms[0].offsetWidth
        var width1 = eventElms[1].offsetWidth
        expect(width0).toBeGreaterThan(0)
        expect(width0).toEqual(width1)
      })
    })
  })
})
