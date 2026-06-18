import { formatDate, formatRange } from 'fullcalendar'
import { enUsSep } from '../lib/misc'

describe('formatDate', () => {
  it('works with no timezone offset', () => {
    let str = formatDate('2018-09-04', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    expect(str).toBe('September 4, 2018')
  })

  it('works with timezone offset', () => {
    let str = formatDate('2018-09-04T00:00:00-05:00', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZoneName: 'short',
      timeZone: 'America/New_York',
      omitCommas: true, // for cross-browser
    })
    expect(str.replace(' at ', ' '))
      .toBe('September 4 2018 01:00AM GMT-4')
  })
})

describe('formatRange', () => {
  it('works with no timezone offset', () => {
    let str = formatRange('2018-09-04', '2018-10-04', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    expect(str).toBe(`September 4${enUsSep}October 4, 2018`)
  })

  it('works with timezone offset', () => {
    let str = formatRange('2018-09-04T00:00:00-05:00', '2018-10-04T00:00:00-05:00', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZoneName: 'short',
      timeZone: 'America/New_York', // but with no named tz implementation
      omitCommas: true, // for cross-browser
    })
    expect(str.replaceAll(' at ', ' '))
      .toBe(`September 4 2018 1:00AM GMT-4${enUsSep}October 4 2018 1:00AM GMT-4`)
  })
})
