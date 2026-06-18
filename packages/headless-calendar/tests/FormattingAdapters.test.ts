/// <reference types="vitest/globals" />

import { FuncDateFormatter } from '../src/formatting-func'
import { CmdDateFormatter } from '../src/formatting-cmd'
import type { DateFormattingContext } from '../src/formatting-interface'
import { createCalendarSystem } from '../src/calendar-system'
import type { Locale } from '../src/locale'
import type { ZonedMarker } from '../src/zoned-marker'

function makeLocale(code: string): Locale {
  return {
    codeArg: code,
    codes: [code],
    week: { dow: 0, doy: 0 },
    simpleNumberFormat: new Intl.NumberFormat(code),
    options: {},
  }
}

function makeContext(overrides: Partial<DateFormattingContext> = {}): DateFormattingContext {
  return {
    timeZone: 'UTC',
    locale: makeLocale('en-US'),
    calendarSystem: createCalendarSystem('gregory'),
    computeWeekNumber: () => 1,
    weekTextLong: 'Week',
    weekTextShort: 'W',
    ...overrides,
  }
}

function makeMarker(isoString: string, timeZoneOffset = 0): ZonedMarker {
  return { marker: new Date(isoString), timeZoneOffset }
}

describe('formatting adapters', () => {
  it('FuncDateFormatter wraps single-date output in a literal part', () => {
    const formatter = new FuncDateFormatter(() => 'alpha')
    expect(formatter.formatToParts(makeMarker('2024-01-15T00:00:00Z'), makeContext())).toEqual([
      { type: 'literal', value: 'alpha' },
    ])
  })

  it('FuncDateFormatter wraps range output in a shared literal part', () => {
    const formatter = new FuncDateFormatter(() => 'alpha -> beta')
    expect(
      formatter.formatRangeToParts(
        makeMarker('2024-01-15T00:00:00Z'),
        makeMarker('2024-01-16T00:00:00Z'),
        makeContext(),
      ),
    ).toEqual([
      { source: 'shared', type: 'literal', value: 'alpha -> beta' },
    ])
  })

  it('CmdDateFormatter returns callback-provided parts as-is for single-date formatting', () => {
    const formatter = new CmdDateFormatter('parts')
    const parts = formatter.formatToParts(
      makeMarker('2024-01-15T00:00:00Z'),
      makeContext({
        cmdFormatter() {
          return [{ type: 'week', value: '7' }]
        },
      }),
    )

    expect(parts).toEqual([{ type: 'week', value: '7' }])
  })

  it('CmdDateFormatter converts callback-provided range parts to shared source parts', () => {
    const formatter = new CmdDateFormatter('parts')
    const parts = formatter.formatRangeToParts(
      makeMarker('2024-01-15T00:00:00Z'),
      makeMarker('2024-01-16T00:00:00Z'),
      makeContext({
        cmdFormatter() {
          return [{ type: 'week', value: '7' }]
        },
      }),
    )

    expect(parts).toEqual([{ source: 'shared', type: 'week', value: '7' }])
  })

  it('CmdDateFormatter wraps string range output in a shared literal part', () => {
    const formatter = new CmdDateFormatter('string')
    const parts = formatter.formatRangeToParts(
      makeMarker('2024-01-15T00:00:00Z'),
      makeMarker('2024-01-16T00:00:00Z'),
      makeContext({
        cmdFormatter() {
          return '15 / 16'
        },
      }),
    )

    expect(parts).toEqual([{ source: 'shared', type: 'literal', value: '15 / 16' }])
  })
})
