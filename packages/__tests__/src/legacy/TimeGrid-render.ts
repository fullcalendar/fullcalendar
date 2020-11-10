import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('Agenda view rendering', () => {
  pushOptions({
    initialView: 'timeGridWeek',
  })

  describe('when LTR', () => {
    pushOptions({
      direction: 'ltr',
    })

    it('renders the axis on the left', () => {
      let calendar = initCalendar()
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let headerWrapper = viewWrapper.header
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      expect(viewWrapper.getHeaderAxisEl())
        .toBeLeftOf(headerWrapper.getCellEls()[0])

      expect(viewWrapper.getAllDayAxisEl())
        .toBeLeftOf(dayGridWrapper.getAllDayEls()[0])

      expect(timeGridWrapper.getSlotAxisEls()[0])
        .toBeLeftOf(timeGridWrapper.getSlotLaneEls()[0])
    })
  })

  describe('when RTL', () => {
    pushOptions({
      direction: 'rtl',
    })

    it('renders the axis on the right', () => {
      let calendar = initCalendar()
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let headerWrapper = viewWrapper.header
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      expect(viewWrapper.getHeaderAxisEl())
        .toBeRightOf(headerWrapper.getCellEls()[0])

      expect(viewWrapper.getAllDayAxisEl())
        .toBeRightOf(dayGridWrapper.getAllDayEls()[0])

      expect(timeGridWrapper.getSlotAxisEls()[0])
        .toBeRightOf(timeGridWrapper.getSlotLaneEls()[0])
    })
  })
})
