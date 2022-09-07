import { DateRange } from '../datelib/date-range'
import { guid } from '../util/misc'

export interface EventInstance {
  instanceId: string
  defId: string
  range: DateRange
  forcedStartTzo: number | null
  forcedEndTzo: number | null
}

export type EventInstanceHash = { [instanceId: string]: EventInstance }

export function createEventInstance(
  defId: string,
  range: DateRange,
  forcedStartTzo?: number,
  forcedEndTzo?: number,
): EventInstance {
  return {
    instanceId: guid(),
    defId,
    range,
    forcedStartTzo: forcedStartTzo == null ? null : forcedStartTzo,
    forcedEndTzo: forcedEndTzo == null ? null : forcedEndTzo,
  }
}
