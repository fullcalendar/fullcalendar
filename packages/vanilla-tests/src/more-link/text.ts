import { describe, expect, it, vi } from 'vitest'
import frLocale from 'fullcalendar/locales/fr'
import { initCalendar } from '../lib/calendar'
import { getMoreLinkEls } from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

describe('moreLinkText', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    events: Array.from({ length: 4 }, (_, i) => ({ title: `event${i + 1}`, start: '2014-07-29' })),
  }

  it.each([
    { desc: 'defaults to "more"', extraOptions: {}, text: '+2 more' },
    { desc: 'accepts a string', extraOptions: { moreLinkText: 'extra' }, text: '+2 extra' },
    { desc: 'defaults to the locale\'s text', extraOptions: { locale: frLocale }, text: '+2 en plus' },
    { desc: 'takes a string over the locale\'s text', extraOptions: { locale: frLocale, moreLinkText: 'extra' }, text: '+2 extra' },
  ])('$desc', async ({ extraOptions, text }) => {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()

    expect(getMoreLinkEls(calendar.el).map((el) => el.textContent)).toEqual([text])
  })

  it('accepts a function given the hidden-event count', async () => {
    const moreLinkText = vi.fn((n: number) => `there are ${n} more events!`)
    const calendar = initCalendar({ ...options, moreLinkText })
    await waitForSettle()

    expect(getMoreLinkEls(calendar.el).map((el) => el.textContent)).toEqual(['there are 2 more events!'])
    expect(moreLinkText).toHaveBeenCalledWith(2) // (also called for hidden measuring links)
  })
})
