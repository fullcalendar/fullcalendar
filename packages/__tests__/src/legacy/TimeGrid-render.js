import {
  getFirstDayEl, getTimeGridHeaderAxisEl,
  getDayGridAxisEl, getSlatElAxisEl,
  getSlatElGridEls, getFirstDayGridDayEl } from './../lib/DayGridRenderUtils'
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
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let firstSlat = timeGridWrapper.getSlotEls()[0]

      expect(getTimeGridHeaderAxisEl()).toBeLeftOf(getFirstDayEl())
      expect(getDayGridAxisEl()).toBeLeftOf(getFirstDayGridDayEl())
      expect(getSlatElAxisEl(firstSlat)).toBeLeftOf(getSlatElGridEls(firstSlat))
    })
  })

  describe('when RTL', function() {
    pushOptions({
      dir: 'rtl'
    })

    it('renders the axis on the right', function() {
      let calendar = initCalendar()
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let firstSlat = timeGridWrapper.getSlotEls()[0]

      expect(getTimeGridHeaderAxisEl()).toBeRightOf(getFirstDayEl())
      expect(getDayGridAxisEl()).toBeRightOf(getFirstDayGridDayEl())
      expect(getSlatElAxisEl(firstSlat)).toBeRightOf(getSlatElGridEls(firstSlat))
    })
  })
})
