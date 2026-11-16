import { describe, expect, it, onTestFinished, vi } from 'vitest'
import { Calendar, PluginInput } from 'fullcalendar'
import interactionPlugin from 'fullcalendar/interaction'
import dayGridPlugin from 'fullcalendar/daygrid'
import timeGridPlugin from 'fullcalendar/timegrid'
import listPlugin from 'fullcalendar/list'
import breezyThemePlugin from 'fullcalendar/themes/breezy'
import formaThemePlugin from 'fullcalendar/themes/forma'
import monarchThemePlugin from 'fullcalendar/themes/monarch'
import pulseThemePlugin from 'fullcalendar/themes/pulse'
import breezyThemeCss from 'fullcalendar/themes/breezy/theme.css?inline'
import breezyPaletteCss from 'fullcalendar/themes/breezy/palettes/indigo.css?inline'
import formaThemeCss from 'fullcalendar/themes/forma/theme.css?inline'
import formaPaletteCss from 'fullcalendar/themes/forma/palettes/blue.css?inline'
import monarchThemeCss from 'fullcalendar/themes/monarch/theme.css?inline'
import monarchPaletteCss from 'fullcalendar/themes/monarch/palettes/blue.css?inline'
import pulseThemeCss from 'fullcalendar/themes/pulse/theme.css?inline'
import pulsePaletteCss from 'fullcalendar/themes/pulse/palettes/blue.css?inline'
import { createCalendarElement } from '../lib/calendar'
import { getEventEls, getEventIdOfEl, queryPart } from '../lib/models/events'
import { getButtonLabel, ToolbarModel } from '../lib/models/toolbar'
import { enUsSep } from '../lib/intl'
import { waitForSettle } from '../lib/settle'
import testPlugin from '../lib/test-plugin'
import { hasPart } from '../lib/parts'

/*
A smoke render of each non-classic theme shipped by the `fullcalendar` package: its plugin, theme.css
and one palette. (The classic theme is what every other test renders with.)

The built themes' class names are scoped per theme (ex: `fc-monarch-xYz`), so the classic CSS that
src/lib/setup.ts loads can't style these calendars. Each theme's CSS is still injected only for its
own tests, so a theme can't lean on another's CSS.
The calendar is constructed directly: initCalendar would add the classic theme plugin.
*/

const themes: { name: string, plugin: PluginInput, css: string[] }[] = [
  { name: 'breezy', plugin: breezyThemePlugin, css: [breezyThemeCss, breezyPaletteCss] },
  { name: 'forma', plugin: formaThemePlugin, css: [formaThemeCss, formaPaletteCss] },
  { name: 'monarch', plugin: monarchThemePlugin, css: [monarchThemeCss, monarchPaletteCss] },
  { name: 'pulse', plugin: pulseThemePlugin, css: [pulseThemeCss, pulsePaletteCss] },
]

// initialDate is 2024-05-15
const views: { viewName: string, title: string, buttonLabels: string[] }[] = [
  { viewName: 'dayGridMonth', title: 'May 2024', buttonLabels: ['This Month', 'Previous Month', 'Next Month'] },
  { viewName: 'timeGridWeek', title: 'May 2024', buttonLabels: ['This Week', 'Previous Week', 'Next Week'] },
  { viewName: 'listWeek', title: `May 12${enUsSep}18, 2024`, buttonLabels: ['This Week', 'Previous Week', 'Next Week'] },
]

const cases = themes.flatMap((theme) => views.map((view) => ({ ...theme, ...view })))

const events = [
  { id: 'allDay', title: 'All-day event', start: '2024-05-14' },
  { id: 'timed', title: 'Timed event', start: '2024-05-16T10:00:00', end: '2024-05-16T12:00:00' },
]

function injectCss(cssTexts: string[]): void {
  for (const cssText of cssTexts) {
    const styleEl = document.createElement('style')
    styleEl.textContent = cssText
    document.head.appendChild(styleEl)
    onTestFinished(() => {
      styleEl.remove()
    })
  }
}

