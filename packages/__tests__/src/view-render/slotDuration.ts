import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('slotDuration', () => {
  pushOptions({
    initialDate: '2017-07-17',
    initialView: 'timeGridDay',
    scrollTime: 0,
    locale: 'en-GB', // for 00:00 instead of 24:00
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  })

  describe('when only major slots', () => {
    pushOptions({
      slotDuration: '01:00',
      slotLabelInterval: '01:00',
    })

    describe('when in alignment with slotMinTime', () => {
      pushOptions({
        slotMinTime: '00:00',
        slotMaxTime: '03:00',
      })
      it('render slots correctly', () => {
        let calendar = initCalendar()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getTimeAxisInfo()).toEqual([
          { text: '00:00', isMajor: true },
          { text: '01:00', isMajor: true },
          { text: '02:00', isMajor: true },
        ])
      })
    })

    describe('when out of alignment with slotMinTime', () => {
      pushOptions({
        slotMinTime: '00:20',
        slotMaxTime: '03:20',
      })
      it('render slots correctly', () => {
        let calendar = initCalendar()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getTimeAxisInfo()).toEqual([
          { text: '00:20', isMajor: true },
          { text: '01:20', isMajor: true },
          { text: '02:20', isMajor: true },
        ])
      })
    })
  })

  describe('when major and minor slots', () => {
    pushOptions({
      slotDuration: '00:30',
      slotLabelInterval: '01:00',
    })

    describe('when in alignment with slotMinTime', () => {
      pushOptions({
        slotMinTime: '00:00',
        slotMaxTime: '03:00',
      })
      it('render slots correctly', () => {
        let calendar = initCalendar()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getTimeAxisInfo()).toEqual([
          { text: '00:00', isMajor: true },
          { text: '', isMajor: false },
          { text: '01:00', isMajor: true },
          { text: '', isMajor: false },
          { text: '02:00', isMajor: true },
          { text: '', isMajor: false },
        ])
      })
    })

    describe('when out of alignment with slotMinTime', () => {
      pushOptions({
        slotMinTime: '00:20',
        slotMaxTime: '03:20',
      })
      it('render slots correctly', () => {
        let calendar = initCalendar()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getTimeAxisInfo()).toEqual([
          { text: '00:20', isMajor: true },
          { text: '', isMajor: false },
          { text: '01:20', isMajor: true },
          { text: '', isMajor: false },
          { text: '02:20', isMajor: true },
          { text: '', isMajor: false },
        ])
      })
    })
  })
})
