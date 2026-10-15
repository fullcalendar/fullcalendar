import { Calendar } from 'fullcalendar'
import { strictModeFactor } from 'fullcalendar/protected-api'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import dayGridPlugin from 'fullcalendar/daygrid'

describe('datesSet', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    now: '2020-06-21',
  })

  it('won\'t fire when a non-dateprofile-related option is reset', () => {
    let fireCnt = 0
    let options = {
      ...getCurrentOptions(),
      weekNumbers: false,
      datesSet() {
        fireCnt += 1
      },
    }
    let $calendarEl = $('<div>').appendTo('body')
    let calendar = new Calendar($calendarEl[0], options)
    calendar.render()
    expect(fireCnt).toBe(1 * strictModeFactor)
    calendar.resetOptions({
      ...options,
      weekNumbers: true,
    })
    expect(fireCnt).toBe(1 * strictModeFactor)
    calendar.destroy()
    $calendarEl.remove()
  })

  it('won\'t fire when a complex object-like option is reset', () => {
    function buildHeaderToolbar() {
      return {
        left: 'today',
      }
    }
    let fireCnt = 0
    let options = {
      ...getCurrentOptions(),
      headerToolbar: buildHeaderToolbar(),
      datesSet() {
        fireCnt += 1
      },
    }
    let $calendarEl = $('<div>').appendTo('body')
    let calendar = new Calendar($calendarEl[0], options)
    calendar.render()
    expect(fireCnt).toBe(1 * strictModeFactor)
    calendar.resetOptions({
      ...options,
      headerToolbar: buildHeaderToolbar(),
    })
    expect(fireCnt).toBe(1 * strictModeFactor)
    calendar.destroy()
    $calendarEl.remove()
  })

  it('won\'t fire when plugins option is reset', () => {
    let fireCnt = 0
    let options = {
      ...getCurrentOptions(),
      plugins: [classicThemePlugin, themeForTestsPlugin, dayGridPlugin],
      datesSet() {
        fireCnt += 1
      },
    }
    let $calendarEl = $('<div>').appendTo('body')
    let calendar = new Calendar($calendarEl[0], options)
    calendar.render()
    expect(fireCnt).toBe(1 * strictModeFactor)
    calendar.resetOptions({
      ...options,
      plugins: [classicThemePlugin, themeForTestsPlugin, dayGridPlugin],
    })
    expect(fireCnt).toBe(1 * strictModeFactor)
    calendar.destroy()
    $calendarEl.remove()
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7069
  describe('when a date-range-related option is reset with an equal new value', () => {
    function countDatesSetAfterReset(buildOptions: () => any, buildNewOptions = buildOptions) {
      let fireCnt = 0
      let options = {
        ...getCurrentOptions(),
        ...buildOptions(),
        datesSet() {
          fireCnt += 1
        },
      }
      let $calendarEl = $('<div>').appendTo('body')
      let calendar = new Calendar($calendarEl[0], options)
      calendar.render()
      let initialCnt = fireCnt
      calendar.resetOptions({
        ...options,
        ...buildNewOptions(),
      })
      let afterCnt = fireCnt
      calendar.destroy()
      $calendarEl.remove()
      return afterCnt - initialCnt
    }

    it('won\'t fire for validRange with strings', () => {
      expect(countDatesSetAfterReset(() => ({ validRange: { start: '2020-06-10' } }))).toBe(0)
    })

    it('won\'t fire for validRange with Dates', () => {
      expect(countDatesSetAfterReset(() => ({ validRange: { start: new Date('2020-06-10T00:00:00Z') } }))).toBe(0)
    })

    it('won\'t fire for visibleRange', () => {
      expect(countDatesSetAfterReset(() => ({
        initialView: 'dayGrid',
        visibleRange: { start: '2020-06-10', end: '2020-06-20' },
      }))).toBe(0)
    })

    it('won\'t fire for hiddenDays', () => {
      expect(countDatesSetAfterReset(() => ({ hiddenDays: [0, 6] }))).toBe(0)
    })

    it('won\'t fire for hiddenDays when weekends:false', () => {
      expect(countDatesSetAfterReset(() => ({ hiddenDays: [1], weekends: false }))).toBe(0)
    })

    it('still fires when validRange actually changes', () => {
      expect(countDatesSetAfterReset(
        () => ({ validRange: { start: '2020-06-10' } }),
        () => ({ validRange: { start: '2020-06-12' } }),
      )).toBe(1) // StrictMode only doubles mounting, not updating
    })
  })
})
