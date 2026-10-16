import { afterEach, describe, expect, it, vi } from 'vitest'
import { DateEnv, type Locale } from '@full-ui/headless-calendar'
import { CalendarNowManager } from '../src/reducers/CalendarNowManager'
import { NowTimerRunner, type NowTimerRunnerInput } from '../src/NowTimerRunner'

function makeLocale(): Locale {
  return {
    codeArg: 'en',
    codes: ['en'],
    week: { dow: 0, doy: 0 },
    simpleNumberFormat: new Intl.NumberFormat('en'),
    options: {},
  }
}

function makeEnv(): DateEnv {
  return new DateEnv({
    timeZone: 'UTC',
    calendarSystem: 'gregory',
    locale: makeLocale(),
    weekTextLong: 'Week',
    weekTextShort: 'W',
  })
}

function makeInput(nowManager: CalendarNowManager, dateEnv: DateEnv): NowTimerRunnerInput {
  return {
    unit: 'day',
    unitValue: 1,
    nowIndicatorSnap: false,
    nowManager,
    dateEnv,
  }
}

describe('NowTimerRunner', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('arms timers on mount and does not re-arm them from update after destroy', () => {
    vi.useFakeTimers()
    const dateEnv = makeEnv()
    const nowManager = new CalendarNowManager()
    nowManager.handleInput(dateEnv, new Date('2024-06-15T12:00:00Z'))

    let changes = 0
    const runner = new NowTimerRunner(() => {
      changes += 1
    })
    const input = makeInput(nowManager, dateEnv)

    const output = runner.update(input)
    expect(output.nowMs).toBe(nowManager.getEpochMs())
    expect(vi.getTimerCount()).toBe(0)

    runner.mount()
    expect(vi.getTimerCount()).toBe(1)

    runner.mount()
    expect(vi.getTimerCount()).toBe(1)

    runner.destroy()
    expect(vi.getTimerCount()).toBe(0)

    runner.update(input)
    runner.update({ ...input, unit: 'hour', unitValue: 1 })
    vi.advanceTimersByTime(24 * 60 * 60 * 1000)
    expect(vi.getTimerCount()).toBe(0)
    expect(changes).toBe(0)

    runner.mount()
    expect(changes).toBe(1)
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(60 * 1000)
    expect(changes).toBe(2)
    expect(vi.getTimerCount()).toBe(1)

    runner.destroy()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('resets the timeout when inputs change while mounted', () => {
    vi.useFakeTimers()
    const dateEnv = makeEnv()
    const nowManager = new CalendarNowManager()
    nowManager.handleInput(dateEnv, new Date('2024-06-15T12:00:00Z'))
    const runner = new NowTimerRunner(() => {})
    const input = makeInput(nowManager, dateEnv)

    runner.update(input)
    runner.mount()
    expect(vi.getTimerCount()).toBe(1)

    runner.update({ ...input, dateEnv: makeEnv() })
    expect(vi.getTimerCount()).toBe(1)

    runner.destroy()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('adds the visibility listener on mount and removes it on destroy', () => {
    vi.useFakeTimers()
    const listeners = new Set<() => void>()
    vi.stubGlobal('document', {
      hidden: true,
      addEventListener: (_type: string, fn: () => void) => {
        listeners.add(fn)
      },
      removeEventListener: (_type: string, fn: () => void) => {
        listeners.delete(fn)
      },
    })

    const dateEnv = makeEnv()
    const nowManager = new CalendarNowManager()
    nowManager.handleInput(dateEnv, new Date('2024-06-15T12:00:00Z'))
    const runner = new NowTimerRunner(() => {})
    const input = makeInput(nowManager, dateEnv)

    runner.update(input)
    expect(listeners.size).toBe(0)

    runner.mount()
    runner.mount()
    expect(listeners.size).toBe(1)

    runner.destroy()
    expect(listeners.size).toBe(0)
    expect(vi.getTimerCount()).toBe(0)

    runner.update(input)
    expect(listeners.size).toBe(0)
  })
})
