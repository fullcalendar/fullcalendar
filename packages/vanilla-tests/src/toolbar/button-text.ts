import { describe, expect, it } from 'vitest'
import frLocale from 'fullcalendar/locales/fr'
import { initCalendar } from '../lib/calendar'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'

describe('button text', () => {
  const options = {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prevYear,prev,today,next,nextYear',
      center: '',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,timeGridWeek,timeGridDay',
    },
  }

  // text for the views' buttons comes from these options, not from `buttons`
  const customTextOptions = {
    buttons: {
      prev: { text: '<-' },
      next: { text: '->' },
      prevYear: { text: '<--' },
      nextYear: { text: '-->' },
      today: { text: 'tidei' },
    },
    monthText: 'mun',
    weekTextLong: 'wiki',
    dayText: 'dei',
  }
  const customTexts = ['<--', '<-', 'tidei', '->', '-->', 'mun', 'wiki', 'dei', 'wiki', 'dei']

  async function getButtonTexts(extraOptions: object): Promise<string[]> {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()
    return ToolbarModel.header(calendar.el)!.getButtons().map((el) => el.textContent!)
  }

  it.each([
    // the prev/next buttons have icons and no text
    ['the default locale, with icons', {}, ['', '', 'Today', '', '', 'Month', 'Week', 'Day', 'Week', 'Day']],
    ['the default locale, as text', { buttonDisplay: 'text' }, ['Prev year', 'Prev', 'Today', 'Next', 'Next year', 'Month', 'Week', 'Day', 'Week', 'Day']],
    ['the default locale, customized', { buttonDisplay: 'text', ...customTextOptions }, customTexts],
    ['a French locale, with icons', { locale: frLocale }, ['', '', 'Aujourd\'hui', '', '', 'Mois', 'Semaine', 'Jour', 'Semaine', 'Jour']],
    // the locale has no text for prev/next year, so it falls back to English
    ['a French locale, as text', { locale: frLocale, buttonDisplay: 'text' }, ['Prev year', 'Précédent', 'Aujourd\'hui', 'Suivant', 'Next year', 'Mois', 'Semaine', 'Jour', 'Semaine', 'Jour']],
    ['a French locale, customized', { locale: frLocale, buttonDisplay: 'text', ...customTextOptions }, customTexts],
  ])('with %s', async (_desc, extraOptions, expectedTexts) => {
    expect(await getButtonTexts(extraOptions)).toEqual(expectedTexts)
  })

  describe('for custom views', () => {
    it('uses the locale\'s text for the view\'s single unit', async () => {
      const calendar = initCalendar({
        locale: frLocale,
        headerToolbar: { center: 'custom,dayGridMonth' },
        initialView: 'custom',
        views: {
          custom: { type: 'dayGrid', duration: { days: 1 } },
        },
      })
      await waitForSettle()

      const texts = ToolbarModel.header(calendar.el)!.getButtons().map((el) => el.textContent)
      expect(texts).toEqual(['Jour', 'Mois'])
    })

    it('falls back to the view name when the view has no metadata', async () => {
      const calendar = initCalendar({
        plugins: [{
          name: 'crazy-view-plugin',
          views: {
            crazy: { content: 'hello world' },
          },
        }],
        headerToolbar: { center: 'crazy,dayGridMonth' },
        initialView: 'crazy',
      })
      await waitForSettle()

      const texts = ToolbarModel.header(calendar.el)!.getButtons().map((el) => el.textContent)
      expect(texts).toEqual(['crazy', 'Month'])
    })
  })
})
