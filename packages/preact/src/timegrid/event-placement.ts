import { DateMarker } from '@full-ui/headless-calendar'
import { DateProfile } from '../DateProfileGenerator'
import { TimeGridRange } from './TimeColsSeg'
import { computeDateTopFrac } from './components/util'

// VERTICAL
// -------------------------------------------------------------------------------------------------

export interface TimeGridSegVertical {
  start: number // pixels
  end: number // pixels
  size: number // pixels
  isShort: boolean
}

export function computeFgSegVerticals(
  segs: TimeGridRange[],
  dateProfile: DateProfile,
  colDate: DateMarker,
  slatCnt: number,
  slatHeight: number | undefined, // in pixels
  eventMinHeight: number | undefined, // in pixels
  eventShortHeight: number, // in pixels
): TimeGridSegVertical[] {
  const res: TimeGridSegVertical[] = []

  if (slatHeight != null) {
    const totalHeight = slatHeight * slatCnt

    for (const seg of segs) {
      const startFrac = computeDateTopFrac(seg.startDate, dateProfile, colDate)
      const endFrac = computeDateTopFrac(seg.endDate, dateProfile, colDate)
      const startCoord = startFrac * totalHeight
      let endCoord = endFrac * totalHeight
      let height = endCoord - startCoord

      if (eventMinHeight != null && height < eventMinHeight) {
        height = eventMinHeight
        endCoord = startCoord + height
      }

      res.push({
        start: startCoord,
        end: endCoord,
        size: height,
        isShort: height <= eventShortHeight
      })
    }
  }

  return res
}
