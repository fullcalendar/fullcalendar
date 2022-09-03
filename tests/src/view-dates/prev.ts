/*
SEE ALSO:
- next (does core of date switching)
*/

import { expectActiveRange } from '../lib/ViewDateUtils'

describe('prev', () => {
  pushOptions({
    initialDate: '2017-06-08',
  })

  describe('when in a week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    it('moves back by one week', () => {
      initCalendar()
      currentCalendar.prev()
      expectActiveRange('2017-05-28', '2017-06-04')
    })

    describe('when two week dateIncrement', () => {
      pushOptions({
        dateIncrement: { weeks: 2 },
      })

      it('moves back by two weeks', () => {
        initCalendar()
        currentCalendar.prev()
        expectActiveRange('2017-05-21', '2017-05-28')
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4595
  it('can navigate back when starting late in month', () => {
    initCalendar({
      initialDate: '2019-03-31T12:00',
      initialView: 'dayGridMonth',
    })
    expectActiveRange('2019-02-24', '2019-04-07')
    currentCalendar.prev()
    expectActiveRange('2019-01-27', '2019-03-10')
  })

  // related to #4595
  it('can navigate forward when starting late in month', () => {
    initCalendar({
      initialDate: '2019-03-31T12:00',
      initialView: 'dayGridMonth',
    })
    expectActiveRange('2019-02-24', '2019-04-07')
    currentCalendar.next()
    expectActiveRange('2019-03-31', '2019-05-12')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5319
  it('can navigate back twice when duration greater than dateIncrement', () => {
    let calendar = initCalendar({
      firstDay: 1, // monday
      initialDate: '2021-06-14',
      initialView: 'dayGridFourWeeks',
      views: {
        dayGridFourWeeks: {
          type: 'dayGrid',
          duration: { weeks: 4 },
          dateIncrement: { weeks: 1 },
        },
      },
    })
    expectActiveRange('2021-06-14', '2021-07-12')
    calendar.prev() // back a week
    expectActiveRange('2021-06-07', '2021-07-05')
    calendar.prev() // back a week
    expectActiveRange('2021-05-31', '2021-06-28')
  })
})
