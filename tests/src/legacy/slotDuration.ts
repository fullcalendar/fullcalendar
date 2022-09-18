import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('slotDuration', () => {
  const minutesInADay = 1440

  describe('when using the default settings', () => {
    describe('in week', () => {
      it('should have slots 1440/30 slots', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let slotCount = timeGridWrapper.getSlotEls().length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })

    describe('in day', () => {
      it('should have slots 1440/30 slots', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let slotCount = timeGridWrapper.getSlotEls().length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
  })

  describe('when slotMinutes is set to 30', () => {
    describe('in week', () => {
      it('should have slots 1440/30 slots', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let slotCount = timeGridWrapper.getSlotEls().length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })

    describe('in day', () => {
      it('should have slots 1440/30 slots', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let slotCount = timeGridWrapper.getSlotEls().length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
  })

  describe('when slotMinutes is set to a series of times', () => {
    const slotMinutesList = [10, 12, 15, 17, 20, 30, 35, 45, 60, 62, 120, 300]

    describe('in week', () => {
      slotMinutesList.forEach((slotMinutes) => {
        it('should have slots 1440/x slots', () => {
          let calendar = initCalendar({
            initialView: 'timeGridWeek',
            slotDuration: { minutes: slotMinutes },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let slotCount = timeGridWrapper.getSlotEls().length
          let expected = Math.ceil(minutesInADay / slotMinutes)
          expect(slotCount).toEqual(expected)
        })
      })
    })

    describe('in day', () => {
      slotMinutesList.forEach((slotMinutes) => {
        it('should have slots 1440/x slots', () => {
          let calendar = initCalendar({
            initialView: 'timeGridDay',
            slotDuration: { minutes: slotMinutes },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let slotCount = timeGridWrapper.getSlotEls().length
          let expected = Math.ceil(minutesInADay / slotMinutes)
          expect(slotCount).toEqual(expected)
        })
      })
    })
  })
})
