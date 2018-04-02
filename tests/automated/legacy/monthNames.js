describe('month name', function() {
  var referenceDate = '2014-01-01' // The day the world is hung-over
  var locales = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ]

  pushOptions({
    defaultDate: referenceDate
  })

  afterEach(function() {
    moment.locale('en') // reset moment's global locale
  });

  [ 'month', 'agendaDay', 'basicDay' ].forEach(function(viewClass, index, viewClasses) {
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

        moment.months().forEach(function(month, index, months) {
          it('should be ' + month, function(done) {
            initCalendar({
              defaultDate: $.fullCalendar.moment(referenceDate).add(index, 'months'),
              eventAfterAllRender: function() {
                expect($('.fc-toolbar h2')).toContainText(month)
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

          moment.months().forEach(function(month, index, months) { // `month` will always be English
            it('should be the translated name for ' + month, function(done) {
              var localeMonths = moment.months()
              var localeMonth = localeMonths[index]
              var defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months')
              initCalendar({
                defaultDate: defaultDate,
                eventAfterAllRender: function() {
                  if (viewClass === 'month') { // with month view check for occurence of the monthname in the title
                    expect($('.fc-toolbar h2')).toContainText(localeMonth)
                  } else { // with day views ensure that title contains the properly formatted phrase
                    expect($('.fc-toolbar h2')).toHaveText(defaultDate.format('LL'))
                  }
                  done()
                }
              })
            })
          })
        })
      })

      describe('when names are specified', function() {
        var months = [
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

        months.forEach(function(month, index, months) { // `month` is our custom month name
          it('should be the translated name for ' + month, function(done) {
            initCalendar({
              defaultDate: $.fullCalendar.moment(referenceDate).add(index, 'months'),
              monthNames: months,
              eventAfterAllRender: function() {
                expect($('.fc-toolbar h2')).toContainText(month)
                done()
              }
            })
          })
        })
      })
    })
  })

})
