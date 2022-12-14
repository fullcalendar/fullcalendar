import esLocale from '@fullcalendar/core/locales/es'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('weekText', () => { // TODO: rename file
  pushOptions({
    weekNumbers: true,
  });

  ['timeGridWeek'].forEach((viewName) => {
    describe('when views is ' + viewName, () => {
      pushOptions({
        initialView: viewName,
      })

      it('renders correctly by default', () => {
        let calendar = initCalendar()
        expectWeekNumberTitle(calendar, 'W')
      })

      it('renders correctly when unspecified and when locale is customized', () => {
        let calendar = initCalendar({
          locale: esLocale,
        })
        expectWeekNumberTitle(calendar, 'Sm')
      })

      it('renders correctly when customized and LTR', () => {
        let calendar = initCalendar({
          direction: 'ltr',
          weekText: 'YO',
        })
        expectWeekNumberTitle(calendar, 'YO')
      })

      it('renders correctly when customized and RTL', () => {
        let calendar = initCalendar({
          direction: 'rtl',
          weekText: 'YO',
        })
        expectWeekNumberTitle(calendar, 'YO')
      })
    })

    function expectWeekNumberTitle(calendar, title) {
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let text = viewWrapper.getHeaderWeekText()
        .replace(/\d/g, '').trim() // remove the number

      expect(text).toBe(title)
    }
  })
})
