import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { TimeGridWrapper } from '../lib/wrappers/TimeGridWrapper'
import { waitTimeout } from '../lib/misc'

describe('slotMinTime', () => {
  // root cause of https://github.com/fullcalendar/fullcalendar-vue/issues/88
  it('gets rerendered when changing via resetOptions', () => {
    let calendar = initCalendar({
      initialView: 'timeGridDay',
      slotMinTime: '01:00',
    })
    let gridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    expect(gridWrapper.getAxisTexts()[0]).toBe('1am')
    calendar.setOption('slotMinTime', '09:00')
    expect(gridWrapper.getAxisTexts()[0]).toBe('9am')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/8101
  it('keeps slat and axis sizes when moved later with a label-phase shift', async () => {
    let calendar = initCalendar({
      initialView: 'timeGridDay',
      slotDuration: '00:15',
      slotMinTime: '05:45',
      slotMaxTime: '22:00',
      slotMinHeight: 40,
      height: 800,
      expandRows: false,
      allDaySlot: false,
    })
    let gridWrapper = new TimeGridViewWrapper(calendar).timeGrid

    await waitTimeout()

    expect(gridWrapper.getAxisTexts()[0]).toBe('5:45am')
    expectMinSlotSize(gridWrapper, 40)

    calendar.setOption('slotMinTime', '08:00')
    await waitTimeout()

    expect(gridWrapper.getAxisTexts()[0]).toBe('8am')
    expect(gridWrapper.getAxisTexts().length).toBeGreaterThan(0)
    expectMinSlotSize(gridWrapper, 40)
  })
})

function expectMinSlotSize(gridWrapper: TimeGridWrapper, minHeight: number) {
  let laneEls = gridWrapper.getSlotLaneEls()
  let axisEls = gridWrapper.getSlotAxisEls()

  expect(laneEls.length).toBeGreaterThan(0)
  expect(axisEls.length).toBeGreaterThan(0)

  for (let el of laneEls) {
    expect(el.getBoundingClientRect().height).toBeGreaterThanOrEqual(minHeight)
  }

  for (let el of axisEls) {
    let rect = el.getBoundingClientRect()
    expect(rect.height).toBeGreaterThan(0)
    expect(rect.width).toBeGreaterThan(0)
  }
}
