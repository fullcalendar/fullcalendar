import { formatIsoDay } from '../lib/datelib-utils.js'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

describe('dayCellDidMount', () => { // TODO: rename file
  it('is triggered upon initialization of a view, with correct parameters', () => {
    let options = {
      initialView: 'dayGridMonth',
      fixedWeekCount: true,
      initialDate: '2014-05-01',
      dayCellDidMount(arg) {
        expect(arg.date instanceof Date).toEqual(true)
        expect(formatIsoDay(arg.date)).toEqual(arg.el.getAttribute('data-date'))
        expect(arg.el instanceof HTMLElement).toBe(true)
      },
    }

    spyOn(options, 'dayCellDidMount').and.callThrough()
    initCalendar(options)
    expect(options.dayCellDidMount.calls.count()).toEqual(42)
  })

  it('is called when date range is changed', () => {
    let options = {
      initialView: 'dayGridWeek',
      initialDate: '2014-05-01',
      dayCellDidMount(arg) { },
    }

    spyOn(options, 'dayCellDidMount').and.callThrough()
    initCalendar(options)
    options.dayCellDidMount.calls.reset()
    currentCalendar.gotoDate('2014-05-04') // a day in the next week
    expect(options.dayCellDidMount.calls.count()).toEqual(7)
  })

  it('won\'t be called when date is navigated but remains in the current visible range', () => {
    let options = {
      initialView: 'dayGridWeek',
      initialDate: '2014-05-01',
      dayCellDidMount(arg) { },
    }

    spyOn(options, 'dayCellDidMount').and.callThrough()
    initCalendar(options)
    options.dayCellDidMount.calls.reset()
    currentCalendar.gotoDate('2014-05-02') // a day in the same week
    expect(options.dayCellDidMount.calls.count()).toEqual(0)
  })

  it('allows you to modify the element', () => {
    let options = {
      initialView: 'dayGridMonth',
      fixedWeekCount: true,
      initialDate: '2014-05-01',
      dayCellDidMount(arg) {
        if (formatIsoDay(arg.date) === '2014-05-01') {
          arg.el.classList.add('mycustomclass')
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
      allDaySlot: false, // turn off. fires its own dayCellDidMount
      dayCellDidMount(arg) {
        expect(arg.date instanceof Date).toBe(true)
        expect(arg.el instanceof HTMLElement).toBe(true)
        expect(typeof arg.view).toBe('object')
        callCnt += 1
      },
    }

    initCalendar(options)
    expect(callCnt).toBe(7)
  })
})
