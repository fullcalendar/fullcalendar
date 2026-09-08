import { createDuration, DateMarker, Duration } from '@full-ui/headless-calendar'
import { DateProfile } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { diffDates } from '../util/date'
import { Rect } from '../util/geom'
import { ViewContext } from '../ViewContext'

export interface Hit {
  componentId?: string // will be set by HitDragging
  context?: ViewContext // will be set by HitDragging
  dateProfile: DateProfile
  dateSpan: DateSpan
  getDayEl: () => HTMLElement
  rect: Rect
  layer: number
  largeUnit?: string // TODO: have timeline set this!
}

/*
When both hits come from an instant-aware component (their dateSpans carry exact instants),
returns the drag distance in absolute ms. Otherwise null, and callers should fall back to
civil-duration diffing.
*/
export function computeHitInstantDeltaMs(hit0: Hit, hit1: Hit): number | null {
  const startMs0 = hit0.dateSpan.allDay ? null : hit0.dateSpan.instantStartMs
  const startMs1 = hit1.dateSpan.allDay ? null : hit1.dateSpan.instantStartMs

  if (startMs0 != null && startMs1 != null) {
    return startMs1 - startMs0
  }

  return null
}

interface HitDeltaOptions {
  date0?: DateMarker
  date1?: DateMarker
  largeUnit?: string | null
}

export function computeHitDelta(
  hit0: Hit,
  hit1: Hit,
  options: HitDeltaOptions = {},
): { delta: Duration, instantDeltaMs: number | null } {
  const instantDeltaMs = computeHitInstantDeltaMs(hit0, hit1)
  const date0 = options.date0 || hit0.dateSpan.range.start
  const date1 = options.date1 || hit1.dateSpan.range.start

  return {
    delta: instantDeltaMs != null
      ? createDuration(instantDeltaMs)
      : diffDates(date0, date1, hit0.context.dateEnv, options.largeUnit),
    instantDeltaMs,
  }
}
