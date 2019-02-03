import { expectActiveRange } from './ViewDateUtils'
import { expectDay } from '../view-render/ViewRenderUtils'

describe('dayCount', function() {
  pushOptions({
    defaultDate: '2017-03-15', // wed
    weekends: false
  })

  describeOptions({
    'when specified as top-level options': {
      defaultView: 'dayGrid',
      dayCount: 5
    },
    'when specified as custom view': {
      views: {
        myCustomView: {
          type: 'dayGrid',
          dayCount: 5
        }
      },
      defaultView: 'myCustomView'
    }
  }, function() {
    it('renders the exact day count', function() {
      initCalendar()
      expectActiveRange('2017-03-15', '2017-03-22')
      expectDay('2017-03-15', true)
      expectDay('2017-03-16', true)
      expectDay('2017-03-17', true)
      expectDay('2017-03-18', false) // sat
      expectDay('2017-03-19', false) // sun
      expectDay('2017-03-20', true)
      expectDay('2017-03-21', true)
    })
  })

  it('can span multiple weeks', function() {
    initCalendar({
      defaultView: 'timeGrid',
      dayCount: 9
    })
    expectActiveRange('2017-03-15', '2017-03-28')
    expectDay('2017-03-15', true)
    expectDay('2017-03-16', true)
    expectDay('2017-03-17', true)
    expectDay('2017-03-18', false) // sat
    expectDay('2017-03-19', false) // sun
    expectDay('2017-03-20', true)
    expectDay('2017-03-21', true)
    expectDay('2017-03-22', true)
    expectDay('2017-03-23', true)
    expectDay('2017-03-24', true)
    expectDay('2017-03-25', false) // sat
    expectDay('2017-03-26', false) // sun
    expectDay('2017-03-27', true)
  })

  it('can navigate in reverse with a small dateIncrement split by hidden days', function() {
    initCalendar({
      defaultDate: '2018-06-11',
      defaultView: 'timeGridTwoDay',
      header: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,timeGridTwoDay'
      },
      hiddenDays: [ 0, 6 ], // sunday, saturday
      views: {
        timeGridTwoDay: {
          type: 'timeGrid',
          dayCount: 2,
          dateIncrement: { days: 1 },
          buttonText: '2 days'
        }
      }
    })
    currentCalendar.prev()
    expectActiveRange('2018-06-08', '2018-06-12')
  })

})
