import enGbLocale from '@fullcalendar/core/locales/en-gb'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('slotLabelFormat', () => {
  pushOptions({
    initialDate: '2014-06-04',
    initialView: 'timeGridWeek',
  })

  it('renders correctly when default', () => {
    let calendar = initCalendar()
    expectAxisText(calendar, '12am')
  })

  it('renders correctly when default and the locale is customized', () => {
    let calendar = initCalendar({
      locale: enGbLocale,
    })
    expectAxisText(calendar, '00')
  })

  it('renders correctly when customized', () => {
    let calendar = initCalendar({
      slotLabelFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      locale: 'en-GB', // for 00:00 instead of 24:00
    })
    expectAxisText(calendar, '00:00:00')
  })

  function expectAxisText(calendar, expectedText) {
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let axisTexts = timeGridWrapper.getAxisTexts()
    expect(axisTexts[0]).toBe(expectedText)
  }
})
