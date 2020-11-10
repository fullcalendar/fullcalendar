import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

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
    expect(fireCnt).toBe(1)
    calendar.resetOptions({
      ...options,
      weekNumbers: true,
    })
    expect(fireCnt).toBe(1)
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
    expect(fireCnt).toBe(1)
    calendar.resetOptions({
      ...options,
      headerToolbar: buildHeaderToolbar(),
    })
    expect(fireCnt).toBe(1)
    calendar.destroy()
    $calendarEl.remove()
  })

  it('won\'t fire when plugins option is reset', () => {
    let fireCnt = 0
    let options = {
      ...getCurrentOptions(),
      plugins: [dayGridPlugin],
      datesSet() {
        fireCnt += 1
      },
    }
    let $calendarEl = $('<div>').appendTo('body')
    let calendar = new Calendar($calendarEl[0], options)
    calendar.render()
    expect(fireCnt).toBe(1)
    calendar.resetOptions({
      ...options,
      plugins: [dayGridPlugin],
    })
    expect(fireCnt).toBe(1)
    calendar.destroy()
    $calendarEl.remove()
  })
})
