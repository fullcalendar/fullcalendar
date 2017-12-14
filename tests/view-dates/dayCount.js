import { expectActiveRange } from './ViewDateUtils'
import { expectDay } from '../view-render/ViewRenderUtils'

describe('dayCount', function() {
  pushOptions({
    defaultDate: '2017-03-15', // wed
    weekends: false
  })

  describeOptions({
    'when specified as top-level options': {
      defaultView: 'basic',
      dayCount: 5
    },
    'when specified as custom view': {
      views: {
        myCustomView: {
          type: 'basic',
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
      defaultView: 'agenda',
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
})
