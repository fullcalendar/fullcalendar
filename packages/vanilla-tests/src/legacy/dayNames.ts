import { addDays } from 'fullcalendar/protected-api'
import { removeLtrCharCodes, moveDayNumberLast, removeCommas } from '../lib/string'
import { parseUtcDate } from '../lib/date-parsing'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('day names', () => {
  let sundayDate = parseUtcDate('2019-03-17')
  let locales = [
    'es',
    'fr',
    'de',
    'zh-cn',
    'nl',
  ]

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
          moveDayNumberLast(
            dayDate.toLocaleString('en', { weekday: 'long', day: 'numeric', timeZone: 'UTC' }),
          )
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
            moveDayNumberLast(
              removeCommas(
                dayDate.toLocaleString(locale, { weekday: 'long', day: 'numeric', timeZone: 'UTC' }),
              )
            )
          ).replace(/\.$/, '')

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