/*
The color a CSS value resolves to inside `parentEl`, in computed-style form (ex: "rgb(221, 222, 225)").
*/
function resolveColor(parentEl: HTMLElement, value: string): string {
  const probeEl = document.createElement('div')
  probeEl.style.color = value
  parentEl.appendChild(probeEl)
  const color = getComputedStyle(probeEl).color
  probeEl.remove()
  return color
}

/*
The day an event element is rendered in: a dayGrid day cell, a timeGrid day lane, or a list day.
*/
function getDayContainer(eventEl: HTMLElement): { el: HTMLElement, date: string } {
  const el = eventEl.closest<HTMLElement>('.test-part-dayCell, .test-part-dayLane, .test-part-listDay')!
  const dateEl = el.matches('.test-part-listDay') ? queryPart(el, 'listDayHeader')! : el
  return { el, date: dateEl.getAttribute('data-date')! }
}

describe('themes', () => {
  it.each(cases)('$name theme renders $viewName', async ({ name, plugin, css, viewName, title, buttonLabels }) => {
    injectCss(css)
    const consoleErrorSpy = vi.spyOn(console, 'error')
    onTestFinished(() => {
      consoleErrorSpy.mockRestore()
    })

    const calendar = new Calendar(createCalendarElement(), {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, plugin, testPlugin],
      timeZone: 'UTC',
      initialView: viewName,
      initialDate: '2024-05-15',
      events,
    })
    calendar.render()
    await waitForSettle()

    const rootEl = calendar.el
    expect(hasPart(rootEl, 'root')).toBe(true)

    // the toolbar, title and buttons render
    const toolbar = ToolbarModel.header(rootEl)!
    expect(toolbar.getTitleText()).toBe(title)
    expect(toolbar.getButtons().map(getButtonLabel)).toEqual(buttonLabels)
    for (const buttonEl of toolbar.getButtons()) {
      expect(buttonEl.getBoundingClientRect().width).toBeGreaterThan(0)
    }

    // each event renders with a size, inside the day it's on
    const eventEls = getEventEls(rootEl)
    expect(eventEls.map(getEventIdOfEl).sort()).toEqual(['allDay', 'timed'])
    const expectedDates: Record<string, string> = { allDay: '2024-05-14', timed: '2024-05-16' }

    for (const eventEl of eventEls) {
      const eventId = getEventIdOfEl(eventEl)
      const eventRect = eventEl.getBoundingClientRect()
      expect(eventRect.width, eventId).toBeGreaterThan(0)
      expect(eventRect.height, eventId).toBeGreaterThan(0)

      const day = getDayContainer(eventEl)
      expect(day.date, eventId).toBe(expectedDates[eventId])
      const dayRect = day.el.getBoundingClientRect()
      expect(eventRect.left, eventId).toBeGreaterThanOrEqual(dayRect.left - 0.5)
      expect(eventRect.right, eventId).toBeLessThanOrEqual(dayRect.right + 0.5)
      expect(eventRect.top, eventId).toBeGreaterThanOrEqual(dayRect.top - 0.5)
      expect(eventRect.bottom, eventId).toBeLessThanOrEqual(dayRect.bottom + 0.5)
    }

    // the theme's plugin, CSS and palette are what styled the calendar: its classes are on the root
    // and view, and the view's border has the theme's border color (defined by the palette), not classic's
    const viewEl = queryPart(rootEl, 'view')!
    for (const el of [rootEl, viewEl]) {
      expect(el.className).toMatch(new RegExp(`\\bfc-${name}-`))
      expect(el.className).not.toMatch(/\bfc-classic-/)
    }
    const viewStyle = getComputedStyle(viewEl)
    expect(viewStyle.borderLeftWidth).toBe('1px')
    expect(viewStyle.borderLeftStyle).toBe('solid')
    expect(getComputedStyle(rootEl).getPropertyValue(`--fc-${name}-border`)).not.toBe('')
    const themeBorderColor = resolveColor(rootEl, `var(--fc-${name}-border)`)
    expect(viewStyle.borderLeftColor).toBe(themeBorderColor)
    expect(themeBorderColor).not.toBe(resolveColor(rootEl, 'var(--fc-classic-border)'))

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
