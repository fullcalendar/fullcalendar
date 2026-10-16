import frLocale from 'fullcalendar/locales/fr'
import { type MoreLinkInfo } from 'fullcalendar'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

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

  it('allows a string', async () => {
    let calendar = initCalendar({
      moreLinkText: 'extra',
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('+2 extra')
  })

  it('allows a function', async () => {
    let calendar = initCalendar({
      moreLinkText(n) {
        expect(typeof n).toBe('number')
        return 'there are ' + n + ' more events!'
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('there are 2 more events!')
  })

  it('accepts the public render-hook info type', async () => {
    let calendar = initCalendar({
      moreLinkContent(info: MoreLinkInfo) {
        expect(typeof info.numericText).toBe('string')
        expect(typeof info.longText).toBe('string')
        expect(typeof info.isNarrow).toBe('boolean')
        return `Hidden events: ${info.num}`
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('Hidden events: 2')
  })

  it('has a default value that is affected by the custom locale', async () => {
    let calendar = initCalendar({
      locale: frLocale,
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('+2 en plus')
  })

  it('is not affected by a custom locale when the value is explicitly specified', async () => {
    let calendar = initCalendar({
      locale: frLocale,
      moreLinkText: 'extra',
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getMoreEl()).toHaveText('+2 extra')
  })
})
