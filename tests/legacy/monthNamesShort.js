describe('short month name', function() {
  var settings = {}
  var referenceDate = '2014-01-01' // The day the world is hung-over
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  beforeEach(function() {
    affix('#cal')
    settings = {
      defaultDate: referenceDate
    }
  })

  afterEach(function() {
    moment.locale('en') // reset moment's global locale
  });

  [ 'agendaWeek', 'basicWeek' ].forEach(function(viewClass, index, viewClasses) {
    describe('when view is ' + viewClass, function() {
      beforeEach(function() {
        settings.defaultView = viewClass
      })

      describe('when locale is default', function() {
        beforeEach(function() {
          settings.locale = 'en'
          moment.locale('en')
        })

        moment.monthsShort().forEach(function(monthShort, index) {
          it('should be ' + monthShort, function(done) {
            settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months')
            settings.eventAfterAllRender = function() {
              expect($('.fc-toolbar h2')).toContainText(monthShort)
              done()
            }

            $('#cal').fullCalendar(settings)
          })
        })
      })

      locales.forEach(function(locale, index, locales) {
        describe('when locale is ' + locale, function() {
          beforeEach(function() {
            settings.locale = locale
            moment.locale(locale)
          })

          moment.monthsShort().forEach(function(monthShort, index) { // `monthShort` will always be English
            it('should be the translated name for ' + monthShort, function(done) {
              var localeMonthsShort = moment.monthsShort()
              var localeMonthShort = localeMonthsShort[index]

              settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months')
              settings.eventAfterAllRender = function() {
                expect($('.fc-toolbar h2')).toContainText(localeMonthShort)
                done()
              }

              $('#cal').fullCalendar(settings)
            })
          })
        })
      })

      describe('when names are specified', function() {
        var monthsShort = [
          'I',
          'II',
          'III',
          'IV',
          'V',
          'VI',
          'VII',
          'IIX',
          'IX',
          'X',
          'XI',
          'XII'
        ]

        monthsShort.forEach(function(monthShort, index) { // `monthShort` will be our custom month name
          it('should be the translated name for ' + monthShort, function(done) {
            settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months')
            settings.monthNamesShort = monthsShort
            settings.eventAfterAllRender = function() {
              expect($('.fc-toolbar h2')).toContainText(monthShort)
              done()
            }

            $('#cal').fullCalendar(settings)
          })
        })
      })
    })
  })

})
