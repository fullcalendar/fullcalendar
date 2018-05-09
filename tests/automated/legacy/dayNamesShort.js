describe('short day names', function() {
  var testableClasses = [
    'month',
    'agendaWeek',
    'basicWeek'
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
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'es' ]

  afterEach(function() {
    moment.locale('en') // reset moment's global locale
  })

  testableClasses.forEach(function(viewClass, index, viewClasses) {
    describe('when view is ' + viewClass, function() {
      pushOptions({
        defaultView: viewClass
      })
      describe('when locale is default', function() {
        it('should be in English', function() {
          moment.locale('en')
          initCalendar()

          var weekdays = moment.weekdaysShort()
          dayClasses.forEach(function(cls, index, classes) {
            expect($('.fc-view thead ' + cls)[0]).toContainText(weekdays[index])
          })
        })
      })

      describe('when locale is not default', function() {
        locales.forEach(function(locale, index, locales) {
          it('should be in the selected locale', function() {
            initCalendar({
              locale: locale
            })

            moment.locale(locale)
            var weekdays = moment.weekdaysShort()

            dayClasses.forEach(function(cls, index, classes) {
              expect($('.fc-view thead ' + cls)[0]).toContainText(weekdays[index])
            })
          })
        })
      })

      describe('when specified', function() {
        it('should contain the specified names in the given order', function() {
          var days = [
            'Hov.', 'maS.', 'veS.', 'mech.', 'parmaq.', 'HoS.'
          ]
          initCalendar({
            dayNamesShort: days
          })

          dayClasses.forEach(function(cls, index, classes) {
            expect($('.fc-view thead ' + cls)[0]).toContainText(days[index])
          })
        })
      })
    })
  })
})
