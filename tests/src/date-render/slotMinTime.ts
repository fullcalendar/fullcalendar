import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

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
})
