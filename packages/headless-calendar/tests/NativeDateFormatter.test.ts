/// <reference types="vitest/globals" />

import type { Locale } from '../src/locale'
import type { ZonedMarker } from '../src/zoned-marker'
import type { DateFormattingContext as FormattingContextNew } from '../src/formatting-interface'
import { NativeDateFormatter as NativeDateFormatterNew } from '../src/formatting-native'
import { joinDateTimeFormatParts } from '../src/formatting-utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLocale(
  code: string,
  options: Record<string, unknown> = {},
): Locale {
  return {
    codeArg: code,
    codes: [code],
    week: { dow: 0, doy: 0 },
    simpleNumberFormat: new Intl.NumberFormat(code),
    options,
  }
}

function makeContext(
  localeCode: string,
  overrides: Partial<FormattingContextNew> = {},
): FormattingContextNew {
  return {
    timeZone: 'UTC',
    locale: makeLocale(localeCode),
    calendarSystem: {} as any,
    computeWeekNumber: () => 1,
    weekTextLong: 'Week',
    weekTextShort: 'W',
    ...overrides,
  }
}

function makeMarker(isoString: string, tzOffsetMinutes: number): ZonedMarker {
  return { marker: new Date(isoString), timeZoneOffset: tzOffsetMinutes }
}

function formatParts(
  formatter: NativeDateFormatterNew,
  marker: ZonedMarker,
  context: FormattingContextNew,
) {
  return joinDateTimeFormatParts(formatter.formatToParts(marker, context))
}

function formatRangeParts(
  formatter: NativeDateFormatterNew,
  start: ZonedMarker,
  end: ZonedMarker,
  context: FormattingContextNew,
) {
  return joinDateTimeFormatParts(formatter.formatRangeToParts(start, end, context))
}

// ---------------------------------------------------------------------------
// Test date constants — Monday 2024-01-15, various times
// ---------------------------------------------------------------------------

const MON_NOON = makeMarker('2024-01-15T12:00:00Z', 0)  // 12:00 UTC = noon (PM), minute=0
const MON_0700 = makeMarker('2024-01-15T07:00:00Z', 0)  // 07:00 UTC = 7 AM, minute=0
const MON_0730 = makeMarker('2024-01-15T07:30:00Z', 0)  // 07:30 UTC = 7:30 AM, minute=30
const MON_1230 = makeMarker('2024-01-15T12:30:00Z', 0)  // 12:30, minute=30
const MON_1430 = makeMarker('2024-01-15T14:30:00Z', 0)  // 14:30 = 2:30 PM

const PRETTY_DATE_TIME_OPTIONS = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
  omitCommas: true,
} as const

