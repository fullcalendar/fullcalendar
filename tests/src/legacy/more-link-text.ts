import frLocale from '@fullcalendar/core/locales/fr'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

describe('moreLinkText', () => {
  pushOptions({
    initialDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
    initialView: 'dayGridMonth',
    dayMaxEventRows: 3,
    events: [
      { title: 'event1', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
    ],
  })

  it('allows a string', () => {
    let calendar = initCalendar({
      moreLinkText: 'extra',
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('+2 extra')
  })

  it('allows a function', () => {
    let calendar = initCalendar({
      moreLinkText(n) {
        expect(typeof n).toBe('number')
        return 'there are ' + n + ' more events!'
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('there are 2 more events!')
  })

  it('has a default value that is affected by the custom locale', () => {
    let calendar = initCalendar({
      locale: frLocale,
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('+2 en plus')
  })

  it('is not affected by a custom locale when the value is explicitly specified', () => {
    let calendar = initCalendar({
      locale: frLocale,
      moreLinkText: 'extra',
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('+2 extra')
  })
})
