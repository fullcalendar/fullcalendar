import { getHeaderEl, getFirstDayEl } from './../view-render/DayGridRenderUtils'
import { getSlotEls } from '../lib/time-grid'
import { AXIS_CLASS, DAY_GRID_CLASS, DAY_CLASS } from '../lib/constants'

describe('Agenda view rendering', function() {
  pushOptions({
    defaultView: 'agendaWeek'
  })

  describe('when LTR', function() {
    pushOptions({
      isRTL: false
    })

    it('renders the axis on the left', function() {
      initCalendar()
      var header = getHeaderEl()
      var firstSlat = getSlotEls().first()
      expect(header.find(`.${AXIS_CLASS}`)).toBeLeftOf(getFirstDayEl())
      expect($(`.${DAY_GRID_CLASS} .${AXIS_CLASS}`)).toBeLeftOf($(`.${DAY_GRID_CLASS} .${DAY_CLASS}`).first())
      expect(firstSlat.find(`.${AXIS_CLASS}`)).toBeLeftOf(firstSlat.find(`td:not(.${AXIS_CLASS})`))
    })
  })

  describe('when RTL', function() {
    pushOptions({
      isRTL: true
    })

    it('renders the axis on the right', function() {
      initCalendar()
      var header = getHeaderEl()
      var firstSlat = getSlotEls().first()
      expect(
        header.find(`.${AXIS_CLASS}`)
      ).toBeRightOf(getFirstDayEl())
      expect(
        $(`.${DAY_GRID_CLASS} .${AXIS_CLASS}`)
      ).toBeRightOf($(`.${DAY_GRID_CLASS} .${DAY_CLASS}`).first())
      expect(
        firstSlat.find(`.${AXIS_CLASS}`)
      ).toBeRightOf(firstSlat.find(`td:not(.${AXIS_CLASS})`))
    })
  })
})
