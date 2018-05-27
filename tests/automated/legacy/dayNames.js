describe('day names', function() {
  var testableClasses = [
    'basicDay',
    'agendaDay'
  ]
  var dayClasses = [
    '.fc-sun',
    '.fc-mon',
    '.fc-tue',
    '.fc-wed',
    '.fc-thu',
    '.fc-fri',
    '.fc-sat'
  ]
  var sundayDate = new Date('2014-05-25T06:00:00Z')
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  pushOptions({
    now: sundayDate,
    timezone: 'UTC'
  })

  afterEach(function() {
    moment.locale('en') // reset moment's global locale
  })

  testableClasses.forEach(function(viewClass, index, viewClasses) {
    describe('when view is basicDay', function() {
      pushOptions({
        defaultView: 'basicDay'
      })
      describe('when locale is default', function() {
        pushOptions({
          locale: 'en'
        })
        dayClasses.forEach(function(cls, index, classes) {
          var dayDate = FullCalendar.addDays(sundayDate, index)
          var dayText = dayDate.toLocaleString('en', { weekday: 'long' })

          it('should be ' + dayText, function() {
            initCalendar({
              now: dayDate
            })
            expect($('.fc-view thead ' + dayClasses[index])).toHaveText(dayText)
          })
        })
      })

      $.each(locales, function(index, locale) {
        describe('when locale is ' + locale, function() {
          dayClasses.forEach(function(cls, index, classes) {
            var dayDate = FullCalendar.addDays(sundayDate, index)
            var dayText = dayDate.toLocaleString(locale, { weekday: 'long' })

            it('should be the translation for ' + dayText, function() {

              initCalendar({
                locale: locale,
                now: dayDate
              })

              expect($('.fc-view thead ' + dayClasses[index])).toHaveText(dayText)
            })
          })
        })
      })
    })
  })
})
