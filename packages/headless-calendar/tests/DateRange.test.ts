/// <reference types="vitest/globals" />

import { intersectRanges } from '../src/date-range'

describe('intersectRanges', () => {
  const january = {
    start: new Date('2027-01-01T00:00:00Z'),
    end: new Date('2027-02-01T00:00:00Z'),
  }
  const validRange = {
    start: new Date('2022-04-07T00:00:00Z'),
    end: new Date('2027-07-30T00:00:00Z'),
  }

  it('returns the overlapping range', () => {
    expect(intersectRanges(january, validRange)).toEqual(january)
  })

  it('returns null when the ranges do not overlap', () => {
    const august = {
      start: new Date('2027-08-01T00:00:00Z'),
      end: new Date('2027-09-01T00:00:00Z'),
    }
    expect(intersectRanges(august, validRange)).toBeNull()
  })

  // https://github.com/fullcalendar/fullcalendar/issues/8134
  it('returns null when either range is null', () => {
    expect(intersectRanges(null, january)).toBeNull()
    expect(intersectRanges(january, null)).toBeNull()
    expect(intersectRanges(null, null)).toBeNull()
  })
})
