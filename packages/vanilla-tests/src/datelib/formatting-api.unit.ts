import { describe, expect, it } from 'vitest'
import { formatDate, formatRange } from '../../../preact/src/formatting-api'
import { enUsSep } from '../lib/intl'

/*
The standalone formatDate/formatRange utilities, which work without a calendar.
*/
describe('formatDate', () => {
  it('formats a date without an offset', () => {
    const str = formatDate('2018-09-04', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    expect(str).toBe('September 4, 2018')
  })

  it('formats a date-time with an offset in a named time zone', () => {
    const str = formatDate('2018-09-04T00:00:00-05:00', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZoneName: 'short',
      timeZone: 'America/New_York',
      omitCommas: true, // for cross-browser
    })
    expect(str.replace(' at ', ' ')).toBe('September 4 2018 01:00AM GMT-4')
  })
})

describe('formatRange', () => {
  it('formats dates without an offset', () => {
    const str = formatRange('2018-09-04', '2018-10-04', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    expect(str).toBe(`September 4${enUsSep}October 4, 2018`)
  })

  it('formats date-times with an offset in a named time zone', () => {
    const str = formatRange('2018-09-04T00:00:00-05:00', '2018-10-04T00:00:00-05:00', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZoneName: 'short',
      timeZone: 'America/New_York',
      omitCommas: true, // for cross-browser
    })
    expect(str.replaceAll(' at ', ' '))
      .toBe(`September 4 2018 1:00AM GMT-4${enUsSep}October 4 2018 1:00AM GMT-4`)
  })
})
