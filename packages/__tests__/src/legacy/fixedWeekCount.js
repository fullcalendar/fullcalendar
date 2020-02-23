import DayGridViewWrapper from "../lib/wrappers/DayGridViewWrapper"

describe('fixedWeekCount', function() {

  pushOptions({
    defaultView: 'dayGridMonth',
    defaultDate: '2014-07-01' // has 5 weeks
  })

  describe('when true', function() {
    pushOptions({
      fixedWeekCount: true
    })

    it('renders a 5-week month with 6 rows', function() {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      expect(dayGridWrapper.getRowEls().length).toBe(6)
    })
  })

  describe('when false', function() {
    pushOptions({
      fixedWeekCount: false
    })

    it('renders a 5-week month with 5 rows', function() {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      expect(dayGridWrapper.getRowEls().length).toBe(5)
    })
  });

  [ true, false ].forEach(function(bool) {
    describe('regardless of value (' + bool + ')', function() {
      pushOptions({
        fixedWeekCount: bool,
        defaultDate: '2014-08-01' // has 6 weeks
      })

      it('should render a 6-week month consistently', function() {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getRowEls().length).toBe(6)
      })
    })
  })

})