function makePrettyDateTimeFormatter() {
  return new NativeDateFormatterNew(PRETTY_DATE_TIME_OPTIONS)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NativeDateFormatter', () => {

  // ==========================================================================
  // sanitizeSettings (exercised via constructor + formatToParts)
  // ==========================================================================
  describe('sanitizeSettings', () => {
    it('adds hour and minute props when timeZoneName is combined with other props', () => {
      // { timeZoneName: 'short' } alone takes the timezone-only shortcut and bypasses sanitize.
      // Use a two-prop input to exercise the sanitizeSettings path.
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'short', month: 'long' })
      const parts = fmt.formatToParts(MON_1430, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'hour')).toBe(true)
      expect(parts.some((p) => p.type === 'minute')).toBe(true)
    })

    it('does not overwrite explicit hour/minute when timeZoneName is also present', () => {
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'short', hour: 'numeric', minute: 'numeric' })
      const parts = fmt.formatToParts(MON_1430, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'hour')).toBe(true)
      expect(parts.some((p) => p.type === 'minute')).toBe(true)
    })

    it("downgrades timeZoneName:'long' to 'short' (proven by offset injection activating)", () => {
      // If the downgrade did NOT happen, injectableTz would be undefined and no offset
      // injection would occur — we'd get a long tz name like "Coordinated Universal Time".
      // Seeing "GMT+5" proves both the downgrade and the injection worked.
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'long' })
      const marker = makeMarker('2024-01-15T14:30:00Z', 300)
      const parts = fmt.formatToParts(marker, makeContext('en-US'))
      expect(parts.find((p) => p.type === 'timeZoneName')?.value).toBe('GMT+5')
    })

    it('removes omitZeroMinute when second is present', () => {
      // If omitZeroMinute were active, minute would be absent at :00
      const fmt = new NativeDateFormatterNew({
        hour: 'numeric', minute: '2-digit', second: 'numeric', omitZeroMinute: true,
      })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'minute')).toBe(true)
    })

    it('removes omitZeroMinute when fractionalSecondDigits is present', () => {
      const fmt = new NativeDateFormatterNew({
        hour: 'numeric', minute: '2-digit', fractionalSecondDigits: 1, omitZeroMinute: true,
      })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'minute')).toBe(true)
    })

    it('preserves omitZeroMinute when no seconds options are given', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit', omitZeroMinute: true })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'minute')).toBe(false)
    })
  })

  // ==========================================================================
  // week-only shortcut
  // ==========================================================================
  describe('week-only shortcut', () => {
    it('week:"numeric" returns a single week part', () => {
      const fmt = new NativeDateFormatterNew({ week: 'numeric' })
      const ctx = makeContext('en-US', { computeWeekNumber: () => 3 })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts).toHaveLength(1)
      expect(parts[0].type).toBe('week')
      expect(parts[0].value).toBe('3')
    })

    it('week:"long" returns [weekTextLong, space, week]', () => {
      const fmt = new NativeDateFormatterNew({ week: 'long' })
      const ctx = makeContext('en-US', { weekTextLong: 'Week', computeWeekNumber: () => 7 })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts).toHaveLength(3)
      expect(parts[0]).toEqual({ type: 'literal', value: 'Week' })
      expect(parts[1]).toEqual({ type: 'literal', value: ' ' })
      expect(parts[2].type).toBe('week')
    })

    it('week:"short" returns [weekTextShort, space, week]', () => {
      const fmt = new NativeDateFormatterNew({ week: 'short' })
      const ctx = makeContext('en-US', { weekTextShort: 'Wk', computeWeekNumber: () => 5 })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts).toHaveLength(3)
      expect(parts[0]).toEqual({ type: 'literal', value: 'Wk' })
      expect(parts[1]).toEqual({ type: 'literal', value: ' ' })
      expect(parts[2].type).toBe('week')
    })

    it('week:"narrow" returns [weekTextShort, week] — no space', () => {
      const fmt = new NativeDateFormatterNew({ week: 'narrow' })
      const ctx = makeContext('en-US', { weekTextShort: 'W', computeWeekNumber: () => 2 })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts).toHaveLength(2)
      expect(parts[0]).toEqual({ type: 'literal', value: 'W' })
      expect(parts[1].type).toBe('week')
    })

    it('RTL locale reverses parts order for week:"long"', () => {
      const fmt = new NativeDateFormatterNew({ week: 'long' })
      const ctx = makeContext('he', {
        weekTextLong: 'שבוע',
        computeWeekNumber: () => 4,
        locale: makeLocale('he', { direction: 'rtl' }),
      })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts).toHaveLength(3)
      expect(parts[0].type).toBe('week')
      expect(parts[2]).toEqual({ type: 'literal', value: 'שבוע' })
    })

    it('RTL locale is a no-op for week:"numeric" (single part)', () => {
      const fmt = new NativeDateFormatterNew({ week: 'numeric' })
      const ctx = makeContext('he', {
        computeWeekNumber: () => 4,
        locale: makeLocale('he', { direction: 'rtl' }),
      })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts).toHaveLength(1)
      expect(parts[0].type).toBe('week')
    })

    it('uses locale.simpleNumberFormat to format the week number', () => {
      const fmt = new NativeDateFormatterNew({ week: 'numeric' })
      const ctx = makeContext('en-US', { computeWeekNumber: () => 42 })
      const parts = fmt.formatToParts(MON_NOON, ctx)
      expect(parts[0].value).toBe(new Intl.NumberFormat('en-US').format(42))
    })

    it('formatRangeToParts with week-only formats start only', () => {
      const fmt = new NativeDateFormatterNew({ week: 'long' })
      const start = makeMarker('2024-01-15T00:00:00Z', 0)
      const end = makeMarker('2024-01-22T00:00:00Z', 0)
      const ctx = makeContext('en-US', {
        weekTextLong: 'Week',
        computeWeekNumber: (d) => (d === start.marker ? 3 : 99),
      })
      const parts = fmt.formatRangeToParts(start, end, ctx)
      const result = joinDateTimeFormatParts(parts)
      expect(result).toContain('3')
      expect(result).not.toContain('99')
    })
  })

  // ==========================================================================
  // timezone-only shortcut ({ timeZoneName: 'short' } alone, no other props)
  // ==========================================================================
  describe('timezone-only shortcut', () => {
    it('returns a single timeZoneName part with the formatted offset', () => {
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'short' })
      const marker = makeMarker('2024-01-15T14:30:00Z', 300) // UTC+5
      const parts = fmt.formatToParts(marker, makeContext('en-US'))
      expect(parts).toHaveLength(1)
      expect(parts[0]).toEqual({ type: 'timeZoneName', value: 'GMT+5' })
    })

    it('returns "GMT+0" when timeZoneOffset is null (formatTimeZoneOffset does not special-case null)', () => {
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'short' })
      const marker = { marker: new Date('2024-01-15T14:30:00Z'), timeZoneOffset: null as any }
      const parts = fmt.formatToParts(marker, makeContext('en-US'))
      expect(parts).toHaveLength(1)
      expect(parts[0]).toEqual({ type: 'timeZoneName', value: 'GMT+0' })
    })

    it('activates for timeZoneName:"long" because it is normalized to the short timezone fast path', () => {
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'long' })
      const marker = makeMarker('2024-01-15T14:30:00Z', 300)
      const parts = fmt.formatToParts(marker, makeContext('en-US'))
      expect(parts).toHaveLength(1)
      expect(parts[0]).toEqual({ type: 'timeZoneName', value: 'GMT+5' })
    })

    it('does NOT activate when timeZoneName is combined with other props', () => {
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'short', hour: 'numeric' })
      const parts = fmt.formatToParts(MON_1430, makeContext('en-US'))
      expect(parts.length).toBeGreaterThan(1)
    })

    it('formatRangeToParts with timezone-only uses start marker only', () => {
      const fmt = new NativeDateFormatterNew({ timeZoneName: 'short' })
      const start = makeMarker('2024-01-15T09:00:00Z', 300)
      const end = makeMarker('2024-01-15T17:00:00Z', -300)
      const parts = fmt.formatRangeToParts(start, end, makeContext('en-US'))
      const result = joinDateTimeFormatParts(parts)
      expect(result).toBe('GMT+5') // start's offset, not end's
    })
  })

  // ==========================================================================
  // datelib main.ts compatibility
  // ==========================================================================
  describe('datelib main.ts compatibility', () => {
    it('formats a pretty UTC date/time string', () => {
      const result = formatParts(
        makePrettyDateTimeFormatter(),
        makeMarker('2018-06-08T00:00:00Z', 0),
        makeContext('en-US'),
      ).replace(' at ', ' ')
      expect(result).toBe('Friday June 8 2018 12:00AM GMT+0')
    })

    it('formats a pretty date/time string with a non-zero offset', () => {
      const result = formatParts(
        makePrettyDateTimeFormatter(),
        makeMarker('2018-06-08T00:00:00Z', 300),
        makeContext('en-US'),
      ).replace(' at ', ' ')
      expect(result).toBe('Friday June 8 2018 12:00AM GMT+5')
    })

    it('formats week numbers like the legacy strings', () => {
      const ctx = makeContext('en-US', {
        computeWeekNumber: () => 23,
        weekTextLong: 'W',
        weekTextShort: 'W',
      })

      expect(joinDateTimeFormatParts(new NativeDateFormatterNew({ week: 'numeric' }).formatToParts(MON_NOON, ctx))).toBe('23')
      expect(joinDateTimeFormatParts(new NativeDateFormatterNew({ week: 'short' }).formatToParts(MON_NOON, ctx))).toBe('W 23')
      expect(joinDateTimeFormatParts(new NativeDateFormatterNew({ week: 'narrow' }).formatToParts(MON_NOON, ctx))).toBe('W23')
    })

    it('compresses the legacy range cases', () => {
      const ctx = makeContext('en-US')
      const formatter = new NativeDateFormatterNew({ day: 'numeric', month: 'long', year: 'numeric' })

      const sameMonth = formatRangeParts(
        formatter,
        makeMarker('2018-06-08T00:00:00Z', 0),
        makeMarker('2018-06-09T00:00:00Z', 0),
        ctx,
      )
      expect(sameMonth).toMatch(/^June 8.*9, 2018$/)

      const monthOnly = formatRangeParts(
        new NativeDateFormatterNew({ month: 'long', year: 'numeric' }),
        makeMarker('2018-06-08T00:00:00Z', 0),
        makeMarker('2018-06-09T00:00:00Z', 0),
        ctx,
      )
      expect(monthOnly).toBe('June 2018')

      const differentMonth = formatRangeParts(
        formatter,
        makeMarker('2018-06-08T00:00:00Z', 0),
        makeMarker('2018-07-09T00:00:00Z', 0),
        ctx,
      )
      expect(differentMonth).toContain('June 8')
      expect(differentMonth).toContain('July 9, 2018')

      const differentYears = formatRangeParts(
        formatter,
        makeMarker('2018-06-08T00:00:00Z', 0),
        makeMarker('2020-07-09T00:00:00Z', 0),
        ctx,
      )
      expect(differentYears).toContain('June 8, 2018')
      expect(differentYears).toContain('July 9, 2020')
    })
  })

  // ==========================================================================
  // omitZeroMinute
  // ==========================================================================
  describe('omitZeroMinute', () => {
    const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit', omitZeroMinute: true })

    it('hides the minute part when minute=0', () => {
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'minute')).toBe(false)
    })

    it('shows the minute part when minute≠0', () => {
      const parts = fmt.formatToParts(MON_1230, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'minute')).toBe(true)
    })

    it('without omitZeroMinute, minute is always present even at :00', () => {
      const fmtNormal = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit' })
      const parts = fmtNormal.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.some((p) => p.type === 'minute')).toBe(true)
    })
  })

  // ==========================================================================
  // LTR control character stripping
  // ==========================================================================
  describe('LTR control character stripping', () => {
    it('output contains no \\u200e control characters', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit' })
      const parts = fmt.formatToParts(MON_1430, makeContext('en-US'))
      const joined = parts.map((p) => p.value).join('')
      expect(joined).not.toContain('\u200e')
    })
  })

  // ==========================================================================
  // omitCommas
  // ==========================================================================
  describe('omitCommas', () => {
    it('removes commas from all literal parts', () => {
      // en-US produces ", " between weekday and month name
      const fmt = new NativeDateFormatterNew({
        weekday: 'long', month: 'long', day: 'numeric', omitCommas: true,
      })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      parts.forEach((p) => expect(p.value).not.toContain(','))
    })

    it('preserves commas when omitCommas is not set', () => {
      const fmt = new NativeDateFormatterNew({ weekday: 'long', month: 'long', day: 'numeric' })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.some((p) => p.value.includes(','))).toBe(true)
    })
  })

  // ==========================================================================
  // omitTrailing
  // ==========================================================================
  describe('omitTrailing', () => {
    it('removes trailing literal punctuation from single-date output', () => {
      const ctx = makeContext('nb')
      const fmt = new NativeDateFormatterNew({ weekday: 'short', day: 'numeric', omitTrailing: true })
      const parts = fmt.formatToParts(MON_NOON, ctx)

      expect(parts.map((part) => part.type)).toEqual(['weekday', 'literal', 'day'])
      expect(joinDateTimeFormatParts(parts)).toBe('man. 15')
    })

    it('removes only the last literal part from range output', () => {
      const ctx = makeContext('nb')
      const fmt = new NativeDateFormatterNew({ weekday: 'short', day: 'numeric', omitTrailing: true })
      const start = makeMarker('2024-01-15T12:00:00Z', 0)
      const end = makeMarker('2024-01-16T12:00:00Z', 0)
      const parts = fmt.formatRangeToParts(start, end, ctx)

      expect(joinDateTimeFormatParts(parts)).toBe('man. 15.–tir. 16')
      expect(parts[parts.length - 1]).toEqual({ source: 'endRange', type: 'day', value: '16' })
      expect(parts.some((part) => part.type === 'literal' && part.value === '.–')).toBe(true)
    })

    it('removes the last part when trimming empties a trailing literal', () => {
      const fmt = new NativeDateFormatterNew({ omitTrailing: true })
      ;(fmt as any).getFormats = () => ({
        normalFormat: {
          formatToParts: () => [
            { type: 'month', value: 'January' },
            { type: 'literal', value: ' ., ' },
          ],
        },
      })

      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts).toEqual([{ type: 'month', value: 'January' }])
    })
  })

  // ==========================================================================
  // meridiem
  // ==========================================================================
  describe('meridiem', () => {
    // 2:30 PM in en-US 12-hour format → dayPeriod = 'PM'
    const ctx = makeContext('en-US')

    it('meridiem:false removes the dayPeriod part entirely', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: false })
      const parts = fmt.formatToParts(MON_1430, ctx)
      expect(parts.find((p) => p.type === 'dayPeriod')).toBeUndefined()
    })

    it('meridiem:false leaves no empty-value parts in output', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: false })
      const parts = fmt.formatToParts(MON_1430, ctx)
      expect(parts.every((p) => p.value.length > 0)).toBe(true)
    })

    it('meridiem:"lowercase" lowercases the dayPeriod', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'lowercase' })
      const parts = fmt.formatToParts(MON_1430, ctx)
      const dp = parts.find((p) => p.type === 'dayPeriod')
      expect(dp).toBeDefined()
      expect(dp!.value).toBe(dp!.value.toLocaleLowerCase())
    })

    it('meridiem:"narrow" PM produces "p"', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'narrow' })
      const parts = fmt.formatToParts(MON_1430, ctx)
      expect(parts.find((p) => p.type === 'dayPeriod')?.value).toBe('p')
    })

    it('meridiem:"narrow" AM produces "a"', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'narrow' })
      const parts = fmt.formatToParts(MON_0730, ctx)
      expect(parts.find((p) => p.type === 'dayPeriod')?.value).toBe('a')
    })

    it('meridiem:"short" PM produces "pm"', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'short' })
      const parts = fmt.formatToParts(MON_1430, ctx)
      expect(parts.find((p) => p.type === 'dayPeriod')?.value).toBe('pm')
    })

    it('meridiem:"short" AM produces "am"', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'short' })
      const parts = fmt.formatToParts(MON_0730, ctx)
      expect(parts.find((p) => p.type === 'dayPeriod')?.value).toBe('am')
    })

    it('meridiem:"short" trims trailing space before dayPeriod ("7 PM" → "7pm")', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'short' })
      const parts = fmt.formatToParts(MON_1430, ctx)
      const joined = joinDateTimeFormatParts(parts)
      expect(joined).toMatch(/\dpm$/)
    })

    it('meridiem:"narrow" trims trailing space before dayPeriod ("7 PM" → "7p")', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: 'narrow' })
      const parts = fmt.formatToParts(MON_1430, ctx)
      const joined = joinDateTimeFormatParts(parts)
      expect(joined).toMatch(/\dp$/)
    })

    it('meridiem:true (default) leaves the dayPeriod unchanged', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', meridiem: true })
      const parts = fmt.formatToParts(MON_1430, ctx)
      const dp = parts.find((p) => p.type === 'dayPeriod')
      expect(dp).toBeDefined()
      // Value is Intl-produced — just verify it starts with 'a' or 'p'
      expect(dp!.value.toLocaleLowerCase()).toMatch(/^[ap]/)
    })
  })

  // ==========================================================================
  // timeZoneName injection
  // ==========================================================================
  describe('timeZoneName injection', () => {
    const fmt = new NativeDateFormatterNew({ timeZoneName: 'short' })
    const ctx = makeContext('en-US')

    it('replaces Intl UTC timezone value with formatted positive offset', () => {
      const marker = makeMarker('2024-01-15T14:30:00Z', 300) // UTC+5
      const parts = fmt.formatToParts(marker, ctx)
      expect(parts.find((p) => p.type === 'timeZoneName')?.value).toBe('GMT+5')
    })

    it('formats zero offset as "GMT+0"', () => {
      const parts = fmt.formatToParts(MON_1430, ctx)
      expect(parts.find((p) => p.type === 'timeZoneName')?.value).toBe('GMT+0')
    })

    it('formats negative offset as "GMT-5"', () => {
      const marker = makeMarker('2024-01-15T14:30:00Z', -300) // UTC-5
      const parts = fmt.formatToParts(marker, ctx)
      expect(parts.find((p) => p.type === 'timeZoneName')?.value).toBe('GMT-5')
    })

    it('formats offset with sub-hour minutes as "GMT+5:30"', () => {
      const marker = makeMarker('2024-01-15T14:30:00Z', 330) // UTC+5:30 (IST)
      const parts = fmt.formatToParts(marker, ctx)
      expect(parts.find((p) => p.type === 'timeZoneName')?.value).toBe('GMT+5:30')
    })

    it('uses "UTC" when timeZoneOffset is null (postProcessParts injection path)', () => {
      // This uses { timeZoneName:'short', hour:'numeric' } so it goes through postProcessParts,
      // which has the explicit null → 'UTC' conversion. The timezone-only shortcut path does not.
      const fmtWithHour = new NativeDateFormatterNew({ timeZoneName: 'short', hour: 'numeric' })
      const marker = { marker: new Date('2024-01-15T14:30:00Z'), timeZoneOffset: null as any }
      const parts = fmtWithHour.formatToParts(marker, ctx)
      expect(parts.find((p) => p.type === 'timeZoneName')?.value).toBe('UTC')
    })
  })

  // ==========================================================================
  // weekdayJustify
  // ==========================================================================
  describe('weekdayJustify', () => {
    // Use omitCommas so the separator is whitespace-only and the
    // weekdayJustify guard recognizes it as a separator.
    const ctx = makeContext('en-US')
    const date = MON_NOON

    it('weekdayJustify:"start" ensures weekday is at position 0', () => {
      const fmt = new NativeDateFormatterNew({
        weekday: 'long', day: 'numeric', omitCommas: true, weekdayJustify: 'start',
      })
      const parts = fmt.formatToParts(date, ctx)
      expect(parts).toHaveLength(3)
      expect(parts[0].type).toBe('weekday')
      expect(parts[2].type).toBe('day')
    })

    it('weekdayJustify:"end" ensures weekday is at position 2', () => {
      const fmt = new NativeDateFormatterNew({
        weekday: 'long', day: 'numeric', omitCommas: true, weekdayJustify: 'end',
      })
      const parts = fmt.formatToParts(date, ctx)
      expect(parts).toHaveLength(3)
      expect(parts[0].type).toBe('day')
      expect(parts[2].type).toBe('weekday')
    })

    it('weekdayJustify is a no-op when parts count is not 3', () => {
      // month added → en-US produces 5 parts, guard (parts.length === 3) does not fire
      const fmtBase = new NativeDateFormatterNew({
        weekday: 'long', month: 'long', day: 'numeric', omitCommas: true,
      })
      const fmtJustify = new NativeDateFormatterNew({
        weekday: 'long', month: 'long', day: 'numeric', omitCommas: true, weekdayJustify: 'end',
      })
      const baseParts = fmtBase.formatToParts(date, ctx)
      const justifyParts = fmtJustify.formatToParts(date, ctx)
      expect(baseParts.length).toBeGreaterThan(3)
      expect(justifyParts.map((p) => p.type)).toEqual(baseParts.map((p) => p.type))
    })

    it('weekdayJustify treats thin-space literals as separators', () => {
      const fmt = new NativeDateFormatterNew({ weekdayJustify: 'start' })
      ;(fmt as any).getFormats = () => ({
        normalFormat: {
          formatToParts: () => [
            { type: 'day', value: '15' },
            { type: 'literal', value: '\u2009' },
            { type: 'weekday', value: 'Monday' },
          ],
        },
      })

      const parts = fmt.formatToParts(date, ctx)
      expect(parts.map((p) => p.type)).toEqual(['weekday', 'literal', 'day'])
      expect(parts[1].value).toBe('\u2009')
    })
  })

  // ==========================================================================
  // forceCommas
  // ==========================================================================
  describe('forceCommas', () => {
    it('prepends commas to space-only literals', () => {
      // en-US { month, day } → "January 15" where the space is a literal
      const fmt = new NativeDateFormatterNew({ month: 'long', day: 'numeric', forceCommas: true })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts.find((p) => p.type === 'literal' && p.value === ' ')).toBeUndefined()
      expect(parts.find((p) => p.type === 'literal' && p.value === ', ')).toBeDefined()
    })

    it('does not double-comma literals that are already ", "', () => {
      // en-US { weekday, month, day } has existing ", " literals
      const fmt = new NativeDateFormatterNew({
        weekday: 'long', month: 'long', day: 'numeric', forceCommas: true,
      })
      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      parts.filter((p) => p.type === 'literal').forEach((p) => {
        expect(p.value).not.toMatch(/^,+,/)
      })
    })

    it('prepends commas to thin-space literals without requiring normalization', () => {
      const fmt = new NativeDateFormatterNew({ forceCommas: true })
      ;(fmt as any).getFormats = () => ({
        normalFormat: {
          formatToParts: () => [
            { type: 'month', value: 'January' },
            { type: 'literal', value: '\u2009' },
            { type: 'day', value: '15' },
          ],
        },
      })

      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts).toEqual([
        { type: 'month', value: 'January' },
        { type: 'literal', value: ',\u2009' },
        { type: 'day', value: '15' },
      ])
    })

    it('preserves thin-space literals when forceCommas is not enabled', () => {
      const fmt = new NativeDateFormatterNew({ month: 'long', day: 'numeric' })
      ;(fmt as any).getFormats = () => ({
        normalFormat: {
          formatToParts: () => [
            { type: 'month', value: 'January' },
            { type: 'literal', value: '\u2009' },
            { type: 'day', value: '15' },
          ],
        },
      })

      const parts = fmt.formatToParts(MON_NOON, makeContext('en-US'))
      expect(parts[1].value).toBe('\u2009')
    })
  })

  // ==========================================================================
  // formatRangeToParts
  // ==========================================================================
  describe('formatRangeToParts', () => {
    it('returns a non-empty parts array', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit' })
      const start = makeMarker('2024-01-15T09:00:00Z', 0)
      const end = makeMarker('2024-01-15T17:30:00Z', 0)
      const parts = fmt.formatRangeToParts(start, end, makeContext('en-US'))
      expect(parts.length).toBeGreaterThan(0)
    })

    it('range result is different from formatting either endpoint alone', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit' })
      const start = makeMarker('2024-01-15T09:00:00Z', 0)
      const end = makeMarker('2024-01-15T17:00:00Z', 0)
      const ctx = makeContext('en-US')
      const rangeParts = fmt.formatRangeToParts(start, end, ctx)
      const startOnly = fmt.formatToParts(start, ctx)
      const endOnly = fmt.formatToParts(end, ctx)
      expect(rangeParts).not.toEqual(startOnly)
      expect(rangeParts).not.toEqual(endOnly)
    })

    it('week-only: formatRangeToParts uses start marker only', () => {
      const fmt = new NativeDateFormatterNew({ week: 'long' })
      const start = makeMarker('2024-01-15T00:00:00Z', 0)
      const end = makeMarker('2024-01-22T00:00:00Z', 0)
      const ctx = makeContext('en-US', {
        weekTextLong: 'Week',
        computeWeekNumber: (d) => (d === start.marker ? 3 : 99),
      })
      const parts = fmt.formatRangeToParts(start, end, ctx)
      expect(parts).toEqual([
        { source: 'shared', type: 'literal', value: 'Week' },
        { source: 'shared', type: 'literal', value: ' ' },
        { source: 'startRange', type: 'week', value: '3' },
      ])
    })

    it('forceCommas applies to range output', () => {
      const fmtCommas = new NativeDateFormatterNew({ month: 'long', day: 'numeric', forceCommas: true })
      const fmtPlain = new NativeDateFormatterNew({ month: 'long', day: 'numeric' })
      const start = makeMarker('2024-01-15T00:00:00Z', 0)
      const end = makeMarker('2024-02-20T00:00:00Z', 0)
      const ctx = makeContext('en-US')
      const withCommas = fmtCommas.formatRangeToParts(start, end, ctx)
      const withoutCommas = fmtPlain.formatRangeToParts(start, end, ctx)
      expect(withCommas).not.toEqual(withoutCommas)
      expect(withCommas.some((p) => p.type === 'literal' && p.value === ', ')).toBe(true)
    })

    it('timeZoneName injection works in range output', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
      const start = makeMarker('2024-01-15T09:00:00Z', 300) // UTC+5
      const end = makeMarker('2024-01-15T17:00:00Z', 300)
      const parts = fmt.formatRangeToParts(start, end, makeContext('en-US'))
      expect(parts).toContainEqual({ source: 'shared', type: 'timeZoneName', value: 'GMT+5' })
    })
  })

  // ==========================================================================
  // format caching
  // ==========================================================================
  describe('format caching', () => {
    // vi.spyOn on the native Intl.DateTimeFormat constructor breaks the returned
    // instance, so we inspect the private cache directly via (fmt as any).

    it('same context object reuses cached formats (same object reference)', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric' })
      const ctx = makeContext('en-US')
      fmt.formatToParts(MON_NOON, ctx)
      const cachedFormats = (fmt as any).cachedFormats
      fmt.formatToParts(MON_1430, ctx)
      expect((fmt as any).cachedFormats).toBe(cachedFormats)
    })

    it('different context objects replace the cached formats', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric' })
      const ctx1 = makeContext('en-US')
      const ctx2 = makeContext('en-US') // distinct object, same values
      fmt.formatToParts(MON_NOON, ctx1)
      const cachedAfterFirst = (fmt as any).cachedFormats
      fmt.formatToParts(MON_1430, ctx2)
      const cachedAfterSecond = (fmt as any).cachedFormats
      expect(cachedAfterSecond).not.toBe(cachedAfterFirst)
    })

    it('omitZeroMinute populates both normalFormat and zeroFormat', () => {
      const fmt = new NativeDateFormatterNew({ hour: 'numeric', minute: '2-digit', omitZeroMinute: true })
      fmt.formatToParts(MON_0700, makeContext('en-US'))
      const { normalFormat, zeroFormat } = (fmt as any).cachedFormats
      expect(normalFormat).toBeDefined()
      expect(zeroFormat).toBeDefined()
      expect(normalFormat).not.toBe(zeroFormat)
    })
  })
})
