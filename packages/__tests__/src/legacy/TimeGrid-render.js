import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('Agenda view rendering', function() {
  pushOptions({
    defaultView: 'timeGridWeek'
  })

  describe('when LTR', function() {
    pushOptions({
      dir: 'ltr'
    })

    it('renders the axis on the left', function() {
      let calendar = initCalendar()
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let headerWrapper = viewWrapper.header
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      expect(headerWrapper.getAxisEl())
        .toBeLeftOf(headerWrapper.getCellEls()[0])

      expect(dayGridWrapper.getAxisEls()[0])
        .toBeLeftOf(dayGridWrapper.getAllDayEls()[0])

      expect(timeGridWrapper.getSlotAxisEls()[0])
        .toBeLeftOf(timeGridWrapper.getSlotNonAxisEls()[0])
    })
  })

  describe('when RTL', function() {
    pushOptions({
      dir: 'rtl'
    })

    it('renders the axis on the right', function() {
      let calendar = initCalendar()
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let headerWrapper = viewWrapper.header
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      expect(headerWrapper.getAxisEl())
        .toBeRightOf(headerWrapper.getCellEls()[0])

      expect(dayGridWrapper.getAxisEls()[0])
        .toBeRightOf(dayGridWrapper.getAllDayEls()[0])

      expect(timeGridWrapper.getSlotAxisEls()[0])
        .toBeRightOf(timeGridWrapper.getSlotNonAxisEls()[0])
    })
  })
})
