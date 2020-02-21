import esLocale from '@fullcalendar/core/locales/es'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper';

describe('weekLabel', function() {
  pushOptions({
    weekNumbers: true
  })

  ;[ 'dayGridWeek', 'timeGridWeek' ].forEach(function(viewName) {

    describe('when views is ' + viewName, function() {
      pushOptions({
        defaultView: viewName
      })

      it('renders correctly by default', function() {
        let calendar = initCalendar()
        expectWeekNumberTitle(calendar, 'W')
      })

      it('renders correctly when unspecified and when locale is customized', function() {
        let calendar = initCalendar({
          locale: esLocale
        })
        expectWeekNumberTitle(calendar, 'Sm')
      })

      it('renders correctly when customized and LTR', function() {
        let calendar = initCalendar({
          dir: 'ltr',
          weekLabel: 'YO'
        })
        expectWeekNumberTitle(calendar, 'YO')
      })

      it('renders correctly when customized and RTL', function() {
        let calendar = initCalendar({
          dir: 'rtl',
          weekLabel: 'YO'
        })
        expectWeekNumberTitle(calendar, 'YO')
      })
    })


    function expectWeekNumberTitle(calendar, title) {
      let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper
      let headerWrapper = new ViewWrapper(calendar).header
      let text = headerWrapper.getWeekNumberTitle()
        .replace(/\d/g, '').trim() // remove the number

      expect(text).toBe(title)
    }

  })
})
