import { getHeaderEl } from '../view-render/DayGridRenderUtils'
import { DAY_CLASSES } from '../lib/constants'
import { removeLtrCharCodes } from '../lib/string'

describe('day names', function() {
  var sundayDate = new Date('2014-05-25T06:00:00')
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  pushOptions({
    now: sundayDate
  })

  describe('when view is basicDay', function() {
    pushOptions({
      defaultView: 'basicDay'
    })
    describe('when locale is default', function() {
      pushOptions({
        locale: 'en'
      })
      DAY_CLASSES.forEach(function(cls, index) {
        var dayDate = FullCalendar.addDays(sundayDate, index)
        var dayText = removeLtrCharCodes(
          dayDate.toLocaleString('en', { weekday: 'long' })
        )

        it('should be ' + dayText, function() {
          initCalendar({
            now: dayDate
          })
          expect(getHeaderEl().find(`.${cls}`)).toHaveText(dayText)
        })
      })
    })

    $.each(locales, function(index, locale) {
      describe('when locale is ' + locale, function() {
        DAY_CLASSES.forEach(function(cls, index, classes) {
          var dayDate = FullCalendar.addDays(sundayDate, index)
          var dayText = removeLtrCharCodes(
            dayDate.toLocaleString(locale, { weekday: 'long' })
          )

          it('should be the translation for ' + dayText, function() {

            initCalendar({
              locale: locale,
              now: dayDate
            })

            expect(getHeaderEl().find(`.${cls}`)).toHaveText(dayText)
          })
        })
      })
    })
  })

})
