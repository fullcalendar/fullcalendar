describe('day names', function() {
  var settings = {}
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
  var referenceDate = '2014-05-25 06:00' // A sunday
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  beforeEach(function() {
    affix('#cal')
    settings = {
      now: moment(referenceDate).toISOString()
    }
  })

  afterEach(function() {
    moment.locale('en') // reset moment's global locale
  })

  testableClasses.forEach(function(viewClass, index, viewClasses) {
    describe('when view is basicDay', function() {
      beforeEach(function() {
        settings.defaultView = 'basicDay'
      })

      describe('when locale is default', function() {
        beforeEach(function() {
          settings.locale = 'en'
        })

        dayClasses.forEach(function(cls, index, classes) {
          var weekdays = moment.weekdays()
          it('should be ' + weekdays[index], function() {
            settings.now = moment(referenceDate).add(index, 'days')
            $('#cal').fullCalendar(settings)

            expect($('.fc-view thead ' + dayClasses[index])).toHaveText(weekdays[index])
          })
        })
      })

      $.each(locales, function(index, locale) {
        describe('when locale is ' + locale, function() {
          beforeEach(function() {
            moment.locale(locale)
          })

          dayClasses.forEach(function(cls, index, classes) {
            it('should be the translation for ' + moment.weekdays()[index], function() {
              settings.locale = locale
              settings.now = moment(referenceDate).add(index, 'days')
              $('#cal').fullCalendar(settings)

              expect($('.fc-view thead ' + dayClasses[index])).toHaveText(moment.weekdays()[index])
            })
          })
        })
      })

      describe('when daynames are specified', function() {
        var weekdays = [
          'Hovjaj',
          'maSjaj',
          'veSjaj',
          'mechjaj',
          'jevjaj',
          'parmaqjaj',
          'HoSjaj'
        ]

        dayClasses.forEach(function(cls, idx, classes) {
          it('should be ' + weekdays[idx], function() {
            settings.dayNames = [].slice.call(weekdays) // copy. in case there is a mutation
            settings.now = moment(referenceDate).add(idx, 'days')

            $('#cal').fullCalendar(settings)

            expect($('.fc-view thead ' + cls)).toHaveText(weekdays[idx])
          })
        })
      })
    })
  })
})
