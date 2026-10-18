import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

// background fills are decorative. otherwise screen readers find empty groups
describe('background fill a11y', () => {
  pushOptions({
    initialDate: '2023-01-16',
    businessHours: true,
    events: [
      { start: '2023-01-17', display: 'background', title: 'Holiday' },
      { start: '2023-01-18T10:00:00', end: '2023-01-18T12:00:00', display: 'background' },
    ],
  })

  describeOptions('initialView', {
    'when dayGrid': 'dayGridMonth',
    'when timeGrid': 'timeGridWeek',
  }, () => {
    it('hides background events and non-business fills from screen readers', () => {
      let calendar = initCalendar()
      let bgEventEls = new CalendarWrapper(calendar).getBgEventEls()
      let nonBusinessEls = calendar.el.querySelectorAll('.fc-non-business')

      expect(bgEventEls.length).toBeGreaterThan(0)
      expect(nonBusinessEls.length).toBeGreaterThan(0)

      for (let el of [...bgEventEls, ...Array.from(nonBusinessEls)]) {
        expect(el.closest('[aria-hidden]')).toBeTruthy()
      }
    })
  })
})
