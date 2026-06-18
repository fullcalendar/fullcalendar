import { strictModeFactor } from 'fullcalendar/protected-api'
import { formatIsoDay } from '../lib/datelib-utils'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

/*
TODO: rename file
NOTE: about day cell AND day LANE
*/
describe('dayCellDidMount', () => {
  it('is triggered upon initialization of a view, with correct parameters', () => {
    let options = {
      initialView: 'dayGridMonth',
      fixedWeekCount: true,
      initialDate: '2014-05-01',
      dayCellDidMount(info) {
        expect(info.date instanceof Date).toEqual(true)
        expect(formatIsoDay(info.date)).toEqual(info.el.getAttribute('data-date'))
        expect(info.el instanceof HTMLElement).toBe(true)
      },
    }

    spyOn(options, 'dayCellDidMount').and.callThrough()
    initCalendar(options)
    expect(options.dayCellDidMount.calls.count()).toEqual(42 * strictModeFactor)
  })

  it('is called when date range is changed', () => {
    let options = {
      initialView: 'dayGridWeek',
      initialDate: '2014-05-01',
      dayCellDidMount(info) { },
    }

    spyOn(options, 'dayCellDidMount').and.callThrough()
    let calendar = initCalendar(options)
    options.dayCellDidMount.calls.reset()
    calendar.gotoDate('2014-05-04') // a day in the next week
    expect(options.dayCellDidMount.calls.count()).toEqual(7 * strictModeFactor)
  })

  it('won\'t be called when date is navigated but remains in the current visible range', () => {
    let options = {
      initialView: 'dayGridWeek',
      initialDate: '2014-05-01',
      dayCellDidMount(info) { },
    }

    spyOn(options, 'dayCellDidMount').and.callThrough()
    let calendar = initCalendar(options)
    options.dayCellDidMount.calls.reset()
    calendar.gotoDate('2014-05-02') // a day in the same week
    expect(options.dayCellDidMount.calls.count()).toEqual(0 * strictModeFactor)
  })

  it('allows you to modify the element', () => {
    let options = {
      initialView: 'dayGridMonth',
      fixedWeekCount: true,
      initialDate: '2014-05-01',
      dayCellDidMount(info) {
        if (formatIsoDay(info.date) === '2014-05-01') {
          info.el.classList.add('mycustomclass')
        }
      },
    }

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEl = dayGridWrapper.getDayEl('2014-05-01')
    expect(dayEl).toHaveClass('mycustomclass')
  })

  it('gets called for TimeGrid views', () => {
    let callCnt = 0
    let options = {
      initialView: 'timeGridWeek',
      initialDate: '2014-05-01',
      dayLaneDidMount(info) {
        expect(info.date instanceof Date).toBe(true)
        expect(info.el instanceof HTMLElement).toBe(true)
        expect(typeof info.view).toBe('object')
        callCnt += 1
      },
    }

    initCalendar(options)
    expect(callCnt).toBe(7 * strictModeFactor)
  })
})
