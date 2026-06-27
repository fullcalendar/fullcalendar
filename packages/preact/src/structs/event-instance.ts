import { DateRange } from '@full-ui/headless-calendar'
import { guid } from '../util/misc'

export interface EventInstance {
  instanceId: string
  defId: string
  range: DateRange
}

export type EventInstanceHash = { [instanceId: string]: EventInstance }

export function createEventInstance(
  defId: string,
  range: DateRange,
): EventInstance {
  return {
    instanceId: guid(),
    defId,
    range,
  }
}
