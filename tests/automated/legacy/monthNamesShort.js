describe('short month name', function() {
  var referenceDate = '2014-01-01' // The day the world is hung-over
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  pushOptions({
    defaultDate: referenceDate
  })

  afterEach(function() {
    moment.locale('en') // reset moment's global locale
  });

  [ 'agendaWeek', 'basicWeek' ].forEach(function(viewClass, index, viewClasses) {
    describe('when view is ' + viewClass, function() {
      pushOptions({
        defaultView: viewClass
      })

      describe('when locale is default', function() {
        beforeEach(function() {
          moment.locale('en')
        })
        pushOptions({
          locale: 'en'
        })

        moment.monthsShort().forEach(function(monthShort, index) {
          it('should be ' + monthShort, function(done) {
            initCalendar({
              defaultDate: $.fullCalendar.moment(referenceDate).add(index, 'months'),
              eventAfterAllRender: function() {
                expect($('.fc-toolbar h2')).toContainText(monthShort)
                done()
              }
            })
          })
        })
      })

      locales.forEach(function(locale, index, locales) {
        describe('when locale is ' + locale, function() {
          beforeEach(function() {
            moment.locale(locale)
          })
          pushOptions({
            locale: locale
          })

          moment.monthsShort().forEach(function(monthShort, index) { // `monthShort` will always be English
            it('should be the translated name for ' + monthShort, function(done) {
              var localeMonthsShort = moment.monthsShort()
              var localeMonthShort = localeMonthsShort[index]
              initCalendar({
                defaultDate: $.fullCalendar.moment(referenceDate).add(index, 'months'),
                eventAfterAllRender: function() {
                  expect($('.fc-toolbar h2')).toContainText(localeMonthShort)
                  done()
                }
              })
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
            initCalendar({
              defaultDate: $.fullCalendar.moment(referenceDate).add(index, 'months'),
              monthNamesShort: monthsShort,
              eventAfterAllRender: function() {
                expect($('.fc-toolbar h2')).toContainText(monthShort)
                done()
              }
            })
          })
        })
      })
    })
  })

})
