describe('events as an array', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2014-05-01',
  })

  function getEventArray() {
    return [
      {
        title: 'my event',
        start: '2014-05-21',
      },
    ]
  }

  it('accepts an event using dayGrid form', (done) => {
    initCalendar({
      events: getEventArray(),
      eventDidMount(arg) {
        expect(arg.event.title).toEqual('my event')
        done()
      },
    })
  })

  it('accepts an event using extended form', (done) => {
    initCalendar({
      eventSources: [
        {
          classNames: 'customeventclass',
          events: getEventArray(),
        },
      ],
      eventDidMount(arg) {
        expect(arg.event.title).toEqual('my event')
        expect(arg.el).toHaveClass('customeventclass')
        done()
      },
    })
  })

  it('doesn\'t mutate the original array', (done) => {
    let eventArray = getEventArray()
    let origArray = eventArray
    let origEvent = eventArray[0]
    initCalendar({
      events: eventArray,
      eventDidMount() {
        expect(origArray).toEqual(eventArray)
        expect(origEvent).toEqual(eventArray[0])
        done()
      },
    })
  })
})
