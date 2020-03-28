import { removeLtrCharCodes } from '../lib/string'
import { addDays } from '@fullcalendar/core'
import { parseUtcDate } from '../lib/date-parsing'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'


describe('day names', function() {
  var sundayDate = parseUtcDate('2019-03-17')
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  pushOptions({
    now: sundayDate
  })

  describe('when view is dayGridDay', function() {
    pushOptions({
      defaultView: 'dayGridDay'
    })

    describe('when locale is default', function() {
      pushOptions({
        locale: 'en'
      })

      CalendarWrapper.DOW_CLASSNAMES.forEach(function(dowClassName, index) {
        var dayDate = addDays(sundayDate, index)
        var dayText = removeLtrCharCodes(
          dayDate.toLocaleString('en', { weekday: 'long', timeZone: 'UTC' })
        )

        it('should be ' + dayText, function() {
          let calendar = initCalendar({
            now: dayDate
          })
          let headerWrapper = new DayGridViewWrapper(calendar).header
          expect(headerWrapper.el.querySelector(`.${dowClassName}`)).toHaveText(dayText)
        })
      })
    })

    $.each(locales, function(index, locale) {
      describe('when locale is ' + locale, function() {

        CalendarWrapper.DOW_CLASSNAMES.forEach(function(dowClassName, index) {
          var dayDate = addDays(sundayDate, index)
          var dayText = removeLtrCharCodes(
            dayDate.toLocaleString(locale, { weekday: 'long', timeZone: 'UTC' })
          )

          it('should be the translation for ' + dayText, function() {
            let calendar = initCalendar({
              locale: locale,
              now: dayDate
            })
            let headerWrapper = new DayGridViewWrapper(calendar).header
            expect(headerWrapper.el.querySelector(`.${dowClassName}`)).toHaveText(dayText)
          })
        })
      })
    })
  })

})
