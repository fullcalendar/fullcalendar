import { describe, expect, it } from 'vitest'
import { formatIsoMonthStr } from '../src/formatting-utils'

describe('formatIsoMonthStr', () => {
  it.each([
    ['+010000-12-15T12:34:56.789Z', '+010000-12'],
    ['+020241-01-15T00:00:00.000Z', '+020241-01'],
    ['-000001-02-15T00:00:00.000Z', '-000001-02'],
    ['-010000-03-15T00:00:00.000Z', '-010000-03'],
    ['+275760-09-13T00:00:00.000Z', '+275760-09'],
    ['-271821-04-20T00:00:00.000Z', '-271821-04'],
  ])('formats the expanded year in %s', (iso, expected) => {
    const marker = new Date(iso)
    const timestamp = marker.valueOf()

    expect(formatIsoMonthStr(marker)).toBe(expected)
    expect(marker.valueOf()).toBe(timestamp)
  })

  it.each([
    ['0000-01-15T00:00:00.000Z', '0000-01'],
    ['0099-02-15T00:00:00.000Z', '0099-02'],
    ['2024-03-15T00:00:00.000Z', '2024-03'],
    ['9999-12-15T00:00:00.000Z', '9999-12'],
  ])('keeps the existing four-digit output for %s', (iso, expected) => {
    expect(formatIsoMonthStr(new Date(iso))).toBe(expected)
  })

  it('keeps rejecting an invalid Date', () => {
    expect(() => formatIsoMonthStr(new Date(NaN))).toThrow(RangeError)
  })
})
