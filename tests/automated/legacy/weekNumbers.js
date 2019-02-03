describe('weekNumbers', function() {

  var counts

  beforeEach(function() {
    counts = {}
  })

  afterEach(function() {
    currentCalendar.destroy()
  })

  describe('when using month view', function() {

    pushOptions({
      defaultView: 'dayGridMonth',
      fixedWeekCount: true // will make 6 rows
    })

    describe('with default weekNumbers', function() { // which is false!

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          initCalendar()
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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
          initCalendar({
            weekNumbersWithinDays: true
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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
          initCalendar()
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
          initCalendar({
            weekNumbersWithinDays: false
          })
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
          initCalendar({
            weekNumbersWithinDays: true
          })
          counts = getCounts()
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(6)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

    })

  })

  describe('when using dayGridWeek view', function() {

    pushOptions({
      defaultView: 'dayGridWeek'
    })

    describe('with default weekNumbers', function() {

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          initCalendar()
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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
          initCalendar()
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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
          initCalendar()
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
          initCalendar({
            weekNumbersWithinDays: false
          })
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
          initCalendar({
            weekNumbersWithinDays: true
          })
          counts = getCounts()
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(1)
          expect(counts.cornerWeekNumbers).toEqual(0)
        })
      })

    })

  })

  describe('when using an timeGrid view', function() {

    pushOptions({
      defaultView: 'timeGridWeek'
    })

    describe('with default weekNumbers', function() {

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          initCalendar()
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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
          initCalendar()
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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
          initCalendar()
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(1)
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(1)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should display week numbers in the top left corner only', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          counts = getCounts()
          expect(counts.allWeekNumbers).toEqual(1)
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(1)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should display week numbers in the top left corner only', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
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

    t.allWeekNumbers = $('.fc-week-number').length
    t.colWeekNumbers = $('.fc-content-skeleton thead td.fc-week-number').length
    t.cellWeekNumbers = $('.fc-content-skeleton thead .fc-day-top span.fc-week-number').length
    t.cornerWeekNumbers = $('.fc-axis.fc-widget-header.fc-week-number').length

    return t
  }
})
