import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('dayHeaders', () => { // TODO: rename file
  pushOptions({
    initialDate: '2014-05-11',
  })

  describeOptions('initialView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    describe('when on', () => {
      pushOptions({
        dayHeaders: true,
      })

      it('should show header', () => {
        let calendar = initCalendar()
        let viewWrapper = new ViewWrapper(calendar)
        expect(viewWrapper.header).toBeTruthy()
      })
    })

    describe('when off', () => {
      pushOptions({
        dayHeaders: false,
      })

      it('should not show header', () => {
        let calendar = initCalendar()
        let viewWrapper = new ViewWrapper(calendar)
        expect(viewWrapper.header).toBeFalsy()
      })
    })
  })
})
