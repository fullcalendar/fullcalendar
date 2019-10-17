import {
  getFirstDayEl, getTimeGridHeaderAxisEl,
  getDayGridAxisEl, getSlatElAxisEl,
  getSlatElGridEls, getFirstDayGridDayEl } from './../view-render/DayGridRenderUtils'
import { getSlotEls } from '../lib/time-grid'

describe('Agenda view rendering', function() {
  pushOptions({
    defaultView: 'timeGridWeek'
  })

  describe('when LTR', function() {
    pushOptions({
      dir: 'ltr'
    })

    it('renders the axis on the left', function() {
      initCalendar()
      var firstSlat = getSlotEls().first()
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
      initCalendar()
      var firstSlat = getSlotEls().first()
      expect(getTimeGridHeaderAxisEl()).toBeRightOf(getFirstDayEl())
      expect(getDayGridAxisEl()).toBeRightOf(getFirstDayGridDayEl())
      expect(getSlatElAxisEl(firstSlat)).toBeRightOf(getSlatElGridEls(firstSlat))
    })
  })
})
