import { describe, expect, it, onTestFinished } from 'vitest'
import { Calendar, type PluginInput } from 'fullcalendar'
import dayGridPlugin from 'fullcalendar/daygrid'
import bootstrapPlugin from '../../../bootstrap5/dist/index.js'
import bootstrapCss from '../../../bootstrap5/node_modules/bootstrap/dist/css/bootstrap.css?inline'
import themeCss from '../../../bootstrap5/dist/theme.css?inline'
import { appendTestElement } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getRectCenter } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'
import testPlugin from '../lib/test-plugin'

describe('Bootstrap popover stacking', () => {
  it.each([undefined, '1200'])('opens above a modal with popover z-index %s', async (customZIndex) => {
    const styleEl = appendTestElement(document.createElement('style'))
    styleEl.textContent = bootstrapCss + themeCss
    if (customZIndex) {
      styleEl.textContent += `.popover { --bs-popover-zindex: ${customZIndex} }`
    }

    const backdrop = appendTestElement(document.createElement('div'))
    backdrop.className = 'modal-backdrop show'
    const modal = appendTestElement(document.createElement('div'))
    modal.className = 'modal show'
    modal.style.display = 'block'
    modal.setAttribute('role', 'dialog')
    modal.innerHTML = '<div class="modal-dialog modal-xl"><div class="modal-content"><div class="modal-body"></div></div></div>'
    const calendarEl = document.createElement('div')
    modal.querySelector('.modal-body')!.appendChild(calendarEl)
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, bootstrapPlugin as PluginInput, testPlugin],
      initialDate: '2025-03-14',
      initialView: 'dayGridMonth',
      height: 550,
      dayMaxEvents: 1,
      events: Array.from({ length: 8 }, (_, i) => ({ title: `Event ${i}`, start: '2025-03-14' })),
    })
    onTestFinished(() => calendar.destroy())
    calendar.render()
    await waitForSettle()

    const popover = await new DayGridModel(calendarEl).openMorePopover('2025-03-14')
    expect(popover.parentElement).toBe(document.body)
    expect(getComputedStyle(popover).zIndex).toBe(customZIndex || '1070')
    const point = getRectCenter(popover.getBoundingClientRect())
    expect(popover.contains(document.elementFromPoint(point.x, point.y))).toBe(true)
  })
})
