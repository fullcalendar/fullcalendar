import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { pointer } from '../lib/pointer'
import { getElEventRange } from 'fullcalendar/protected-api'
import { isElVisible } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
Events sharing a groupId move together.
*/
describe('dragging events that share a groupId', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2017-02-12',
    editable: true,
    dragScroll: false,
    events: [
      { groupId: '999', id: 'a', start: '2017-02-09T16:00:00' },
      { groupId: '999', id: 'b', start: '2017-02-16T16:00:00' },
    ],
  }

  it('moves every event in the group, including ones out of view', async () => {
    const calendar = initCalendar(options)
    // switch from month to week, so the week view has events outside its range
    calendar.changeView('timeGridWeek')
    await waitForSettle()

    await new TimeGridModel(calendar.el).dragEvent('b', '2017-02-16T16:00', '2017-02-16T12:00')

    expect(calendar.getEventById('a')!.startStr).toBe('2017-02-09T12:00:00Z')
    expect(calendar.getEventById('b')!.startStr).toBe('2017-02-16T12:00:00Z')
  })

  /*
  The events have no ids. A bug once hid every id-less event while one was dragged.
  */
  it.each([
    ['hides the whole group', [
      { groupId: '999', title: 'dragged', start: '2017-02-09T16:00:00' },
      { groupId: '999', title: 'other', start: '2017-02-16T16:00:00' },
    ], []],
    ['hides only the dragged event when there\'s no group', [
      { title: 'dragged', start: '2017-02-09T16:00:00' },
      { title: 'other', start: '2017-02-16T16:00:00' },
    ], ['other']],
  ])('%s while dragging', async (_desc, events, expectedVisibleTitles) => {
    const calendar = initCalendar({ ...options, events })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const { point } = dayGrid.pointForEventOnDate('', '2017-02-09') // '' matches id-less events
    await pointer.press(point, async () => {
      await pointer.move(dayGrid.pointForDate('2017-02-10'))
      await waitForSettle()

      const visibleTitles = dayGrid.getEventEls().filter(isElVisible).map((el) => getElEventRange(el)!.def.title)
      expect(visibleTitles).toEqual(expectedVisibleTitles)
    })
    await waitForSettle()
  })
})
