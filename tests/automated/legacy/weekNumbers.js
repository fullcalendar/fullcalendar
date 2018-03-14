
describe('weekNumbers', function() {

  var options = {}
  var counts = {}

  afterEach(function() {
    $('#cal').fullCalendar('destroy')
  })

  describe('when using month view', function() {

    pushOptions({
      defaultView: 'month',
      fixedWeekCount: true // will make 6 rows
    })

    describe('with default weekNumbers', function() { // which is false!

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

    })

    describe('with weekNumbers to false', function() {

      pushOptions({
        weekNumbers: false
      })

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

    })

    describe('with weekNumbers to true', function() {

      pushOptions({
        weekNumbers: true
      })

      describe('and default weekNumbersWithinDays', function() {
        it('should display week numbers along the side only', function() {
          counts = getCounts()
          // TODO: Is it possible to remove class fc-week-number from
          // headers and fillers, bringing allWeekNumbers down to 6?
          expect(counts.colWeekNumbers).toEqual(6)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should display week numbers along the side only', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          // TODO: Is it possible to remove class fc-week-number from
          // headers and fillers, bringing allWeekNumbers down to 6?
          expect(counts.colWeekNumbers).toEqual(6)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should display week numbers in the day cells only', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(6)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

    })

  })

  describe('when using basicWeek view', function() {

    pushOptions({
      defaultView: 'basicWeek'
    })

    describe('with default weekNumbers', function() {

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

    })

    describe('with weekNumbers to false', function() {

      pushOptions({
        weekNumbers: false
      })

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

    })

    describe('with weekNumbers to true', function() {

      pushOptions({
        weekNumbers: true
      })

      describe('and default weekNumbersWithinDays', function() {
        it('should display week numbers along the side only', function() {
          counts = getCounts()
          // TODO: Is it possible to remove class fc-week-number from
          // headers and fillers, bringing allWeekNumbers down to 1?
          expect(counts.colWeekNumbers).toEqual(1)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should display week numbers along the side only', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          // TODO: Is it possible to remove class fc-week-number from
          // headers and fillers, bringing allWeekNumbers down to 1?
          expect(counts.colWeekNumbers).toEqual(1)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should display week numbers in the day cells only', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(1)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

    })

  })

  describe('when using an agenda view', function() {

    pushOptions({
      defaultView: 'agendaWeek'
    })

    describe('with default weekNumbers', function() {

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

    })

    describe('with weekNumbers to false', function() {

      pushOptions({
        weekNumbers: false
      })

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

    })

    describe('with weekNumbers to true', function() {

      pushOptions({
        weekNumbers: true
      })

      describe('and default weekNumbersWithinDays', function() {
        it('should display week numbers in the top left corner only', function() {
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(1)
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(1)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should display week numbers in the top left corner only', function() {
          options.weekNumbersWithinDays = false
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(1)
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(1)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should display week numbers in the top left corner only', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(1)
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(1)
        })
      })

    })

  })

  function getCounts() {
    var t = {}

    initCalendar(options)

    t.allWeekNumbers = $('.fc-week-number').length
    t.colWeekNumbers = $('.fc-content-skeleton thead td.fc-week-number').length
    t.cellWeekNumbers = $('.fc-content-skeleton thead .fc-day-top span.fc-week-number').length
    t.cornerWeekNumbers = $('.fc-axis.fc-widget-header.fc-week-number').length

    return t
  }
})
