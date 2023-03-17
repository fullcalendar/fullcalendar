import { expectActiveRange } from '../lib/ViewDateUtils.js'

describe('view duration', () => {
  pushOptions({
    initialView: 'timeGrid',
    initialDate: '2017-03-15',
  })

  describe('when specified as a week integer', () => {
    pushOptions({
      duration: { weeks: 1 },
    })
    it('aligns with start of week', () => {
      initCalendar()
      expectActiveRange('2017-03-12', '2017-03-19')
    })
  })

  describe('when specified as 7 days', () => {
    pushOptions({
      duration: { days: 7 },
    })
    it('aligns with start of week', () => {
      initCalendar()
      expectActiveRange('2017-03-15', '2017-03-22')
    })
  })
})
