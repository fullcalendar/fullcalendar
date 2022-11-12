import { addDays } from '@fullcalendar/core/internal'
import { removeLtrCharCodes } from '../lib/string.js'
import { parseUtcDate } from '../lib/date-parsing.js'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('day names', () => {
  let sundayDate = parseUtcDate('2019-03-17')
  let locales = ['es', 'fr', 'de', 'zh-cn', 'nl']

  pushOptions({
    now: sundayDate,
  })

  describe('when view is dayGridDay', () => {
    pushOptions({
      initialView: 'dayGridDay',
    })

    describe('when locale is default', () => {
      pushOptions({
        locale: 'en',
      })

      CalendarWrapper.DOW_CLASSNAMES.forEach((dowClassName, index) => {
        let dayDate = addDays(sundayDate, index)
        let dayText = removeLtrCharCodes(
          dayDate.toLocaleString('en', { weekday: 'long', timeZone: 'UTC' }),
        )

        it('should be ' + dayText, () => {
          let calendar = initCalendar({
            now: dayDate,
          })
          let headerWrapper = new DayGridViewWrapper(calendar).header
          expect(headerWrapper.el.querySelector(`.${dowClassName}`)).toHaveText(dayText)
        })
      })
    })

    $.each(locales, (localeIndex, locale) => {
      describe('when locale is ' + locale, () => {
        CalendarWrapper.DOW_CLASSNAMES.forEach((dowClassName, index) => {
          let dayDate = addDays(sundayDate, index)
          let dayText = removeLtrCharCodes(
            dayDate.toLocaleString(locale, { weekday: 'long', timeZone: 'UTC' }),
          )

          it('should be the translation for ' + dayText, () => {
            let calendar = initCalendar({
              locale,
              now: dayDate,
            })
            let headerWrapper = new DayGridViewWrapper(calendar).header
            expect(headerWrapper.el.querySelector(`.${dowClassName}`)).toHaveText(dayText)
          })
        })
      })
    })
  })
})
