import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { waitTimeout } from '../lib/misc'

/*
TimeGrid is a civil-time view: DST-transition days still render the standard
48 half-hour slots. Selection edges must keep their CIVIL order. Sorting edges
by derived instant would reorder spring-forward edges, because a nonexistent
civil time resolves to an instant past the gap. Fall-back selections resolve
an ambiguous civil edge deterministically to its first occurrence.
*/
describe('timegrid selection across DST transitions', () => {
  pushOptions({
    timeZone: 'America/New_York',
    initialView: 'timeGridDay',
    scrollTime: '00:00',
    selectable: true,
  })

  describe('spring-forward gap', () => {
    pushOptions({
      initialDate: '2024-03-10', // 2:00 EST -> 3:00 EDT
    })

    it('keeps civil edge order when dragging across the gap', async () => {
      let selectSpy
      let calendar = initCalendar({
        select: (selectSpy = spyCall((info) => {
          expect(info.startStr).toContain('2024-03-10T02:30:00')
          expect(info.endStr).toContain('2024-03-10T03:30:00')
        })),
      })
      await waitTimeout()

      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      expect(timeGridWrapper.getSlotLaneEls().length).toBe(48)

      await timeGridWrapper.selectDates('2024-03-10T02:30:00', '2024-03-10T03:30:00')
      expect(selectSpy).toHaveBeenCalled()
    })
  })

  describe('fall-back fold', () => {
    pushOptions({
      initialDate: '2024-11-03', // 2:00 EDT -> 1:00 EST
    })

    it('resolves an ambiguous selection edge to the first occurrence', async () => {
      let selectSpy
      let calendar = initCalendar({
        select: (selectSpy = spyCall((info) => {
          expect(info.start).toEqualDate('2024-11-03T05:30:00Z')
          expect(info.end).toEqualDate('2024-11-03T07:30:00Z')
          expect(info.startStr).toBe('2024-11-03T01:30:00-04:00')
          expect(info.endStr).toBe('2024-11-03T02:30:00-05:00')
        })),
      })
      await waitTimeout()

      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      expect(timeGridWrapper.getSlotLaneEls().length).toBe(48)

      await timeGridWrapper.selectDates('2024-11-03T01:30:00', '2024-11-03T02:30:00')
      expect(selectSpy).toHaveBeenCalled()
    })
  })
})
