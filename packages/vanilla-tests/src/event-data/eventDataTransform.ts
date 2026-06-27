describe('eventDataTransform', () => {
  let transform = (raw) => (
    $.extend({}, raw, {
      was_processed: true,
    })
  )

  describeOptions({
    'when on the calendar': {
      events: [
        { start: '2017-10-23' },
      ],
      eventDataTransform: transform,
    },
    'when on an event source': {
      eventSources: [{
        events: [
          { start: '2017-10-23' },
        ],
        eventDataTransform: transform,
      }],
    },
  }, () => {
    it('affects parsing of the event', () => {
      let calendar = initCalendar()
      let eventObj = calendar.getEvents()[0]
      expect(eventObj.extendedProps.was_processed).toBe(true)
    })
  })
})
