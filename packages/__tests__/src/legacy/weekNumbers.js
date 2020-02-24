import { getLegacyWeekNumberCounts } from "../lib/wrappers/DayGridWrapper"

describe('weekNumbers', function() {

  describe('when using month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth',
      fixedWeekCount: true // will make 6 rows
    })

    describe('with default weekNumbers', function() { // which is false!

      describe('and default weekNumbersWithinDays', function() {
        it('should not display week numbers at all', function() {
          initCalendar()
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to false', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: false
          })
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(0)
        })
      })

      describe('and weekNumbersWithinDays set to true', function() {
        it('should not display week numbers at all', function() {
          initCalendar({
            weekNumbersWithinDays: true
          })
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
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
          let counts = getLegacyWeekNumberCounts()
          expect(counts.allWeekNumbers).toEqual(1)
          expect(counts.colWeekNumbers).toEqual(0)
          expect(counts.cellWeekNumbers).toEqual(0)
          expect(counts.cornerWeekNumbers).toEqual(1)
        })
      })

    })

  })

})
