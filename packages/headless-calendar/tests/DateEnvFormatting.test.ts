/// <reference types="vitest/globals" />

import { DateEnv } from '../src/env'
import { FuncDateFormatter } from '../src/formatting-func'
import { CmdDateFormatter } from '../src/formatting-cmd'
import type { CmdDateFormatterFunc } from '../src/formatting-interface'
import type { Locale } from '../src/locale'
import { formatTimeZoneOffset, joinDateTimeFormatParts } from '../src/formatting-utils'

function makeLocale(code: string): Locale {
  return {
    codeArg: code,
    codes: [code],
    week: { dow: 0, doy: 0 },
    simpleNumberFormat: new Intl.NumberFormat(code),
    options: {},
  }
}

describe('DateEnv formatting', () => {
  function makeEnv(cmdFormatter?: CmdDateFormatterFunc) {
    return new DateEnv({
      timeZone: 'UTC',
      calendarSystem: 'gregory',
      locale: makeLocale('en-US'),
      weekTextLong: 'Week',
      weekTextShort: 'W',
      cmdFormatter,
    })
  }

  it('formatToParts returns formatter parts directly', () => {
    const env = makeEnv()
    const formatter = new FuncDateFormatter(({ start }) => `day-${start.day}`)
    const marker = new Date('2024-01-15T00:00:00Z')

    expect(env.formatToParts(marker, formatter)).toEqual([
      { type: 'literal', value: 'day-15' },
    ])
  })

  it('formatRangeToParts returns shared range parts directly', () => {
    const env = makeEnv(() => [{ type: 'literal', value: 'joined-range' }])
    const formatter = new CmdDateFormatter('range')

    expect(
      env.formatRangeToParts(
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-16T00:00:00Z'),
        formatter,
      ),
    ).toEqual([{ source: 'shared', type: 'literal', value: 'joined-range' }])
  })

  it('formatRangeToParts still delegates to cmd-based range formatting', () => {
    const env = makeEnv((_cmd, data) => `${data.start.day}/${data.end!.day}`)
    const formatter = new CmdDateFormatter('range')
    const parts = env.formatRangeToParts(
      new Date('2024-01-15T00:00:00Z'),
      new Date('2024-01-16T00:00:00Z'),
      formatter,
    )

    expect(parts).toEqual([{ source: 'shared', type: 'literal', value: '15/16' }])
    expect(joinDateTimeFormatParts(parts)).toBe('15/16')
  })

  it('formatIso keeps existing omitTime behavior', () => {
    const env = makeEnv()
    expect(env.formatIso(new Date('2024-01-15T00:00:00Z'), { omitTime: true })).toBe('2024-01-15')
  })

  it('formatIso preserves the UTC suffix when timeZone is UTC', () => {
    const env = makeEnv()
    expect(env.formatIso(new Date('2024-01-15T00:00:00Z'))).toBe('2024-01-15T00:00:00Z')
  })

  it('formatIso preserves the local offset when timeZone is local', () => {
    const env = new DateEnv({
      timeZone: 'local',
      calendarSystem: 'gregory',
      locale: makeLocale('en-US'),
      weekTextLong: 'Week',
      weekTextShort: 'W',
    })
    const marker = new Date(Date.UTC(2018, 5, 8, 0, 0, 0))
    const expectedOffset = formatTimeZoneOffset(-marker.getTimezoneOffset(), true)
    expect(env.formatIso(marker)).toBe('2018-06-08T00:00:00' + expectedOffset)
  })
})
